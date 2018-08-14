/*eslint-disable */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../Utils');

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
require('./statusService/statusApi');
require('./cycleService/cycleApi');
require('./fileService/FileApi');
