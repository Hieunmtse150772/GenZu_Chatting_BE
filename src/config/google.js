module.exports = {
    oauth2Credentials: {
        client_id: '186870696368-7qljlc1ujt6ve5r69kaej3p253m1n3d3.apps.googleusercontent.com',
        project_id: 'fptmilkteashop', // The name of your project
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_secret: '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',
        redirect_uris: [`${process.env.URL}:${process.env.PORT}/auth/callback`],
        scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    },
};
