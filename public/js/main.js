const chatForm = document.getElementById('chat-form');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
// We use query selector to select the class from the dom.
const chatMessages = document.querySelector('.chat-messages');
const socket = io();

// Using qs (query string) library to get username and room from URL.
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
console.log(username, room);

// When user joins chatroom
socket.emit('joinRoom', {username, room});

// Get userlist and room name from server
socket.on('roomUsers', ({room, users}) => {
    console.log(users, room);
    outputRoom(room);
    outputUserList(users);
});

// message from server
socket.on('message', message => {
    outputMessage(message);

    // Scroll down New message
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // get message text
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage',msg);

    // After emiting chat message to the server, clear the input.
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// To render messages in dom
function outputMessage(message) {
    const div = document.createElement('div');
    // classList give us the list of all the classes
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div); 
}

// To render room in dom
function outputRoom(room) {
    roomName.innerHTML = room;
}

// To Display userList in dom
function outputUserList(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}
