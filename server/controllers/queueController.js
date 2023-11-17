const queueModel = require("../models/queueModel");
const messageModel = require("../models/messageModel");

module.exports.addMessage = async (req, res, next) => {
    try {
        const body =  req.body;
        
        // validations
        if(body == null || body == undefined) return res.status(400).json({
            msg: "body mustn't be null",
            state: 400
        });

        if((body.kind == null || body.kind == undefined) || 
            (body.conversationId == null || body.conversationId == undefined) || 
            (body.channel == null || body.channel == undefined) ||
            (body.message == null || body.message == undefined)) return res.status(400).json({
            msg: "body invalid",
            state: 400
        });

        if(onlineAgent == null || onlineAgent == undefined) return res.status(500).json({
            msg: "Not Agent error ",
            state: 500
        });

        
        // get user from queue
        const filter = { _id: body.conversationId  };
        let queue = await queueModel.findOne(filter);

        if(! queue) return res.status(500).json({
            msg: "Error not exist conversationId",
            state: 500
        });

        const getAgentSocket = onlineAgent.get(queue.agentId);
        if(getAgentSocket) res.status(500).json({
            msg: "Invalid agent",
            state: 500
        });

        
        // create message
        const message = await messageModel.create({
            message:{
                text: body.message
            },
            users: [
                queue.agentId,
                queue._id,
                body.conversationId
            ],
            conversationId: body.conversationId,
            user: queue._id,
            agent:queue.agentId,
        });

        // sent to specifict client connection
        chatSocket.to(getAgentSocket).emit("msg-recieved",body.message);

        if(message) return res.status(200).json({
            msg: "Message sent successfully!",
            state: 200,
            response: {
                id: message._id
            }
        });

        return res.status(500).json({
            msg: "Internal server error",
            state: 500
        });

    } catch (err) {
        next(err);
    }
};

module.exports.addUserQueue = async (req, res, next) => {
    try {
        
        const body =  req.body;
        
        // validations
        if(body == null || body == undefined) return res.status(400).json({
            msg: "body mustn't be null",
            state: 400
        });

        if((body.kind == null || body.kind == undefined) || 
            (body.conversationIdReference == null || body.conversationIdReference == undefined) || 
            (body.channel == null || body.channel == undefined)  || 
            (body.userName == null || body.userName == undefined)) return res.status(400).json({
            msg: "body invalid",
            state: 400
        });

        if(onlineAgent == null || onlineAgent == undefined) return res.status(500).json({
            msg: "Not Agent error ",
            state: 500
        });
        
        const queue = await queueModel.create({
            agentId: '',
            isInQueue:true,
            conversationIdReference:body.conversationIdReference ,
            userName: body.userName
        });

        if(!queue) return res.status(500).json({
            msg: "Internal server error",
            state: 500
        });

        
        const addUser  = { 
            agentId: '',
            isInQueue:true,
            conversationIdReference:body.conversationIdReference ,
            userName: body.userName,
            _id: queue._id
        };
        
        // notify all agent
        socket.emit("add-user", addUser );

        return res.status(200).json({
            msg: "Message sent successfully!",
            state: 200,
            response: {
                conversationId: queue._id
            }
        });

    } catch (err) {
        next(err);
    }
};

module.exports.pickUserQueue = async (req, res, next) => {
    try {
        const body =  req.body;
        
        // validations
        if(body == null || body == undefined) return res.status(400).json({
            msg: "body mustn't be null",
            state: 400
        });

        if((body.kind == null || body.kind == undefined) || 
            (body.conversationId == null || body.conversationId == undefined) || 
            (body.channel == null || body.channel == undefined)  ||
            (body.agentId == null || body.agentId == undefined)) return res.status(400).json({
            msg: "body invalid",
            state: 400
        });

        if(onlineAgent == null || onlineAgent == undefined) return res.status(500).json({
            msg: "Not Agent error ",
            state: 500
        });

       
        const filter = { _id: body.conversationId  };
        const update = { agentId: body.agentId, isInQueue:true  };
        let doc = await queueModel.findOneAndUpdate(filter, update);

        if(! doc) return res.status(400).json({
            msg: "conversationId is Null",
            state: 400
        });

        doc = await queueModel.findOne(filter);
       
        return res.json({
            msg: "Message sent successfully!",
            response: {
                conversationId: doc._id,
                agentId: doc.agentId,
                isInQueue: doc.isInQueue
            }
        });
       

    } catch (err) {
        next(err);
    }
};
