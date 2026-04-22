import React, { useEffect, useRef, useState } from 'react'
import { FaRegPenToSquare } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { BsPerplexity } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Dashboard = () => {

  const chat = useChat()
  const [chatInput, setChatInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatAvailable, setChatAvailable] = useState(false);
  const [showMenuButton, setShowMenuButton] = useState(true);

  // ✅ NEW STATES (no UI change)
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState("")

  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  const messagesContainerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [showScrollDown, setShowScrollDown] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ✅ STREAMING FUNCTION
  const streamTextEffect = (text) => {
    let i = 0
    setStreamingText("")
    const interval = setInterval(() => {
      setStreamingText(prev => prev + text[i])
      i++
      if (i >= text.length) clearInterval(interval)
    }, 15)
  }

  // ✅ MODIFIED SUBMIT (no UI change)
  const handleSubmitMessage = async (e) => {
    e.preventDefault()
    const trimmed = chatInput.trim()
    if (!trimmed) return

    setLoading(true)
    setStreamingText("")

    const res = await chat.handleSendMessage({ message: trimmed, chatId: currentChatId })

    if (res?.content) {
      streamTextEffect(res.content)
    }

    setChatInput('')
    setLoading(false)
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
    localStorage.setItem("currentChatId", chatId)
    setSidebarOpen(false)
  }

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 50

      setShowScrollDown(!isAtBottom)

      if (container.scrollTop > 50) {
        setShowMenuButton(false)
      } else {
        setShowMenuButton(true)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chats[currentChatId]?.messages, streamingText])

  useEffect(() => {
    const saved = localStorage.getItem("currentChatId")
    if (saved && chats[saved]) {
      chat.handleOpenChat(saved, chats)
    }
  }, [chats])

  useEffect(() => {
    setChatAvailable((chats[currentChatId]?.messages?.length || 0) > 0)
  }, [chats, currentChatId])

  useEffect(() => {
    const ids = Object.keys(chats)
    if (ids.length > 0 && !currentChatId) {
      chat.handleOpenChat(ids[ids.length - 1], chats)
    }
  }, [chats])

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#2c2c2c] via-[#0f0a18] to-[#140d1f] text-white">

      <div className="flex h-screen">

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`md:hidden fixed top-4 left-4 z-50 bg-pink-500 px-3 py-2 rounded-lg transition-all duration-300
          ${showMenuButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}
        `}
        >
          ☰
        </button>

        {/* SIDEBAR */}
        <aside className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-[#0f0a18] p-4 border border-white/10 transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

          <h1 className="mb-5 text-xl sm:text-2xl text-center text-pink-300">
            Perplexity
          </h1>

          <button
            onClick={() => {
              const newChatId = chat.handleNewChat()
              if (newChatId) {
                localStorage.setItem("currentChatId", newChatId)
              }
              if (sidebarOpen) setSidebarOpen(false)
            }}
            className="w-fit flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-white/5 hover:bg-green-500/20"
          >
            <FaRegPenToSquare /> New Chat
          </button>

          <div className="overflow-y-auto max-h-[75vh] space-y-2">
            {Object.entries(chats).map(([chatId, chat]) => (
              <button
                key={chatId}
                onClick={() => openChat(chatId)}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-pink-500/20"
              >
                {chat.title}
              </button>
            ))}
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* CHAT */}
        <section className="flex flex-col justify-center flex-1 max-w-full md:max-w-3xl mx-auto w-full relative">

          {!chatAvailable && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
              {/* ✅ BLINKING LOADER ICON */}
              {loading ? (
                <BsPerplexity className="text-6xl sm:text-8xl text-pink-400 animate-pulse" />
              ) : (
                <h1 className="text-6xl sm:text-8xl text-pink-400">
                  <BsPerplexity />
                </h1>
              )}
            </div>
          )}

          {/* MESSAGES */}
          <div
            ref={messagesContainerRef}
            className={`h-130 flex-1 sm:flex-none overflow-y-auto space-y-3 px-2 sm:px-4
              ${!chatAvailable ? 'hidden' : 'block'}
            `}
          >
            {chats[currentChatId]?.messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[95%] sm:max-w-[70%] w-fit px-4 py-3 rounded-2xl text-sm sm:text-base
                ${message.role === 'user'
                    ? 'ml-auto bg-pink-500/30'
                    : 'mr-auto bg-white/5'
                  }`}
              >
                {message.role === 'user' ? (
                  <p>{message.content}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            ))}

            {/* ✅ STREAMING MESSAGE */}
            {streamingText && (
              <div className="mr-auto bg-white/5 px-4 py-3 rounded-2xl">
                <ReactMarkdown>{streamingText}</ReactMarkdown>
              </div>
            )}

            {/* ✅ LOADER MESSAGE */}
            {loading && !streamingText && (
              <div className="mr-auto bg-white/5 px-4 py-3 rounded-2xl animate-pulse">
                <BsPerplexity className="inline mr-2 animate-spin" />
                Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT (UNCHANGED) */}
          <div className={`flex flex-col bg-[#1b1325]/90 p-3 border rounded-2xl border-white/10
              ${chatAvailable
                ? 'fixed bottom-0 left-0 w-full md:static'
                : 'absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl'
              }`}
          >
            <form onSubmit={handleSubmitMessage} className="flex gap-2">
              <div className="flex flex-1 items-center px-3 py-2 rounded-xl">
                <FiSearch className="mr-2" />
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="bg-transparent flex-1 outline-none"
                />
              </div>
            </form>

            <div className='mt-9 flex justify-between'>
              <h5 className='flex items-center justify-center rounded-full border border-zinc-500 text-zinc-500 px-2 py-1 w-fit'>
                <IoMdAdd />
              </h5>

              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 py-2 bg-pink-500 rounded-xl disabled:opacity-40"
              >
                <IoSend />
              </button>
            </div>
          </div>

        </section>
      </div>
    </main>
  )
}

export default Dashboard