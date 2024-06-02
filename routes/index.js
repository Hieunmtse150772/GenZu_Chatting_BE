const swaggerUi = require('swagger-ui-express');

const AuthRoutes = require('../routes/auth.route');
const GeneralRoutes = require('../routes/general.route');
const MessageRoutes = require('../routes/message.route');
const configSwagger = require('../config/swagger');

const routes = (app) => {
    app.use('/auth', AuthRoutes);
    app.use('/messages', MessageRoutes);
    app.use('/documentations', swaggerUi.serve, swaggerUi.setup(configSwagger));
    app.use('/', GeneralRoutes);
};

module.exports = routes;
