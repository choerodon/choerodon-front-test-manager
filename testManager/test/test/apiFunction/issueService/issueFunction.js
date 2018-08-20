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
  /**
   * 查询项目的版本
   */
  // getVersions(arr) {
  //   return chai.request(utils.config.gateway)
  //     .post(`/agile/v1/projects/${projectId}/product_version/names`)     
  //     .set('Authorization', global.user.token)
  //     .then((res) => {
  //       res.should.have.status(200);
  //       return res;
  //     })
  // },
  /**
   * 查询项目的史诗
   */
  getEpics() {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/issues/epics/select_data`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },

  /**
   * 查询项目的所有冲刺
   */
  // getSprints(arr) {
  //   return chai.request(utils.config.gateway)
  //     .post(`/agile/v1/projects/${projectId}/sprint/names`)     
  //     .set('Authorization', global.user.token)
  //     .then((res) => {
  //       res.should.have.status(200);
  //       return res;
  //     })
  // },
  /**
   * 查询单个项目的冲刺
   * @param {*} sprintId 
   */
  getSprint(sprintId) {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/sprint/${sprintId}`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },

  /**
   * 查询单个冲刺的issuees
   * @param {*} sprintId 
   * @param {*} status 
   * @param {*} page 
   * @param {*} size 
   */
  getSprintIssues(sprintId, status, page, size) {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/sprint/${sprintId}/issues?status=${status}&page=${page}&size=${size}`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },

  // getChartData(id, type) {
  //   return chai.request(utils.config.gateway)
  //     .get(`/agile/v1/projects/${projectId}/reports/${id}/burn_down_report?type=${type}`)     
  //     .set('Authorization', global.user.token)
  //     .then((res) => {
  //       res.should.have.status(200);
  //       return res;
  //     })
  // },

  /**
   * 查询单个issue
   * @param {*} issueId 
   */
  getIssue(issueId) {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/issues/${issueId}`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },
  /**
   * 查询子任务
   * @param {*} issueId 
   */
  getSubtask(issueId) {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/issues/sub_issue/${issueId}`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },
  /**
   * 查询工作日志
   * @param {*} issueId 
   */
  getWorklogs(issueId) {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/work_log/issue/${issueId}`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },

  /**
   * 查询活动日志
   * @param {*} issueId 
   */
  getDatalogs(issueId) {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/data_log?issueId=${issueId}`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },

  /**
   * 查询分支
   * @param {*} issueId 
   */
  getBranchs(issueId) {
    return chai.request(utils.config.gateway)
      .get(`/devops/v1/project/${projectId}/issue/${issueId}/commit_and_merge_request/count`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },


  // getIssues(page, size, search, orderField, orderType) {
  //   return chai.request(utils.config.gateway)
  //     .get(`/agile/v1/projects/${projectId}/issues/test_component/no_sub_detail?page=${page}&size=${size}`)     
  //     .set('Authorization', global.user.token)
  //     .then((res) => {
  //       res.should.have.status(200);
  //       return res;
  //     })
  // },


  /**
   * 创建链接时查询issues
   * @param {*} page 
   * @param {*} size 
   * @param {*} issueId 
   * @param {*} content 
   */
  getIssuesInLink(page, size, issueId, content) {
    console.log('en '+ page);
    let url = content ? `/agile/v1/projects/${projectId}/issues/summary?issueId=${issueId}&self=false&content=${content}&page=${page}&size=${size}&onlyActiveSprint=false`
      : `/agile/v1/projects/${projectId}/issues/summary?issueId=${issueId}&self=false&page=${page}&size=${size}&onlyActiveSprint=false`;

      return chai.request(utils.config.gateway)
      .get(url)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },

  /**
   * 查询关联的issues
   * @param {*} issueId 
   */
  getLinkIssues(issueId) {
    return chai.request(utils.config.gateway)
      .get(`/agile/v1/projects/${projectId}/issue_links/${issueId}`)     
      .set('Authorization', global.user.token)
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
  },
   
};
module.exports = issueFunction;
