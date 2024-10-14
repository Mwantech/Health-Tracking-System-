import React, { useState, useEffect, useRef, useCallback } from 'react';
import FuzzySet from 'fuzzyset';
import { ThumbsUp, ThumbsDown, Loader } from 'lucide-react';
import './SymptomChecker.css';

// ... (previous code remains the same)

const SymptomChecker = () => {
  // ... (previous state and hooks remain the same)
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


  // ... (previous functions remain the same)
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


  const sendMessage = useCallback(() => {
    if (userInput.trim() === "" || !isInitialized) return;
  
    if (isFirstMessage) {
      setMessages([]);
      setIsFirstMessage(false);
    }
  
    const correctedInput = NLP.correctSpelling(userInput);
    addChatMessage("user-msg", correctedInput);
    setIsLoading(true);
  
    setTimeout(() => {
      if (handleSmallTalk(correctedInput)) {
        setIsLoading(false);
        setUserInput("");
        return;
      }

      const sentiment = NLP.analyzeSentiment(correctedInput);
      const entities = NLP.extractEntities(correctedInput);
      setUserProfile(prevProfile => ({
        ...prevProfile,
        recentSymptoms: [...(prevProfile.recentSymptoms || []), ...entities],
      }));

      const matchingIntent = findMatchingIntent(correctedInput);
      if (matchingIntent) {
        const personalizedResponse = generatePersonalizedResponse(matchingIntent, sentiment);
        const precautions = matchingIntent.precaution ? matchingIntent.precaution.join("<br>") : "";
        const batchedResponse = `${personalizedResponse}${precautions ? `<br><br>Based on what you've told me, here are some recommended actions:<br>${precautions}` : ""}`;
        
        addChatMessage("bot-msg", batchedResponse);
  
        if (!matchingIntent.isGreeting) {
          askForNearbyMedicalCenters();
          scheduleFollowUp();
          
          setConversationContext(prevContext => [...prevContext, matchingIntent.tag]);
  
          addChatMessage("bot-msg", "I want to remind you that while I'm here to help, I'm an AI assistant and can't replace professional medical advice. If you're experiencing severe symptoms or have urgent concerns, it's important to consult a healthcare professional or seek emergency services. Is there anything else you'd like to discuss about your health?");
        }
      } else {
        handleUnrecognizedInput(correctedInput);
      }
  
      setIsLoading(false);
      setUserInput("");

      // Add a follow-up question or suggestion based on the conversation context
      if (conversationContext.length > 0) {
        const lastContext = conversationContext[conversationContext.length - 1];
        setTimeout(() => {
          addFollowUpQuestion(lastContext);
        }, 2000);
      }
    }, 1000);
  }, [userInput, isInitialized, isFirstMessage, addChatMessage, handleSmallTalk, findMatchingIntent, generatePersonalizedResponse, askForNearbyMedicalCenters, scheduleFollowUp, handleUnrecognizedInput, conversationContext]);

  const addFollowUpQuestion = useCallback((context) => {
    const followUpQuestions = {
      headache: "How long have you been experiencing this headache? Has anything helped relieve it?",
      fever: "Have you noticed any other symptoms accompanying your fever, such as chills or body aches?",
      cough: "Is your cough dry or productive? Have you noticed any changes in its frequency or intensity?",
      general: "Is there anything else about your health you'd like to discuss or any questions you have for me?",
    };

    const question = followUpQuestions[context] || followUpQuestions.general;
    addChatMessage("bot-msg", question);
  }, [addChatMessage]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  }, [sendMessage]);

  const handleInterruption = useCallback(() => {
    setIsLoading(false);
    addChatMessage("bot-msg", "I noticed you're typing. Would you like me to pause so you can ask a question or add more information?");
  }, [addChatMessage]);

  useEffect(() => {
    let typingTimer;
    const doneTypingInterval = 1000; // 1 second

    const doneTyping = () => {
      if (userInput.trim() !== "") {
        sendMessage();
      }
    };

    const keyUpHandler = () => {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(doneTyping, doneTypingInterval);
    };

    const keyDownHandler = () => {
      clearTimeout(typingTimer);
      if (isLoading) {
        handleInterruption();
      }
    };

    const inputElement = document.getElementById("user-input");
    if (inputElement) {
      inputElement.addEventListener("keyup", keyUpHandler);
      inputElement.addEventListener("keydown", keyDownHandler);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("keyup", keyUpHandler);
        inputElement.removeEventListener("keydown", keyDownHandler);
      }
    };
  }, [userInput, isLoading, sendMessage, handleInterruption]);

  return (
    <div className="chat-container">
      <div className="chat-box" id="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          msg.isButtons ? (
            <div key={index} className={`button-container${msg.isFeedback ? ' feedback-buttons' : ''}`}>
              {msg.isFeedback ? (
                <>
                  <button className="response-button" onClick={() => handleFeedback(true)}><ThumbsUp size={20} /> Helpful</button>
                  <button className="response-button" onClick={() => handleFeedback(false)}><ThumbsDown size={20} /> Not Helpful</button>
                </>
              ) : msg.isLocation ? (
                <>
                  <button className="response-button" onClick={() => handleLocationResponse("yes")}>Yes, use my location</button>
                  <button className="response-button" onClick={() => handleLocationResponse("no")}>No, don't use my location</button>
                </>
              ) : (
                <>
                  <button className="response-button" onClick={() => handleMedicalCenterResponse("yes")}>Yes, find medical centers</button>
                  <button className="response-button" onClick={() => handleMedicalCenterResponse("no")}>No, thanks</button>
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


import React, { useState, useEffect, useRef, useCallback } from 'react';
import FuzzySet from 'fuzzyset';
import { ThumbsUp, ThumbsDown, Loader } from 'lucide-react';
import './SymptomChecker.css';

// Simulated NLP libraries (in a real implementation, you'd import actual NLP libraries)
const NLP = {
  analyzeSentiment: (text) => Math.random() > 0.5 ? 'positive' : 'negative',
  extractEntities: (text) => ['headache', 'fever'],
  correctSpelling: (text) => text.replace(/(.{1,2})/g, (m) => m[0].toUpperCase() + m.slice(1).toLowerCase()),
};

const SymptomChecker = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [intents, setIntents] = useState([]);
  const [fuzzyMatcher, setFuzzyMatcher] = useState(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [conversationContext, setConversationContext] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [conversationHistory, setConversationHistory] = useState([]);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await fetch('intents/intents.json');
        const data = await response.json();
        setIntents(data);
        const allPatterns = data.flatMap(intent => intent.patterns);
        setFuzzyMatcher(FuzzySet(allPatterns));
        setIsInitialized(true);

        const greetings = [
          "Hello! I'm Novas, your AI health assistant. How are you feeling today?",
          "Hi there! I'm Novas, ready to chat about your health. What's on your mind?",
          "Welcome! I'm Novas, your friendly virtual health companion. How can I assist you today?",
        ];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        setMessages([{ className: "bot-msg", message: randomGreeting }]);
      } catch (error) {
        console.error('Error loading intents:', error);
      }
    };

    initializeChat();
  }, []);

  const lemmatize = (word) => {
    const lemmatizedWords = {
      "running": "run", "ran": "run", "eaten": "eat", "ate": "eat",
      "eating": "eat", "walked": "walk", "walking": "walk",
      "coughing": "cough", "coughed": "cough", "feeling": "feel",
      "felt": "feel", "aching": "ache", "ached": "ache",
    };
    return lemmatizedWords[word.toLowerCase()] || word.toLowerCase();
  };

  const extractKeyPhrases = useCallback((userInput) => {
    const cleanInput = userInput.toLowerCase().replace(/[.,!?;:]/g, '');
    const words = cleanInput.split(/\s+/).map(word => word.trim());
    
    const stopwords = ["i", "have", "has", "the", "a", "an", "is", "are", "already", "today", "and", 
      "in", "for", "where", "when", "to", "at", "by", "with", "from", "as", "on", "of", 
      "that", "this", "these", "those", "it", "its", "they", "them", "their", "there", "be",
      "been", "having", "being", "do", "does", "did", "doing", "will", "would", "can", "could", "shall",
      "should", "may", "might", "must", "need", "ought", "shall", "should", "will", "would"];
    
    return words.filter(word => !stopwords.includes(word)).map(lemmatize);
  }, []);

  const synonyms = {
    "headache": ["migraine", "head pain"],
    "fever": ["high temperature", "elevated temperature"],
    "cough": ["hacking", "wheezing"],
  };

  const findMatchingIntent = useCallback((userInput) => {
    const keyPhrases = extractKeyPhrases(userInput);
    let bestMatch = null;
    let highestScore = 0;

    const expandedKeyPhrases = keyPhrases.flatMap(phrase => 
      [phrase, ...(synonyms[phrase] || [])]
    );

    const fullInputMatch = fuzzyMatcher.get(userInput.toLowerCase(), null, 0.6);
    if (fullInputMatch && fullInputMatch.length > 0) {
      const [score, matchedPattern] = fullInputMatch[0];
      bestMatch = intents.find(intent => intent.patterns.includes(matchedPattern));
      highestScore = score;
    }

    if (!bestMatch) {
      for (const phrase of expandedKeyPhrases) {
        const phraseMatches = fuzzyMatcher.get(phrase, null, 0.7);
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
  }, [fuzzyMatcher, intents, extractKeyPhrases]);

  const saveUnrecognizedInput = useCallback((userInput) => {
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
  }, []);

  const addChatMessage = useCallback((className, message) => {
    setMessages(prevMessages => [...prevMessages, { className, message }]);
    setConversationHistory(prevHistory => [...prevHistory, { role: className === 'user-msg' ? 'user' : 'bot', content: message }]);
  }, []);

  const scrollChatToBottom = useCallback(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, []);

  useEffect(scrollChatToBottom, [messages]);

  const showNearbyMedicalCenters = useCallback((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const googleMapsUrl = `https://www.google.com/maps/search/medical+centers/@${lat},${lon},15z/`;

    addChatMessage("bot-msg", `I've found some nearby medical centers for you. You can view them here: <a href="${googleMapsUrl}" target="_blank">View on Google Maps</a>. Is there anything specific you're looking for in a medical center?`);
  }, [addChatMessage]);

  const handleLocationError = useCallback((error) => {
    addChatMessage("bot-msg", "I'm sorry, I couldn't retrieve your location. This can happen due to privacy settings or technical issues. Would you like me to guide you on how to find medical centers manually?");
  }, [addChatMessage]);

  const askForNearbyMedicalCenters = useCallback(() => {
    addChatMessage("bot-msg", "It sounds like you might benefit from professional medical attention. Would you like me to help you find nearby medical centers?");
    setMessages(prevMessages => [...prevMessages, { className: "button-container", isButtons: true }]);
  }, [addChatMessage]);

  const handleMedicalCenterResponse = useCallback((response) => {
    if (response.toLowerCase() === "yes") {
      addChatMessage("bot-msg", "Great, I'll help you with that. To find the most accurate results, I'll need to access your location. Is that okay?");
      setMessages(prevMessages => [...prevMessages, { className: "button-container", isButtons: true, isLocation: true }]);
    } else if (response.toLowerCase() === "no") {
      addChatMessage("bot-msg", "I understand. Remember, it's always a good idea to consult with a healthcare professional if you're concerned about your symptoms. Is there anything else I can help you with?");
    }

    setMessages(prevMessages => prevMessages.filter(msg => !msg.isButtons || msg.isLocation));
  }, [addChatMessage]);

  const handleLocationResponse = useCallback((response) => {
    if (response.toLowerCase() === "yes") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showNearbyMedicalCenters, handleLocationError);
      } else {
        addChatMessage("bot-msg", "I'm sorry, but it looks like your device doesn't support location services. Would you like me to guide you on how to search for medical centers manually?");
      }
    } else if (response.toLowerCase() === "no") {
      addChatMessage("bot-msg", "I understand you prefer not to share your location. That's completely fine. Would you like me to guide you on how to search for medical centers manually instead?");
    }

    setMessages(prevMessages => prevMessages.filter(msg => !msg.isLocation));
  }, [addChatMessage, showNearbyMedicalCenters, handleLocationError]);

  const scheduleFollowUp = useCallback(() => {
    const followUpTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    addChatMessage("bot-msg", `I care about your wellbeing, so I've made a note to check in with you tomorrow at ${followUpTime.toLocaleString()}. How does that sound? If you're feeling better before then, feel free to let me know!`);
  }, [addChatMessage]);

  const askForFeedback = useCallback(() => {
    addChatMessage("bot-msg", "I hope I've been helpful. Do you mind if I ask - how did I do in assisting you today?");
    setMessages(prevMessages => [...prevMessages, { className: "button-container feedback-buttons", isButtons: true, isFeedback: true }]);
  }, [addChatMessage]);

  const handleFeedback = useCallback((isPositive) => {
    if (isPositive) {
      addChatMessage("bot-msg", "I'm so glad I could help! Your health and wellbeing are important to me. Is there anything else you'd like to discuss?");
    } else {
      addChatMessage("bot-msg", "I'm sorry I couldn't be more helpful. I'm always learning and your feedback is valuable. Could you tell me a bit more about what I could improve? I'd really appreciate your insights.");
    }
    setMessages(prevMessages => prevMessages.filter(msg => !msg.isFeedback));
  }, [addChatMessage]);

  const handleUnrecognizedInput = useCallback((userInput) => {
    const fuzzyMatches = fuzzyMatcher.get(userInput.toLowerCase(), [], 0.4);
    if (fuzzyMatches.length > 0) {
      const suggestions = fuzzyMatches.slice(0, 3).map(([score, match]) => match);
      addChatMessage("bot-msg", `I'm not quite sure I understood that correctly. Were you perhaps asking about ${suggestions.join(', ')}? If not, could you rephrase your question?`);
    } else {
      addChatMessage("bot-msg", "I apologize, but I'm having trouble understanding your concern. Could you please provide more details or rephrase your question? I want to make sure I can help you effectively.");
    }
    saveUnrecognizedInput(userInput);
  }, [fuzzyMatcher, addChatMessage, saveUnrecognizedInput]);

  const generatePersonalizedResponse = useCallback((intent, sentiment) => {
    const responses = intent.responses;
    let personalizedResponse = responses[Math.floor(Math.random() * responses.length)];

    if (sentiment === 'negative') {
      personalizedResponse = "I'm sorry to hear that you're not feeling well. " + personalizedResponse;
    } else {
      personalizedResponse = "I'm glad you reached out. " + personalizedResponse;
    }

    if (userProfile.name) {
      personalizedResponse = `${userProfile.name}, ${personalizedResponse}`;
    }

    return personalizedResponse;
  }, [userProfile]);

  const handleSmallTalk = useCallback((userInput) => {
    const smallTalkResponses = {
      "how are you": "As an AI, I don't have feelings, but I'm functioning well and ready to help you. How are you feeling today?",
      "thanks": "You're welcome! I'm glad I could help. Is there anything else you'd like to know?",
      "bye": "Take care! Remember, I'm here 24/7 if you need any health-related assistance. Wishing you the best of health!",
    };

    for (const [key, value] of Object.entries(smallTalkResponses)) {
      if (userInput.toLowerCase().includes(key)) {
        addChatMessage("bot-msg", value);
        return true;
      }
    }
    return false;
  }, [addChatMessage]);

  const sendMessage = useCallback(() => {
    if (userInput.trim() === "" || !isInitialized) return;
  
    if (isFirstMessage) {
      setMessages([]);
      setIsFirstMessage(false);
    }
  
    const correctedInput = NLP.correctSpelling(userInput);
    addChatMessage("user-msg", correctedInput);
    setIsLoading(true);
  
    setTimeout(() => {
      if (handleSmallTalk(correctedInput)) {
        setIsLoading(false);
        setUserInput("");
        return;
      }

      const sentiment = NLP.analyzeSentiment(correctedInput);
      const entities = NLP.extractEntities(correctedInput);
      setUserProfile(prevProfile => ({
        ...prevProfile,
        recentSymptoms: [...(prevProfile.recentSymptoms || []), ...entities],
      }));

      const matchingIntent = findMatchingIntent(correctedInput);
      if (matchingIntent) {
        const personalizedResponse = generatePersonalizedResponse(matchingIntent, sentiment);
        const precautions = matchingIntent.precaution ? matchingIntent.precaution.join("<br>") : "";
        const batchedResponse = `${personalizedResponse}${precautions ? `<br><br>Based on what you've told me, here are some recommended actions:<br>${precautions}` : ""}`;
        
        addChatMessage("bot-msg", batchedResponse);
  
        if (!matchingIntent.isGreeting) {
          askForNearbyMedicalCenters();