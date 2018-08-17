/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');

chai.should();
chai.use(chaiHttp);
const projectId = utils.config.projectId;
const summaryFunction = {
  /**
   * 查询未规划个数
   *
   * @returns
   */
  getCaseNotPlain() {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .get(`/test/v1/projects/${projectId}/cycle/case/countCaseNotPlain`)
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })

  },
  /**
   *查询未执行个数
   *
   * 
   * @returns
   */
  getCaseNotRun() {
    return chai.request(utils.config.gateway)
      .get(`/test/v1/projects/${projectId}/cycle/case/countCaseNotRun`)
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })

  },
  /**
   *获取执行总数
   *
   * @returns
   */
  getCaseNum() {
    return chai.request(utils.config.gateway)
      .get(`/test/v1/projects/${projectId}/cycle/case/countCaseSum`)
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },
  /**
   *查询创建折线图
   *
   * @param {*} range
   * @returns
   */
  getCreateRange(range) {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/issues/type/issue_test?timeSlot=${range}`)
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },
  /**
   *查询执行折线图
   *
   * @param {*} day
   * @param {*} range
   * @returns
   */
  getCycleRange(day, range) {
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/cycle/case/range/${day}/${range}`)
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(201);
        return res;
      })
  },
  /**
   *查询Issue统计信息
   *
   * @param {*} type
   */
  getIssueStatistic(type) {
    return chai.request(utils.config.gateway)
      .post(`/agile/v1/projects/${projectId}/issues/test_component/statistic?type=${type}`)
      .send(['sub_task', 'story', 'task', 'issue_epic', 'bug'])
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  }
};
module.exports = summaryFunction;
