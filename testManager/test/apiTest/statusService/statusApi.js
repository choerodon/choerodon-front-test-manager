/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../../Utils');
const statusFunc = require('../../apiFunction/statusService/statusFunction');

chai.should();
chai.use(chaiHttp);
global.before(function () {
  // set login timeout to 5 seconds.
  this.timeout(5000);
  const reqBody = {
    username: utils.config.loginName,
    password: utils.config.loginPass,
  };
  return utils.login(reqBody, 'success');
});

global.after(() => utils.logout());
describe('Status Api-POST', () => {
  it('[POST] 查询当前项目循环状态列表', () => {    
    const body = { statusType: "CYCLE_CASE", projectId: 144 }
    return statusFunc.getStatusList(body);
  });
});
