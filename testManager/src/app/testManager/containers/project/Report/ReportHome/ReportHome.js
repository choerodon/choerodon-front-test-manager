import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, Dropdown, Icon, Button,
} from 'choerodon-ui';
import {
  Page, Header, Content, stores, 
} from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { ReporterSwitcher } from '../../../../components/ReportComponent';
import Pic from './pic.svg';
import Pic2 from './pic2.svg';


const { AppState } = stores;
const styles = {
  itemContainer: {
    marginRight: 24,
    width: 280, 
    height: 296, 
    background: '#FAFAFA', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    padding: 18,
    fontSize: '13px',
  },
  imgContainer: {                
    width: 220,
    height: 154,
    textAlign: 'center',
    lineHeight: '154px',
    // padding: '30px 10px',
    boxShadow: '0 1px 0 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.12), 0 2px 1px -1px rgba(0,0,0,0.12)',
    borderRadius: 2, 
    background: 'white',
  },
  itemTextBold: { 
    color: 'black',
    width: '100%', 
    margin: '18px 0', 
    fontWeight: 500, 
  },
};
class ReportHome extends Component {
  render() {
    const urlParams = AppState.currentMenuType;
    const { organizationId } = AppState.currentMenuType;    
    return (
      <Page className="c7ntest-report-home">
        <Header title={<FormattedMessage id="report_title" />}>
          <ReporterSwitcher isHome />
        </Header>
        <Content
          // style={{
          //   padding: '0 0 10px 0',
          // }}
          title={<FormattedMessage id="report_content_title" />}
          description={<FormattedMessage id="report_content_description" />}
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-report/report/"
        >
          <div style={{ display: 'flex' }}>
            <Link to={`/testManager/report/story?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}>
              <div style={styles.itemContainer}>
                <div style={styles.imgContainer}>
                  <img src={Pic} alt="" />
                </div>
                <div style={styles.itemTextBold}><FormattedMessage id="report_demandToDefect" /></div>
                <div style={{ color: 'rgba(0,0,0,0.65)' }}><FormattedMessage id="report_demandToDefect_description" /></div>
              </div>
            </Link>
            <Link to={`/testManager/report/test?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}>
              <div style={styles.itemContainer}>
                <div style={styles.imgContainer}>
                  <img src={Pic2} alt="" />
                </div>
                <div style={styles.itemTextBold}><FormattedMessage id="report_defectToDemand" /></div>
                <div style={{ color: 'rgba(0,0,0,0.65)' }}><FormattedMessage id="report_defectToDemand_description" /></div>
              </div>
            </Link>
          </div>
        </Content>
      </Page>
    );
  }
}

ReportHome.propTypes = {

};

export default ReportHome;
