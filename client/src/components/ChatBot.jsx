"use client"
import { useState, useRef, useEffect } from 'react'
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa'
import "./ChatBot.css"
import api from "../services/api"
import { useAuth } from '../contexts/AuthContext'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) 
  const messagesEndRef = useRef(null)
  const { user, showLogin } = useAuth()

  const handleOpenChat = () => {
    setIsOpen(true)
    setIsTyping(true) // Bắt đầu hiển thị "..."
    
    // Sau 1 giây, hiển thị tin nhắn chào
    setTimeout(() => {
      setMessages([
        {
          text: "Xin chào! Tôi là trợ lý âm nhạc của bạn. Hãy hỏi tôi về bài hát, nghệ sĩ hoặc danh sách phát!",
          sender: 'bot'
        }
      ])
      setIsTyping(false) // Dừng hiển thị "..."
    }, 1000)
  }

  const handleSendMessage = async () => {
    if (!user) {
      showLogin()
      return
    }
  
    if (!inputMessage.trim() || isLoading) return;
  
    // Thêm tin nhắn người dùng
    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
  
    const greetingMessages = ['Xin chào', 'Hello', 'Chào bạn'];
    if (greetingMessages.some(greeting => inputMessage.toLowerCase().includes(greeting.toLowerCase()))) {
      const botResponse = {
        text: "Chào bạn, tôi giúp gì được cho bạn?",
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      return; // Exit early to prevent making an API call
    }

    try {
      const response = await api.chatBot(inputMessage);
      if (response.data) {
        const links = response.data
          ?.map((item) => `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.url}</a>`)
          .join(', ');

        const botResponse = {
          text: links
            ? `Tôi có một vài kết quả tìm kiếm bạn tham khảo nhé: \n ${links}`
            : "Tôi không hiểu được điều đó. Bạn có thể hỏi cách khác không?",
          sender: 'bot',
        };

        setMessages((prev) => [...prev, botResponse]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Xin lỗi, tôi không tìm được từ khóa mà bạn cho tôi.", sender: 'bot' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <h3>
              <FaRobot className="robot-icon" />
              <span>Music Assistant</span>
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn"
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages area */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.sender === 'bot' ? (
                  // Render nội dung HTML cho bot
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                  // Hiển thị tin nhắn dạng văn bản thông thường
                  <span>{msg.text}</span>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="chat-input-area">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Hãy nhập câu hỏi của bạn..."
              className="chat-input"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              className="send-btn"
              disabled={!inputMessage.trim() || isLoading}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleOpenChat}
          className="chat-toggle-btn"
        >
          <FaRobot size={24} />
          <span className="notification-dot"></span>
        </button>
      )}
    </div>
  )
}
