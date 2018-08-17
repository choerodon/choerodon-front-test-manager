/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');

chai.should();
chai.use(chaiHttp);
const projectId = utils.config.projectId;
let fileFunction = {
  /**
   * 上传文件
   * @param query  ( Example : query ={bucket_name: 'string', file_name: 'string'} )
   * @param formData  ( Example : formData ={file: 'string'} )
   * @returns {*|Promise|PromiseLike<T>|Promise<T>}
   */
  uploadFile: function (query, formData) {
    return new Promise((resolve, reject) => {
      chai.request(utils.config.gateway)
        .post(`/zuul/test/v1/projects/${projectId}/test/case/attachment`)
        .query(query)
        .attach('file', formData.file)
        .set('Authorization', global.user.token)
        .then(function (res) {
          res.should.have.status(201);
          resolve(res.body);
        })
    })
  },
  /**
   * 删除文件
   * @param query  ( Example : query ={bucket_name: 'string', url: 'string'} )
   * @returns {*|Promise|PromiseLike<T>|Promise<T>}
   */
  deleteFile: function (id) {
    return chai.request(utils.config.gateway)
      .delete(`/test/v1/projects/${projectId}/test/case/attachment/delete/bucket/test/attach/${id}`)
      .set('Authorization', global.user.token)
      .then(function (res) {
        res.should.have.status(204);
        return res;
      })
  }
};

module.exports = fileFunction;
