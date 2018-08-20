/*eslint-disable */
import chai from 'chai';
import chaiHttp from 'chai-http';
import utils from '../../Utils';
// import './statusService/statusApi';
// import './cycleService/cycleApi';
// import './summaryService/summaryApi';
// import './issueService/issueApi';
// import './fileService/FileApi';
import './reportService/reportApi';
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
