const config = {
    local: true, //是否为本地开发
    clientId: 'localhost', // 必须填入响应的客户端（本地开发）
    titlename: 'Choerodon', //项目页面的title名称
    // favicon: 'favicon.ico', //项目页面的icon图片名称
    theme: {
        'primary-color': '#3F51B5',
    },
    cookieServer: '', // 子域名token共享
    server: 'http://api.choerodon.example.com', // 后端接口服务器地址
    webSocketServer: 'ws://websocket.choerodon.example.com',
    port: 9090,// 端口
    dashboard: {
        'testManager': 'src/app/testManager/dashboard/*',
    },
};

module.exports = config;
