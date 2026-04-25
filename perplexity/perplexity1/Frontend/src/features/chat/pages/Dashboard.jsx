import React, { useEffect, useRef, useState } from 'react'
import { FaRegPenToSquare } from "react-icons/fa6";
import { FiSearch, FiSun, FiMoon } from "react-icons/fi";
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
  const [theme, setTheme] = useState('dark')

  // NEW STATES
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

  // STREAMING FUNCTION - ENHANCED for natural streaming
  const streamTextEffect = (text) => {
    let i = 0
    setStreamingText("")
    const interval = setInterval(() => {
      // Stream chunks instead of single characters for a more natural line-reading effect
      const chunk = Math.floor(Math.random() * 4) + 1
      setStreamingText(text.slice(0, i + chunk))
      i += chunk
      if (i >= text.length) {
        setStreamingText(text)
        clearInterval(interval)
      }
    }, 15)
  }

  const handleSubmitMessage = async (e) => {
    e.preventDefault()
    const trimmed = chatInput.trim()
    if (!trimmed) return

    setLoading(true)
    setStreamingText("")
    
    // Optimistic UI clear
    setChatInput('')

    const res = await chat.handleSendMessage({ message: trimmed, chatId: currentChatId })

    if (res?.content) {
      streamTextEffect(res.content)
    }

    setLoading(false)
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
    localStorage.setItem("currentChatId", chatId)
    setSidebarOpen(false)
  }

  // Theme effect toggle
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
    // Default theme based on system preference or local storage could be added here
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
    <main className="min-h-screen w-full bg-[#f8f9fc] dark:bg-gradient-to-br dark:from-[#0b1326] dark:to-[#171f33] text-slate-800 dark:text-[#dae2fd] transition-colors duration-500">
      <div className="flex h-screen relative">
        
        {/* THEME TOGGLE (Absolute Top Right) */}
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-slate-200/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            {theme === 'dark' ? <FiSun className="text-yellow-400 text-xl" /> : <FiMoon className="text-indigo-600 text-xl" />}
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`md:hidden fixed top-4 left-4 z-50 bg-[#10b981] text-white p-3 rounded-full shadow-lg transition-all duration-300
          ${showMenuButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}`}
        >
          ☰
        </button>

        {/* SIDEBAR - STRICT GLASSMORPHISM */}
        <aside className={`fixed md:static z-40 top-0 left-0 h-full w-64 md:w-72 
          bg-white/50 dark:bg-[#131b2e]/60 backdrop-blur-xl border-r border-[#e2e8f0]/40 dark:border-white/5
          p-5 transform transition-transform duration-300 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>

          <h1 className="mb-8 mt-2 text-2xl font-semibold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-[#10b981] to-[#4edea3]">
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
            className="w-full flex items-center justify-between gap-2 mb-6 px-4 py-3 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 transition-all text-sm font-medium"
          >
            <span>New Thread</span>
            <FaRegPenToSquare className="text-slate-500 dark:text-slate-400" />
          </button>

          <div className="overflow-y-auto flex-1 space-y-1 rounded-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2">History</h3>
            {Object.entries(chats).reverse().map(([chatId, chatItem]) => (
              <button
                key={chatId}
                onClick={() => openChat(chatId)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm truncate transition-colors duration-200
                  ${currentChatId === chatId 
                    ? 'bg-[#10b981]/15 text-[#10b981] dark:bg-[#4edea3]/10 dark:text-[#4edea3] font-medium' 
                    : 'hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'}
                `}
              >
                {chatItem.title || "New Search"}
              </button>
            ))}
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/50 backdrop-blur-sm md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MAIN CHAT AREA */}
        <section className="flex flex-col flex-1 w-full relative">

          {/* EMPTY STATE */}
          {!chatAvailable && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 -mt-20 px-4">
              <div className="relative">
                {loading && <div className="absolute inset-0 bg-[#4edea3] rounded-full blur-[60px] opacity-20 animate-pulse"></div>}
                <BsPerplexity className={`text-7xl sm:text-8xl transition-all duration-700 
                  ${loading ? 'text-[#10b981] scale-110' : 'text-slate-300 dark:text-slate-700'}`} 
                />
              </div>
              <h2 className="text-2xl sm:text-4xl font-semibold text-center text-slate-700 dark:text-white max-w-lg tracking-tight">
                Where knowledge begins
              </h2>
            </div>
          )}

          {/* MESSAGES LIST */}
          <div
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto px-4 md:px-12 lg:px-32 max-w-5xl mx-auto w-full pt-20 pb-40
              ${!chatAvailable ? 'hidden' : 'block'}
            `}
          >
            <div className="space-y-16">
              {chats[currentChatId]?.messages.map((message, index) => (
                <div key={index} className="flex flex-col gap-3">
                  
                  {/* USER MESSAGE */}
                  {message.role === 'user' && (
                    <div className="self-end ml-auto bg-slate-200/80 dark:bg-[#283044]/60 backdrop-blur-sm px-6 py-4 rounded-3xl rounded-tr-sm text-base sm:text-lg max-w-[85%] border border-slate-300/30 dark:border-white/5">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  )}

                  {/* AI MESSAGE */}
                  {message.role !== 'user' && (
                    <div className="self-start mr-auto w-full max-w-full text-base sm:text-lg break-words prose prose-slate dark:prose-invert prose-p:leading-relaxed prose-pre:bg-[#060e20] prose-pre:border prose-pre:border-slate-800">
                      <div className="pl-4 sm:pl-6 border-l-2 border-[#10b981] dark:border-[#4edea3]/40">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* LOADER MESSAGE */}
              {loading && !streamingText && (
                <div className="self-start w-full">
                  <div className="pl-4 sm:pl-6 border-l-2 border-[#10b981] dark:border-[#4edea3] flex items-center space-x-4 h-8 animate-pulse text-[#10b981] font-medium tracking-wide">
                    <BsPerplexity className="animate-spin text-xl" />
                    <span>Analyzing sources...</span>
                  </div>
                  {/* Skeletal lines */}
                  <div className="pl-4 sm:pl-6 mt-4 space-y-3 opacity-40">
                    <div className="h-4 bg-slate-300 dark:bg-white/10 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-300 dark:bg-white/10 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-slate-300 dark:bg-white/10 rounded w-5/6 animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* STREAMING MESSAGE */}
              {streamingText && (
                <div className="self-start mr-auto w-full max-w-full text-base sm:text-lg break-words prose prose-slate dark:prose-invert prose-p:leading-relaxed">
                  <div className="pl-4 sm:pl-6 border-l-2 border-[#10b981] dark:border-[#4edea3]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingText}
                    </ReactMarkdown>
                    <span className="inline-block w-2 bg-[#10b981] dark:bg-[#4edea3] h-[1.1em] align-middle ml-1 animate-pulse"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* FLOATING INPUT BAR */}
          <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-gradient-to-t from-[#f8f9fc] via-[#f8f9fc]/80 to-transparent dark:from-[#0b1326] dark:via-[#0b1326]/80 flex justify-center z-20">
            <div className={`w-full max-w-3xl transition-all duration-500 
                bg-white/80 dark:bg-[#171f33]/80 backdrop-blur-2xl p-2 rounded-[2rem] 
                shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
                border border-slate-200/60 dark:border-[#3c4a42]/40
                ${chatAvailable ? '' : 'transform md:-translate-y-20'}`}
            >
              <form onSubmit={handleSubmitMessage} className="flex gap-2">
                <div className="flex flex-1 items-center pl-4 py-3 rounded-full">
                  <FiSearch className="mr-3 text-slate-400 text-lg" />
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="bg-transparent flex-1 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg"
                    disabled={loading && !streamingText}
                  />
                </div>
                
                <div className='flex items-center gap-2 pr-2'>
                  <button type="button" className='flex items-center justify-center rounded-full p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5 transition-colors'>
                    <IoMdAdd className="text-xl" />
                  </button>

                  <button
                    type="submit"
                    disabled={!chatInput.trim() || (loading && !streamingText)}
                    className="p-3 bg-[#10b981] hover:bg-[#0ea5e9] dark:bg-[#4edea3] dark:hover:bg-[#10b981] text-white dark:text-[#003824] rounded-full transition-all duration-300 disabled:opacity-40 disabled:scale-95 hover:scale-105"
                  >
                    <IoSend className="text-xl" />
                  </button>
                </div>
              </form>
            </div>
          </div>

        </section>
      </div>
    </main>
  )
}

export default Dashboard