// Socratic WTF - PWA with Speech Recognition and WebAssembly

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.log('Service Worker registration failed', err));
}

// DOM elements
const rantButton = document.getElementById('rantButton');
const statusDiv = document.getElementById('status');
const transcriptDiv = document.getElementById('transcript');
const responseDiv = document.getElementById('response');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;
let finalTranscript = '';

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        console.log('Speech recognition started');
        statusDiv.textContent = 'Listening... Keep holding and speak';
        rantButton.classList.add('listening');
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        transcriptDiv.textContent = finalTranscript + interimTranscript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        statusDiv.textContent = `Error: ${event.error}`;
        rantButton.classList.remove('listening');
    };

    recognition.onend = () => {
        console.log('Speech recognition ended');
        rantButton.classList.remove('listening');
        
        if (isRecording) {
            // If still holding, restart recognition
            recognition.start();
        }
    };
} else {
    statusDiv.textContent = 'Speech recognition not supported in this browser';
}

// Button event handlers
rantButton.addEventListener('mousedown', startRanting);
rantButton.addEventListener('touchstart', startRanting, { passive: true });

rantButton.addEventListener('mouseup', stopRanting);
rantButton.addEventListener('touchend', stopRanting);
rantButton.addEventListener('mouseleave', stopRanting);

function startRanting(e) {
    e.preventDefault();
    if (!recognition) {
        statusDiv.textContent = 'Speech recognition not available';
        return;
    }
    
    isRecording = true;
    finalTranscript = '';
    transcriptDiv.textContent = '';
    responseDiv.style.display = 'none';
    responseDiv.classList.remove('visible');
    rantButton.classList.add('active');
    
    try {
        recognition.start();
    } catch (err) {
        console.log('Recognition already started or error:', err);
    }
}

function stopRanting(e) {
    e.preventDefault();
    if (!isRecording) return;
    
    isRecording = false;
    rantButton.classList.remove('active', 'listening');
    
    if (recognition) {
        recognition.stop();
    }
    
    statusDiv.textContent = 'Processing your rant...';
    
    // Process the transcript
    processTranscript(finalTranscript.trim());
}

// Process transcript with WebAssembly (mock implementation)
async function processTranscript(transcript) {
    if (!transcript) {
        statusDiv.textContent = 'No speech detected. Try again.';
        return;
    }
    
    try {
        // Attempt to fetch and use whisper.wasm
        // Since whisper.wasm is not provided, we'll use a fallback
        let processedText = transcript;
        
        try {
            const response = await fetch('whisper.wasm');
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const { instance } = await WebAssembly.instantiate(arrayBuffer);
                
                // Call the WASM module's run function
                if (instance.exports.run) {
                    processedText = instance.exports.run(transcript);
                }
            }
        } catch (wasmError) {
            console.log('WebAssembly module not available, using fallback:', wasmError);
            // Fallback: just use the transcript as-is
        }
        
        // Generate Socratic response (7/10 serious, 3/10 sarcastic)
        const response = generateSocraticResponse(processedText);
        
        // Display response
        responseDiv.textContent = response;
        responseDiv.classList.add('visible');
        statusDiv.textContent = 'Response generated!';
        
        // Save to local storage
        saveToHistory(transcript, response);
        
    } catch (error) {
        console.error('Error processing transcript:', error);
        statusDiv.textContent = 'Error processing your rant';
    }
}

// Generate Socratic response (70% serious, 30% sarcastic)
function generateSocraticResponse(text) {
    const isSarcastic = Math.random() < 0.3; // 30% chance of sarcastic
    
    const seriousResponses = [
        `What leads you to believe that "${text}"? Have you considered the underlying assumptions?`,
        `Interesting perspective. What evidence supports this view? How might alternative explanations account for the same observations?`,
        `Let's examine this carefully. What would need to be true for "${text}" to be valid? Are those conditions met?`,
        `Have you reflected on why this matters to you? What values or principles are at stake here?`,
        `Consider: if the opposite were true, how would that change your understanding? What remains constant?`,
        `What are the implications of this statement? Have you traced through the logical consequences?`,
        `Before we proceed, can you define the key terms you're using? Do we share the same understanding?`,
    ];
    
    const sarcasticResponses = [
        `Oh, absolutely! And I'm sure that's based on rigorous, peer-reviewed research and not just, you know, a feeling.`,
        `Fascinating. Tell me, does complaining about it make it better, or just make you feel better?`,
        `Wow, such insight! Did you come up with that all by yourself, or did the internet help?`,
    ];
    
    const responses = isSarcastic ? sarcasticResponses : seriousResponses;
    return responses[Math.floor(Math.random() * responses.length)];
}

// Save rant and response to localStorage
function saveToHistory(rant, response) {
    const history = getHistory();
    
    const entry = {
        timestamp: new Date().toISOString(),
        rant: rant,
        response: response
    };
    
    history.unshift(entry);
    
    // Keep only last 10 entries
    if (history.length > 10) {
        history.length = 10;
    }
    
    localStorage.setItem('rantHistory', JSON.stringify(history));
    displayHistory();
}

// Get history from localStorage
function getHistory() {
    const stored = localStorage.getItem('rantHistory');
    return stored ? JSON.parse(stored) : [];
}

// Display history
function displayHistory() {
    const history = getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: #666;">No previous rants yet.</p>';
        clearHistoryBtn.style.display = 'none';
        return;
    }
    
    clearHistoryBtn.style.display = 'block';
    
    historyList.innerHTML = history.map(entry => {
        const date = new Date(entry.timestamp);
        const timeString = date.toLocaleString();
        
        return `
            <div class="history-item">
                <div class="timestamp">${timeString}</div>
                <div class="rant-text">"${entry.rant}"</div>
                <div class="response-text">${entry.response}</div>
            </div>
        `;
    }).join('');
}

// Clear history
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all history?')) {
        localStorage.removeItem('rantHistory');
        displayHistory();
    }
});

// Initialize history display on load
displayHistory();
