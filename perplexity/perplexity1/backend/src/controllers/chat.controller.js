import { generateChatTitle, generateResponse } from "../services/ai.service.js"
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js"


export async function sendMessage(req, res, next) {
    try{
         const { message, chat: chatId } = req.body
    console.log(message)

    // console.log(title)
    let title = null;
    let chat = null;
    console.log(chatId)

    if (!chatId) {
        title = await generateChatTitle(message)
        chat = await chatModel.create({
            user: req.user.id,
            title,
        })
    }


    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        role: "user"
    })

    const messages = await messageModel.find({ chat: chatId || chat._id })

    console.log(messages)

    const result = await generateResponse(messages)
    console.log("Generated Response:", result)  
  
    const aiMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: result,
        role: "ai"
    })
    console.log(aiMessage)

    // console.log("AI Message:", aiMessage.content)
    // console.log("DB Name:", chat.db.name)
    res.status(201).json({
        title,
        chat,
        aiMessage
    })
    }
    catch(err){
        console.error("Error in sendMessage:", err)
        res.status(500).json({
            message: "An error occurred while processing the message.",
            error: err.message
        })
    }
   
}

export async function getChats(req, res, next) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })


    res.status(200).json({
        message: "Chats fetched successfully",
        chats
    })
}


export async function getMessages(req, res, next) {
    const chatId = req.params.chatId
    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })
    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }
    const messages = await messageModel.find({ chat: chatId })
    res.status(200).json({
        message: "Messages fetched successfully",
        messages
    })
}

export async function deleteChat(req, res, next) {
    const chatId = req.params.chatId
    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })
    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }
    await messageModel.deleteMany({ chat: chatId })

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}


export async function deleteMessage(req, res, next) {
    const chatId = req.params.chatId
    // const messageId = req.params.messageId
    await messageModel.findOneAndDelete({
        chat: chatId
    })

    res.status(200).json({
        message: "Message deleted successfully"
    })
}