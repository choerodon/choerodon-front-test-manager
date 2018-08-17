
import statusFunc from "../../apiFunction/statusService/statusFunction";
import utils from '../../../Utils';
let testData = {};

const projectId = utils.config.projectId;
function getColor() {
  return `#${Math.random().toString(16).slice(2, 8)}`;
}

function getstatusName() {
  return `状态：${Math.random().toString()}`;
}

describe("Status Api-CYCLE_CASE", () => {
  // search
  it("[POST] 查询当前项目状态列表", () => {
    const body = {
      statusType: "CYCLE_CASE",
      projectId: projectId
    };
    return statusFunc.getStatusList(body);
  });

  // create
  it("[POST] 创建执行状态", done => {
    const body = {
      statusType: "CYCLE_CASE",
      projectId: projectId,
      statusName: getstatusName(),
      description: "一些创建描述",
      statusColor: getColor()
    };
    statusFunc.createStatus(body).then(res => {
      //console.log(res.body);
      testData = res.body;
      done();
    });
  });

  // edit
  it(`[PUT] 编辑执行状态`, () => {
    // console.log('ed '+testData.statusId);
    const body = {
      statusType: "CYCLE_CASE",
      projectId: projectId,
      statusId: testData.statusId,
      description: "改变描述",
      objectVersionNumber: null,
      statusName: getstatusName(),
      statusColor: getColor()
    };
    return statusFunc.editStatus(body);
  });

  // delete
  it(`[DELETE] 删除执行状态`, () => {
    // console.log('de '+testData.statusId);
    return statusFunc.deleteStatus(testData.statusId);
  });
});

describe("Status Api-CASE_STEP", () => {
  it("[POST] 查询当前项目步骤状态列表", () => {
    const body = {
      statusType: "CASE_STEP",
      projectId: projectId
    };
    return statusFunc.getStatusList(body);
  });

  it("[POST] 创建步骤状态", done => {
    const body = {
      statusType: "CASE_STEP",
      projectId: projectId,
      statusName: getstatusName(),
      description: "一些创建描述",
      statusColor: getColor()
    };
    statusFunc.createStatus(body).then(res => {
      // console.log(res.body);
      testData = res.body;
      done();
    });
  });

  it(`[PUT] 编辑步骤状态`, () => {
    const body = {
      statusType: "CASE_STEP",
      projectId: projectId,
      statusId: testData.statusId,
      description: "改变描述",
      objectVersionNumber: null,
      statusName: getstatusName(),
      statusColor: getColor()
    };
    return statusFunc.editStatus(body);
  });

  it(`[DELETE] 删除步骤状态`, () => {
    // console.log('de2 '+testData.statusId);
    return statusFunc.deleteStatus(testData.statusId);
  });
});
