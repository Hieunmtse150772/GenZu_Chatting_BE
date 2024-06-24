const express = require('express');
const { Server } = require('socket.io');
const http = require('http'); // cần một máy chủ HTTP để Socket.IO có thể làm việc đúng cách

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
      // credentials: true,
    },
  });
  
module.exports = { app, io, server };
