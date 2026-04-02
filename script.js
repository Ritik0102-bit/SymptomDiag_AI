const GEMINI_API_KEY = 'AIzaSyDcylABPSd9k5MFNRi78Y7dF6nAml0ScZc'; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const quickReplies = document.getElementById('quick-replies');

// Keep track of the conversation so Gemini remembers the context
let chatHistory = [];

window.onload = () => {
    setTimeout(() => {
        addMessage("Hi there! I am MediBot, powered by Gemini AI. Please describe your symptoms in detail.", "bot");
    }, 500);
};

sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
});

function handleUserInput() {
    const text = userInput.value.trim();
    if (text === "") return;

    quickReplies.style.display = 'none'; 
    addMessage(text, "user");
    userInput.value = "";
    showTypingIndicator();

    analyzeSymptoms(text);
}

function sendQuickReply(text) {
    userInput.value = text;
    handleUserInput();
}

async function analyzeSymptoms(text) {
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        removeTypingIndicator();
        addMessage("<b>Developer Error:</b> Please add your Gemini API Key in script.js.", "bot");
        return;
    }

    // Add user message to history
    chatHistory.push({
        "role": "user",
        "parts": [{ "text": text }]
    });

    // The payload sent to Gemini
    const payload = {
        "system_instruction": {
            "parts": [{ 
                "text": "You are MediBot, an AI symptom checker for a university project. Your job is to analyze the user's symptoms and suggest 1 to 3 potential conditions. Keep your responses concise, highly readable, and professional. Always include a strong disclaimer at the end stating that you are an AI and they should consult a real doctor. Format your text using simple markdown (bolding and bullet points)." 
            }]
        },
        "contents": chatHistory
    };

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        removeTypingIndicator();
        
        // Extract the text from Gemini's response
        const botReply = data.candidates[0].content.parts[0].text;
        
        // Add bot response to history so it remembers the conversation
        chatHistory.push({
            "role": "model",
            "parts": [{ "text": botReply }]
        });

        // Convert simple markdown to HTML and display it
        addMessage(formatText(botReply), "bot");

    } catch (error) {
        console.error("API Error:", error);
        removeTypingIndicator();
        addMessage("Sorry, I'm having trouble connecting to my AI brain right now. Please check the API key and console logs.", "bot");
    }
}

// Helper function to convert Gemini's Markdown (**) to HTML (<b>) and newlines to <br>
function formatText(text) {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Bold
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics
    formattedText = formattedText.replace(/\n/g, '<br>'); // Line breaks
    return formattedText;
}

// UI Helper Functions
function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'user' ? 'user-msg' : 'bot-msg');
    msgDiv.innerHTML = text; 
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-msg');
    typingDiv.setAttribute('id', 'typing-indicator');
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}