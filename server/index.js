const express = require("express");
const app = express(); 
const cors  = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const agentRoutes = require("./routes/agentRoutes");
const messageRoute = require("./routes/messagesRoute");
const queueRoute = require("./routes/queueRoute");
const socket = require("socket.io");
const agentSessionModel = require("./models/agentSessionModel");

//temp
const queueModel = require("./models/queueModel");
const messageModel = require("./models/messageModel");

dotenv.config();
app.use(cors());
app.use(express.json());

//store all online users inside this map
//global.onlineAgent =  new Map();
global.onlineUser =  new Map();
global.io = null;

app.use("/api/auth", agentRoutes);
app.use("/api/message", messageRoute);
app.use("/api/chat", queueRoute)

mongoose.set('strictQuery', true);
//mongoose connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log("DB Connection Successful!");

        agentSessionModel.deleteMany({}).then(x => console.log('agentSessionModel ok'));
        queueModel.deleteMany({}).then(x => console.log('queueModel ok'));
        messageModel.deleteMany({}).then(x => console.log('messageModel ok'));

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
    
    console.log(`socket.id: ${socket.id} - socket.sessionId: ${socket.sessionId} - socket.agent: ${socket.agent}`);
    
    // join the "sessionId" room
    //socket.join(socket.sessionId);
    socket.join(socket.agent);

    // emit session details to specifict socket
    socket.emit("agent-session", {
        sessionId: socket.sessionId
    });

    /*
    socket.on("disconnect", async () => {

        const socketRoomClients = await io.in(socket.agent).allSockets();
        const isDisconnected = socketRoomClients.size === 0;
        if (isDisconnected) {
          // notify other users
          socket.broadcast.emit("user-disconnected", socket.userID);
          // update the connection status of the session
          sessionStore.saveSession(socket.sessionID, {
            userID: socket.userID,
            username: socket.username,
            connected: false,
          });
        }
    });
    */

    
    socket.on("send-msg",(data)=>{
        //const sendUserSocket = onlineAgent.get(data.to);
        if(sendUserSocket) {
            // sent to specifict client connection
            socket.to(sendUserSocket).emit("msg-recieved",data.message);
        }
    });

});

// io middleware
io.use(async (socket, next) => {
    
    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
        const filter = { _id: sessionId }
        const agentSession = await agentSessionModel.findOne(filter);
        
        if (agentSession) {
            console.log(`Exist session session.agent: ${agentSession.agent} - session.connect: ${agentSession.connected}  - session._id: ${agentSession._id}`);
            socket.sessionId = agentSession._id;
            socket.agent = agentSession.agent;
            socket.connected = agentSession.connected;
            return next();
        }
    }

    const userId = socket.handshake.auth.userId;
    if (!userId) return next(new Error("userId requerid"));

    // create new session
    const newSessionId = await createSession({
        agent: userId,
        connected: true,
    });

    if(! newSessionId) return next(new Error("error create session"));
    socket.sessionId = newSessionId;
    socket.agent = userId;
    socket.connected = true;

    console.log(`New`)

    next();
});

global.io = io;



async function createSession (data){
    const item = await agentSessionModel.create({
        connected: data.connected,
        agent:data.agent
    });

    if(!item) return null;

    return item._id
}

// Todo:
/*
queueContoller, add user to queue when no exist agent
what happends with the socket's sessions if server crash
chats.jsx emit new user also, get user when is the first connection
*/