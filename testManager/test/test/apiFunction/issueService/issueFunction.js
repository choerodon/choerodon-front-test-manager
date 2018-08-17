/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');

chai.should();
chai.use(chaiHttp);
const projectId = utils.config.projectId;
const issueFunction = {
  /**
   * 根据指定搜索条件查询issue
   *
   * @returns
   */
  getIssuesSearch(search) {
    return chai.request(utils.config.gateway)
      .post(`/agile/v1/projects/${projectId}/issues/test_component/no_sub`)
      .send(search)
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },   
  /**
   *查询所有的模块
   *
   * @returns
   */
  getModules() {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/component`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },   
  /**
   *查询所有的版本
   *
   * @returns
   */
  getProjectVersion() {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/product_version/versions`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },   
  /**
   *获取所有标签
   *
   * @returns
   */
  getLabels() {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/issue_labels`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  }, 
  /**
   *获取所有优先级
   *
   * @returns
   */
  getPrioritys() {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/lookup_values/priority`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },  
    /**
   *获取所有issue状态
   *
   * @returns
   */
  getIssueStatus() {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/issue_status/list`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },  
   
};
module.exports = issueFunction;
