import { observable, action, computed } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import { getYaml } from '../../../api/AutoTestApi';

const { AppState } = stores;

@store('CreateAutoTestStore')
class CreateAutoTestStore {
  @observable currentStep = 1;

  @observable app = {};

  @observable appVersion = {};

  @observable version = {};

  @observable env = {};

  // @observable envs = [];

  // @observable currentEnv = {};

  @observable value = null;

  @observable currentMode = 'new';

  @observable instances = [];

  @observable currentInstance = {};


  checkYaml = (value, projectId = AppState.currentMenuType.id) => axios.post(`/devops/v1/projects/${projectId}/app_instances/value_format`, { yaml: value });

  // loadInstances(appId, envId, projectId = AppState.currentMenuType.id) {
  //   return axios.get(`/devops/v1/projects/${projectId}/app_instances/listByAppIdAndEnvId?envId=${envId}&appId=${appId}`)
  //     .then((data) => {
  //       const res = this.handleProptError(data);
  //       if (res) {
  //         this.setCurrentInstance(res);
  //       }
  //       return res;
  //     });
  // }

  // deploymentApp(applicationDeployDTO, projectId = AppState.currentMenuType.id) {
  //   return axios.post(`/devops/v1/projects/${projectId}/app_instances`, applicationDeployDTO)
  //     .then((data) => {
  //       const res = this.handleProptError(data);
  //       return res;
  //     });
  // }
  @action setApp = (app) => {
    this.app = app;
  }

  @action setAppVersion = (appVersion) => {
    this.appVersion = appVersion;
  }

  @action setVersion = (version) => {
    this.version = version;
  }

  @action setEnv = (env) => {
    this.env = env;
  }

  @action toStep = (step) => {
    this.currentStep = step;
  }

  @action nextStep = () => {
    this.currentStep += 1;
  }

  @action preStep = () => {
    this.currentStep -= 1;
  }

  // @action setEnvs(data) {
  //   this.envs = data;
  // }

  // @action setCurrentEnv(data) {
  //   this.currentEnv = data;
  // }

  @action setValue(data) {
    this.value = data;
  }

  @action setShowArr(data) {
    this.showArr = data;
  }

  @action setLoadingArr(data) {
    this.loadingArr = data;
  }

  @action setCurrentMode(data) {
    this.currentMode = data;
  }

  @action setInstances(data) {
    this.instances = data;
  }

  @action setCurrentInstance(data) {
    this.currentInstance = data;
  }

  @computed get getCurrentStage() {
    return this.showArr.lastIndexOf(true) + 1;
  }

  @computed get getValue() {
    return this.value;
  }

  handleProptError = (error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}
const createAutoTestStore = new CreateAutoTestStore();
export default createAutoTestStore;
