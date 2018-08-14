/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');

chai.should();
chai.use(chaiHttp);
const cycleFunction = {
  /**
   * 查询状态列表
   *
   * @returns
   */
  getCycleTree(body) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .get(`/test/v1/projects/${144}/cycle/query`)   
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
};
module.exports = cycleFunction;
