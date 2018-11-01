import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

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
