import { observable, action } from 'mobx';
import { BaseTreeProto } from '../prototype';

class IssueTreeStore extends BaseTreeProto {
  @observable draggingFolder = null;

  @observable isCopy = false;


  @action setCopy = (isCopy) => {
    this.isCopy = isCopy;
  }
}

export default new IssueTreeStore();
