const express = require('express');
require('dotenv').config();
const cors = require('cors');
var cookieParser = require('cookie-parser');
const routes = require('./routes');
require('./connections/mongodb');

const port = process.env.PORT || 3000;
const app = express();

// middleware
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());
app.use(cookieParser());

// routes
routes(app);

app.use((err, req, res, next) => {
    if (err.status !== 500) {
        res.status(err.status).json(err);
    } else {
        res.status(500).json({ error: 'Internal Server Error' + err });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
