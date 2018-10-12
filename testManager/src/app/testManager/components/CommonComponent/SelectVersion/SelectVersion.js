import React, { Component } from 'react';
import { Select } from 'choerodon-ui';
import { getProjectVersion } from '../../../api/agileApi';

const Option = Select.Option;

class SelectVersion extends Component {
  state = {
    loading: false,
    List: [],
  }

  componentDidMount() {
    getProjectVersion().then((Data) => {
      this.setState({
        List: Data,
        loading: false,
      });
    });
  }
  
  render() {
    const { loading, List } = this.state;
    const Options = List.map(item => (
      <Option value={item.versionId} key={item.versionId}>
        {item.name}
      </Option>
    ));
    return (
      <Select       
        label="版本" 
        loading={loading}   
        style={{ width: 200 }}       
        onFocus={() => {
          this.setState({
            loading: true,
          });
          getProjectVersion().then((Data) => {
            this.setState({
              List: Data,
              loading: false,
            });
          });
        }}
        {...this.props}
      >
        {Options}
      </Select>
    );
  }
}

SelectVersion.propTypes = {

};

export default SelectVersion;
