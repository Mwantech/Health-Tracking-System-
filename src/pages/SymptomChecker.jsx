import React, { useState, useEffect, useRef } from 'react';
import FuzzySet from 'fuzzyset';
import { ThumbsUp, ThumbsDown, Loader } from 'lucide-react';
import './SymptomChecker.css';

const SymptomChecker = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [intents, setIntents] = useState([]);
  const [fuzzyMatcher, setFuzzyMatcher] = useState(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [conversationContext, setConversationContext] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    fetch('intents/intents.json')
      .then(response => response.json())
      .then(data => {
        setIntents(data);
        const allPatterns = data.flatMap(intent => intent.patterns);
        setFuzzyMatcher(FuzzySet(allPatterns));
      })
      .catch(error => console.error('Error loading intents:', error));

    const greetings = [
      "Hello, I'm Novas, your AI symptom checker. How can I help you today?",
      "Hi there! I'm Novas, ready to assist with your health concerns. What brings you here?",
      "Welcome! I'm Novas, your virtual health assistant. What symptoms are you experiencing?",
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    setMessages([{ className: "bot-msg", message: randomGreeting }]);
  }, []);

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

  const synonyms = {
    "headache": ["migraine", "head pain"],
    "fever": ["high temperature", "elevated temperature"],
    "cough": ["hacking", "wheezing"],
    // Add more synonyms here
  };

const findMatchingIntent = (userInput) => {
  const keyPhrases = extractKeyPhrases(userInput);
  let bestMatch = null;
  let highestScore = 0;

  // Expand key phrases with synonyms
  const expandedKeyPhrases = keyPhrases.flatMap(phrase => 
    [phrase, ...(synonyms[phrase] || [])]
  );

  // Create a FuzzySet with all patterns
  const allPatterns = intents.flatMap(intent => intent.patterns);
  const fuzzyPatterns = FuzzySet(allPatterns);

  // Try to match the entire user input
  const fullInputMatch = fuzzyPatterns.get(userInput.toLowerCase(), null, 0.6);
  if (fullInputMatch && fullInputMatch.length > 0) {
    const [score, matchedPattern] = fullInputMatch[0];
    bestMatch = intents.find(intent => intent.patterns.includes(matchedPattern));
    highestScore = score;
  }

  // If no full match, try matching individual words or phrases
  if (!bestMatch) {
    for (const phrase of expandedKeyPhrases) {
      const phraseMatches = fuzzyPatterns.get(phrase, null, 0.7);
      if (phraseMatches && phraseMatches.length > 0) {
        const [score, matchedPattern] = phraseMatches[0];
        if (score > highestScore) {
          bestMatch = intents.find(intent => intent.patterns.includes(matchedPattern));
          highestScore = score;
        }
      }
    }
  }

  return bestMatch;
};

// ... (rest of the code remains the same)

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

  const handleUnrecognizedInput = (userInput) => {
    const fuzzyMatches = fuzzyMatcher.get(userInput.toLowerCase(), [], 0.4);
    if (fuzzyMatches.length > 0) {
      const suggestions = fuzzyMatches.slice(0, 3).map(([score, match]) => match);
      addChatMessage("bot-msg", `I'm not sure I understood that. Did you mean something like: ${suggestions.join(', ')}?`);
    } else {
      addChatMessage("bot-msg", "I apologize, but I'm not sure I fully understood your concern. Could you please rephrase or provide more details about your symptoms?");
    }
    saveUnrecognizedInput(userInput);
  };

  const sendMessage = () => {
    if (userInput.trim() === "") return;
  
    if (isFirstMessage) {
      setMessages([]);
      setIsFirstMessage(false);
    }
  
    addChatMessage("user-msg", userInput);
    setIsLoading(true);
  
    setTimeout(() => {
      const matchingIntent = findMatchingIntent(userInput);
      if (matchingIntent) {
        const botResponse = matchingIntent.responses[Math.floor(Math.random() * matchingIntent.responses.length)];
        addChatMessage("bot-msg", botResponse);
  
        // Check if it's a greeting
        if (matchingIntent.isGreeting) {
          // For greetings, don't schedule follow-up, show caution, or ask for feedback
          setIsLoading(false);
          setUserInput("");
          return;
        }
  
        if (matchingIntent.precaution) {
          const precautions = matchingIntent.precaution.join("<br>");
          addChatMessage("bot-msg", `<b>Recommended actions:</b><br>${precautions}`);
        }
  
        // Always display the option for nearby medical centers for non-greeting intents
        askForNearbyMedicalCenters();
  
        scheduleFollowUp();
        askForFeedback();
  
        // Update conversation context
        setConversationContext(prevContext => [...prevContext, matchingIntent.tag]);
  
        addChatMessage("bot-msg", "Remember, I'm an AI assistant and can't provide professional medical advice. If you're experiencing severe symptoms or have urgent concerns, please consult a healthcare professional or seek emergency services.");
      } else {
        handleUnrecognizedInput(userInput);
      }
  
      setIsLoading(false);
      setUserInput("");
    }, 1000); // Simulating a delay for the bot's response
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
              {msg.isFeedback ? (
                <>
                  <button className="response-button" onClick={() => handleFeedback(true)}><ThumbsUp size={20} /></button>
                  <button className="response-button" onClick={() => handleFeedback(false)}><ThumbsDown size={20} /></button>
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
        {isLoading && <div className="loading-indicator"><Loader size={24} /></div>}
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