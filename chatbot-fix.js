// AI-Powered ChatGPT-like Chatbot
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotMessages = document.getElementById('chatbot-messages');
const typingIndicator = document.getElementById('typing-indicator');
const voiceButton = document.getElementById('voice-button');

// AI Configuration
const API_KEY = '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'; // Replace with your OpenAI API key
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Conversation history
let conversationHistory = [
    {
        role: 'system',
        content: 'You are an AI assistant created by Priyanshu Vishwakarma. You are helpful, knowledgeable, creative, and friendly. You can help with programming, answer questions, solve problems, provide explanations, write code, help with projects, and assist with any topic the user asks about. You should behave like ChatGPT - be conversational, informative, and helpful. Only mention Priyanshu\'s details if specifically asked about him (19-year-old Software Developer from Azamgarh, UP, India with skills in HTML, CSS, JavaScript, React, Node.js, MongoDB, Git).'
    }
];

// Voice recognition setup with Hindi support
let isListening = false;
let recognition = null;
let currentLanguage = 'hi-IN'; // Default to Hindi
let speechSynthesis = window.speechSynthesis;
let voices = [];

// Load available voices
function loadVoices() {
    voices = speechSynthesis.getVoices();
    // Find Hindi voices or fallback to unique voices
    const hindiVoices = voices.filter(voice => 
        voice.lang.includes('hi') || 
        voice.name.includes('Hindi') ||
        voice.name.includes('Google हिन्दी')
    );
    return hindiVoices.length > 0 ? hindiVoices : voices;
}

// Initialize speech synthesis
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentLanguage;
}

// Toggle chatbot
chatbotToggle.addEventListener('click', () => {
    chatbotWindow.style.display = chatbotWindow.style.display === 'flex' ? 'none' : 'flex';
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.style.display = 'none';
});

// Add message with voice output
function addMessage(text, sender, speakText = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    // Speak bot messages in Hindi voice
    if (sender === 'bot' && speakText) {
        speakInHindi(text);
    }
}

// Text-to-speech in Hindi with unique voice
function speakInHindi(text) {
    if (speechSynthesis) {
        speechSynthesis.cancel(); // Stop any ongoing speech
        
        const utterance = new SpeechSynthesisUtterance(text);
        const availableVoices = loadVoices();
        
        // Try to find Hindi voice, otherwise use a unique voice
        const hindiVoice = availableVoices.find(voice => 
            voice.lang.includes('hi') || voice.name.includes('Hindi')
        );
        
        if (hindiVoice) {
            utterance.voice = hindiVoice;
        } else {
            // Use a unique voice (female or different accent)
            const uniqueVoice = availableVoices.find(voice => 
                voice.name.includes('Female') || 
                voice.name.includes('Zira') ||
                voice.name.includes('Google')
            );
            if (uniqueVoice) utterance.voice = uniqueVoice;
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        
        speechSynthesis.speak(utterance);
    }
}

// Language toggle function
function toggleLanguage() {
    currentLanguage = currentLanguage === 'hi-IN' ? 'en-US' : 'hi-IN';
    if (recognition) {
        recognition.lang = currentLanguage;
    }
    
    const langButton = document.getElementById('lang-toggle');
    if (langButton) {
        langButton.textContent = currentLanguage === 'hi-IN' ? 'हिं' : 'EN';
        langButton.title = currentLanguage === 'hi-IN' ? 'Switch to English' : 'Switch to Hindi';
    }
}

// Generate AI response using OpenAI API
async function generateAIResponse(userMessage) {
    try {
        conversationHistory.push({ role: 'user', content: userMessage });
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: conversationHistory,
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const aiResponse = data.choices[0].message.content;
            conversationHistory.push({ role: 'assistant', content: aiResponse });
            return aiResponse;
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('AI API Error:', error);
        return getFallbackResponse(userMessage);
    }
}

// Fallback responses when API fails
function getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
        return 'Hello! I\'m an AI assistant. How can I help you today?';
    }
    if (message.includes('who are you') || message.includes('what are you')) {
        return 'I\'m an AI assistant created by Priyanshu Vishwakarma. I can help you with various tasks, answer questions, solve problems, and assist with programming or any other topics!';
    }
    if (message.includes('priyanshu') && (message.includes('name') || message.includes('who'))) {
        return 'Priyanshu Vishwakarma is a 19-year-old Software Developer from Azamgarh, UP, India with skills in HTML, CSS, JavaScript, React, Node.js, MongoDB, and Git.';
    }
    if (message.includes('priyanshu') && message.includes('contact')) {
        return 'Email: priyanshuvishwakarma506@gmail.com\nPhone: +91 9198757063';
    }
    if (message.includes('help')) {
        return 'I can help you with programming, answer questions, explain concepts, solve problems, write code, and assist with various topics. What would you like to know?';
    }
    
    return 'I\'m here to help! Feel free to ask me anything - programming questions, general knowledge, problem-solving, or anything else you need assistance with.';
}

// Send message with AI response
async function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatbotInput.value = '';

    // Show typing indicator
    typingIndicator.style.display = 'block';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    try {
        const response = await generateAIResponse(message);
        typingIndicator.style.display = 'none';
        addMessage(response, 'bot', true); // Enable voice output
    } catch (error) {
        typingIndicator.style.display = 'none';
        const errorMsg = currentLanguage === 'hi-IN' ? 
            'माफ करें, मुझे कनेक्ट करने में समस्या हो रही है। कृपया फिर से कोशिश करें।' :
            'Sorry, I\'m having trouble connecting. Please try again.';
        addMessage(errorMsg, 'bot', true);
    }
}

// Enhanced voice recognition with Hindi support
if (recognition) {
    recognition.onstart = () => {
        isListening = true;
        voiceButton.classList.add('recording');
        voiceButton.innerHTML = '<i class="fas fa-stop"></i>';
        
        // Show language indicator
        const langIndicator = currentLanguage === 'hi-IN' ? 'हिंदी में बोलें...' : 'Speak in English...';
        addMessage(langIndicator, 'bot');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatbotInput.value = transcript;
        sendMessage();
    };
    
    recognition.onend = () => {
        isListening = false;
        voiceButton.classList.remove('recording');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
    };
    
    recognition.onerror = (event) => {
        isListening = false;
        voiceButton.classList.remove('recording');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        
        const errorMsg = currentLanguage === 'hi-IN' ? 
            'आवाज़ पहचानने में समस्या हुई। कृपया फिर से कोशिश करें।' :
            'Voice recognition error. Please try again.';
        addMessage(errorMsg, 'bot');
    };
}

// Enhanced voice button with language support
voiceButton.addEventListener('click', () => {
    if (recognition) {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.lang = currentLanguage; // Set current language
            recognition.start();
        }
    } else {
        const errorMsg = currentLanguage === 'hi-IN' ? 
            'आपके ब्राउज़र में आवाज़ समर्थित नहीं है।' :
            'Voice not supported in your browser.';
        addMessage(errorMsg, 'bot');
    }
});

// Add language toggle button functionality
document.addEventListener('DOMContentLoaded', () => {
    // Create language toggle button if it doesn't exist
    const chatbotHeader = document.querySelector('.chatbot-header');
    if (chatbotHeader && !document.getElementById('lang-toggle')) {
        const langButton = document.createElement('button');
        langButton.id = 'lang-toggle';
        langButton.textContent = 'हिं';
        langButton.title = 'Switch to English';
        langButton.style.cssText = `
            background: none;
            border: 1px solid #fff;
            color: #fff;
            padding: 5px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 10px;
        `;
        langButton.addEventListener('click', toggleLanguage);
        chatbotHeader.appendChild(langButton);
    }
    
    // Load voices on page load
    loadVoices();
});

// Event listeners
chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Suggestion buttons
function suggestQuestion(question) {
    chatbotInput.value = question;
}

// Close on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.chatbot-container')) {
        chatbotWindow.style.display = 'none';
    }
});