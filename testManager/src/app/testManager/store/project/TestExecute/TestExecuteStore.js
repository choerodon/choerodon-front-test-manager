import {
  observable, action, computed, toJS, 
} from 'mobx';
import { BaseTreeProto } from '../prototype';

class TestExecuteStore extends BaseTreeProto {}

export default new TestExecuteStore();
