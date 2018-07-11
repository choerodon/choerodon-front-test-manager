import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

export function getUsers(param) {
  const projectId = AppState.currentMenuType.id;
  if (param) {
    return axios.get(`/test/v1/projects/${projectId}/users?param=${param}`);
  }
  return axios.get(`/test/v1/projects/${projectId}/users`);
}

export function uploadFile(data, config) {
  const { bucketName, fileName, comment, attachmentLinkId, attachmentType } = config;
  const projectId = AppState.currentMenuType.id;
  const axiosConfig = {
    headers: { 'content-type': 'multipart/form-datal' },
  };

  return axios.post(
    `/test/v1/projects/${projectId}/test/case/attachment?bucket_name=${bucketName}&attachmentLinkId=${attachmentLinkId}&attachmentType=CYCLE_CASE`,
    data,
    axiosConfig,
  );
}
