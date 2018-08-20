/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');

chai.should();
chai.use(chaiHttp);
const projectId = utils.config.projectId;
let reportFunction = {

  getReportsFromStory: function () {
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue`)
      .query({ size: 5, page: 0 })
      .send({
        advancedSearchArgs: {
          // typeCode: ['story'],
        },
        otherArgs: {

        },
      })
      .set('Authorization', global.user.token)
      .then(function (res) {
        res.should.have.status(200);
        return res;
      })
  },
  getReportsFromStoryByIssueIds: function (issueIds) {
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue/by/issueId?size=${size}&page=${page}`)
      .send(issueIds)
      .set('Authorization', global.user.token)
      .then(function (res) {
        res.should.have.status(200);
        return res;
      })
  },
  getReportsFromDefectByIssueIds: function (issueIds) {
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/case/get/reporter/from/defect/by/issueId`)
      .send(issueIds)
      .query({ size: 5, page: 0 })
      .set('Authorization', global.user.token)
      .then(function (res) {
        res.should.have.status(200);
        return res;
      })
  },
};

module.exports = reportFunction;
