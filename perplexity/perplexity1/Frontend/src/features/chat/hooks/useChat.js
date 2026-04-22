import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages } from "../chat.slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";


export const useChat = () => {

    const dispatch = useDispatch()
    // const chats = useSelector((state) => state.chat.chats)

    // useEffect(()=>{
    //     console.log(chats)
    // },[])

    async function handleSendMessage({ message, chatId }) {

    dispatch(setLoading(true))

    const isTempChat = !chatId || chatId.length < 20 // simple check

    const data = await sendMessage({
        message,
        chatId: isTempChat ? null : chatId
    })

    const { chat, aiMessage } = data

    // ✅ If temp chat → replace with real chat
    if (isTempChat) {
        dispatch(createNewChat({
            chatId: chat._id,
            title: chat.title,
        }))

        dispatch(setCurrentChatId(chat._id))
        localStorage.setItem("currentChatId", chat._id)
    }

    dispatch(addNewMessage({
        chatId: isTempChat ? chat._id : chatId,
        content: message,
        role: "user",
    }))

    dispatch(addNewMessage({
        chatId: isTempChat ? chat._id : chatId,
        content: aiMessage.content,
        role: aiMessage.role,
    }))
}

    async function handleGetChats() {
        dispatch(setLoading(true))
        const data = await getChats()
        const { chats } = data
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc
        }, {})))
        dispatch(setLoading(false))
    }

    async function handleOpenChat(chatId, chats) {

    const isTempChat = chatId.length < 20 // simple check

    // ❌ DO NOT call backend for temp chat
    if (!isTempChat && chats[chatId]?.messages.length === 0) {

        const data = await getMessages(chatId)
        const { messages } = data

        const formattedMessages = messages.map(msg => ({
            content: msg.content,
            role: msg.role,
        }))

        dispatch(addMessages({
            chatId,
            messages: formattedMessages,
        }))
    }

    dispatch(setCurrentChatId(chatId))
}

    function handleNewChat() {
        const tempId = Date.now().toString() // or uuid()

        dispatch(createNewChat({
            chatId: tempId,
            title: "New Chat",
        }))

        dispatch(setCurrentChatId(tempId))

        return tempId // ✅ important
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleNewChat
    }

}