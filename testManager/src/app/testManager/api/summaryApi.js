import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;

export function getCaseNotPlain() {
  const projectId = AppState.currentMenuType.id;

  return axios.get(`/test/v1/projects/${projectId}/cycle/case/countCaseNotPlain`);
}

export function getCaseNotRun() {
  const projectId = AppState.currentMenuType.id;

  return axios.get(`/test/v1/projects/${projectId}/cycle/case/countCaseNotRun`);
}
export function getCycleRange(day, range) {
  const projectId = AppState.currentMenuType.id;

  return axios.get(`/test/v1/projects/${projectId}/cycle/case/range/${day}/${range}`);
}
