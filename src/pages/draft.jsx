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

  // ... [other functions remain the same]

  const synonyms = {
    "headache": ["migraine", "head pain"],
    "fever": ["high temperature", "elevated temperature"],
    "cough": ["hacking", "wheezing"],
    // Add more synonyms here
  };

  const findMatchingIntent = (userInput) => {
    const keyPhrases = extractKeyPhrases(userInput);
    let bestMatch = null;
    let highestMatchCount = 0;

    // Expand key phrases with synonyms
    const expandedKeyPhrases = keyPhrases.flatMap(phrase => 
      [phrase, ...(synonyms[phrase] || [])]
    );

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
          const matchCount = patternWords.filter(word => expandedKeyPhrases.includes(word)).length;

          if (matchCount > highestMatchCount) {
            highestMatchCount = matchCount;
            bestMatch = intent;
          }
        }
      }
    }

    return bestMatch;
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

        if (matchingIntent.precaution) {
          const precautions = matchingIntent.precaution.join("<br>");
          addChatMessage("bot-msg", `<b>Recommended actions:</b><br>${precautions}`);
        }

        if (matchingIntent.askForMedicalCenters || matchingIntent.precaution) {
          askForNearbyMedicalCenters();
        }

        scheduleFollowUp();
        
        // Only ask for feedback if it's not a greeting
        if (!matchingIntent.isGreeting) {
          askForFeedback();
        }

        // Update conversation context
        setConversationContext(prevContext => [...prevContext, matchingIntent.tag]);
      } else {
        handleUnrecognizedInput(userInput);
      }

      addChatMessage("bot-msg", "Remember, I'm an AI assistant and can't provide professional medical advice. If you're experiencing severe symptoms or have urgent concerns, please consult a healthcare professional or seek emergency services.");

      setIsLoading(false);
      setUserInput("");
    }, 1000); // Simulating a delay for the bot's response
  };

  // ... [rest of the component code remains the same]

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