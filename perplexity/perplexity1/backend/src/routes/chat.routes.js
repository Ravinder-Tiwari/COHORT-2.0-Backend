import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { sendMessage , getChats, getMessages, deleteChat,deleteMessage} from "../controllers/chat.controller.js";

const chatRouter = Router()


chatRouter.post("/message",authUser,sendMessage)
chatRouter.get("/",authUser,getChats)
chatRouter.get("/:chatId/messages",authUser,getMessages)
chatRouter.delete("/:chatId",authUser,deleteChat)
chatRouter.delete("/delete/:chatId",authUser,deleteMessage)

export default chatRouter