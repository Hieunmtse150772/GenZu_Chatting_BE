module.exports = {
    getMessages: (req, res) => {
        res.send('hello');
    },
    sendMessage: (req, res) => {
        res.status(401).send('message');
    },
};
