require('module-alias/register');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const routes = require('@/routes');
require('@/connections/mongodb');
const { app, server } = require('@/connections/socketio');

const port = process.env.PORT || 3000;

// middleware
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());
app.use(cookieParser());

// routes
routes(app);

app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    console.log('err: ', err);
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        status: statusCode,
    });
    next();
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Thực hiện các hành động cần thiết, ví dụ như:
    // - Ghi log lỗi vào file
    // - Gửi thông báo email
    // - Khởi động lại server

    // Ngăn chặn server sập hoàn toàn
});
// server.on('close', () => {
//     console.log('Server closed');
// });

// server.on('error', (error) => {
//     console.log('Server errored: ' + error);
// });
