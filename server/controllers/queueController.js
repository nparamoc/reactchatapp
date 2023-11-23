const queueModel = require("../models/queueModel");
const messageModel = require("../models/messageModel");
const agentSessionModel = require("../models/agentSessionModel");
const agentModel = require("../models/agentModel");
const enums = require("../conts/enums");

module.exports.addMessage = async (req, res, next) => {
    try {

        const body =  req.body;

        // validations
        if(body == null || body == undefined) return res.status(400).json({
            msg: "body mustn't be null",
            state: 400
        });

        if((body.type == null || body.type == undefined) || 
            (body.conversationId == null || body.conversationId == undefined) || 
            (body.channel == null || body.channel == undefined) ||
            (body.message == null || body.message == undefined)) return res.status(400).json({
            msg: "body invalid",
            state: 400
        });

         // get queue
         let filter = { _id: body.conversationId  };
         const queueEntity = await queueModel.findOne(filter);
         if(queueEntity == null ) return res.status(500).json({
            msg: "Error conversationId not exist ",
             state: 500
         });

         // there is agent assigned
         if(queueEntity.agentId != null && queueEntity.agentId != '' ){
            
            // get agent session
            filter = { agent: queueEntity.agentId };
            const agentSessionEntity = await agentSessionModel.findOne(filter);
            if(agentSessionEntity == null) return res.status(500).json({
                msg: "Agent error ",
                state: 500
            });
            
            console.log(`agent: ${agentSessionEntity.agent} - _id: ${agentSessionEntity._id} - body.type: ${body.type}`);

            // sent to specifict room connection
            io.to(agentSessionEntity._id.toString()).emit("msg-recieved", body.message.toString());

            // create message
            const message = await messageModel.create({
                message:{
                    text: body.message
                },
                sender: queueEntity._id,
                users: [
                    queueEntity._id,
                    agentSessionEntity.agent
                ],
                conversationId: queueEntity._id,
                user: queueEntity._id,
                agent:agentSessionEntity.agent,
            });

            
            if(message) return res.status(200).json({
                msg: "Message sent successfully!",
                state: 200,
                response: {
                    id: message._id
                }
            });
            
        }else{
            
            // create message
            const message = await messageModel.create({
                message:{
                    text: body.message
                },
                sender: queueEntity._id,
                users: [
                    queueEntity._id
                ],
                conversationId: queueEntity._id,
                user: queueEntity._id,
                agent: null,
            });

            if(message) return res.status(200).json({
                msg: "Message sent successfully!",
                state: 200,
                response: {
                    id: message._id
                }
            });
        }
         

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

        if((body.type == null || body.type == undefined) || 
            (body.conversationIdReference == null || body.conversationIdReference == undefined) || 
            (body.channel == null || body.channel == undefined)  || 
            (body.userName == null || body.userName == undefined)) return res.status(400).json({
            msg: "body invalid",
            state: 400
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
        io.emit("user-connected", addUser);
        
        
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

        if((body.type == null || body.type == undefined) || 
            (body.conversationId == null || body.conversationId == undefined) || 
            (body.channel == null || body.channel == undefined)  ||
            (body.agentId == null || body.agentId == undefined)) return res.status(400).json({
            msg: "body invalid",
            state: 400
        });

        // get queue
        let filter = { _id: body.conversationId  };
        const queueEntity = await queueModel.findOne(filter);
        if(queueEntity == null ) return res.status(500).json({
            msg: "Error not exist conversationId",
            state: 500
        });

        // get agent
        filter = { _id: body.agentId  };
        let agentEntity = await agentModel.findOne(filter);
        if( agentEntity == null ) return res.status(500).json({
            msg: "Agent Id error ",
            state: 500
        });

        // user from quequ already asigned to diferent agent
        if(queueEntity.agentId != null && queueEntity.agentId != '' ) 
            if(queueEntity.agentId != queueEntity.agentId) return res.status(200).json({
            msg: "User queue already asigned",
            state: enums.ApiCodes.UserQueueAlreadyAsigned
        });


        // get agent session
        filter = { agent: agentEntity._id  };
        let agentSessionEntity = await agentSessionModel.findOne(filter);
        if(agentSessionEntity == null) return res.status(500).json({
            msg: "Agent error ",
            state: 500
        });

        
        // update queue
        filter = { _id: body.conversationId  };
        let update = { agentId: body.agentId, isInQueue:true  };
        let doc = await queueModel.findOneAndUpdate(filter, update);

        if(! doc) return res.status(400).json({
            msg: "conversationId is Null",
            state: 400
        });

        // get queue
        doc = await queueModel.findOne(filter);
       
        // update all message without agent
        filter = { user: doc._id, agent: null  };
        update = { agent: agentEntity._id, users:[ doc._id , agentEntity._id]  };
        await messageModel.updateMany(filter, update);
        
        return res.json({
            msg: "Message sent successfully!",
            state: 200,
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
