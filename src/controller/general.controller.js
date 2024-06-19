module.exports = {
    home: (req, res) => {
        res.send('home');
    },
    notFound: (req, res) => {
        res.status(404).send('not found');
    },
};
