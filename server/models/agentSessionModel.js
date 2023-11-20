const mongoose = require("mongoose");

const agentSessionSchema = new mongoose.Schema({
   
    sessionId:{
        type: String,
        required: true,
        unique: false,
        max: 30,
    },
    connected: {
        type: Boolean,
        default: true,
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
        required: true,
    }
});

module.exports = mongoose.model("AgentSession", agentSessionSchema);