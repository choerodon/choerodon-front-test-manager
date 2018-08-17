/*eslint-disable */

const issueFunction = require("../../apiFunction/issueService/issueFunction");
const utils = require('../../../Utils');
const projectId = utils.config.projectId;
const { getIssuesSearch, getProjectVersion, getModules, getLabels, getPrioritys, getIssueStatus } = issueFunction;
describe("Issue Api-GET", () => {
  it("[GET] 根据筛选条件查询issue", () => {
    const search = {
      advancedSearchArgs: {
        typeCode: [
          'issue_test',
        ],
      },
      otherArgs: {
        // version: [version.versionId],
      },
    }
    return getIssuesSearch(search);
  });
  it("[GET] 查询项目下所有版本", () => {
    return getProjectVersion();
  });
  it("[GET] 查询项目下所有模块", () => {
    return getModules();
  });
  it("[GET] 查询项目下所有标签", () => {
    return getLabels();
  });
  it("[GET] 查询项目下所有优先级", () => {
    return getPrioritys();
  });
  it("[GET] 查询项目下所有issue状态", () => {
    return getIssueStatus();
  });
});
