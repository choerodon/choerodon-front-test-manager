const clientFunc = require("../apiFunction/iamService/ClientFunction");
const utils = require('../../Utils');
const uuidv1 = require("uuid/v1");
const assert = require('chai').assert;

// Path Parameter: organizationId
let organizationId = 138;
let clientId = undefined;
// let updateVersionNumber = undefined;
let clientName = 'rke-test-client-' + uuidv1().substring(0, 5);
let clientDTO = {};

global.before(function () {
    // set login timeout to 5 seconds.
    this.timeout(5000);
    let reqBody = {
        "username": utils.config.loginName,
        "password": utils.config.loginPass
    }
    return utils.login(reqBody);
});

global.after(function () {
    return utils.logout();
});

describe('Client Api', function () {
    it('[POST] 创建客户端，客户端名称为空', function () {
        let reqBody = {
            "authorizedGrantTypes": "password",
            "secret": "secret"
        };
        return clientFunc.createClient(organizationId, reqBody, utils.errors.error.clientName.null);
    });

    it('[POST] 创建客户端，客户端密钥为空', function () {
        let reqBody = {
            "authorizedGrantTypes": "password",
            "name": clientName
        };
        return clientFunc.createClient(organizationId, reqBody, utils.errors.error.secret.null);
    });

    it('[POST] 创建客户端，授权类型为空', function () {
        let reqBody = {
            "name": clientName,
            "secret": "secret"
        };
        return  clientFunc.createClient(organizationId, reqBody, utils.errors.error.authorizedGrantTypes.null);
    });

    it('[POST] 创建客户端，输入正确信息', function () {
        // let reqBody = {};
        let reqBody = {
            "authorizedGrantTypes": "password",
            "name": clientName,
            "secret": "secret"
        };

        return clientFunc.createClient(organizationId, reqBody, 'success')
                .then(function(res) {
                    clientDTO = res.body;

                    assert.ownInclude({ a: 1 }, { a: 1 });

                }).catch(err => {
                    console.log('创建客户端Error：', err);
                })
    });

    it('[POST] 修改客户端, 客户端名称为空', function () {
        let tempName = clientDTO.name;
        let reqBody = clientDTO;
        reqBody.name = undefined;
        return clientFunc.updateClient(organizationId, clientDTO.id, reqBody, utils.errors.error.clientName.null)
                        .then(clientDTO.name = tempName);
    });

    it('[POST] 修改客户端, 信息错误', function () {
        let tempVersionNumber = clientDTO.objectVersionNumber;
        let reqBody = clientDTO;
        reqBody.objectVersionNumber = -1;
        return clientFunc.updateClient(organizationId, clientDTO.id, reqBody, utils.errors.error.client.update)
                        .then(clientDTO.objectVersionNumber = tempVersionNumber);
    });

    it('[POST] 修改客户端, 输入正确信息', function () {
        let reqBody = clientDTO;
        reqBody.secret = "new secret"
        return clientFunc.updateClient(organizationId, clientDTO.id, reqBody, 'success')
                 .then(function(res) {
                     clientDTO = res.body;
                 })
                 .catch(err => {
                     console.log('修改客户端Error：', err);
                 });
    });

    it('[DELETE] 删除客户端', function () {
        return clientFunc.deleteClient(organizationId, clientDTO.id);
    });

});
