import {stores, axios} from 'choerodon-front-boot';

export function getCycleByVersionId(versionId) {
    return axios.get(`test/v1/cycle/query/${versionId}`);
}

export function getFolderByCycleId(cycleId) {
    return axios.get(`test/v1/cycle/case/query/${cycleId}`);
}