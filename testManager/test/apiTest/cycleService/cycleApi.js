/*eslint-disable */

const cycleFunc = require('../../apiFunction/cycleService/cycleFunction');
describe('Cycle Api-GET', () => {
  it('[GET] 查询当前项目循环树', () => {
    return cycleFunc.getCycleTree();
  });
});
