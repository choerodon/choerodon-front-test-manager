const chai = require('chai');
const chaiHttp = require('chai-http');
const uuidv1 = require('uuid/v1');

const utils = require('../../Utils');
const organizationFunc = require('../apiFunction/organizationService/organizationFunction');
const organizationUserFunc = require('../apiFunction/iamService/OrganizationUserFunction');

// functions 
chai.should();
chai.use(chaiHttp);
let sleep = utils.sleep;
let getMonthAndDate = utils.getMonthAndDate;

// global variables
let organization = {};
let testUser1 = {};
let myDate = getMonthAndDate();
organization.id = 475;


describe('Password Policy Flow Test', function () {
    // specify timeout for this block
    this.timeout(20000);
    it('使用test登录', function () {
        let reqBody = {
            'username': 'test',
            'password': 'test'
        };
        return utils.login(reqBody)
                            .then(function() {
                                console.log('User: ' + global.user.username + ' has logged in');
                            });
    });

    it('test用户创建组织', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "name": "密码策略测试组织-" + myDate + "-" + uuid,
            "code": "pwd-" + myDate + "-" + uuid
          };
        return organizationFunc.createOrganization(reqBody)
            .then(function (res) {
                organization = res.body;
            }).catch(function(err) {
                console.log(err);
            });
    }); 

    it('在创建的组织下新建用户testUser1', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "ini-user-" + uuid,
            "password": "abcd1234",
            "realName": "real-user"
        }
        // return sleep(15000).then(function() {
        return sleep(15000).then(function() {
            organizationUserFunc.createUser(organization.id, reqBody)
                .then(function (res) {
                    testUser1 = res.body;
                }).catch(function(err) {
                    console.log(err);
                });
        })
    });

    it('登出test成功', function () {
        return sleep(5000).then(function() {
            utils.logout();
        });

    });
    
    it('使用新建用户登录', function () {
        let reqBody = {
            'username': testUser1.loginName,
            'password': "abcd1234"
        };
        return utils.login(reqBody)
            .then(function() {
                console.log('User: ' + global.user.username + ' has logged in');
            });
    });

    it('登出testUser1成功', function () {
        return utils.logout();
    });

});
