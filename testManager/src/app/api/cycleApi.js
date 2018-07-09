import {axios} from 'choerodon-front-boot';

export function getCycleByVersionId(versionId) {
    return axios.get(`test/v1/cycle/query/${versionId}`);
}

export function getFolderByCycleId(cycleId) {
    return axios.get(`test/v1/cycle/case/query/${cycleId}`);
}

export function filterCycleWithBar(parameters) {
    return axios.get(`test/v1/cycle/filter/${parameters}`);
}