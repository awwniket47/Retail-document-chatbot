import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import Sidebar from '../components/Sidebar'
import MessageBubble from '../components/MessageBubble'
import TypingIndicator from '../components/TypingIndicator'
import { Send, Menu, Sparkles, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function ChatPage() {
  const { user } = useAuth()
  const { messages, isTyping, chat, documents, loadHistory, upload, uploading, uploadProgress } = useChat()
  const [input, setInput]             = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [uploadMsg, setUploadMsg]     = useState(null)
  const bottomRef    = useRef(null)
  const textareaRef  = useRef(null)
  const fileInputRef = useRef(null)  // dedicated hidden file input

  useEffect(() => {
    if (user) loadHistory()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    const q = input.trim()
    if (!q || isTyping) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await chat(q)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const handleFile = async (file) => {
    if (!file) return
    setUploadMsg(null)
    try {
      const result = await upload(file)
      setUploadMsg({ type: 'success', text: `"${result.filename}" added — ${result.chunks_added} chunks` })
    } catch {
      setUploadMsg({ type: 'error', text: 'Upload failed. Please try again.' })
    }
    setTimeout(() => setUploadMsg(null), 4000)
  }

  // Drag-and-drop on the chat area
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => handleFile(acceptedFiles[0]),
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  })

  // Hidden <input type="file"> — triggered by any button anywhere on the page
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''  // reset so same file can be picked again
  }

  const openFilePicker = () => fileInputRef.current?.click()

  return (
    <div className="flex h-screen bg-surface overflow-hidden">

      {/* Single hidden file input used by all upload buttons */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 relative">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-2">
            <Menu size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-white/80 font-medium text-sm">
              {documents.length > 0
                ? `Chatting with ${documents.length} document${documents.length > 1 ? 's' : ''}`
                : 'Retail Doc Intel'
              }
            </h1>
            {documents.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                {documents.map((doc, i) => (
                  <span key={i} className="flex items-center gap-1 text-white/25 text-xs">
                    <FileText size={10} />
                    <span className="truncate max-w-[120px]">{doc.name}</span>
                    {i < documents.length - 1 && <span className="text-white/15">·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Add PDF button — visible after first upload */}
          {documents.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              {uploadMsg && (
                <span className={`text-xs hidden sm:flex items-center gap-1 animate-fade-in
                  ${uploadMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {uploadMsg.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  {uploadMsg.text}
                </span>
              )}
              <button
                onClick={openFilePicker}
                disabled={uploading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                  ${uploading
                    ? 'border-border text-white/30 cursor-not-allowed'
                    : 'border-accent/30 bg-accent/10 hover:bg-accent/20 text-accent'
                  }`}
              >
                <Upload size={12} />
                {uploading ? `${uploadProgress}%` : 'Add PDF'}
              </button>
            </div>
          )}
        </header>

        {/* Messages / drop zone */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 relative" {...getRootProps()}>

          {/* Drag overlay */}
          {isDragActive && (
            <div className="absolute inset-0 z-10 bg-accent/5 border-2 border-dashed border-accent/40 flex items-center justify-center pointer-events-none">
              <p className="text-accent text-sm font-medium">Drop PDF here</p>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-accent/60" />
              </div>

              <h2 className="text-white/50 font-medium mb-2">
                {documents.length === 0 ? 'Upload a document to get started' : 'Ask anything about your documents'}
              </h2>
              <p className="text-white/25 text-sm max-w-sm mb-6">
                {documents.length === 0
                  ? 'Upload a retail PDF and start chatting about its contents'
                  : 'Your documents are indexed and ready. Ask questions about products, reports, or manuals.'
                }
              </p>

              {documents.length === 0 && (
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={openFilePicker}
                    disabled={uploading}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border transition-all text-sm font-medium
                      ${uploading
                        ? 'border-border text-white/30 cursor-not-allowed'
                        : 'border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent-light'
                      }`}
                  >
                    <Upload size={15} />
                    {uploading ? `Uploading... ${uploadProgress}%` : 'Upload PDF'}
                  </button>
                  {uploading && (
                    <div className="w-48 bg-surface-3 rounded-full h-1">
                      <div
                        className="bg-accent h-1 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  {uploadMsg && (
                    <p className={`text-xs ${uploadMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {uploadMsg.text}
                    </p>
                  )}
                  <p className="text-white/20 text-xs">or drag & drop a PDF anywhere</p>
                </div>
              )}

              {documents.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {['Summarize the key points', 'What are the main products?', 'Give me the pricing details', 'What are the sales highlights?'].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="px-3 py-1.5 rounded-full border border-border hover:border-accent/30 hover:bg-accent/5 text-white/40 hover:text-white/70 text-xs transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-border bg-surface/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto">
            <div className={`flex items-end gap-3 bg-surface-2 border rounded-2xl px-4 py-3 transition-colors
              ${isTyping ? 'border-border opacity-70' : 'border-border focus-within:border-accent/40'}`}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={documents.length === 0 ? 'Upload a document first...' : 'Ask about your documents...'}
                disabled={isTyping}
                rows={1}
                className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/25 focus:outline-none resize-none leading-relaxed max-h-40"
                style={{ minHeight: '24px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all
                  ${input.trim() && !isTyping
                    ? 'bg-accent hover:bg-accent-light text-white'
                    : 'bg-surface-3 text-white/20 cursor-not-allowed'
                  }`}
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-white/15 text-xs mt-2">
              Responses are grounded in your uploaded documents
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}