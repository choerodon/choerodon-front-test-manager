import {
  observable, action, computed, toJS, 
} from 'mobx';
import { BaseTreeProto } from '../prototype';

class IssueTreeStore extends BaseTreeProto {
  @observable loading=false;

  @observable draggingFolders = [];

  @observable isCopy = false;

  @computed get getDraggingFolders() {
    return toJS(this.draggingFolders);
  }

  @action setCopy = (isCopy) => {
    this.isCopy = isCopy;
  }

  @action setLoading = (loading) => {
    this.loading = loading;
  }

  @action setDraggingFolders(draggingFolders) {
    this.draggingFolders = draggingFolders;
  }
}

export default new IssueTreeStore();
