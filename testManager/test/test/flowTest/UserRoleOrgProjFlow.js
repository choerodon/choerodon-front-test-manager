const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../Utils');
const uuidv1 = require('uuid/v1');
const lodash = require('lodash');
let orgFunc = require('../apiFunction/organizationService/organizationFunc');
let orgProjFunc = require('../apiFunction/iamService/OrganizationProjectFunction');
let projFunc = require('../apiFunction/iamService/ProjectFunction');
let orgUserFunc = require('../apiFunction/iamService/OrganizationUserFunction');
let roleFunc = require('../apiFunction/iamService/RoleFunction');
let roleMemberFunc = require('../apiFunction/iamService/RoleMemberFunction');
let pmsFunc = require('../apiFunction/iamService/PermissionFunction');

chai.should();
var assert = chai.assert;
chai.use(chaiHttp);

let testData = {
    roleSiteA: {
        "name": "全局层角色（创建角色、组织）",
        "code": "role/site/custom/test-" + getDate() + "-" + uuidv1().substring(0, 3),
        "level": "site",
        "permissions": [],
        "labels": []
    },
    roleOrgB: {
        "name": "组织层角色（添加Label）",
        "code": "role/organization/custom/test-" + getDate() + "-" + uuidv1().substring(0, 3) + "-l",
        "level": "organization",
        "permissions": [{"id": 56}],
        "labels": [{"id": "2"}]
    },
    roleOrgC: {
        "name": "组织层角色（不添加Label）",
        "code": "role/organization/custom/test-" + getDate() + "-" + uuidv1().substring(0, 3),
        "level": "organization",
        "permissions": [{"id": 56}],
        "labels": []
    },
    roleOrgD: {
        "name": "组织层角色（创建项目、分配组织层角色）",
        "code": "role/organization/custom/test-" + getDate() + "-" + uuidv1().substring(0, 4),
        "level": "organization",
        "permissions": [],
        "labels": []
    },
    roleProjE: {
        "name": "项目层角色（添加Label）",
        "code": "role/project/custom/test-" + getDate() + "-" + uuidv1().substring(0, 3) + '-l',
        "level": "project",
        "permissions": [],
        "labels": [{"id": "1"}]
    },
    roleProjF: {
        "name": "项目层角色（不添加Label）",
        "code": "role/project/custom/test-" + getDate() + "-" + uuidv1().substring(0, 3),
        "level": "project",
        "permissions": [{"id": 87}],
        "labels": []
    },
    orgA: {
        "code": "test-" + getDate() + "-" + uuidv1().substring(0, 3),
        "enabled": true,
        "id": undefined,
        "name": "测试创建组织" + uuidv1().substring(0, 3),
        "objectVersionNumber": 0
    },
    orgB: {
        "code": "suser-" + getDate() + "-" + uuidv1().substring(0, 3),
        "enabled": true,
        "id": undefined,
        "name": "用户创建组织" + uuidv1().substring(0, 3),
        "objectVersionNumber": 0
    },
    proj: {
        "code": "suser-" + getDate() + "-" + uuidv1().substring(0, 3),
        "name": "用户创建项目" + uuidv1().substring(0, 3),
    },
    updateProj: {
        "name": "用户创建项目" + uuidv1().substring(0, 3) + "-M",
    },
    siteUser: {
        "loginName": "suser-" + uuidv1().substring(0, 3),
        "realName": "suser-" + getDate() + "-" + uuidv1().substring(0, 3),
        "email": uuidv1().substring(0, 10) + "@suser.com",
        "password": "suser",
        "rePassword": "suser"
    },
    orgUser: {
        "loginName": "ouser-" + uuidv1().substring(0, 3),
        "realName": "ouser-" + getDate() + "-" + uuidv1().substring(0, 3),
        "email": uuidv1().substring(0, 10) + "@ouser.com",
        "password": "ouser",
        "rePassword": "ouser"
    },
    projUser: {
        "loginName": "puser-" + uuidv1().substring(0, 3),
        "realName": "puser-" + getDate() + "-" + uuidv1().substring(0, 3),
        "email": uuidv1().substring(0, 10) + "@puser.com",
        "password": "puser",
        "rePassword": "puser"
    }
};
describe('平台管理员测试', function () {
    this.timeout(100000);
    it('test登陆', function () {
        let reqBody = {
            "username": utils.config.loginName,
            "password": utils.config.loginPass
        };
        return utils.login(reqBody, 'success');
    });

    it('查询创建角色与组织所需的权限', function () {
        let query = {
            getPmsAboutLabel: {
                level: "site",
                params: "label"
            },
            getPmsAboutOrg: {
                level: "site",
                params: "org"
            },
            getPmsAboutPms: {
                level: "site",
                params: "Permission"
            },
            getPmsAboutRole: {
                level: "site",
                params: "role"
            },
        };
        pmsFunc.getPmsByLevel(query.getPmsAboutLabel).then(function (res) {
            testData.roleSiteA.permissions = testData.roleSiteA.permissions.concat(res.body.content);
        });
        pmsFunc.getPmsByLevel(query.getPmsAboutOrg).then(function (res) {
            testData.roleSiteA.permissions = testData.roleSiteA.permissions.concat(res.body.content);
        });
        pmsFunc.getPmsByLevel(query.getPmsAboutPms).then(function (res) {
            testData.roleSiteA.permissions = testData.roleSiteA.permissions.concat(res.body.content);
        });
        return pmsFunc.getPmsByLevel(query.getPmsAboutRole).then(function (res) {
            testData.roleSiteA.permissions = testData.roleSiteA.permissions.concat(res.body.content);
        });
    });
    it('1.1 创建全局层角色（编码：' + testData.roleSiteA.code + ',名称：' + testData.roleSiteA.name + ',权限：创建角色 创建组织）', function () {
        testData.roleSiteA.permissions = lodash.uniqWith(testData.roleSiteA.permissions, lodash.isEqual);
        let body = testData.roleSiteA;
        return roleFunc.createRole(body).then(function (res) {
            testData.roleSiteA = res.body;
        })
    });
    it('1.2 创建组织层角色（编码：' + testData.roleOrgB.code + ',名称：' + testData.roleOrgB.name + ',权限：创建项目,标签：organization.owner）', function () {
        let body = testData.roleOrgB;
        return roleFunc.createRole(body).then(function (res) {
            testData.roleOrgB = res.body;
        })
    });
    it('1.3 创建组织层角色（编码：' + testData.roleOrgC.code + ',名称：' + testData.roleOrgC.name + ',权限：创建项目）', function () {
        let body = testData.roleOrgC;
        return roleFunc.createRole(body).then(function (res) {
            testData.roleOrgC = res.body;
        })
    });
    it('2 创建组织（编码：' + testData.orgA.code + ',名称：' + testData.orgA.name + '）', function () {
        let body = testData.orgA;
        return (orgFunc.createOrganization(body).then(function (res) {
            testData.orgA = res.body;
        }));
    });
    it('数据初始化∠( ᐛ 」∠)＿', function () {
        return sleep(60000);
    });
    it('3 在组织\"' + testData.orgA.name + '\"下创建全局层用户（登录名：' + testData.siteUser.loginName + '）', function () {
        let body = testData.siteUser;
        return orgUserFunc.createUser(testData.orgA.id, body).then(function (res) {
            testData.siteUser = res.body;
        }).catch(function (err) {
            console.log("error:" + err);
        });
    });
    it('数据初始化∠( ᐛ 」∠)＿', function () {
        return sleep(20000);
    });
    it('4 给用户\"' + testData.siteUser.loginName + '\"分配角色\"' + testData.roleSiteA.name + '\"', function () {
        let body = [{
            memberType: 'user',
            roleId: testData.roleSiteA.id,
            sourceId: 0,
            sourceType: testData.roleSiteA.level
        }];
        let query = {member_ids: testData.siteUser.id, is_edit: true};
        return roleMemberFunc.siteAssignRole(query, JSON.stringify(body));
    });
    it('test登出', function () {
        return utils.logout();
    });
});


describe('全局层测试', function () {
    this.timeout(100000);
    it(testData.siteUser.loginName + '登陆', function () {
        let reqBody = {
            'username': testData.siteUser.loginName,
            'password': 'suser',
        };
        return utils.login(reqBody, 'success');
    });
    it('数据初始化∠( ᐛ 」∠)＿', function () {
        return sleep(60000);
    });
    it('查询创建项目、分配组织层角色所需的权限', function () {
        let query = {
            getPmsAboutRole: {
                level: "organization",
                params: "role"
            },
            getPmsAboutProj: {
                level: "organization",
                params: "proj"
            }
        };
        pmsFunc.getPmsByLevel(query.getPmsAboutRole).then(function (res) {
            testData.roleOrgD.permissions = testData.roleOrgD.permissions.concat(res.body.content);
        });
        return pmsFunc.getPmsByLevel(query.getPmsAboutProj).then(function (res) {
            testData.roleOrgD.permissions = testData.roleOrgD.permissions.concat(res.body.content);
        });
    });
    it('1.1 创建组织层角色（编码：' + testData.roleOrgD.code + ',名称：' + testData.roleOrgD.name + '）', function () {
        testData.roleOrgD.permissions = lodash.uniqWith(testData.roleOrgD.permissions, lodash.isEqual);
        let body = testData.roleOrgD;
        return roleFunc.createRole(body).then(function (res) {
            testData.roleOrgD = res.body;
        })
    });
    it('查询修改项目、分配项目层角色所需的权限', function () {
        let query = {
            getPmsAboutRole: {
                level: "project",
                params: "role"
            },
            getPmsAboutProj: {
                level: "project",
                params: "iam-service.project"
            }
        };
        pmsFunc.getPmsByLevel(query.getPmsAboutRole).then(function (res) {
            testData.roleProjE.permissions = testData.roleProjE.permissions.concat(res.body.content);
        });
        return pmsFunc.getPmsByLevel(query.getPmsAboutProj).then(function (res) {
            testData.roleProjE.permissions = testData.roleProjE.permissions.concat(res.body.content);
        });
    });
    it('1.2 创建项目层角色（编码：' + testData.roleProjE.code + ',名称：' + testData.roleProjE.name + ',权限：项目层批量分配角色、修改项目,标签：project.owner）', function () {
        let body = testData.roleProjE;
        return roleFunc.createRole(body).then(function (res) {
            testData.roleProjE = res.body;
        })
    });
    it('1.3 创建项目层角色（编码：' + testData.roleProjF.code + ',名称：' + testData.roleProjF.name + ',权限：创建项目）', function () {
        let body = testData.roleProjF;
        return roleFunc.createRole(body).then(function (res) {
            testData.roleProjF = res.body;
        })
    });
    it('2 创建组织（编码：' + testData.orgB.code + ',名称：' + testData.orgB.name + '）', function () {
        let body = testData.orgB;
        return orgFunc.createOrganization(body).then(function (res) {
            testData.orgB = res.body;
        });
    });
    it('数据初始化∠( ᐛ 」∠)＿', function () {
        return sleep(60000);
    });
    // it('3 查看组织\"' + testData.orgB.name + '\"的角色分配（标签校验：应带有\"' + testData.roleOrgB.name + '\"标签）', function () {
    //     let organizationId = testData.orgB.id;
    //     let query = {};
    //     let body = {"roleName": testData.roleOrgB.name, "param": []};
    //     return roleMemberFunc.getOrgUserRoles(organizationId, query, body).then(function (res) {
    //         let roles = res.body.content[0].roles;
    //         console.log(roles.length);
    //         assert.deepInclude(roles, testData.roleOrgB);
    //         assert.notDeepInclude(roles, testData.roleOrgC);
    //     }).catch(function (err) {
    //         console.log("error:" + err);
    //     });
    // });
    it('4.1 在组织\"' + testData.orgB.name + '\"下创建组织层用户（登录名：' + testData.orgUser.loginName + '）', function () {
        let body = testData.orgUser;
        orgUserFunc.createUser(testData.orgB.id, body).then(function (res) {
            testData.orgUser = res.body;
        }).catch(function (err) {
            console.log("error:" + err);
        })
        ;
    });
    it('数据初始化∠( ᐛ 」∠)＿', function () {
        return sleep(15000);
    });
    it('4.2 在组织\"' + testData.orgB.name + '\"下创建项目层用户（登录名：' + testData.projUser.loginName + '）', function () {
        let body = testData.projUser;
        return (orgUserFunc.createUser(testData.orgB.id, body).then(function (res) {
            testData.projUser = res.body;
        }).catch(function (err) {
            console.log("error:" + err);
        }));
    });
    it('数据初始化∠( ᐛ 」∠)＿', function () {
        return sleep(15000);
    });
    it('5 给用户\"' + testData.orgUser.loginName + '\"分配角色\"' + testData.roleOrgD.name + '\"', function () {
        let body = [{
            memberType: 'user',
            roleId: testData.roleOrgD.id,
            sourceId: 0,
            sourceType: testData.roleOrgD.level
        }];
        let query = {member_ids: testData.orgUser.id, is_edit: true};
        return roleMemberFunc.orgAssignRole(testData.orgB.id, query, JSON.stringify(body));
    });
    it(testData.siteUser.loginName + '登出', function () {
        return utils.logout();
    });
});

describe('组织层测试', function () {
    this.timeout(100000);
    it(testData.orgUser.loginName + '登陆', function () {
        let reqBody = {
            'username': testData.orgUser.loginName,
            'password': 'ouser',
        };
        return utils.login(reqBody, 'success');
    });
    it('数据初始化∠( ᐛ 」∠)＿', function () {
        return sleep(15000);
    });
    it('2 创建项目（编码：' + testData.proj.code + ',名称：' + testData.proj.name + '）', function () {
        let body = testData.proj;
        return orgProjFunc.createProj(testData.orgB.id, body).then(function (res) {
            testData.proj = res.body;
        });
    });
    it('数据初始化∠( ᐛ 」∠)＿', function () {
        return sleep(60000);
    });
    // it('4 查看项目\"' + testData.proj.name + '\"的角色分配（标签校验：应带有\"' + testData.roleProjE.name + '\"标签）', function () {
    //     let projectId = testData.proj.id;
    //     let query = {};
    //     let body = {"loginName": testData.orgUser.loginName, "param": []};
    //     return roleMemberFunc.getProjUserRoles(projectId, query, body).then(function (res) {
    //         let roles = res.body.content[0].roles;
    //         console.log(roles.length);
    //         assert.deepInclude(roles, testData.roleProjE);
    //         assert.notDeepInclude(roles, testData.roleProjF);
    //     }).catch(function (err) {
    //         console.log("error:" + err);
    //     });
    // });
    it('1 给用户\"' + testData.projUser.loginName + '\"分配角色\"' + testData.roleProjE.name + '\"', function () {
        let body = [{
            memberType: 'user',
            roleId: testData.roleProjE.id,
            sourceId: 0,
            sourceType: testData.roleProjE.level
        }];
        let query = {member_ids: testData.projUser.id, is_edit: true};
        return roleMemberFunc.projAssignRole(testData.proj.id, query, JSON.stringify(body));
    });
    it(testData.orgUser.loginName + '登出', function () {
        return utils.logout();
    });
});

describe('项目层测试', function () {
    this.timeout(100000);
    it(testData.projUser.loginName + '登陆', function () {
        let reqBody = {
            'username': testData.projUser.loginName,
            'password': 'puser',
        };
        return utils.login(reqBody, 'success');
    });
    it('数据初始化∠( ᐛ 」∠)＿', function () {
        return sleep(20000);
    });
    it('1 给用户\"' + testData.siteUser.loginName + '\"分配角色\"' + testData.roleProjF.name + '\"', function () {
        let body = [{
            memberType: 'user',
            roleId: testData.roleProjF.id,
            sourceId: 0,
            sourceType: testData.roleProjF.level
        }];
        let query = {member_ids: testData.projUser.id, is_edit: true};
        return roleMemberFunc.orgAssignRole(testData.orgB.id, query, JSON.stringify(body));
    });
    it('2 修改项目：' + testData.proj, function () {
        let projectId = testData.proj.id;
        let body = testData.proj;
        body.name = testData.updateProj.name;
        return projFunc.updateProj(projectId, body);
    });
    it(testData.projUser.loginName + '登出', function () {
        return utils.logout();
    });
});

function getDate() {
    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = '0' + day;
    }
    return month + day;
}

function sleep(time) {
    console.log("等待" + time + "毫秒");
    return new Promise((resolve) => setTimeout(resolve, time));
}
