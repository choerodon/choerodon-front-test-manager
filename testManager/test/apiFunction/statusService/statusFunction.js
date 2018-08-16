/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');

chai.should();
chai.use(chaiHttp);

const testData = {

}
const statusFunction = {
  /**
   * 查询状态列表
   *
   * @returns
   */
  getStatusList(body) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${144}/status/query`)
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
    // return chai.request(utils.config.gateway)
    //   .post(`/test/v1/projects/${144}/status`)
    //   .send(body)
    //   .set('Authorization', global.user.token)
    //   .set('Content-Type', 'application/json')
    //   .then((res) => {
    //     res.should.have.status(201);

    //     console.log(res.body);
    //     return res;
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    return new Promise((resolve, reject) => {
      chai.request(utils.config.gateway)
        .post(`/test/v1/projects/${144}/status`)
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
      .put(`/test/v1/projects/${144}/status/update`)
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
    console.log(statusId)
    return chai.request(utils.config.gateway)
      .delete(`/test/v1/projects/${144}/status/${statusId}`)
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
