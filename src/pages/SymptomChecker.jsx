import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, initializeChatbot } from '../utils/chatbot';
import './SymptomChecker.css';

const SymptomChecker = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    const welcomeMessage = initializeChatbot();
    addChatMessage('bot', welcomeMessage);
  }, []);

  const handleSendMessage = async () => {
    if (userInput.trim() === '') return;

    addChatMessage('user', userInput);

    const botResponses = await sendMessage(userInput);
    botResponses.forEach(response => addChatMessage('bot', response));

    setUserInput('');
    scrollToBottom();
  };

  const addChatMessage = (sender, message) => {
    // Convert <br> to line breaks
    const formattedMessage = message.replace(/<br>/g, '\n');
    setChatHistory(prevHistory => [...prevHistory, { sender, message: formattedMessage }]);
  };
  

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="symptom-checker-container">
      <div className="chat-box" ref={chatBoxRef}>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`chat-message ${chat.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {chat.message}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          placeholder="Describe your symptoms..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default SymptomChecker;
