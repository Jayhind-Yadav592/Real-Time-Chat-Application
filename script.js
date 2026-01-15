// State Management
let currentUsername = '';
let selectedUser = null;
let users = [];
let messages = {};
let typingUsers = new Set();

// Initialize
function login() {
    const username = document.getElementById('usernameInput').value.trim();

    if (!username) {
        showNotification('Please enter your name!');
        return;
    }

    currentUsername = username;
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('chatContainer').classList.add('active');
    document.getElementById('currentUser').textContent = username;

    // Simulate online users
    simulateOnlineUsers();
    showNotification(`Welcome, ${username}! 🎉`);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUsername = '';
        selectedUser = null;
        users = [];
        messages = {};
        document.getElementById('chatContainer').classList.remove('active');
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('usernameInput').value = '';
    }
}

// Simulate online users (in real app, this would come from WebSocket)
function simulateOnlineUsers() {
    const demoUsers = [
        { name: 'Rajesh Yadav', status: 'online', lastSeen: 'online' },
        { name: 'Ritika Patel', status: 'online', lastSeen: 'online' },
        { name: 'Mukesh Yadav', status: 'offline', lastSeen: '2 hours ago' },
        { name: 'Prakash Friend', status: 'online', lastSeen: 'online' },
        { name: 'Maya Di', status: 'offline', lastSeen: '1 day ago' },
        { name: 'Sai Bro', status: 'online', lastSeen: 'online' }
    ];

    users = demoUsers.filter(u => u.name !== currentUsername);
    renderUserList();
    updateOnlineCount();
}

function renderUserList() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        if (selectedUser === user.name) {
            userItem.classList.add('active');
        }

        const lastMessage = getLastMessage(user.name);

        userItem.innerHTML = `
          <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
          <div class="user-info">
            <h3>
              ${user.name}
              <span class="status-indicator ${user.status === 'online' ? 'status-online' : 'status-offline'}"></span>
            </h3>
            <p>${lastMessage || user.lastSeen}</p>
          </div>
        `;

        userItem.onclick = () => selectUser(user.name);
        userList.appendChild(userItem);
    });
}

function selectUser(username) {
    selectedUser = username;
    renderUserList();
    renderChatHeader();
    renderMessages();
    document.getElementById('inputArea').style.display = 'flex';
    document.getElementById('messageInput').focus();
}

function renderChatHeader() {
    const user = users.find(u => u.name === selectedUser);
    if (!user) return;

    const chatHeader = document.getElementById('chatHeader');
    chatHeader.innerHTML = `
        <div class="user-avatar">${selectedUser.charAt(0).toUpperCase()}</div>
        <div style="flex: 1;">
          <h2>${selectedUser}</h2>
          ${typingUsers.has(selectedUser) ? '<div class="typing-indicator">typing...</div>' :
            `<p style="color: #8696a0; font-size: 13px;">${user.status === 'online' ? 'online' : user.lastSeen}</p>`}
        </div>
      `;
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    const userMessages = messages[selectedUser] || [];

    if (userMessages.length === 0) {
        container.innerHTML = `
          <div class="empty-chat">
            <h2>Start a conversation with ${selectedUser}</h2>
            <p>Send a message to get started</p>
          </div>
        `;
        return;
    }

    userMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender === currentUsername ? 'sent' : 'received'}`;

        messageDiv.innerHTML = `
          <div class="message-bubble">
            ${msg.sender !== currentUsername ? `<div class="message-sender">${msg.sender}</div>` : ''}
            <div class="message-text">${msg.text}</div>
            <div class="message-time">${msg.time}</div>
          </div>
        `;

        container.appendChild(messageDiv);
    });

    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    if (!text || !selectedUser) return;

    const message = {
        sender: currentUsername,
        text: text,
        time: getCurrentTime(),
        timestamp: Date.now()
    };

    if (!messages[selectedUser]) {
        messages[selectedUser] = [];
    }

    messages[selectedUser].push(message);
    input.value = '';
    renderMessages();
    renderUserList();

    // Simulate response after 2-4 seconds
    setTimeout(() => simulateResponse(), Math.random() * 2000 + 2000);
}

function simulateResponse() {
    if (!selectedUser) return;

    const responses = [
        "Hey! How are you?",
        "That's interesting!",
        "I totally agree with you",
        "Tell me more about it",
        "Sounds great!",
        "Let's catch up soon",
        "Thanks for the message!",
        "That made my day! 😊",
        "I'll get back to you on that",
        "Awesome! Keep me posted"
    ];

    // Show typing indicator
    typingUsers.add(selectedUser);
    renderChatHeader();

    setTimeout(() => {
        typingUsers.delete(selectedUser);

        const response = {
            sender: selectedUser,
            text: responses[Math.floor(Math.random() * responses.length)],
            time: getCurrentTime(),
            timestamp: Date.now()
        };

        if (!messages[selectedUser]) {
            messages[selectedUser] = [];
        }

        messages[selectedUser].push(response);
        renderMessages();
        renderUserList();
        renderChatHeader();

        showNotification(`New message from ${selectedUser}`);
    }, 1500);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function getLastMessage(username) {
    const userMessages = messages[username];
    if (!userMessages || userMessages.length === 0) return null;

    const lastMsg = userMessages[userMessages.length - 1];
    const preview = lastMsg.text.substring(0, 30);
    return preview + (lastMsg.text.length > 30 ? '...' : '');
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function updateOnlineCount() {
    const onlineUsers = users.filter(u => u.status === 'online').length;
    document.getElementById('onlineCount').textContent = `${onlineUsers} Online`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Simulate random user status changes
setInterval(() => {
    if (users.length > 0 && currentUsername) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        randomUser.status = randomUser.status === 'online' ? 'offline' : 'online';
        randomUser.lastSeen = randomUser.status === 'online' ? 'online' : 'just now';
        renderUserList();
        updateOnlineCount();
        if (selectedUser === randomUser.name) {
            renderChatHeader();
        }
    }
}, 10000);