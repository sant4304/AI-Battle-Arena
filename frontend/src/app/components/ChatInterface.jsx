import React, { useState, useRef, useEffect } from 'react';
import UserMessage from './UserMessage';
import ArenaResponse from './ArenaResponse';
import axios from "axios";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const problem = inputValue.trim();
    setInputValue('');
    setLoading(true);
    setError(null);

    // Optimistically add the user message first
    const pendingId = Date.now();
    setMessages(prev => [...prev, { id: pendingId, problem, pending: true }]);

    try {
      const response = await axios.post("https://ai-battle-arena-merl.onrender.com/invoke", {
        input: problem
      });

      const data = response.data;

      // Replace the pending message with the full result
      setMessages(prev =>
        prev.map(msg =>
          msg.id === pendingId
            ? { id: pendingId, problem, ...data.result, pending: false }
            : msg
        )
      );
    } catch (err) {
      setError("Something went wrong. Please check the server and try again.");
      // Remove the pending message on error
      setMessages(prev => prev.filter(msg => msg.id !== pendingId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Header */}
      <header className="py-4 px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 flex justify-center">
        <h1 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
          ⚔️ AI Chat Arena
        </h1>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 w-full max-w-6xl mx-auto flex flex-col">
        {messages.length === 0 && !loading ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <div className="text-center space-y-4">
              <div className="text-5xl">⚔️</div>
              <h2 className="text-2xl font-light text-zinc-600 dark:text-zinc-300">Welcome to the Arena</h2>
              <p className="text-zinc-400 max-w-sm">
                Type any problem below. Two AI models will battle it out, and a third will judge the winner.
              </p>
              <div className="flex gap-3 justify-center pt-2 text-sm text-zinc-500">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">Mistral</span>
                <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full">Cohere</span>
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">Gemini Judge</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <UserMessage message={msg.problem} />
              {msg.pending ? (
                <LoadingSkeleton />
              ) : (
                <ArenaResponse
                  solution1={msg.solution_1}
                  solution2={msg.solution_2}
                  judge={msg.judge}
                />
              )}
            </div>
          ))
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </main>

      {/* Input */}
      <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={loading ? "Waiting for the AI Arena..." : "Ask a coding question or any problem..."}
              disabled={loading}
              className="w-full bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-none rounded-full py-4 pl-6 pr-16 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-zinc-400 transition-shadow shadow-sm hover:shadow-md text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              className="absolute right-2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!inputValue.trim() || loading}
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
              )}
            </button>
          </form>
          {loading && (
            <p className="text-center text-xs text-zinc-400 mt-3 animate-pulse">
              🤖 Mistral &amp; Cohere are generating solutions... Gemini is standing by to judge.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 my-8 px-4 w-full animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Skeleton card 1 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-700"></div>
            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-full"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-5/6"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-4/6"></div>
          </div>
          <div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl mt-2"></div>
          <div className="space-y-3">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-full"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-3/4"></div>
          </div>
        </div>

        {/* Skeleton card 2 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-300 dark:bg-violet-700"></div>
            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-full"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-4/6"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-5/6"></div>
          </div>
          <div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl mt-2"></div>
          <div className="space-y-3">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-full"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-2/3"></div>
          </div>
        </div>
      </div>

      {/* Skeleton judge panel */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
        <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-full"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-4/5"></div>
          </div>
          <div className="space-y-4">
            <div className="h-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-full"></div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-3/5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
