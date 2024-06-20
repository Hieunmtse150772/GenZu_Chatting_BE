const jwt = require('jsonwebtoken');

module.exports = {
    home: (req, res) => {
        res.status(404).send('home');
    },
    notFound: (req, res) => {
        res.status(404).send('not found');
    },
};
