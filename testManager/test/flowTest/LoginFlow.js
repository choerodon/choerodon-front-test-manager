const flowTestUtils = require('../../FlowtestUtils');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

describe('Login Flow Test', function () {
    it('输入正确用户名和密码，登陆成功，取到token', function () {
        let reqBody = {
            'username': 'test',
            'password': 'test'
        };
        return flowTestUtils.login(reqBody, 'success')
                            .then(function() {
                                global.token = reqBody.accessToken;
                                console.log(global.token);
                            });
    });

    it('登陆失败，', function () {
        let reqBody = {
            'username': 'test666',
            'password': 'test'
        };
        return flowTestUtils.failedLogin(reqBody, '请输入登录账号')
                            .then(function(res) {
                                console.log('response:', res.text);
                            });
    });

    it('登出成功', function () {
        return flowTestUtils.logout(global.token);
    });
});
