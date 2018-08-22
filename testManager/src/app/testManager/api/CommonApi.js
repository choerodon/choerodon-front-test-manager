import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

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
    headers: { 'content-type': 'multipart/form-datal' },
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
/**
 *获取当前用户
 *
 * @export
 * @returns
 */
export function getSelf() {
  return axios.get('/iam/v1/users/self');
}
/**
 *获取指定用户
 *
 * @export
 * @param {*} userId
 * @returns
 */
export function getUser(userId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`iam/v1/projects/${projectId}/users?id=${userId}`);
}
/**
 *获取用户列表
 *
 * @export
 * @param {*} param
 * @returns
 */
export function getUsers(param) {
  const projectId = AppState.currentMenuType.id;
  if (param) {
    return axios.get(`/iam/v1/projects/${projectId}/users?param=${param}`);
  }
  return axios.get(`/iam/v1/projects/${projectId}/users`);
}
