const socket=io()


const usermessage=document.querySelector('#Send_msg')
const form=document.querySelector('#form')
const send_location=document.querySelector('#location')
const btn=document.querySelector('#btn')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
console.log(username,room)

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('Message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a'),
        username:message.username    
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

form.addEventListener('submit',(e)=>{
    e.preventDefault()

    btn.setAttribute('disabled','disabled')
   
    socket.emit('sendmessage',usermessage.value,(error)=>{
        usermessage.value=''
        btn.removeAttribute('disabled')
        usermessage.focus()

    })
})
socket.on('locationMessage', (locationMessage) => {
    
    const html = Mustache.render(locationMessageTemplate, {
        url:locationMessage.url,
        createdAt:moment(locationMessage.createdAt).format('h:mm a'),
        username:locationMessage.username     
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


send_location.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert("Your browser doesn't support location")
    }
    
    const data={}
    navigator.geolocation.getCurrentPosition((position)=>{
        data.latitude=position.coords.latitude
        data.longitude=position.coords.longitude
        // console.log(position.coords.latitude)

        socket.emit('Location',data)
    })
    
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})