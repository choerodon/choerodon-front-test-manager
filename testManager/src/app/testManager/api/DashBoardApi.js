import { getProjectId, request } from '../common/utils';

export function loadProgressByVersion(versionId) {
  return request.get(`/test/v1/projects/${getProjectId()}/cycle/count/color/in/version/${versionId}`);
}
