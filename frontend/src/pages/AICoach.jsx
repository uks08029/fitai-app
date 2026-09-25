import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  User,
  Zap,
  Dumbbell,
  ChefHat,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { aiApi } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import { Link } from 'react-router-dom';

export const AICoach = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [providerInfo, setProviderInfo] = useState('Gemini & Sports Science Engine');
  const [alert, setAlert] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setInitialLoading(true);
      const res = await aiApi.getHistory();
      if (res.data.success && res.data.history) {
        setMessages(res.data.history);
      }
    } catch (err) {
      console.warn('Could not load chat history:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText = input) => {
    const textToSend = messageText.trim();
    if (!textToSend || loading) return;

    // Optimistically add user message
    const tempUserMsg = {
      role: 'user',
      message: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(textToSend);
      if (res.data.success) {
        const assistantMsg = res.data.chatMessage || {
          role: 'assistant',
          message: res.data.message,
          timestamp: new Date().toISOString(),
          isFallback: res.data.isDemoMode,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (res.data.provider) {
          setProviderInfo(res.data.provider);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setAlert({
        type: 'error',
        message: 'Could not communicate with AI Coach. Make sure the backend server is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await aiApi.clearHistory();
      setMessages([]);
      setAlert({ type: 'info', message: 'Chat history cleared.' });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const promptSuggestions = [
    'How much protein do I need daily to optimize muscle protein synthesis?',
    'Critique my push workout volume for hypertrophy',
    'Recommend high-protein vegetarian snacks for muscle recovery',
    'How should I adjust my calories for a safe 0.5 kg/week fat cut?',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/25">
            <Bot className="w-6 h-6 text-white" />
            <div className="absolute -inset-0.5 rounded-2xl bg-purple-500/30 blur-sm -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">AI Fitness Coach</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized training & nutritional guidance grounded in sports physiology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Quick Tool Links */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold">Specialized AI Tools:</span>
        <Link
          to="/meal-planner"
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 flex items-center gap-1.5 transition-all"
        >
          <ChefHat className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dynamic Meal Planner</span>
        </Link>
        <Link
          to="/workout"
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 flex items-center gap-1.5 transition-all"
        >
          <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
          <span>Routine Builder</span>
        </Link>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl glass-card border border-slate-800/80">
        {messages.length === 0 && !initialLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Meet Your Personal AI Coach</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Ask questions about your daily nutrition, workout technique, recovery protocols, or ask for a customized routine.
              </p>
            </div>

            {/* Prompt pills */}
            <div className="w-full max-w-lg space-y-2 pt-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Try asking:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {promptSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-white transition-all"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isUser
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-md'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none space-y-2 shadow-lg'
                }`}
              >
                <div className="whitespace-pre-line">{msg.message}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                  <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {!isUser && (
                    <span className="flex items-center gap-1 text-purple-400">
                      <Sparkles className="w-3 h-3" /> FitAI Coach
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 rounded-tl-none">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>Coach is analyzing your biometrics & formulating response...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl glass-card border border-slate-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Coach Alex anything about training, diet, or recovery..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AICoach;
