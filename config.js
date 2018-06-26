const config = {
    port: 9090,
    output: './dist',
    htmlTemplate: 'index.template.html',
    devServerConfig: {},
    webpackConfig(config) {
        return config;
    },
    entryName: 'index',
    root: '/',
    routes: null, //by default, routes use main in package.json
    server: 'http://api.example.com', //api server
    clientid: 'localhost',
    titlename: 'Choerodon', //html title
    favicon: 'favicon.ico', //page favicon
    theme: { // less/sass modify vars
        'primary-color': '#3F51B5',
        'icon-font-size-base': '16px',
    },
};

module.exports = config;

