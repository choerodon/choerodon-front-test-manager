const config = {
    local: true, //是否为本地开发
    clientId: 'localhost', // 必须填入响应的客户端（本地开发）
    titlename: 'Choerodon', //项目页面的title名称
    // favicon: 'favicon.ico', //项目页面的icon图片名称
    theme: {
        'primary-color': '#3F51B5',
    },
    cookieServer: '', // 子域名token共享
    // server:'https://api.choerodon.com.cn',
    // server: 'http://api.staging.saas.hand-china.com', // 后端接口服务器地址
    // server: 'http://api.alpha.saas.hand-china.com', // 后端接口服务器地址
    server:'http://10.211.108.232:8080',
    webSocketServer: 'ws://10.211.108.232:18085',
    // server:'http://172.20.1.50:8080',
    port: 9090,// 端口
    dashboard: {
        'testManager': 'src/app/testManager/dashboard/*',
    },
};

module.exports = config;