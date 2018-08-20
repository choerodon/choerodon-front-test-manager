/*eslint-disable */

const issueFunction = require("../../apiFunction/issueService/issueFunction");
const utils = require('../../../Utils');
const projectId = utils.config.projectId;
// const { getIssuesSearch, getProjectVersion, getModules, getLabels, getPrioritys, getIssueStatus,  } = issueFunction;
const issueId = 9058;
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
    return issueFunction.getIssuesSearch(search);
  });
  it("[GET] 查询项目下所有版本", () => {
    return issueFunction.getProjectVersion();
  });
  it("[GET] 查询项目下所有模块", () => {
    return issueFunction.getModules();
  });
  it("[GET] 查询项目下所有标签", () => {
    return issueFunction.getLabels();
  });
  it("[GET] 查询项目下所有优先级", () => {
    return issueFunction.getPrioritys();
  });
  it("[GET] 查询项目下所有issue状态", () => {
    return issueFunction.getIssueStatus();
  });

  // it("[GET] 查询项目的版本", () => {
  //   return issueFunction.getVersions(arr = []);
  // });

  it("[GET] 查询项目的史诗", () => {
    return issueFunction.getEpics();
  });

  // it("[GET] 查询项目的所有冲刺", () => {
  //   return issueFunction.getSprints(arr = []);
  // });

  // it("[GET] 查询单个项目的冲刺", () => {
  //   return issueFunction.getSprint(sprintId);
  // });

  // it("[GET] 查询单个冲刺的issuees", () => {
  //   return issueFunction.getSprintIssues(sprintId, status, page = 0, size = 99999);
  // });

  // it("[GET] 查询", () => {
  //   return issueFunction.getChartData(id, type);
  // });

  it("[GET] 查询单个issue", () => {
    return issueFunction.getIssue(issueId);
  });

  it("[GET] 查询子任务", () => {
    return issueFunction.getSubtask(issueId);
  });

  it("[GET] 查询工作日志", () => {
    return issueFunction.getWorklogs(issueId);
  });

  it("[GET] 查询活动日志", () => {
    return issueFunction.getDatalogs(issueId);
  });

  it("[GET] 查询分支", () => {
    return issueFunction.getBranchs(issueId);
  });

  // it("[GET] 查询项目的图片", () => {
  //   return issueFunction.getIssues(page = 0, size = 10, search, orderField, orderType);
  // });
  
  it("[GET] 创建链接时查询issues", () => {
    let page = 0, size = 10, content;
    return issueFunction.getIssuesInLink(page, size, issueId, content);
  });
  
  it("[GET] 查询关联的issues", () => {
    return issueFunction.getLinkIssues(issueId);
  });
  
});
