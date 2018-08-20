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
let LDAPUser = {};
let myDate = getMonthAndDate();
organization.id = 533;

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
                console.log('User: ' + global.user.username + ' has logged in');
            });
    });

    it('test用户创建组织', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "name": "LDAP测试组织-" + myDate + "-" + uuid,
            "code": "ldap-" + myDate + "-" + uuid
          };
        // return organizationFunc.createOrganization(reqBody)
        //     .then(function (res) {
        //         organization = res.body;
        //     }).catch(function(err) {
        //         console.log(err);
        //     });
    }); 

    it('在创建的组织下新建用户LDAPUser', function () {
        let uuid = uuidv1().substring(0, 3);
        let reqBody = {
            "email": uuid + "@hand-china.com",
            "loginName": "ldapadmin",
            "password": "admin",
            "realName": "admin"
        }
        console.log(organization.id);
        
        // When createOrganization() is enabled in the previous block, 
        // sleep enough time before the newly created org gets initialized in backend, e.g, 15000 ms.
        // return sleep(15000).then(function() {
        return sleep(0).then(function() {
            organizationUserFunc.createUser(organization.id, reqBody)
                .then(function (res) {
                    LDAPUser = res.body;
                }).catch(function(err) {
                    console.log(err);
                });
        });
    });

    it('登出test成功', function () {
        // sleep 5000 ms for the newly created user to be initialized and then log out 'test'.
        return sleep(5000).then(function() {
            utils.logout();
        });
    });




});
