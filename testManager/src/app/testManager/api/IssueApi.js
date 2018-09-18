import { stores, axios } from 'choerodon-front-boot';
import { version } from 'moment';

const { AppState } = stores;

export function createIssue(issueObj, folderId) {
  const projectId = AppState.currentMenuType.id;
  const issue = {
    projectId,
    ...issueObj,
  };
  // return axios.post(`/agile/v1/projects/${projectId}/issues`, issue);
  const versionId = issue.versionIssueRelDTOList[0].versionId;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/testAndRelationship?version_id=${versionId}${folderId ? `&folderId=${folderId}` : ''}`, issue);
}

export function loadLabels() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/projects/${projectId}/issue_labels`,
  );
}

export function loadVersions(arr = []) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/agile/v1/projects/${projectId}/product_version/names`, arr);
}

export function createCommit(commitObj, projectId = AppState.currentMenuType.id) {
  return axios.post(`/agile/v1/projects/${projectId}/issue_comment`, commitObj);
}

export function updateCommit(commitObj, projectId = AppState.currentMenuType.id) {
  return axios.post(`/agile/v1/projects/${projectId}/issue_comment/update`, commitObj);
}

export function deleteCommit(commitId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`/agile/v1/projects/${projectId}/issue_comment/${commitId}`);
}

export function loadComponents() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/projects/${projectId}/component`,
  );
}

export function loadEpics() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/projects/${projectId}/issues/epics/select_data`,
  );
}

/**
 * 根据冲刺状态获取冲刺，["started", "sprint_planning", "closed"]
 * @param {*} arr 
 */
export function loadSprints(arr = []) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/agile/v1/projects/${projectId}/sprint/names`, arr);
}

// export function loadSprint(sprintId) {
//   const projectId = AppState.currentMenuType.id;
//   return axios.get(`/agile/v1/projects/${projectId}/sprint/${sprintId}`);
// }

// export function loadSprintIssues(sprintId, status, page = 0, size = 99999) {
//   const projectId = AppState.currentMenuType.id;
//   return axios.get(`/agile/v1/projects/${projectId}/sprint/${sprintId}/issues?status=${status}&page=${page}&size=${size}`);
// }

// export function loadChartData(id, type) {
//   const projectId = AppState.currentMenuType.id;
//   return axios.get(`/agile/v1/projects/${projectId}/reports/${id}/burn_down_report?type=${type}`);
// }

export function loadStatus() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/projects/${projectId}/issue_status/list`,
  );
}

export function loadPriorities() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/projects/${projectId}/lookup_values/priority`,
  );
}

export function loadIssue(issueId, projectId = AppState.currentMenuType.id) {
  return axios.get(`/agile/v1/projects/${projectId}/issues/${issueId}`);
}

// export function loadSubtask(issueId, projectId = AppState.currentMenuType.id) {
//   return axios.get(`agile/v1/projects/${projectId}/issues/sub_issue/${issueId}`);
// }

export function updateIssue(data, projectId = AppState.currentMenuType.id) {
  // if (type === 'sub_task') {
  //   return axios.put(`agile/v1/projects/${projectId}/issues/sub_issue`, data);
  // }
  return axios.put(`/agile/v1/projects/${projectId}/issues`, data);
}

// export function createSubIssue(issueId, obj, projectId = AppState.currentMenuType.id) {
//   const subIssueObj = {
//     ...obj,
//     parentIssueId: issueId,
//   };
//   return axios.post(`/agile/v1/projects/${projectId}/issues/sub_issue`, subIssueObj);
// }

export function deleteIssue(issueId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`/agile/v1/projects/${projectId}/issues/${issueId}`);
}

export function deleteLink(issueLinkId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`/agile/v1/projects/${projectId}/issue_links/${issueLinkId}`);
}

export function createWorklog(data, projectId = AppState.currentMenuType.id) {
  return axios.post(`/agile/v1/projects/${projectId}/work_log`, data);
}

export function loadWorklogs(issueId, projectId = AppState.currentMenuType.id) {
  return axios.get(`agile/v1/projects/${projectId}/work_log/issue/${issueId}`);
}

export function loadDatalogs(issueId, projectId = AppState.currentMenuType.id) {
  return axios.get(`agile/v1/projects/${projectId}/data_log?issueId=${issueId}`);
}

export function updateWorklog(logId, worklog, projectId = AppState.currentMenuType.id) {
  return axios.patch(`agile/v1/projects/${projectId}/work_log/${logId}`, worklog);
}

export function deleteWorklog(logId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`agile/v1/projects/${projectId}/work_log/${logId}`);
}

// export function updateIssueType(data, projectId = AppState.currentMenuType.id) {
//   const issueUpdateTypeDTO = {
//     projectId,
//     ...data,
//   };
//   return axios.post(`/agile/v1/projects/${projectId}/issues/update_type`, issueUpdateTypeDTO);
// }

export function loadIssues(page = 0, size = 10, search, orderField, orderType) {
  const searchDTO = { ...search };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/agile/v1/projects/${projectId}/issues/test_component/no_sub_detail?page=${page}&size=${size}`, searchDTO, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}

export function loadIssuesInLink(page = 0, size = 10, issueId, content) {
  const projectId = AppState.currentMenuType.id;
  if (content) {
    return axios.get(`/agile/v1/projects/${projectId}/issues/summary?issueId=${issueId}&self=false&content=${content}&page=${page}&size=${size}&onlyActiveSprint=false`);
  } else {
    return axios.get(`/agile/v1/projects/${projectId}/issues/summary?issueId=${issueId}&self=false&page=${page}&size=${size}&onlyActiveSprint=false`);
  }
}

export function createLink(issueId, issueLinkCreateDTOList) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/agile/v1/projects/${projectId}/issue_links/${issueId}`, issueLinkCreateDTOList);
}

export function loadLinkIssues(issueId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/agile/v1/projects/${projectId}/issue_links/${issueId}`);
}
export function getIssueTree() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/test/v1/projects/${projectId}/issueFolder/query`);
}
export function addFolder(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/issueFolder`, data);
}
export function editFolder(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/issueFolder/update`, data);
}
export function deleteFolder(folderId) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`/test/v1/projects/${projectId}/issueFolder/${folderId}`);
}

export function getAllIssues(page = 0, size = 10, search, orderField, orderType) {
  const searchDTO = { ...search };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/query?page=${page}&size=${size}`, searchDTO, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getIssuesByFolder(folderId, page = 0, size = 10, search, orderField, orderType) {
  const searchDTO = { ...search };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/query?folder_id=${folderId}&page=${page}&size=${size}`, searchDTO, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getIssuesByVersion(versionId, page = 0, size = 10, search, orderField, orderType) {
  const searchDTO = { ...search };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/query?version_id=${versionId}&page=${page}&size=${size}`, searchDTO, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getIssuesByIds(versionId, folderId, ids) { 
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/query/by/issueId${versionId ? `?version_id=${versionId}` : ''}${folderId ? `&folderId=${folderId}` : ''}`, ids);
}
export function moveIssues(versionId, folderId, issueLinks) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/issueFolderRel/move?version_id=${versionId}&folder_id=${folderId}`, issueLinks);
}
export function copyIssues(versionId, folderId, issueLinks) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/issueFolderRel/copy?version_id=${versionId}&folder_id=${folderId}`, issueLinks);
}
export function moveFolder(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/issueFolder/move`, data);
}
export function copyFolder(data) {
  const projectId = AppState.currentMenuType.id;
  const { folderId, versionId } = data;
  return axios.put(`/test/v1/projects/${projectId}/issueFolder/copy?folder_id=${folderId}&version_id=${versionId}`);
}

export function getFoldersByVersion(versionId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/test/v1/projects/${projectId}/issueFolder/query/${versionId}`);
}

export function syncFoldersInVersion(versionId) {
  // cycleId || versionId
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/synchro/folder/all/in/version/${versionId}`);
}
export function syncFoldersInCycle(cycleId) {
  // cycleId || versionId
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/synchro/folder/all/in/cycle/${cycleId}`);
}

export function syncFolder(folderId, cycleId) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/synchro/folder/${folderId}/in/${cycleId}`);
}
