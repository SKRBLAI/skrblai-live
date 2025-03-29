import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AIChatInterface({
  agentName,
  agentDescription,
  initialMessage = "Hi there! How can I help you today?",
  onSubmit
}) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      let responseContent = "I'm processing your request...";
      
      if (onSubmit) {
        responseContent = await onSubmit(input);
      }
      
      const aiMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-deep-navy/90 backdrop-blur-md rounded-xl border border-electric-blue/20">
      <div className="flex items-center p-4 border-b border-electric-blue/20">
        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
          AI
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-white">{agentName}</h3>
          <p className="text-sm text-gray-300">{agentDescription}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-teal-500 text-white' 
                : 'bg-deep-navy/80 text-gray-200'
            }`}>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-gray-300 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-deep-navy/80 p-3 rounded-lg text-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-electric-blue/20">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 pr-16 bg-deep-navy/80 text-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-teal-500"
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute right-3 bottom-3 p-2 bg-teal-500 hover:bg-teal-400 rounded-lg text-white disabled:opacity-50"
            disabled={!input.trim() || isLoading}
            title="Send message"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}