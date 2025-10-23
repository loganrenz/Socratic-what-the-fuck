# Socratic WTF

A vanilla JavaScript Progressive Web App (PWA) that lets you rant using speech recognition and get Socratic wisdom in return.

## Features

- **Speech Recognition**: Hold the red button and speak to capture your rant
- **WebAssembly Integration**: Processes transcripts using whisper.wasm
- **Socratic Responses**: Get thoughtful responses (70% serious philosophical questions, 30% sarcastic wit)
- **Local Storage**: Save your rant history locally in the browser
- **PWA Support**: Installable as a standalone app with offline capabilities
- **No Build Required**: Pure vanilla JS, HTML, and CSS - no frameworks or build tools

## How to Use

1. Open `index.html` in a modern browser (Chrome, Edge, or Safari recommended for best speech recognition support)
2. Press and hold the red "HOLD TO RANT" button
3. Speak your rant while holding the button
4. Release the button when done
5. Receive a Socratic response that makes you think (or laugh)

## Technical Details

- Uses Web Speech API (SpeechRecognition/webkitSpeechRecognition)
- WebAssembly integration for audio processing
- Service Worker for offline functionality
- localStorage for persisting rant history
- Fully responsive design

## Browser Support

- Chrome/Edge: Full support
- Safari: Requires webkit prefix for speech recognition
- Firefox: Limited speech recognition support

## Files

- `index.html` - Main application page
- `app.js` - Application logic and speech recognition
- `service-worker.js` - PWA service worker for offline support
- `manifest.json` - PWA manifest for installation
- `whisper.wasm` - WebAssembly module for audio processing
- `icon-192.png` & `icon-512.png` - PWA icons

## Development

Simply serve the directory with any HTTP server:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

## License

Open source - use as you wish!