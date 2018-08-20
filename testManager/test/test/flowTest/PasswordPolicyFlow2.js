const chai = require('chai');
const chaiHttp = require('chai-http');
const uuidv1 = require('uuid/v1');

const utils = require('../../utils');
const passwordPolicyFunc = require('../apiFunction/iamService/PasswordPolicyFunction');
const organizationUserFunc = require('../apiFunction/iamService/OrganizationUserFunction');
const userFunc = require('../apiFunction/iamService/UserFunction');

// functions 
chai.should();
chai.use(chaiHttp);
let sleep = utils.sleep;
let getMonthAndDate = utils.getMonthAndDate;

// global variables
let pwdPolicy = {};
let User = {};
const organizationId = 475;


describe('Password Policy Flow Test', function () {
    // specify timeout for this block.
    this.timeout(20000);

    it('使用test登录', function () {
        let reqBody = {
            'username': 'test',
            'password': 'test'
        };
        return utils.login(reqBody)
            .then(function() {
                console.log('    [Login] User: ' + global.user.username + ' has logged in');
            });
    });

    it('获取组织下的密码安全策略', function () {
        return passwordPolicyFunc.getPwdPolicy(organizationId)
            .then(function(res) {
                pwdPolicy = res.body;
            });
    });

    it('修改密码安全策略，密码不允许与登录名相同', function () {
        let reqBody = {
            "enablePassword":true,
            "notUsername":true,
            "digitsCount": 0,
            "lowercaseCount": 0,
            "uppercaseCount": 0,
            "specialCharCount": 0,
            "minLength": 0,
            "maxLength": 1000,
            "objectVersionNumber":pwdPolicy.objectVersionNumber,
        }

        return passwordPolicyFunc.updatePwdPolicy(organizationId, pwdPolicy.id, reqBody);
    });

    // it('获取组织下的密码安全策略', function () {
    //     return passwordPolicyApi.getPwdPolicy(organizationId)
    //                             .then(function(res) {
    //                                 console.log(res.body);
    //                                 pwdPolicy = res.body;
    //                             });
    // });

    it('新建用户User，密码与用户名相同', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "unpw-user" + uuid,
            "password": "unpw-user" + uuid,
            "realName": "real-user"
        }
        return sleep(5000).then(function() {
            organizationUserFunc.createUser(organizationId, reqBody)
                .then(function(res) {
                    res.body.should.have.property('failed');
                    res.body.message.should.equal('密码不能与用户名相同');
                    console.log("    [Fail] " + res.text);
                });
        })
    });

    it('正确新建用户User', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "unpw-user" + uuid,
            "password": "abcd1234",
            "realName": "real-user"
        }
        return sleep(1000).then(function() {
            organizationUserFunc.createUser(organizationId, reqBody)
                .then(function(res) {
                    User = res.body;
                });
        })
    });

    it('登出test成功', function () {
        return sleep(5000).then(function() {
            utils.logout(global.user.token);
        });
    });

    it('使用新建的用户登录', function () {
        let reqBody = {
            'username': User.loginName,
            'password': "abcd1234"
        };
        return utils.login(reqBody, 'success')
            .then(function() {
                console.log('    [Login] User: ' + global.user.username + ' has logged in');
            });
    });

    it('修改密码使得密码与登陆名称相同，禁止修改', function () {    
        let reqBody = {
            "originalPassword": "abcd1234",
            "password": User.loginName
        }
        // console.log("id: ",User);
        return sleep(1000).then(function() {
            userFunc.updatePwd(User.id, reqBody)
                    .then(function (res) {
                        res.body.should.have.property('failed');
                        res.body.message.should.equal('密码不能与用户名相同');
                        console.log("    [Fail] " + res.text);
                    })
        });
    });

    it('修改密码成功，自动登出', function () {    
        let reqBody = {
            "originalPassword": "abcd1234",
            "password": "abcd1234"
        }
        // console.log("id: ",User);
        return sleep(1000).then(function() {
            userFunc.updatePwd(User.id, reqBody);
        });
    });


});
