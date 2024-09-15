import React, { useState, useEffect, useRef } from 'react';
import './SymptomChecker.css'
const SymptomChecker = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [intents, setIntents] = useState([]);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    // Load intents from the external intents.json file
    fetch('intents/intents.json')
      .then(response => response.json())
      .then(data => {
        setIntents(data);
      })
      .catch(error => console.error('Error loading intents:', error));

    // Initial welcome message
    setMessages([{ className: "bot-msg", message: "Hello, I'm Novas, your AI symptom checker." }]);
  }, []);

  const lemmatize = (word) => {
    const lemmatizedWords = {
      "running": "run",
      "ran": "run",
      "eaten": "eat",
      "ate": "eat",
      "eating": "eat",
      "walked": "walk",
      "walking": "walk",
      "coughing": "cough",
      "coughed": "cough",
      // Add more word variations here
    };
    return lemmatizedWords[word] || word;
  };

  const extractKeyPhrases = (userInput) => {
    const words = userInput.toLowerCase().split(/[\s.,!?;:]+/).map(word => word.trim());
    
    const stopwords = ["i", "have", "has", "the", "a", "an", "is", "are", "already", "today", "and", 
      "in", "for", "where", "when", "to", "at", "by", "with", "from", "as", "on", "of", 
      "that", "this", "these", "those", "it", "its", "they", "them", "their", "there", "be",
      "been", "being", "do", "does", "did", "doing", "will", "would", "can", "could", "shall",
      "should", "may", "might", "must", "need", "ought", "shall", "should", "will", "would"];
    
    return words.filter(word => !stopwords.includes(word)).map(lemmatize);
  };

  const findMatchingIntent = (userInput) => {
    const keyPhrases = extractKeyPhrases(userInput);
    let bestMatch = null;
    let highestMatchCount = 0;

    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        const patternWords = pattern.toLowerCase().split(/\W+/).map(lemmatize);
        const matchCount = patternWords.filter(word => keyPhrases.includes(word)).length;

        if (matchCount > highestMatchCount) {
          highestMatchCount = matchCount;
          bestMatch = intent;
        }
      }
    }

    return bestMatch;
  };

  const saveUnrecognizedInput = (userInput) => {
    const unrecognizedData = {
      input: userInput,
      timestamp: new Date().toISOString()
    };

    fetch('saveUnrecognized.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(unrecognizedData)
    })
    .then(response => {
      console.log('Response status:', response.status);
      return response.text();
    })
    .then(data => console.log('Response data:', data))
    .catch(error => console.error('Error saving data:', error));
  };

  const addChatMessage = (className, message) => {
    setMessages(prevMessages => [...prevMessages, { className, message }]);
  };

  const scrollChatToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(scrollChatToBottom, [messages]);

  const showNearbyMedicalCenters = (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const googleMapsUrl = `https://www.google.com/maps/search/medical+centers/@${lat},${lon},15z/`;

    addChatMessage("bot-msg", `Here are some nearby medical centers: <a href="${googleMapsUrl}" target="_blank">View on Google Maps</a>`);
  };

  const handleLocationError = (error) => {
    addChatMessage("bot-msg", "Unable to retrieve your location.");
  };

  const askForNearbyMedicalCenters = () => {
    addChatMessage("bot-msg", "Would you like to see nearby medical centers?");
    setMessages(prevMessages => [...prevMessages, { className: "button-container", isButtons: true }]);
  };

  const handleMedicalCenterResponse = (response) => {
    if (response.toLowerCase() === "yes") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showNearbyMedicalCenters, handleLocationError);
      } else {
        addChatMessage("bot-msg", "Geolocation is not supported by your browser.");
      }
    } else if (response.toLowerCase() === "no") {
      addChatMessage("bot-msg", "Alright! If you need anything else, let me know.");
    }

    setMessages(prevMessages => prevMessages.filter(msg => !msg.isButtons));
  };

  const sendMessage = () => {
    if (userInput.trim() === "") return;

    // Remove the initial greeting message if it's the user's first input
    setMessages(prevMessages => {
      if (prevMessages.length === 1 && prevMessages[0].message === "Hello, I'm Novas, your AI symptom checker.") {
        return [];
      }
      return prevMessages;
    });

    addChatMessage("user-msg", userInput);

    const matchingIntent = findMatchingIntent(userInput);
    if (matchingIntent) {
      const botResponse = matchingIntent.responses[Math.floor(Math.random() * matchingIntent.responses.length)];
      addChatMessage("bot-msg", botResponse);

      if (matchingIntent.precaution) {
        const precautions = matchingIntent.precaution.join("<br>");
        addChatMessage("bot-msg", `<b>Recommended actions:</b><br>${precautions}`);
      }

      if (matchingIntent.askForMedicalCenters || matchingIntent.precaution) {
        askForNearbyMedicalCenters();
      }
    } else {
      addChatMessage("bot-msg", "Sorry, I didn't understand that.");
      saveUnrecognizedInput(userInput);
      askForNearbyMedicalCenters();
    }

    setUserInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box" id="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          msg.isButtons ? (
            <div key={index} className="button-container">
              <button className="response-button" onClick={() => handleMedicalCenterResponse("yes")}>Yes</button>
              <button className="response-button" onClick={() => handleMedicalCenterResponse("no")}>No</button>
            </div>
          ) : (
            <div key={index} className={msg.className} dangerouslySetInnerHTML={{ __html: msg.message }} />
          )
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          id="user-input"
          placeholder="Type a message..."
          style={{ width: '80%' }}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default SymptomChecker;