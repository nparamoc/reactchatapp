const messageModel = require("../models/messageModel");
const agentSessionModel = require("../models/agentSessionModel");
const queueModel = require("../models/queueModel");
const enums = require("../conts/enums");
const axios = require("axios");

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
            (body.channelId == null || body.channelId == undefined) ||
            (body.agentId == null || body.agentId == undefined) ||
            (body.text == null || body.text == undefined)) return res.status(400).json({
            msg: "body invalid",
            state: 400
        });

        if( process.env.MS_BOTURL == undefined) return res.status(500).json({
            msg: "MS_BOTURL is null",
            state: 500 
        });

        // get queue
        let filter = { _id: body.conversationId  };
        const queueEntity = await queueModel.findOne(filter);
        if(queueEntity == null ) return res.status(500).json({
            msg: "Error conversationId not exist ",
            state: 500
        });

        // get agent session
        filter = { agent: body.agentId,  };
        const agentSessionEntity = await agentSessionModel.findOne(filter);
        if(agentSessionEntity == null) return res.status(500).json({
            msg: "Agent error ",
            state: 500
        });


        let dNow = new Date();
        let _uniqueId = `${dNow.toISOString()}_${(Math.random() + 1).toString(36).substring(7)}`;
        
        // sent to API integration.
        const msg = await axios.post(process.env.MS_BOTURL + '/api/contactcenter', {
            type: body.type,
            id: _uniqueId,
            text: body.text,
            channelId: body.channel,
            timestamp: dNow.toUTCString(),
            botreference: {
                conversationId: queueEntity.conversationIdReference
            },
            contactcenterreference: {
                state : enums.ConversationStatus.Open,
                conversationid: queueEntity._id
            }
        });

        if(msg.status != 200 ) return res.status(500).json({ 
            msg: "Failed to send message",
            state: 500
        });

        // create db message
        const data = await messageModel.create({
            message:{
                text: body.text
            },
            sender: agentSessionEntity.agent,
            users: [
                agentSessionEntity.agent,
                queueEntity._id
            ],
            conversationId: queueEntity._id,
            user: queueEntity._id,
            agent:agentSessionEntity.agent,
        });

        
        if(! data) return res.status(500).json({ 
            msg: "Failed to add message to DB",
            state: 500
        });
  
        // update from queue
        if(body.type == enums.ActivtyType.EndOfConversation){
            
            filter = { _id: body.conversationId  };
            let update = { isInQueue:false  };
            let doc = await queueModel.findOneAndUpdate(filter, update);

            if(! doc) return res.status(500).json({
                msg: "Error udpate from queue",
                state: 500
            });
            
            // notify all agent
            io.emit("user-disconnected", {_id : body.conversationId });
            
        }

        return res.status(200).json({
            msg: "Message added successfully!",
            state: 200
        });


    } catch (err) {
        console.error(`[messagesController] error: ${err}`);
        next(err);
    }
};

module.exports.getAllMessage = async (req, res, next) => {
    try {
        const {from,to} = req.body;
        const messages = await messageModel.find({ user: from, agent: to }).sort({ createdAt: 1 });

        const projectMessages = messages.map((msg)=>{
            return{
                fromSelf: msg.sender.toString() === to,
                message: msg.message.text,
            };
        });

        res.json(projectMessages);
    } catch (error) {
        console.error(`[messagesController] error: ${err}`);
        next(error);
    }
};

