require('dotenv').config();
var mongoose=require('mongoose')
var express=require('express')
var app=express()
const http=require('http').Server(app)
const path=require('path')
const io=require('socket.io')(http)
const User=require('./models/userModel')
const Chat=require('./models/chatModel')
const userRoute=require('./routes/userRoute')

mongoose.connect(process.env.MONGODB_ATLAS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
    });

    app.use("/assets", express.static(path.join(__dirname, "public/assets")));

  

    app.use('/',userRoute)
    var usp=io.of('/user-namespace');

    usp.on('connection',async function(socket){
        console.log("user connected");
        console.log(socket);

        var userId=socket.handshake.auth.token
        console.log(userId);
        await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'1'}})



        socket.broadcast.emit('getOnlineUser',{user_id:userId});



        socket.on('disconnect',async function(){
            console.log("user disconnected");
            var userId=socket.handshake.auth.token
            await User.findByIdAndUpdate({_id:userId},{$set:{is_online:'0'}})
            socket.broadcast.emit('getOfflineUser',{user_id:userId});
        })

        socket.on('newChat',function(data){
            socket.broadcast.emit("loadNewChat",data);
        })
        socket.on('existsChat',async function(data){
            var chats=await Chat.find({$or:[
                {sender_id:data.sender_id,receiver_id:data.receiver_id},
                {sender_id:data.receiver_id,receiver_id:data.sender_id}
            ]})
            socket.emit('loadChats',{chats:chats})
        })


    })



 const PORT = process.env.PORT || 8990;
http.listen(PORT, () => {
  console.log(`server is running on  ${PORT}`);
});

