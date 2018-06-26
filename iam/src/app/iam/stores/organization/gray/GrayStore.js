import { observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('GrayStore')
class GrayStore {
  @observable serviceData = [];
  @observable totalSize;
  @observable totalPage;
  @observable isLoading = false;
  @observable isAuth = false;

  constructor(totalPage = 1, totalSize = 0) {
    this.totalPage = totalPage;
    this.totalSize = totalSize;
  }
  testGray =() =>
    axios.get('/test/v1/testGray');
}
const grayStore = new GrayStore();
export default grayStore;

