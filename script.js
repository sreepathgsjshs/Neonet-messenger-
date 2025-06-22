document.addEventListener('DOMContentLoaded', function() {

    // DOM elements

    const connectionModal = document.getElementById('connectionModal');

    const mainInterface = document.getElementById('mainInterface');

    const yourNumberInput = document.getElementById('yourNumberInput');

    const connectBtn = document.getElementById('connectBtn');

    const chatView = document.getElementById('chatView');

    const recipientNumber = document.getElementById('recipientNumber');

    const messageInput = document.getElementById('messageInput');

    const sendBtn = document.getElementById('sendBtn');

    const connectionStatus = document.getElementById('connectionStatus');

    const peerIdInput = document.getElementById('peerIdInput');

    const connectPeerBtn = document.getElementById('connectPeerBtn');

    const peerIdModal = document.getElementById('peerIdModal');

    const yourPeerId = document.getElementById('yourPeerId');

    const copyPeerIdBtn = document.getElementById('copyPeerIdBtn');

    const closePeerIdModal = document.getElementById('closePeerIdModal');

    const particles = document.querySelector('.particles');

    // App state

    let yourNumber = '';

    let peer = null;

    let conn = null;

    let currentPeerId = '';

    // Initialize

    init();

    function init() {

        // Set up event listeners

        connectBtn.addEventListener('click', initializeConnection);

        connectPeerBtn.addEventListener('click', connectToPeer);

        sendBtn.addEventListener('click', sendMessage);

        messageInput.addEventListener('keypress', function(e) {

            if (e.key === 'Enter' && !e.shiftKey) {

                e.preventDefault();

                sendMessage();

            }

        });

        copyPeerIdBtn.addEventListener('click', copyPeerId);

        closePeerIdModal.addEventListener('click', () => peerIdModal.style.display = 'none');

        // Create floating binary digits

        createParticles();

    }

    function initializeConnection() {

        yourNumber = yourNumberInput.value.trim();

        if (!yourNumber) {

            alert('PLEASE ENTER YOUR NUMBER');

            return;

        }

        // Initialize PeerJS connection

        peer = new Peer(yourNumber.replace(/[^0-9]/g, '')); // Remove non-numeric chars for Peer ID

        peer.on('open', (id) => {

            currentPeerId = id;

            connectionModal.style.display = 'none';

            mainInterface.style.display = 'block';

            

            // Show peer ID to user

            yourPeerId.textContent = id;

            peerIdModal.style.display = 'flex';

            

            // Set up connection handlers

            setupPeerHandlers();

        });

        peer.on('error', (err) => {

            console.error('Peer error:', err);

            alert('CONNECTION ERROR: ' + err.message);

        });

    }

    function setupPeerHandlers() {

        // Handle incoming connections

        peer.on('connection', (connection) => {

            if (conn) {

                connection.close();

                return;

            }

            

            conn = connection;

            setupDataConnection();

        });

        // Update connection status

        peer.on('disconnected', () => {

            connectionStatus.textContent = 'DISCONNECTED';

            connectionStatus.style.color = '#f00';

            connectionStatus.style.textShadow = '0 0 5px #f00';

            enableUI(false);

        });

        peer.on('close', () => {

            connectionStatus.textContent = 'DISCONNECTED';

            connectionStatus.style.color = '#f00';

            connectionStatus.style.textShadow = '0 0 5px #f00';

            enableUI(false);

        });

    }

    function connectToPeer() {

        const peerId = peerIdInput.value.trim();

        if (!peerId) {

            alert('PLEASE ENTER PEER ID');

            return;

        }

        if (conn) {

            conn.close();

        }

        conn = peer.connect(peerId);

        setupDataConnection();

    }

    function setupDataConnection() {

        conn.on('open', () => {

            connectionStatus.textContent = 'CONNECTED TO ' + conn.peer;

            connectionStatus.style.color = '#0f0';

            connectionStatus.style.textShadow = '0 0 5px #0f0';

            

            recipientNumber.value = conn.peer;

            enableUI(true);

        });

        conn.on('data', (data) => {

            displayMessage({

                sender: conn.peer,

                text: data.message,

                time: formatTimestamp(data.timestamp),

                self: false

            });

        });

        conn.on('close', () => {

            connectionStatus.textContent = 'DISCONNECTED';

            connectionStatus.style.color = '#f00';

            connectionStatus.style.textShadow = '0 0 5px #f00';

            enableUI(false);

        });

        conn.on('error', (err) => {

            console.error('Connection error:', err);

            alert('CONNECTION ERROR: ' + err.message);

        });

    }

    function sendMessage() {

        const messageText = messageInput.value.trim();

        if (!messageText) {

            alert('PLEASE ENTER MESSAGE');

            return;

        }

        if (!conn || !conn.open) {

            alert('NOT CONNECTED TO PEER');

            return;

        }

        const messageData = {

            message: messageText,

            timestamp: Date.now()

        };

        conn.send(messageData);

        

        displayMessage({

            sender: yourNumber,

            text: messageText,

            time: formatTimestamp(messageData.timestamp),

            self: true

        });

        messageInput.value = '';

    }

    function displayMessage(message) {

        const messageDiv = document.createElement('div');

        messageDiv.className = `message ${message.self ? 'self' : 'other'}`;

        

        messageDiv.innerHTML = `

            <div class="message-bubble">${message.text}</div>

            <div class="message-time">${message.time}</div>

        `;

        

        chatView.appendChild(messageDiv);

        

        // Scroll to bottom

        setTimeout(() => {

            chatView.scrollTop = chatView.scrollHeight;

        }, 50);

    }

    function formatTimestamp(timestamp) {

        const date = new Date(timestamp);

        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    }

    function enableUI(enabled) {

        messageInput.disabled = !enabled;

        sendBtn.disabled = !enabled;

    }

    function copyPeerId() {

        navigator.clipboard.writeText(currentPeerId)

            .then(() => alert('PEER ID COPIED TO CLIPBOARD'))

            .catch(err => console.error('Failed to copy:', err));

    }

    function createParticles() {

        // Create floating binary digits

        for (let i = 0; i < 20; i++) {

            createFloatingDigit();

        }

    }

    function createFloatingDigit() {

        const digit = document.createElement('div');

        digit.className = 'floating-digit';

        digit.textContent = Math.random() > 0.5 ? '1' : '0';

        digit.style.left = `${Math.random() * 100}%`;

        digit.style.top = `${Math.random() * 100 + 100}%`;

        digit.style.animationDuration = `${5 + Math.random() * 10}s`;

        digit.style.animationDelay = `${Math.random() * 5}s`;

        digit.style.opacity = Math.random() * 0.5;

        digit.style.fontSize = `${10 + Math.random() * 10}px`;

        

        particles.appendChild(digit);

        

        // Remove digit after animation and create a new one

        digit.addEventListener('animationend', () => {

            digit.remove();

            createFloatingDigit();

        });

    }

});