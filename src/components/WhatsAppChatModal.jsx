import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, CheckCircle2, PhoneCall, RefreshCw, Building2 } from 'lucide-react';

export default function WhatsAppChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `👋 *Welcome to Company IT Helpdesk WhatsApp Support!*\n\n` +
            `Type *helpdesk* to begin raising a ticket, tracking a ticket, or reaching IT support.`,
      buttons: ['helpdesk']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [botStatus, setBotStatus] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchBotStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchBotStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success) {
        setBotStatus(data.data);
      }
    } catch (err) {
      console.error('Error fetching WhatsApp status:', err);
    }
  };

  const sendUserMessage = async (msgText) => {
    if (!msgText.trim() || loading) return;

    const userMsg = msgText.trim();
    setInputText('');

    // Append user message to chat history
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: '919876543210',
          senderName: 'Interactive Web Tester',
          messageText: userMsg
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'bot', 
            text: data.replyText || '*(Bot stayed silent - regular chat)*',
            buttons: data.buttons || null,
            step: data.step || null
          }
        ]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Failed to connect to WhatsApp Bot service.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Connection error. Please check server logs.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    sendUserMessage(inputText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[650px] max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 leading-tight">
                IT WhatsApp Bot
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
              </h3>
              <p className="text-xs text-emerald-100">Automated Step-by-Step Ticket Desk</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status bar */}
        <div className="bg-slate-800/80 border-b border-slate-700/60 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${botStatus?.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {botStatus?.statusMessage || 'WhatsApp Service Active'}
          </span>
          <button 
            onClick={fetchBotStatus}
            className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60 font-sans">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-md whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-none'
                }`}
              >
                <div>{msg.text}</div>

                {/* Interactive Clickable Buttons (e.g. Departments or Menu options) */}
                {msg.sender === 'bot' && msg.buttons && msg.buttons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                    {msg.buttons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        type="button"
                        onClick={() => sendUserMessage(btn)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-emerald-700/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 hover:border-emerald-500 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        {msg.step === 'SELECT_DEPARTMENT' ? (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                            <span>{btn}</span>
                          </>
                        ) : (
                          <span>{btn}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-4 py-2.5 text-sm flex items-center gap-2 border border-slate-700">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type 'helpdesk' or enter details..."
            className="flex-1 bg-slate-950 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
