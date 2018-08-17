/*eslint-disable */

const cycleFunc = require('../../apiFunction/cycleService/cycleFunction');
describe('Cycle Api-GET', () => {
  it('[GET] 查询当前项目循环树', () => {
    return cycleFunc.getCycleTree();
  });
  it('[GET] 根据循环查询执行', () => {
    return cycleFunc.getCycleById(737);
  });
  it('[GET] 根据Id查询执行', () => {
    return cycleFunc.getCycleExecute(1636);
  });  
  it('[GET] 查询执行下的步骤', () => {
    return cycleFunc.getExecuteSteps(1636);
  });
  it('[GET] 查询执行下的历史记录', () => {
    return cycleFunc.getExecuteHistiorys(1636);
  });
  
});
