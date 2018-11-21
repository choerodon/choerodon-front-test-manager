import {
  observable, action, computed, toJS, 
} from 'mobx';

class CreateAutoTestStore {
  @observable currentStep = 1;

  @observable app = {};

  @observable appVersion = {};

  @observable version = {};

  @observable env = {};

  @observable configValue = null;

  @observable newConfigValue = null;

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

  @action setConfigValue(configValue) {
    this.configValue = configValue;
    this.newConfigValue = configValue;
  }

  @action setNewConfigValue(newConfigValue) {
    this.newConfigValue = { ...this.newConfigValue, yaml: newConfigValue };
  }

  @computed get getConfigValue() {
    return toJS(this.configValue);
  }

  @computed get getNewConfigValue() {
    return toJS(this.newConfigValue);
  }
}

export default new CreateAutoTestStore();
