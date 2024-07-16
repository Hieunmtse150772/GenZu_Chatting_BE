require('module-alias/register');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Translate } = require('@google-cloud/translate').v2;

const routes = require('@/routes');
require('@/connections/mongodb');
const { app, server } = require('@/connections/socketio');
const User = require('@/model/user.model');

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

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error:', err);
    User.updateMany({}, { $set: { socketId: [], is_online: false } })
        .then((result) => {
            server.close(() => {
                process.exit(1);
            });
        })
        .catch((updateErr) => {
            console.error('Error updating users on uncaughtException:', updateErr);
            server.close(() => {
                process.exit(1);
            });
        });
});

// Creates a client

// Creates a client
const translate = new Translate({ key: 'AIzaSyC-AnLiqjKykX7n-Hg4p4_tEAxFARqkNBo' });

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const text =
    'Before you can start using the Cloud Translation API, you must have a project that has the Cloud Translation API enabled, and you must have the appropriate credentials';
const target = 'ru';

async function translateText() {
    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    let [translations] = await translate.translate(text, target);
    translations = Array.isArray(translations) ? translations : [translations];
    console.log('Translations:');
    translations.forEach((translation, i) => {
        console.log(`${text[i]} => (${target}) ${translation}`);
    });
}

translateText();

server.close(() => {
    console.log('Server has been closed.');
    User.updateMany({}, { $set: { socketId: [], is_online: false } })
        .then((result) => {
            console.log('Server closed');
        })
        .catch((err) => {
            console.error('Error updating users on server close:', err);
        });
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
