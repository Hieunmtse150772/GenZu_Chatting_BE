const express = require('express');
const { Server } = require('socket.io');
const http = require('http'); // cần một máy chủ HTTP để Socket.IO có thể làm việc đúng cách

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('socket was connected');
});

module.exports = { app, io, server };
