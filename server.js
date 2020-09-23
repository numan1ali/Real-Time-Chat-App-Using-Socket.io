// Path is a nodejs core module
const path = require('path')
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = 'Chat Bot';


// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        // console.log(userJoin(socket.id, username, room));
        socket.join(user.room);
        // This (emit) is for only single client
        socket.emit('message', formatMessage(botName, 'Welcome to ChatRoom!'));

        // Broadcast when a user connects 
        // It sends to all the user excepts the client that is connecting.
        // To emit in specific room we will use to
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat.`));

        //  Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    // It has to be inside the connection.
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        console.log(user);
        if(user) {
            // For all the clients in general.
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat.`));
        
            //  Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });

        }
    });
});
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))