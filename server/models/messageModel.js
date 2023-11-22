const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    conversationId: { type: String, required: true },
    user: { type: String, required: true },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: false,
    },
    sender: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", messageSchema);