/*eslint-disable */

const cycleFunc = require('../../apiFunction/cycleService/cycleFunction');
import moment from 'moment';
let cycle = {};
let cloneCycle = {};
let folder = {};
const testCycleId = 737;
const testExecuteId = 1671;
describe('Cycle Api-GET', () => {
  it('[GET] 查询当前项目循环树', () => {
    /**
     * @input : jjnda
     * @expect : sss
     * 
     */
    return cycleFunc.getCycleTree();
  });
  it('[GET] 根据循环查询执行', () => {
    return cycleFunc.getExecutesByCycleId(testCycleId);
  });
  it('[GET] 根据循环查询文件夹', () => {
    return cycleFunc.getFoldersByCycleId(testCycleId);
  });
  it('[GET] 根据Id查询执行', () => {
    return cycleFunc.getExecuteDetail(testExecuteId);
  });
  it('[GET] 查询执行下的步骤', () => {
    return cycleFunc.getExecuteSteps(testExecuteId);
  });
  it('[GET] 查询执行下的历史记录', () => {
    return cycleFunc.getExecuteHistiorys(testExecuteId);
  });
});
describe('Cycle Api-POST', () => {
  it('[POST] 在指定版本下创建循环', (done) => {
    const data = {
      versionId: 167,
      cycleName: '循环创建测试' + Math.random(),
      description: 'description',
      build: 'build',
      environment: 'environment',
      type: 'cycle',
      fromDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      toDate: moment().format('YYYY-MM-DD HH:mm:ss'),
    }
    cycleFunc.addCycle(data).then(res => {
      cycle = res.body;
      // console.log(cycle)
      done()
    });
  });
  it('[PUT] 修改指定循环信息', () => {
    const data = {
      versionId: cycle.versionId,
      cycleId: cycle.cycleId,
      cycleName: '循环编辑测试' + Math.random(),
      description: 'description',
      build: 'build',
      environment: 'environment',
      type: 'cycle',
      fromDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      toDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      objectVersionNumber: 1,
    }
    // console.log(data)
    return cycleFunc.editCycle(data);
  });
  // it('[PUT] 在循环内创建执行', () => {
  //   const data = {
  //     versionId: cycle.versionId,
  //     cycleId: cycle.cycleId,
  //     cycleName: '循环编辑测试' + Math.random(),
  //     description: 'description',
  //     build: 'build',
  //     environment: 'environment',
  //     type: 'cycle',
  //     fromDate: moment().format('YYYY-MM-DD HH:mm:ss'),
  //     toDate: moment().format('YYYY-MM-DD HH:mm:ss'),
  //     objectVersionNumber: 1,
  //   }
  //   // console.log(data)
  //   return cycleFunc.createExecuteDetail(data);
  // });  
  it('[POST] 在指定循环下创建文件夹', (done) => {
    const data = {
      type: 'folder',
      parentCycleId: cycle.cycleId,
      versionId: cycle.versionId,
      cycleName: '文件夹创建测试' + Math.random(),
    }
    cycleFunc.addCycle(data).then(res => {
      folder = res.body;
      done()
    });
  });
  it('[PUT] 修改文件夹信息', () => {
    const data = {
      cycleId: folder.cycleId,
      cycleName: '文件夹编辑测试' + Math.random(),
      type: 'folder',
      objectVersionNumber: folder.objectVersionNumber,
    }
    // console.log(data)
    return cycleFunc.editCycle(data);
  });
  it('[POST] 克隆指定循环', (done) => {
    const { cycleId, versionId } = cycle;
    const cycleName = '循环克隆测试' + Math.random();
    cycleFunc.cloneCycle(cycleId, { cycleName, versionId }).then(res => {
      cloneCycle = res.body;
      done()
    });
  });
  it('[DELETE] 删除指定循环', () => {
    const cycleId = cycle.cycleId;
    return cycleFunc.deleteCycle(cycleId);
  });
  it('[DELETE] 删除克隆的循环', () => {
    const cycleId = cloneCycle.cycleId;
    return cycleFunc.deleteCycle(cycleId);
  });
});
