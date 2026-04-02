const API_ID = 'YOUR_APP_ID_HERE'; 
const API_KEY = 'YOUR_APP_KEY_HERE';
const API_URL = 'https://api.infermedica.com/v3';

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const quickReplies = document.getElementById('quick-replies');

window.onload = () => {
    setTimeout(() => {
        addMessage("Hi there! I am MediBot, powered by a live medical API. Please describe your symptoms in detail.", "bot");
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

    // Call the API instead of the local database
    analyzeSymptoms(text);
}

function sendQuickReply(text) {
    userInput.value = text;
    handleUserInput();
}

async function analyzeSymptoms(text) {
    if (API_ID === 'YOUR_APP_ID_HERE') {
        removeTypingIndicator();
        addMessage("<b>Developer Error:</b> Please add your Infermedica API Keys in script.js to enable the AI engine.", "bot");
        return;
    }

    try {
        // Step 1: Send natural language to the API to extract medical symptoms
        const parseResponse = await fetch(`${API_URL}/parse`, {
            method: 'POST',
            headers: {
                'App-Id': API_ID,
                'App-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            // Note: We are hardcoding age and sex for this demo. 
            // A more complex version would ask the user for these details first.
            body: JSON.stringify({ text: text, age: { value: 25 }, sex: "male" }) 
        });

        const parseData = await parseResponse.json();
        const symptoms = parseData.mentions;

        if (!symptoms || symptoms.length === 0) {
            removeTypingIndicator();
            addMessage("I couldn't identify specific medical symptoms from that. Could you describe how you feel using different words?", "bot");
            return;
        }

        // Format the extracted symptoms for the diagnosis endpoint
        const evidence = symptoms.map(sym => ({
            id: sym.id,
            choice_id: sym.choice_id
        }));

        // Step 2: Request a diagnosis based on the extracted symptoms
        const diagResponse = await fetch(`${API_URL}/diagnosis`, {
            method: 'POST',
            headers: {
                'App-Id': API_ID,
                'App-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sex: "male", age: { value: 25 }, evidence: evidence })
        });

        const diagData = await diagResponse.json();
        removeTypingIndicator();
        
        // Step 3: Output the results and precautions
        if (diagData.conditions && diagData.conditions.length > 0) {
            let topCondition = diagData.conditions[0];
            let probability = Math.round(topCondition.probability * 100);
            
            let responseHtml = `Based on clinical data, your symptoms point towards <b>${topCondition.name}</b> (approx. ${probability}% match).<br><br>`;
            
            // Adding a general precaution block
            responseHtml += `<b>General Precautions:</b><br>`;
            responseHtml += `• Rest and monitor your symptoms closely.<br>`;
            responseHtml += `• Stay hydrated and avoid strenuous activity.<br>`;
            responseHtml += `• If symptoms are severe, sudden, or worsen rapidly, seek emergency medical care.<br><br>`;
            responseHtml += `<em>Disclaimer: This is an AI estimation for educational purposes, not a substitute for a doctor.</em>`;
            
            addMessage(responseHtml, "bot");
        } else {
            addMessage("I detected your symptoms, but they are too broad to suggest a specific condition. Please consult a healthcare provider.", "bot");
        }

    } catch (error) {
        console.error("API Error:", error);
        removeTypingIndicator();
        addMessage("Sorry, I'm having trouble connecting to the live medical database right now.", "bot");
    }
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