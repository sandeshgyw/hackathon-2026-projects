import { useState } from 'react'
import { MessageSquare, Sparkles, X, Send, ClipboardList, AlertCircle, Bot } from 'lucide-react'

function CareBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello Dr. Robert! I'm your Care Assistant. Need help generating a targeted rehab plan or a todo list for a patient?" }
  ])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSend = async () => {
    if (!query.trim()) return

    const userQuery = query
    const userMsg = { role: 'user', content: userQuery }
    setMessages(prev => [...prev, userMsg])
    setQuery('')
    setIsGenerating(true)

    try {
      const token = localStorage.getItem('devcare_access_token')
      
      if (!token) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "You need to be logged in to use Care AI. Please log in and try again." 
        }])
        setIsGenerating(false)
        return
      }

      const res = await fetch('http://localhost:8000/api/rehab/chatbot/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: userQuery })
      })
      
      if (res.status === 401) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "Your session has expired. Please log out and log back in." 
        }])
        return
      }

      if (!res.ok) throw new Error('API error')
      
      const data = await res.json()
      const botMsg = { 
        role: 'bot', 
        content: data.content,
        todoList: data.todoList
      }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error('CareBot Error:', err)
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "Sorry, I'm having trouble connecting to the Care AI service." 
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[400px] max-h-[600px] elevated-card border-none bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[var(--color-primary)] p-6 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Care AI Bot</h3>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Rehab Intelligence</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 min-h-[350px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-[var(--color-primary)] text-white shadow-md rounded-tr-none' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.content}
                  
                  {msg.todoList && msg.todoList.length > 0 && (
                    <div className="mt-4 space-y-2">
                       <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
                          <ClipboardList size={12} /> Generated Todo List
                       </div>
                       {msg.todoList.map((item, idx) => (
                         <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[13px] text-slate-600">
                            <div className="h-4 w-4 rounded-full border-2 border-blue-200 mt-0.5 shrink-0"></div>
                            {item}
                         </div>
                       ))}
                       <button className="w-full mt-2 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
                          Sync to Patient App
                       </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask CareBot to generate tasks..."
                className="auth-input pr-12 h-[52px] bg-slate-50 focus:bg-white text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[9px] font-bold text-slate-400 px-1">
               <AlertCircle size={10} /> AI suggestions should be reviewed by a clinical professional.
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-slate-900 text-white rotate-90' 
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
        }`}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-4 border-white animate-pulse"></div>
        )}
      </button>
    </div>
  )
}

export default CareBot
