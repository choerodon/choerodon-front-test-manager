import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;

export function loadProgressByVersion(versionId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/test/v1/projects/${projectId}/cycle/count/color/in/version/${versionId}`);
}
