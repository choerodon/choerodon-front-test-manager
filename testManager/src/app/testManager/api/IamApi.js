import {stores} from 'choerodon-front-boot';
import { getProjectId, request } from '../common/utils';

const { AppState } = stores;

/**
 *获取当前用户
 *
 * @export
 * @returns
 */
export function getSelf() {
  return request.get('/iam/v1/users/self');
}
/**
 *获取指定用户
 *
 * @export
 * @param {*} userId
 * @returns
 */
export function getUser(userId) {
  return request.get(`iam/v1/projects/${getProjectId()}/users?id=${userId}`);
}
/**
 *获取用户列表
 *
 * @export
 * @param {*} param
 * @returns
 */
export function getUsers(param) {
  if (param) {
    return request.get(`/iam/v1/projects/${getProjectId()}/users?size=40&param=${param}`);
  }
  return request.get(`/iam/v1/projects/${getProjectId()}/users?size=40`);
}

export function getUpdateProjectInfoPermission() {
  return request.post('/iam/v1/permissions/checkPermission', [{
    code: 'agile-service.project-info.updateProjectInfo',
    organizationId: AppState.currentMenuType.organizationId,
    projectId: AppState.currentMenuType.id,
    resourceType: 'project',
  }])
}
