/*eslint-disable */
import reportFunction from "../../apiFunction/reportService/reportFunction";

describe('Report Api', function () {
  it('[GET] 获取报表，要求到缺陷', () => {
    return reportFunction.getReportsFromStory()
  });
  it('[GET] 获取报表，缺陷到要求', () => {
    return reportFunction.getReportsFromDefect()
  });
  it('[GET] 获取指定issue报表，要求到缺陷', () => {
    const issueIds = [9058];
    return reportFunction.getReportsFromStoryByIssueIds(issueIds)
  });
  it('[GET] 获取指定issue报表，缺陷到要求', () => {
    const issueIds = [9058];
    return reportFunction.getReportsFromDefectByIssueIds(issueIds)
  });
});
