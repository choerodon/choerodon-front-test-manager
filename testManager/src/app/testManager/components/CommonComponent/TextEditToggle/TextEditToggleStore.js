import axios from 'axios';
import {
  observable, action, computed, toJS,
} from 'mobx';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('TextEditToggleStore')
class TextEditToggleStore {
  @observable currentToggle = null;


  @computed get getCurrentToggle() {
    return this.currentToggle;
  }

  @action setCurrentToggle(currentToggle) { 
    this.currentToggle = currentToggle;
  }
}

const textEditToggleStore = new TextEditToggleStore();
export default textEditToggleStore;
