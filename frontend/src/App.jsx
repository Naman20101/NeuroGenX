import { useState, useRef, useEffect } from 'react';
import { SparklesIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// The main App component for the conversational NeuroGenX-AI.
export default function App() {
  const [messages, setMessages] = useState([{
    sender: 'ai',
    text: "Hello there! I am NeuroGenX-AI, your universal project generator. What can I build for you today? 💻"
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat window on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Handle the user's message submission
  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: userMessage.text })
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      let aiResponseText = result.project_code || "Sorry, I couldn't generate a response. Please try again.";
      if (result.status === 'failed') {
          aiResponseText = "An error occurred while generating the project. Please try again with a different topic.";
      }
      
      const newAiMessage = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage = { sender: 'ai', text: "Apologies, an error occurred while connecting to the AI. Please check your network and try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Render the chat message with Markdown and code block handling
  const renderMessage = (message) => {
    const isCode = message.text.includes('```');
    let htmlContent = '';
    if (isCode) {
      const codeHtml = marked.parse(message.text);
      htmlContent = DOMPurify.sanitize(codeHtml);
    } else {
      htmlContent = marked.parseInline(message.text);
      htmlContent = DOMPurify.sanitize(htmlContent);
    }

    const icon = message.sender === 'ai' ? (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
        <SparklesIcon className="w-5 h-5 text-white" />
      </div>
    ) : (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
        <UserCircleIcon className="w-5 h-5 text-gray-300" />
      </div>
    );

    const messageClasses = message.sender === 'ai' ? 'bg-gray-800 self-start' : 'bg-indigo-600 self-end text-white';

    return (
      <div key={Math.random()} className={`flex gap-3 mb-4 max-w-[85%] ${message.sender === 'user' ? 'self-end' : ''}`}>
        {message.sender === 'ai' && icon}
        <div className={`p-4 rounded-xl ${messageClasses} break-words`}>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
        {message.sender === 'user' && icon}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      <header className="p-4 bg-gray-800 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-6 h-6 text-purple-400 animate-pulse" />
          <h1 className="text-xl font-bold text-white">NeuroGenX-AI</h1>
        </div>
        <button className="text-gray-400 hover:text-white">
          <Bars3Icon className="w-6 h-6" />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(renderMessage)}
        {isTyping && (
          <div className="flex justify-center my-4">
            <div className="dot-flashing"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-gray-800 sticky bottom-0 z-10">
        <form onSubmit={handleSend} className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="What project do you want me to build?"
          />
          <button
            type="submit"
            disabled={isTyping || input.trim() === ''}
            className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </footer>
      <style>{`
        .dot-flashing {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #a3a3a3;
          color: #a3a3a3;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 0s;
        }

        .dot-flashing::before, .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
        }

        .dot-flashing::before {
          left: -15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #a3a3a3;
          color: #a3a3a3;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: .5s;
        }

        .dot-flashing::after {
          left: 15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #a3a3a3;
          color: #a3a3a3;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 1s;
        }

        @keyframes dot-flashing {
          0% {
            background-color: #fff;
          }
          50%, 100% {
            background-color: rgba(163, 163, 163, 0.2);
          }
        }
        
        pre {
          background-color: #1f2937;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          font-family: 'Courier New', Courier, monospace;
          color: #e5e7eb;
        }
        
        pre code {
          background-color: transparent;
          color: inherit;
        }
        
        code {
          background-color: #4b5563;
          border-radius: 0.25rem;
          padding: 0.2rem 0.4rem;
          font-family: 'Courier New', Courier, monospace;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
