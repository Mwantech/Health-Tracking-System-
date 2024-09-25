import React, { useState, useEffect, useRef } from 'react';
import FuzzySet from 'fuzzyset';
import './SymptomChecker.css';

const SymptomChecker = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [intents, setIntents] = useState([]);
  const [fuzzyMatcher, setFuzzyMatcher] = useState(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    // Load intents from the external intents.json file
    fetch('intents/intents.json')
      .then(response => response.json())
      .then(data => {
        setIntents(data);
        // Initialize fuzzy matcher with all patterns
        const allPatterns = data.flatMap(intent => intent.patterns);
        setFuzzyMatcher(FuzzySet(allPatterns));
      })
      .catch(error => console.error('Error loading intents:', error));

    // Initial welcome message
    setMessages([{ className: "bot-msg", message: "Hello, I'm Novas, your AI symptom checker. How can I help you today?" }]);
  }, []);

  // ... [other functions remain the same]
  const lemmatize = (word) => {
    const lemmatizedWords = {
      "running": "run", "ran": "run", "eaten": "eat", "ate": "eat",
      "eating": "eat", "walked": "walk", "walking": "walk",
      "coughing": "cough", "coughed": "cough", "feeling": "feel",
      "felt": "feel", "aching": "ache", "ached": "ache",
      // Add more word variations here
    };
    return lemmatizedWords[word.toLowerCase()] || word.toLowerCase();
  };

  const extractKeyPhrases = (userInput) => {
    const cleanInput = userInput.toLowerCase().replace(/[.,!?;:]/g, '');
    const words = cleanInput.split(/\s+/).map(word => word.trim());
    
    const stopwords = ["i", "have", "has", "the", "a", "an", "is", "are", "already", "today", "and", 
      "in", "for", "where", "when", "to", "at", "by", "with", "from", "as", "on", "of", 
      "that", "this", "these", "those", "it", "its", "they", "them", "their", "there", "be",
      "been", "having", "being", "do", "does", "did", "doing", "will", "would", "can", "could", "shall",
      "should", "may", "might", "must", "need", "ought", "shall", "should", "will", "would"];
    
    return words.filter(word => !stopwords.includes(word)).map(lemmatize);
  };

  const findMatchingIntent = (userInput) => {
    const keyPhrases = extractKeyPhrases(userInput);
    let bestMatch = null;
    let highestMatchCount = 0;

    // Use fuzzy matching to find the best matching pattern
    const fuzzyMatches = fuzzyMatcher.get(userInput.toLowerCase(), null, 0.6);
    if (fuzzyMatches && fuzzyMatches.length > 0) {
      const [score, matchedPattern] = fuzzyMatches[0];
      bestMatch = intents.find(intent => intent.patterns.includes(matchedPattern));
    }

    // If no fuzzy match, fall back to key phrase matching
    if (!bestMatch) {
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
    .then(response => response.text())
    .then(data => console.log('Unrecognized input saved:', data))
    .catch(error => console.error('Error saving unrecognized input:', error));
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
    addChatMessage("bot-msg", "I'm sorry, I couldn't retrieve your location. You can try searching for 'medical centers near me' in your preferred search engine.");
  };

  const askForNearbyMedicalCenters = () => {
    addChatMessage("bot-msg", "Would you like me to help you find nearby medical centers?");
    setMessages(prevMessages => [...prevMessages, { className: "button-container", isButtons: true }]);
  };

  const handleMedicalCenterResponse = (response) => {
    if (response.toLowerCase() === "yes") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showNearbyMedicalCenters, handleLocationError);
      } else {
        addChatMessage("bot-msg", "I'm sorry, but your browser doesn't support geolocation. You can try searching for 'medical centers near me' in your preferred search engine.");
      }
    } else if (response.toLowerCase() === "no") {
      addChatMessage("bot-msg", "I understand. If you need any other assistance or information, please don't hesitate to ask.");
    }

    setMessages(prevMessages => prevMessages.filter(msg => !msg.isButtons));
  };

  const scheduleFollowUp = () => {
    const followUpTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    addChatMessage("bot-msg", `I've scheduled a follow-up for ${followUpTime.toLocaleString()}. I'll check in with you then to see how you're feeling.`);
    // Here you would typically set up a real scheduling mechanism
  };

  const askForFeedback = () => {
    addChatMessage("bot-msg", "Was this information helpful to you?");
    setMessages(prevMessages => [...prevMessages, { className: "button-container", isButtons: true, isFeedback: true }]);
  };

  const handleFeedback = (isPositive) => {
    if (isPositive) {
      addChatMessage("bot-msg", "I'm glad I could help! If you have any more questions, feel free to ask.");
    } else {
      addChatMessage("bot-msg", "I'm sorry I couldn't be more helpful. I'll make note of this to improve my responses in the future. Is there anything specific you'd like me to clarify or explain differently?");
    }
    setMessages(prevMessages => prevMessages.filter(msg => !msg.isFeedback));
  };

  const sendMessage = () => {
    if (userInput.trim() === "") return;

    // Remove the initial greeting message if it's the user's first input
    if (isFirstMessage) {
      setMessages([]);
      setIsFirstMessage(false);
    }

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

      scheduleFollowUp();
      askForFeedback();
    } else {
      addChatMessage("bot-msg", "I apologize, but I'm not sure I fully understood your concern. Could you please rephrase or provide more details about your symptoms?");
      saveUnrecognizedInput(userInput);
    }

    addChatMessage("bot-msg", "Remember, I'm an AI assistant and can't provide professional medical advice. If you're experiencing severe symptoms or have urgent concerns, please consult a healthcare professional or seek emergency services.");

    setUserInput("");
  };

  // ... [rest of the component code remains the same]
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
              {msg.isFeedback ? (
                <>
                  <button className="response-button" onClick={() => handleFeedback(true)}>Yes, it was helpful</button>
                  <button className="response-button" onClick={() => handleFeedback(false)}>No, I need more help</button>
                </>
              ) : (
                <>
                  <button className="response-button" onClick={() => handleMedicalCenterResponse("yes")}>Yes</button>
                  <button className="response-button" onClick={() => handleMedicalCenterResponse("no")}>No</button>
                </>
              )}
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
          placeholder="Type your symptoms or questions here..."
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