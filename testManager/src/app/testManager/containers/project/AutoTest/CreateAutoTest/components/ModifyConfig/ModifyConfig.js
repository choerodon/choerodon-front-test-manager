
import React, { Component } from 'react';
import {
  Select, Button, Radio, Steps, Icon, Tooltip, Form,
} from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import YAML from 'yamljs';
import { YamlEditor } from '../../../../../../components/CommonComponent';
import CreateAutoTestStore from '../../../../../../store/project/AutoTest/CreateAutoTestStore';
import { getYaml, checkYaml } from '../../../../../../api/AutoTestApi';

@injectIntl
class ModifyConfig extends Component {
  state = {
    markers: null,
    changeYaml: false,
    data: null,
    errorLine: [],
  };

  componentDidMount() {
    this.loadYaml();
  }

  loadYaml=() => {
    getYaml().then((data) => {
      if (data) {
        this.setState({
          data,
        });
      }
    });
  }

  /**
   * 获取values
   * @param value
   */
  handleChangeValue = (value) => {
    this.setState({ value });
    checkYaml(value)
      .then((data) => {
        this.setState({ errorLine: data });
        const oldYaml = CreateAutoTestStore.getValue ? CreateAutoTestStore.getValue.yaml : '';
        const oldvalue = YAML.parse(oldYaml);
        const newvalue = YAML.parse(value);
        if (JSON.stringify(oldvalue) === JSON.stringify(newvalue)) {
          this.setState({
            changeYaml: false,
          });
        } else {
          this.setState({
            changeYaml: true,
          });
        }
      });
  };

  render() {
    const { intl } = this.props;
    const { formatMessage } = intl;
    const { data } = this.state;
    // const data = data || CreateAutoTestStore.value;
    return (
      <div className="deployApp-env">
        <p>
          {formatMessage({ id: 'autoteststep_two_description' })}
        </p>

        <section className="deployApp-section">
          <div className="autotest-title">
            <i className="icon icon-description section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'autoteststep_two_config' })}</span>
          </div>
          {data && (
            <YamlEditor
              newLines={data.newLines}
              isFileError={!!data.errorLines}
              totalLine={data.totalLine}
              errorLines={this.state.errorLine}
              errMessage={data.errorMsg}
              modifyMarkers={this.state.markers}
              value={data.yaml}
              highlightMarkers={data.highlightMarkers}
              onChange={this.handleChangeValue}
              change
            />
          )}
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
            onClick={CreateAutoTestStore.nextStep}
          >
            {formatMessage({ id: 'next' })}
          </Button>
          <Button onClick={CreateAutoTestStore.preStep} funcType="raised">{formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" className="c7ntest-autotest-clear" onClick={() => { CreateAutoTestStore.toStep(1); }}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </div>
    );
  }
}

export default ModifyConfig;
