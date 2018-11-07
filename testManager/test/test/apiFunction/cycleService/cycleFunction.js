/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');

chai.should();
chai.use(chaiHttp);
const projectId = utils.config.projectId;
const cycleFunction = {
  /**
   * 查询状态列表
   *
   * @returns
   */
  getCycleTree() {
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
  /**
   *根据循环id查询执行
   *
   * @param {*} cycleId
   * @returns
   */
  getExecutesByCycleId(cycleId) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/cycle/case/query/cycleId?size=${5}&page=${0}`)
      .send({ cycleId })
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
  /**
   *获取循环下的文件夹
   *
   * @param {*} cycleId
   * @returns
   */
  getFoldersByCycleId(cycleId) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/cycle/query/folder/cycleId/${cycleId}`)    
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
  /**
   *指定一个version添加cycle
   *
   * @param {*} data
   * @returns
   */
  addCycle(data) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/cycle`)
      .send(data)
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
  /**
   *编辑指定循环
   *
   * @param {*} data
   * @returns
   */
  editCycle(data) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .put(`/test/v1/projects/${projectId}/cycle`)
      .send(data)
      .set('Authorization', global.user.token)
      .set('Content-Type', 'application/json')
      .then((res) => {
        // console.log(res.body)
        // console.log(res)
        res.should.have.status(200);
        return res;
      })
      .catch((err) => {
        console.log(err);
      })
  },
  /**
   *克隆循环
   *
   * @param {*} data
   * @returns
   */
  cloneCycle(cycleId, data) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/cycle/clone/cycle/${cycleId}`)
      .send(data)
      .set('Authorization', global.user.token)
      .set('Content-Type', 'application/json')
      .then((res) => {
        res.should.have.status(201);
        return res;
      })
      .catch((err) => {
        console.log(err);
      })
  },
  /**
   *克隆文件夹
   *
   * @param {*} cycleId
   * @param {*} data
   * @returns
   */
  cloneFolder(cycleId, data) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .post(`/test/v1/projects/${projectId}/cycle/clone/folder/${cycleId}`)
      .send(data)
      .set('Authorization', global.user.token)
      .set('Content-Type', 'application/json')
      .then((res) => {
        res.should.have.status(200);
        return res;
      })
      .catch((err) => {
        console.log(err);
      })
  },
  /**
   *删除循环或文件夹
   *
   * @param {*} cycleId
   * @returns
   */
  deleteCycle(cycleId) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .delete(`/test/v1/projects/${projectId}/cycle/delete/${cycleId}`)
      .set('Authorization', global.user.token)
      .set('Content-Type', 'application/json')
      .then((res) => {
        res.should.have.status(204);
        return res;
      })
      .catch((err) => {
        console.log(err);
      })
  },
  /**
   *
   *
   * @param {*} executeId
   * @returns
   */
  getExecuteDetail(executeId) {
    // console.log('token', global.user.token);
    return chai.request(utils.config.gateway)
      .get(`/test/v1/projects/${projectId}/cycle/case/query/one/${executeId}`)
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
  /**
   *获取执行步骤
   *
   * @param {*} executeId
   * @returns
   */
  getExecuteSteps(executeId) {
    return chai.request(utils.config.gateway)
      .get(`/test/v1/projects/${projectId}/cycle/case/step/query/${executeId}?size=${5}&page=${0}`)
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
  /**
   *获取执行历史记录
   *
   * @param {*} executeId
   * @returns
   */
  getExecuteHistiorys(executeId) {
    return chai.request(utils.config.gateway)
      .get(`/test/v1/projects/${projectId}/cycle/case/history/${executeId}?size=${5}&page=${0}`)
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
