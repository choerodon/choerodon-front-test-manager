/*
 * @Author: LainCarl 
 * @Date: 2018-11-01 14:56:06 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-11-01 15:25:27
 * @Feature:  
 */
import { stores } from 'choerodon-front-boot';
import { getProjectId, getOrganizationId, request } from '../common/utils';

const { AppState } = stores;

/**
 *创建issue
 *
 * @export
 * @param {*} issueObj
 * @param {*} folderId
 * @returns
 */
export function createIssue(issueObj, folderId) {
  const issue = { 
    ...issueObj,
  };
  const versionId = issue.versionIssueRelDTOList[0].versionId;
  return request.post(`/test/v1/projects/${getProjectId()}/issueFolderRel/testAndRelationship?versionId=${versionId}${folderId ? `&folderId=${folderId}` : ''}`, issue);
}
export function createCommit(commitObj) {
  return request.post(`/agile/v1/projects/${getProjectId()}/issue_comment`, commitObj);
}

export function updateCommit(commitObj) {
  return request.post(`/agile/v1/projects/${getProjectId()}/issue_comment/update`, commitObj);
}

export function deleteCommit(commitId) {
  return request.delete(`/agile/v1/projects/${getProjectId()}/issue_comment/${commitId}`);
}

export function loadStatus(statusId, issueId, typeId) {
  return request.get(
    `/issue/v1/projects/${getProjectId()}/schemes/query_transforms?current_status_id=${statusId}&issue_id=${issueId}&issue_type_id=${typeId}&scheme_type=agile`,
  );
}
export function loadIssue(issueId) {  
  return request.get(`/agile/v1/projects/${getProjectId()}/issues/${issueId}?organizationId=${getOrganizationId()}`);
}
export function updateStatus(transformId, issueId, objVerNum) {
  return request.put(`/agile/v1/projects/${getOrganizationId()}/issues/update_status?transformId=${transformId}&issueId=${issueId}&objectVersionNumber=${objVerNum}`);
}
export function updateIssue(data) {
  return request.put(`/agile/v1/projects/${getProjectId()}/issues`, data);
}

export function deleteIssue(issueId) {
  return request.delete(`/agile/v1/projects/${getProjectId()}/issues/${issueId}`);
}

export function deleteLink(issueLinkId) {
  return request.delete(`/agile/v1/projects/${getProjectId()}/issue_links/${issueLinkId}`);
}

export function loadDatalogs(issueId) {
  return request.get(`agile/v1/projects/${getProjectId()}/data_log?issueId=${issueId}`);
}

export function loadIssuesInLink(page = 0, size = 10, issueId, content) {
  if (content) {
    return request.get(`/agile/v1/projects/${getProjectId()}/issues/summary?issueId=${issueId}&self=false&content=${content}&page=${page}&size=${size}&onlyActiveSprint=false`);
  } else {
    return request.get(`/agile/v1/projects/${getProjectId()}/issues/summary?issueId=${issueId}&self=false&page=${page}&size=${size}&onlyActiveSprint=false`);
  }
}

export function createLink(issueId, issueLinkCreateDTOList) {
  return request.post(`/agile/v1/projects/${getProjectId()}/issue_links/${issueId}`, issueLinkCreateDTOList);
}
// 需要更新
export function loadLinkIssues(issueId) {
  return request.get(`/agile/v1/projects/${getProjectId()}/issue_links/${issueId}`);
}
export function getIssueTree() {
  return request.get(`/test/v1/projects/${getProjectId()}/issueFolder/query`);
}
export function addFolder(data) {
  return request.post(`/test/v1/projects/${getProjectId()}/issueFolder`, data);
}
export function editFolder(data) {
  return request.put(`/test/v1/projects/${getProjectId()}/issueFolder/update`, data);
}
export function deleteFolder(folderId) {
  return request.delete(`/test/v1/projects/${getProjectId()}/issueFolder/${folderId}`);
}
/**
 *获取单个issue,地址栏跳转情况
 *
 * @export
 * @param {number} [page=0]
 * @param {number} [size=10]
 * @param {*} search
 * @param {*} orderField
 * @param {*} orderType
 * @returns
 */
export function getSingleIssues(page = 0, size = 10, search, orderField, orderType) {
  // console.log(search);
  const searchDTO = { ...search };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];

  return request.post(`/test/v1/projects/${getProjectId()}/issueFolderRel/query?page=${page}&size=${size}&organizationId=${getOrganizationId()}`, { versionIds: [], searchDTO }, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getAllIssues(page = 0, size = 10, search, orderField, orderType) {
  // console.log(search);
  const searchDTO = { ...search, otherArgs: search.searchArgs };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];

  return request.post(`/test/v1/projects/${getProjectId()}/issueFolderRel/query?page=${page}&size=${size}&organizationId=${getOrganizationId()}`, { versionIds: [], searchDTO }, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getIssuesByFolder(folderId, page = 0, size = 10, search, orderField, orderType) {
  const searchDTO = { ...search, otherArgs: search.searchArgs };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];

  return request.post(`/test/v1/projects/${getProjectId()}/issueFolderRel/query?folderId=${folderId}&page=${page}&size=${size}&organizationId=${getOrganizationId()}`, { versionIds: [], searchDTO }, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getIssuesByVersion(versionIds, page = 0, size = 10, search, orderField, orderType) {
  const searchDTO = { ...search, otherArgs: search.searchArgs };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];
  
  return request.post(`/test/v1/projects/${getProjectId()}/issueFolderRel/query?page=${page}&size=${size}`, { versionIds, searchDTO }, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getIssuesByIds(versionId, folderId, ids) {
  return request.post(`/test/v1/projects/${getProjectId()}/issueFolderRel/query/by/issueId${versionId ? `?versionId=${versionId}` : ''}&organizationId=${getOrganizationId()}${folderId ? `&folderId=${folderId}` : ''}`, ids);
}
export function moveIssues(versionId, folderId, issueLinks) {
  return request.put(`/test/v1/projects/${getProjectId()}/issueFolderRel/move?versionId=${versionId}&folderId=${folderId}`, issueLinks);
}
export function copyIssues(versionId, folderId, issueLinks) {
  return request.put(`/test/v1/projects/${getProjectId()}/issueFolderRel/copy?versionId=${versionId}&folderId=${folderId}`, issueLinks);
}
export function moveFolders(data) {
  return request.put(`/test/v1/projects/${getProjectId()}/issueFolder/move`, data);
}
export function copyFolders(data, versionId) {
  const folderIds = data.map(item => item.folderId);
  return request.put(`/test/v1/projects/${getProjectId()}/issueFolder/copy?versionId=${versionId}`, folderIds);
}

export function getFoldersByVersion(versionId) {
  return request.get(`/test/v1/projects/${getProjectId()}/issueFolder/query/all${versionId ? `?versionId=${versionId}` : ''}`);
}

export function syncFoldersInVersion(versionId) {
  // cycleId || versionId
  
  return request.post(`/test/v1/projects/${getProjectId()}/cycle/synchro/folder/all/in/version/${versionId}`);
}
export function syncFoldersInCycle(cycleId) {
  // cycleId || versionId
  
  return request.post(`/test/v1/projects/${getProjectId()}/cycle/synchro/folder/all/in/cycle/${cycleId}`);
}

export function syncFolder(folderId, cycleId) {
  return request.post(`/test/v1/projects/${getProjectId()}/cycle/synchro/folder/${folderId}/in/${cycleId}`);
}
export function cloneIssue(issueId, copyConditionDTO) {
  return request.put(`/test/v1/projects/${getProjectId()}/issueFolderRel/copy/issue/${issueId}`, copyConditionDTO);
}
export function exportIssues() {
  return request.get(`/zuul/test/v1/projects/${getProjectId()}/case/download/excel&organizationId=${getOrganizationId()}`);
}
export function exportIssuesFromVersion(versionId) {
  return request.get(`/zuul/test/v1/projects/${getProjectId()}/case/download/excel/version?versionId=${versionId}&organizationId=${getOrganizationId()}`);
}
export function exportIssuesFromFolder(folderId) {
  return request.get(`/zuul/test/v1/projects/${getProjectId()}/case/download/excel/folder?folderId=${folderId}&userId=${AppState.userInfo.id}&organizationId=${getOrganizationId()}`);
}
export function downloadTemplate() {
  return request.get(`/zuul/test/v1/projects/${getProjectId()}/case/download/excel/template`, { responseType: 'arraybuffer' });
}
export function getExportList() {
  return request.get(`/test/v1/projects/${getProjectId()}/test/fileload/history`);
}
