// ⚠️ Insert your BRAND NEW Gemini API Key here (don't push to public Github!)
const GEMINI_API_KEY = 'AIzaSyBc8YENXyaXqj5cB9Ppxll7rEfI7_tLOCc'; 

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY.trim()}`;

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const quickReplies = document.getElementById('quick-replies');

const themeToggleBtn = document.getElementById('theme-toggle');
const exportChatBtn = document.getElementById('export-chat');
const clearChatBtn = document.getElementById('clear-chat');

let chatHistory = [];

window.onload = () => {
    setTimeout(() => {
        addMessage("Hi there! I am MediBot, an AI symptom analyzer. Please review the safety warnings on the left, and describe your symptoms in detail.", "bot");
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
    if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        removeTypingIndicator();
        addMessage("<b>Developer Error:</b> Please add your Gemini API Key in script.js.", "bot");
        return;
    }

    chatHistory.push({ "role": "user", "parts": [{ "text": text }] });

    const payload = {
        "systemInstruction": {
            "parts": [{ 
                "text": "You are MediBot, an AI symptom checker. Analyze the user's symptoms and suggest potential conditions. Be professional, empathetic, and concise. Format with bolding and bullet points. Always end by advising them to consult a real doctor." 
            }]
        },
        "contents": chatHistory
    };

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        removeTypingIndicator();
        
        const botReply = data.candidates[0].content.parts[0].text;
        chatHistory.push({ "role": "model", "parts": [{ "text": botReply }] });

        addMessage(formatText(botReply), "bot");

    } catch (error) {
        console.error("Fetch failed:", error);
        removeTypingIndicator();
        addMessage("Sorry, I'm having trouble connecting to the AI server. Please try again.", "bot");
    }
}

// --- TOP BAR FEATURES ---

themeToggleBtn.addEventListener('click', () => {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

exportChatBtn.addEventListener('click', () => {
    if (chatHistory.length === 0) {
        alert("No chat history to export yet!");
        return;
    }
    
    let textToSave = "--- MediBot Symptom Consultation Transcript ---\n\n";
    chatHistory.forEach(msg => {
        let sender = msg.role === 'user' ? "Patient: " : "MediBot: ";
        textToSave += `${sender} ${msg.parts[0].text}\n\n`;
    });

    const blob = new Blob([textToSave], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MediBot_Transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
});

clearChatBtn.addEventListener('click', () => {
    if(confirm("Are you sure you want to clear the conversation?")) {
        chatBox.innerHTML = '';
        chatHistory = [];
        quickReplies.style.display = 'flex'; 
        setTimeout(() => {
            addMessage("Chat cleared. How can I help you today?", "bot");
        }, 300);
    }
});

// --- UI HELPER FUNCTIONS ---

function formatText(text) {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>'); 
    formattedText = formattedText.replace(/\n/g, '<br>'); 
    return formattedText;
}

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
    typingDiv.innerHTML = `<div class="typing-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}