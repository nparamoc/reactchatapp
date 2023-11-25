const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema({
   
    conversationIdReference:{
        type: String,
        required: true,
        unique: false,
        max: 30,
    },
    userName:{
        type: String,
        required: true,
        unique: false,
        max: 30,
    },
    agentId:{
        type: String,
        required: false,
        unique: false,
        max: 30,
    },
    channelId:{
        type: String,
        required: false,
        unique: false
    },
    isInQueue: {
        type: Boolean,
        default: true,
    }
});

module.exports = mongoose.model("Queue", queueSchema);