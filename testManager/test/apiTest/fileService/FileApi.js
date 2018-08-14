const chai = require('chai');
const chaiHttp = require('chai-http');
const uuidv1 = require('uuid/v1');
const utils = require('../../../Utils');
let filefunc=require("../../apiFunction/fileService/FileFunction");
chai.should();
chai.use(chaiHttp);

global.before(function () {
    // set login timeout to 5 seconds.
    this.timeout(5000);
    let reqBody = {
        "username": utils.config.loginName,
        "password": utils.config.loginPass
    };
    return utils.login(reqBody, 'success');
});

global.after(function () {
    return utils.logout();
});

describe('File Api', function () {
    it('[POST] 上传文件成功', function () {
        let query = {bucket_name: uuidv1().substring(3, 63), file_name: 'FileUploadTestTXT'};
        let formData = {file: '../framework-api-test/static/fileUploadTestFile.txt'};
        return filefunc.uploadFile(query, formData);
    });

    it('[DELETE] 删除文件', function () {
        let query = {bucket_name: uuidv1().substring(3, 63), url: uuidv1().substring(0, 45)};
        return filefunc.deleteFile(query);
    });
    it('[POST] 上传文件成功', function () {
        let query = {bucket_name: uuidv1().substring(3, 63), file_name: 'FileUploadTestTXT'};
        let formData = {file: '../framework-api-test/static/fileUploadTestFile.txt'};
        return filefunc.uploadDocument(query, formData);
    });
});