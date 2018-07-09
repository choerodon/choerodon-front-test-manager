import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

export function getVersionCode() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`agile/v1/projects/${projectId}/lookup_values/version`);
}

export function getProjectVersion() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`agile/v1/projects/${projectId}/product_version/versions`);
}
