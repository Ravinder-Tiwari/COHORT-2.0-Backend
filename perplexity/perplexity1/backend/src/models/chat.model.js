import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

chatSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "chatRef",
});

const ChatModel = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
export default ChatModel;
