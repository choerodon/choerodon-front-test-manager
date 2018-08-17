/*eslint-disable */

const summaryFunction = require("../../apiFunction/smmaryService/sumaryFunction");
const moment = require('moment');
const { getCaseNotPlain, getCaseNotRun, getCaseNum, getCreateRange, getCycleRange, getIssueStatistic } = summaryFunction;
describe("Summary Api-GET", () => {
  // search
  it("[GET] 查询未规划总数", () => {
    return getCaseNotPlain();
  });
  it("[GET] 查询未执行总数", () => {
    return getCaseNotRun();
  });
  it("[GET] 查询执行总数", () => {
    return getCaseNum();
  });
  it("[GET] 查询创建折线图", () => {
    const range = 30;
    return getCreateRange(range);
  });
  it("[GET] 查询执行折线图", () => {
    const day = moment().format('YYYY-MM-DD');
    const range = 30;
    return getCycleRange(day, range);
  });
  it("[GET] 查询issue版本统计", () => {
    return getIssueStatistic('version');
  });
  it("[GET] 查询issue标签统计", () => {
    return getIssueStatistic('label');
  });
  it("[GET] 查询issue模块统计", () => {
    return getIssueStatistic('component');
  });

});
