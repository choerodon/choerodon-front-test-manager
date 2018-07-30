import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

// export function getUsers(param) {
//   const projectId = AppState.currentMenuType.id;
//   if (param) {
//     return axios.get(`/test/v1/projects/${projectId}/users?param=${param}`);
//   }
//   return axios.get(`/test/v1/projects/${projectId}/users`);
// }

export function uploadFile(data, config) {
  const { bucketName, attachmentLinkId } = config;
  const projectId = AppState.currentMenuType.id;
  const axiosConfig = {
    headers: { 'content-type': 'multipart/form-datal' },
  };

  return axios.post(
    `/zuul/test/v1/projects/${projectId}/test/case/attachment?bucket_name=${bucketName}&attachmentLinkId=${attachmentLinkId}&attachmentType=CYCLE_CASE`,
    data,
    axiosConfig,
  );
}

export function getSelf() {
  return axios.get('/iam/v1/users/self');
}

export function getUsers(param) {
  const projectId = AppState.currentMenuType.id;
  if (param) {
    return axios.get(`/iam/v1/projects/${projectId}/users?param=${param}`);
  }
  return axios.get(`/iam/v1/projects/${projectId}/users`);
}

export function getUser(userId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`iam/v1/projects/${projectId}/users?id=${userId}`);
}
