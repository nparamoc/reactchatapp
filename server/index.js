const express = require("express");
const app = express(); 
const cors  = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const agentRoutes = require("./routes/agentRoutes");
const messageRoute = require("./routes/messagesRoute");
const queueRoute = require("./routes/queueRoute");
const socket = require("socket.io");

dotenv.config();
app.use(cors());
app.use(express.json());

//store all online users inside this map
global.onlineAgent =  new Map();
global.onlineUser =  new Map();
global.chatSocket = null;

app.use("/api/auth", agentRoutes);
app.use("/api/message", messageRoute);
app.use("/api/chat", queueRoute)

mongoose.set('strictQuery', true);
//mongoose connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log("DB Connection Successful!")
    }).catch((err) => console.log(err));



const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server started on Port ${process.env.PORT}`);
});


const io = socket(server,{
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

 
io.on("connection",(socket)=>{
    
    socket.on("add-agent",(userId)=>{
        console.log('new agent: ' + socket.id)
        onlineAgent.set(userId,socket.id);
        //onlineAgent.set(userId,socket.id);
    });

    socket.on("send-msg",(data)=>{
        const sendUserSocket = onlineAgent.get(data.to);
        if(sendUserSocket) {
            // sent to specifict client connection
            socket.to(sendUserSocket).emit("msg-recieved",data.message);
        }
    });

});

io.on("disconnect", (socket) => {
    console.log('delete agent: ' + socket.id)
    //onlineAgent.delete(socket.id);
});

global.chatSocket = io;
