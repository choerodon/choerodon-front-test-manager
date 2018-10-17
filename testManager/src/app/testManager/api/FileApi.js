import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;
// 敏捷接口
/**
 * 删除文件
 * @param {number} resourceId 资源id
 * @param {string} 文件id
 */
export function deleteFileAgile(id) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`/agile/v1/projects/${projectId}/issue_attachment/${id}`);
}

/**
 * 上传图片
 * @param {any} data
 */
export function uploadImage(data) {
  const axiosConfig = {
    headers: { 'content-type': 'multipart/form-data' },
  };
  const projectId = AppState.currentMenuType.id;
  return axios.post(
    `/agile/v1/projects/${projectId}/issue_attachment/upload_for_address`,
    data,
    axiosConfig,
  );
}

/**
 * 上传issue的附件
 * @param {*} data
 * @param {*} config
 */
export function uploadFileAgile(data, config) {
  const {
    issueType, issueId, fileName, projectId,
  } = config;
  const axiosConfig = {
    headers: { 'content-type': 'multipart/form-data' },
  };
  return axios.post(
    `/zuul/agile/v1/projects/${projectId}/issue_attachment?projectId=${projectId}&issueId=${issueId}`,
    data,
    axiosConfig,
  );
}
// 测试管理接口

/**
 *文件上传
 *
 * @export
 * @param {*} data
 * @param {*} config
 * @returns
 */
export function uploadFile(data, config) {
  const { bucketName, attachmentLinkId, attachmentType } = config;
  const projectId = AppState.currentMenuType.id;
  const axiosConfig = {
    headers: { 'content-type': 'multipart/form-data' },
  };

  return axios.post(
    `/zuul/test/v1/projects/${projectId}/test/case/attachment?bucket_name=${'test'}&attachmentLinkId=${attachmentLinkId}&attachmentType=${attachmentType}`,
    data,
    axiosConfig,
  );
}
/**
 *删除附件
 *
 * @export
 * @param {*} id
 * @returns
 */
export function deleteAttachment(id) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`test/v1/projects/${projectId}/test/case/attachment/delete/bucket/test/attach/${id}`);
}
export function importIssue(data) {
  const projectId = AppState.currentMenuType.id;
  const axiosConfig = {
    headers: { 'content-type': 'multipart/form-data' },
  };
  return axios.post(`/zuul/test/v1/projects/${projectId}/case/import/testCase`, data, axiosConfig);
}
