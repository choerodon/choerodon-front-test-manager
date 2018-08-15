/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');

chai.should();
chai.use(chaiHttp);
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
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${144}/status`)
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
  }
};
module.exports = statusFunction;
