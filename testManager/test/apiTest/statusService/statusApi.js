/*eslint-disable */

const statusFunc = require("../../apiFunction/statusService/statusFunction");

let testData = {};

function getColor() {
  return `#${Math.random().toString(16).slice(2, 8)}`;
}

function getstatusName() {
  return `状态：${Math.random().toString()}`;
}

describe("Status Api-CYCLE_CASE", () => {
  // search
  it("[POST] 查询当前项目循环状态列表", () => {
    const body = {
      statusType: "CYCLE_CASE",
      projectId: 144
    };
    return statusFunc.getStatusList(body);
  });

  // create
  it("[POST] 创建当前项目循环状态列表", done => {
    const body = {
      statusType: "CYCLE_CASE",
      projectId: 144,
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
  it("[PUT] 编辑当前项目步骤列表", () => {
    console.log('ed '+testData.statusId);
    const body = {
      statusType: "CYCLE_CASE",
      projectId: 144,
      statusId: testData.statusId,
      description: "改变描述",
      objectVersionNumber: null,
      statusName: getstatusName(),
      statusColor: getColor()
    };
    return statusFunc.editStatus(body);
  });

  // delete
  it("[DELETE] 删除当前项目循环状态列表", () => {
    console.log('de '+testData.statusId);
    return statusFunc.deleteStatus(testData.statusId);
  });
});

describe("Status Api-CASE_STEP", () => {
  it("[POST] 查询当前项目步骤列表", () => {
    const body = {
      statusType: "CASE_STEP",
      projectId: 144
    };
    return statusFunc.getStatusList(body);
  });

  it("[POST] 创建当前项目步骤列表", done => {
    const body = {
      statusType: "CASE_STEP",
      projectId: 144,
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

  it("[PUT] 编辑当前项目步骤列表", () => {
    console.log('ed2 '+testData.statusId);
    const body = {
      statusType: "CASE_STEP",
      projectId: 144,
      statusId: testData.statusId,
      description: "改变描述",
      objectVersionNumber: null,
      statusName: getstatusName(),
      statusColor: getColor()
    };
    return statusFunc.editStatus(body);
  });

  it("[DELETE] 删除当前项目步骤列表", () => {
    console.log('de2 '+testData.statusId);
    return statusFunc.deleteStatus(testData.statusId);
  });
});
