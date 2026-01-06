const myIdDisplay = document.getElementById('my-id');
const peerIdInput = document.getElementById('peer-id');
const chatWindow = document.getElementById('chat-window');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');
const statusInfo = document.getElementById('status-info');

// PeerJS Initialize
const peer = new Peer(); 
let conn;
let typingTimer;

// 1. अपनी ID प्राप्त करें
peer.on('open', (id) => {
    myIdDisplay.innerText = id;
});

// 2. जब कोई आपसे कनेक्ट करे
peer.on('connection', (c) => {
    conn = c;
    setupChatListeners();
});

// 3. कनेक्ट बटन दबाने पर
function connectToPeer() {
    const remoteId = peerIdInput.value;
    if (!remoteId) return alert("ID खाली है!");
    conn = peer.connect(remoteId);
    setupChatListeners();
}

function setupChatListeners() {
    statusInfo.innerText = "ऑनलाइन";
    
    conn.on('data', (data) => {
        // टाइपिंग चेक
        if (data.type === 'typing') {
            typingIndicator.innerText = data.isTyping ? "टाइपिंग..." : "";
        } 
        // मैसेज रिसीव होना
        else if (data.type === 'chat') {
            appendMessage(data.text, 'received', data.id);
            // 'Seen' सिग्नल वापस भेजें
            conn.send({ type: 'ack', id: data.id });
        } 
        // टिक अपडेट (Seen)
        else if (data.type === 'ack') {
            const tick = document.getElementById(`tick-${data.id}`);
            if (tick) {
                tick.innerHTML = "✓✓"; 
                tick.classList.add('seen');
            }
        }
    });
}

// टाइपिंग डिटेक्टर
messageInput.addEventListener('input', () => {
    if (conn) {
        conn.send({ type: 'typing', isTyping: true });
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            conn.send({ type: 'typing', isTyping: false });
        }, 2000);
    }
});

// Enter से मैसेज भेजें
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const text = messageInput.value;
    if (conn && text) {
        const msgId = Date.now(); 
        conn.send({ type: 'chat', text: text, id: msgId });
        appendMessage(text, 'sent', msgId);
        messageInput.value = "";
        conn.send({ type: 'typing', isTyping: false });
    }
}

function appendMessage(text, type, id) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    let tickHtml = type === 'sent' ? `<span class="tick" id="tick-${id}">✓</span>` : "";
    div.innerHTML = `<div>${text}</div> ${tickHtml}`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// वीडियो कॉल लॉजिक
function startVideoCall() {
    const remoteId = peerIdInput.value;
    document.getElementById('v-con').style.display = 'flex';
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        document.getElementById('local-video').srcObject = stream;
        const call = peer.call(remoteId, stream);
        call.on('stream', remStream => {
            document.getElementById('remote-video').srcObject = remStream;
        });
    });
}

peer.on('call', (call) => {
    document.getElementById('v-con').style.display = 'flex';
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        document.getElementById('local-video').srcObject = stream;
        call.answer(stream);
        call.on('stream', remStream => {
            document.getElementById('remote-video').srcObject = remStream;
        });
    });
});

function endCall() {
    location.reload(); // कॉल काटने का आसान तरीका पेज रिफ्रेश है
}