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
const assert = chai.assert;
let sleep = utils.sleep;
let getMonthAndDate = utils.getMonthAndDate;

// global variables
global.user = {};
let User = {};
let pwdPolicy = {};
const organizationId = 475;
const digitsCount = 1;
const lowercaseCount = 1;
const uppercaseCount = 1;
const specialCharCount = 1;
const minLength = 5;
const maxLength = 15;

describe('Password Policy Flow Test', function () {
    this.timeout(6000);

    it('使用test登录', function () {
        let reqBody = {
            'username': 'test',
            'password': 'test'
        };
        return utils.login(reqBody)
            .then(function() {
                console.log('    [Login] User: ' + global.user.username + ' has logged in');
            }).catch(err => {
                console.log(err);
            });
    });

    it('获取组织下的密码安全策略', function () {
        return passwordPolicyFunc.getPwdPolicy(organizationId)
            .then(function(res) {
                pwdPolicy = res.body;
            }).catch(err => {
                console.log(err);
            });
    });

    it('修改密码安全策略', function () {
        let reqBody = {
            "enablePassword":true,
            "notUsername":false,
            "digitsCount": digitsCount,
            "lowercaseCount": lowercaseCount,
            "uppercaseCount": uppercaseCount,
            "specialCharCount": specialCharCount,
            "minLength": minLength,
            "maxLength": maxLength,
            "objectVersionNumber":pwdPolicy.objectVersionNumber,
        }

        return passwordPolicyFunc.updatePwdPolicy(organizationId, pwdPolicy.id, reqBody);
    });

    it('新建用户User，大写字符数不达标', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "pwr-user" + uuid,
            "password": "abcd1234!",
            "realName": "real-user"
        }
        return sleep(1000).then(function() {
            organizationUserFunc.createUser(organizationId, reqBody)
                .then(function(res) {
                    res.body.should.have.property('failed');
                    res.body.message.should.equal('大写字符数不达标，最少要求' + uppercaseCount + '个大写字符');
                    console.log("    [Fail] " + res.text);
                }).catch(err => {
                    console.log(err);
                });
        })
    });
    it('新建用户User，小写字符数不达标', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "pwr-user" + uuid,
            "password": "ABCD1234!",
            "realName": "real-user"
        }
        return sleep(1000).then(function() {
            organizationUserFunc.createUser(organizationId, reqBody)
                .then(function(res) {
                    res.body.should.have.property('failed');
                    res.body.message.should.equal('小写字符数不达标，最少要求' + lowercaseCount + '个小写字符');
                    console.log("    [Fail] " + res.text);
                }).catch(err => {
                    console.log(err);
                });
        })
    });

    it('新建用户User，数字数量不达标', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "pwr-user" + uuid,
            "password": "abcdABCD!",
            "realName": "real-user"
        }
        return sleep(1000).then(function() {
            organizationUserFunc.createUser(organizationId, reqBody)
                .then(function(res) {
                    res.body.should.have.property('failed');
                    res.body.message.should.equal('数字数量不达标，最少要求' + digitsCount + '个数字');
                    console.log("    [Fail] " + res.text);
                }).catch(err => {
                    console.log(err);
                });
        })
    });

    it('新建用户User，特殊字符数量不达标', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "pwr-user" + uuid,
            "password": "abcdABCD1234",
            "realName": "real-user"
        }
        return sleep(1000).then(function() {
            organizationUserFunc.createUser(organizationId, reqBody)
                .then(function(res) {
                    res.body.should.have.property('failed');
                    res.body.message.should.equal('特殊字符数不达标，最少要求' + specialCharCount + '个特殊字符');
                    console.log("    [Fail] " + res.text);
                }).catch(err => {
                    console.log(err);
                });
        })
    });

    it('新建用户User，密码长度过短', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "pwr-user" + uuid,
            "password": "a",
            "realName": "real-user"
        }
        return sleep(1000).then(function() {
            organizationUserFunc.createUser(organizationId, reqBody)
                .then(function(res) {
                    res.body.should.have.property('failed');
                    res.body.message.should.equal('密码长度不达标，最少要求'+ minLength +'个字符');
                    console.log("    [Fail] " + res.text);
                }).catch(err => {
                    console.log(err);
                });
        });
    });

    it('新建用户User，密码长度过长', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "pwr-user" + uuid,
            "password": "abcdABCD1234!abcdABCD1234!",
            "realName": "real-user"
        }
        return sleep(1000).then(function() {
            organizationUserFunc.createUser(organizationId, reqBody)
                .then(function(res) {
                    res.body.should.have.property('failed');
                    res.body.message.should.equal('密码长度不达标，最多要求' + maxLength + '个字符');
                    console.log("    [Fail] " + res.text);
                }).catch(err => {
                    console.log(err);
                });
        })
    });

    it('在创建的组织下正确新建用户User', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "pwr-user" + uuid,
            "password": "abcdABCD1234*!",
            "realName": "real-user"
        }
        return sleep(1000).then(function() {
            organizationUserFunc.createUser(organizationId, reqBody)
                .then(function(res) {
                    res.body.should.not.have.property('failed');
                    User = res.body;
                }).catch(err => {
                    console.log(err);
                });
        })
    });

    it('登出test成功', function () {
        return sleep(5000).then(function() {
            utils.logout();
        }).catch(function(err) {
            console.log(err);
        });
    });

    it('使用新建的用户登录', function () {
        console.log(User);
        
        let reqBody = {
            'username': User.loginName,
            'password': "abcdABCD1234!"
        };
        return utils.login(reqBody)
            .then(function() {
                console.log('    [Login] User: ' + global.user.username + ' has logged in');
            }).catch(err => {
                console.log(err);
            });
    });

    it('修改密码使得密码大写字母数不达标，禁止修改', function () {    
        let reqBody = {
            "originalPassword": "abcdABCD1234!",
            "password": "abcd1234!"
        }
        // console.log("id: ",User);
        return sleep(1000).then(function() {
            userFunc.updatePwd(User.id, reqBody)
                .then(function (res) {
                    res.body.should.have.property('failed');
                    res.body.message.should.equal('密码不能与用户名相同');
                    console.log("    [Fail] " + res.text);
                }).catch(err => {
                    console.log(err);
                });
        });
    });

    // it('修改密码成功，自动登出', function () {    
    //     let reqBody = {
    //         "originalPassword": "abcd1234",
    //         "password": "abcd1234"
    //     }
    //     // console.log("id: ",User);
    //     return sleep(1000).then(function() {
    //         userApi.changePwd(User.id, reqBody);
    //     });
    // });


});
