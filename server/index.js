const express = require("express");
const app = express(); 
const cors  = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const agentRoutes = require("./routes/agentRoutes");
const messageRoute = require("./routes/messagesRoute");
const queueRoute = require("./routes/queueRoute");
const socket = require("socket.io");
const sessionModel = require("./models/agentSessionModel");

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
    
    console.log(`socket.id: ${socket.id} - socket.sessionId: ${socket.sessionId} - socket.userId: ${socket.userId}`);
    
    // persist session
    
    createSession({
        sessionId: socket.sessionId,
        agent: socket.userId,
        connected: true,
    });
    
    // join the "userId" room
    socket.join(socket.userId);

    // emit session details to specifict room
    socket.to(socket.userId).emit("add-session", {
        sessionId: socket.sessionId,
        userId: socket.userId
    });
     
    socket.on("send-msg",(data)=>{
        const sendUserSocket = onlineAgent.get(data.to);
        if(sendUserSocket) {
            // sent to specifict client connection
            socket.to(sendUserSocket).emit("msg-recieved",data.message);
        }
    });

});

// io middleware
io.use((socket, next) => {
    
    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
        // find existing session
        const session = sessionModel.findOne({ sessionId: sessionId });
        if (session) {
          console.log('Exist')
          socket.sessionId = session.sessionId;
          socket.userId = session.agent;
          return next();
        }
    }

    const userId = socket.handshake.auth.userId;
    if (!userId) {
        return next(new Error("invalid userId"));
    }
    console.log('New')
    // create new session
    socket.sessionId = randomId();
    socket.userId = userId;
    next();
});

global.chatSocket = io;



function randomId() { 
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) { 
        const r = Math.random() * 16 | 0,  
            v = c == 'x' ? r : (r & 0x3 | 0x8); 
        return v.toString(16); 
    }); 
}

async function createSession (data){
    const newSession = await sessionModel.create({
        sessionId: data.sessionId,
        connected: data.connected,
        agent:data.agent,
    });
}