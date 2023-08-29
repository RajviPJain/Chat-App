const generateMessage=(message,username)=>{
       return {
        text:message,
        createdAt:new Date().getTime(),
        username:username
       }
}

const locationMessage=(lat,lon,username)=>{
    return {
     url:`https://google.com/maps?query=${lat},${lon}`,
     createdAt:new Date().getTime(),
     username:username
    }
}

module.exports={
    generateMessage,
    locationMessage
}