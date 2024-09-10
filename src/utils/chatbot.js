let intents = [];

// Load intents from the external intents.json file
fetch('intents/intents.json')
    .then(response => response.json())
    .then(data => {
        intents = data;
    })
    .catch(error => console.error('Error loading intents:', error));

// Initial welcome message
export function initializeChatbot() {
    return "Hello, I'm Novas, your AI symptom checker.";
}

// Expanded lemmatizer function
function lemmatize(word) {
    const lemmatizedWords = {
        // Add your word variations here
    };
    return lemmatizedWords[word] || word;
}

// Function to extract key phrases
function extractKeyPhrases(userInput) {
    const words = userInput.toLowerCase().split(/[\s.,!?;:]+/).map(word => word.trim());
    const stopwords = ["i", "have", "has", "the", "a", "an", "is", "are", "already", "today", "and", 
"in", "for", "where", "when", "to", "at", "by", "with", "from", "as", "on", "of", 
"that", "this", "these", "those", "it", "its", "they", "them", "their", "there", "be",
"been", "being", "do", "does", "did", "doing", "will", "would", "can", "could", "shall",
"should", "may", "might", "must", "need", "ought", "shall", "should", "will", "would"];
    
    return words.filter(word => !stopwords.includes(word)).map(lemmatize);
}

// Function to find the best matching intent
function findMatchingIntent(userInput) {
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
}

// Function to save unrecognized health inputs
function saveUnrecognizedInput(userInput) {
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
}

// Function to handle user input and generate a response
export async function sendMessage(userInput) {
    const matchingIntent = findMatchingIntent(userInput);
    let botResponses = [];

    if (matchingIntent) {
        const botResponse = matchingIntent.responses[Math.floor(Math.random() * matchingIntent.responses.length)];
        botResponses.push(botResponse);

        if (matchingIntent.precaution) {
            const precautions = matchingIntent.precaution.join("<br>");
            botResponses.push(`<b>Recommended actions:</b><br>${precautions}`);
        }

        if (matchingIntent.askForMedicalCenters || matchingIntent.precaution) {
            botResponses.push("Would you like to see nearby medical centers?");
        }
    } else {
        botResponses.push("Sorry, I didn't understand that.");
        saveUnrecognizedInput(userInput);
        botResponses.push("Would you like to see nearby medical centers?");
    }

    return botResponses;
}

// Function to show nearby medical centers using Google Maps API
export function showNearbyMedicalCenters(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const googleMapsUrl = `https://www.google.com/maps/search/medical+centers/@${lat},${lon},15z/`;
    return `Here are some nearby medical centers: <a href="${googleMapsUrl}" target="_blank">View on Google Maps</a>`;
}

// Function to handle geolocation errors
export function handleLocationError() {
    return "Unable to retrieve your location.";
}
