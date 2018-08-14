const flowTestUtils = require('../../FlowtestUtils');
const chai = require('chai');
const chaiHttp = require('chai-http');
const uuidv1 = require('uuid/v1');
const organizationApi = require('../apiTest/organizationService/OrganizationApi');
const organizationUserApi = require('../apiTest/iamService/OrganizationUserApi');
const roleMemberApi = require('../apiTest/iamService/RoleMemberApi');

chai.should();
chai.use(chaiHttp);

global.user = {};
const ORG_ADMIN_ID = 2;
const organizationId = 270;
let organizationInfo = undefined;
let memberInfo = undefined;

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

describe('User Role Flow Test', function () {
    it('用户test登录成功并获得token', function () {
        let reqBody = {
            'username': 'test',
            'password': 'test'
        };
        return flowTestUtils.login(reqBody, 'success')
                            .then(function() {
                                global.user.token = reqBody.accessToken;
                                global.user.username = reqBody.username;
                                console.log('Login token: ', global.user.token);
                            });
    });

    it('test用户创建组织', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "name": "用户测试组织" + uuid,
            "code": "test-" + "0712-" + uuid
          };
        return organizationApi.createOrganization('success', reqBody)
                                .then(function (res) {
                                    organizationInfo = res.body;
                                }).catch(function(err) {
                                    console.log(err);
                                });
    }); 

    it('在创建的组织下新建用户', function () {
        let uuid = uuidv1().substring(0, 5);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "st-user1-" + uuid,
            "password": "test",
            "realName": "real-user1"
        }
        return sleep(30000).then(function() {
            console.log(organizationInfo);
            
            organizationUserApi.createUser(organizationInfo.id, reqBody)
                                .then(function (res) {
                                    memberInfo = res.body;
                                    console.log('body:', res.body);
                                }).catch(function(err) {
                                    console.log(err);
                                });
        })
    });

    it('为用户分配组织管理员的角色', function () {
        
        // let query = {}
        return sleep(5000).then(function() {
            console.log(memberInfo);
            
        }).catch(function(err) {
            console.log(err);
        });
        // return roleMemberApi.orgAssignRole(organizationId, query, reqBody);
    });

    it('登出成功', function () {
        return flowTestUtils.logout(global.user.token);
    });
});
