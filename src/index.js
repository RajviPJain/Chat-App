const path=require('path')
const express=require('express')
const http=require('http')
const socketio=require('socket.io')

const app=express()
const server=http.createServer(app)

const io=socketio(server)

const port=process.env.PORT || 3000
const publicDirectory=path.join(__dirname,'../public')

app.use(express.static(publicDirectory))

const {generateMessage,locationMessage}=require('../utils/message')
const { addUser, removeUser, getUser, getUsersInRoom } = require('../utils/users')

let msg="Welcome"


io.on('connection',(socket)=>{
    console.log('New Websocket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }
       
        socket.join(user.room)

        socket.emit('Message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('Message', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendmessage',(usermsg,callback)=>{
        const user=getUser(socket.id)

        if(user){
            io.to(user.room).emit('Message',generateMessage(`${usermsg}`,user.username))
            callback()
        }

       
    })

    socket.on('disconnect',()=>{
       const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('Message', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('Location',(data)=>{
        const user=getUser(socket.id)
        console.log(user)

        if(user){
            io.to(user.room).emit('locationMessage',locationMessage(data.latitude,data.lonitude,user.username))
        }
        
    })
})
server.listen(port,()=>{
    console.log('Connected')
})