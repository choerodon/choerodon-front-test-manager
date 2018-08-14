/*eslint-disable */

const statusFunc = require('../../apiFunction/statusService/statusFunction');


describe('Status Api-POST', () => {
  it('[POST] 查询当前项目循环状态列表', () => {    
    const body = { statusType: "CYCLE_CASE", projectId: 144 }
    return statusFunc.getStatusList(body);
  });
});
