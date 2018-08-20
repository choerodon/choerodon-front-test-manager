/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');

chai.should();
chai.use(chaiHttp);

const projectId = utils.config.projectId;
const statusFunction = {
  /**
   * 查询状态列表
   *
   * @returns
   */
  getStatusList(body) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/status/query`)
      .send(body)
      .set('Authorization', global.user.token)
      .set('Content-Type', 'application/json')
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  createStatus(body) {
    return new Promise((resolve, reject) => {
      chai.request(utils.config.gateway)
        .post(`/test/v1/projects/${projectId}/status`)
        .send(body)
        .set('Authorization', global.user.token)
        .set('Content-Type', 'application/json')
        .then((res) => {
          res.should.have.status(201);
          resolve(res);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    })
  },
  editStatus(body) {
    return chai.request(utils.config.gateway)
      .put(`/test/v1/projects/${projectId}/status/update`)
      .send(body)
      .set('Authorization', global.user.token)
      .set('Content-Type', 'application/json')
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  deleteStatus(statusId) {
    // console.log(statusId)
    return chai.request(utils.config.gateway)
      .delete(`/test/v1/projects/${projectId}/status/${statusId}`)
      .set('Authorization', global.user.token)
      // .set("Accept", "text/plain")
      .then((res) => {
        res.should.have.status(204);
        return res;
      })
      // .catch((err) => {
      //   console.log(err);
      // });
  }
};
module.exports = statusFunction;
