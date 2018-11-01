import Mock from 'mockjs';


const server = process.env.API_HOST;
Mock.setup({
  timeout: '200 - 400',
});

// Mock响应模板
Mock.mock(`${server}/getAppList`, () => Mock.mock({
  'list|4-10': [{
    'id|+1': 1, // 序号 属性值自动加 1，初始值为 1    
    name: '@ctitle(3, 7)', // 门店名称  
  }], 
}).list);
Mock.mock(`${server}/getTestHistoryByApp`, {
  'content|1-10': [{
    'id|+1': 1, // 序号 属性值自动加 1，初始值为 1
    'status|1': ['passed', 'pending', 'failed'], // 随机选取 1 个元素
    lastUpdateUser: {
      realName: '@cname',
      loginName: '@integer(60, 100)',
    },
    testType: 'Mocha',
    appVersion: /\d{1,10}/,
    during: '@integer(60, 100)', // 
    time: '@date("yyyy-MM-dd")',
    'result|1': ['passed', 'pending', 'failed'],
  }],
});
Mock.mock(`${server}/getYaml`, { 
  yaml: "# Default values for api-gateway.\n# This is a YAML-formatted file.\n# Declare variables to be passed into your templates.\n\nreplicaCount: 1\n\nimage:\n  repository: registry.choerodon.com.cn/choerodon-c7ntest/choerodon-front-test-manager\n  pullPolicy: Always\n\npreJob:\n  preConfig:\n    mysql:\n      host: 192.168.12.156\n      port: 3306\n      username: root\n      password: handhand\n      dbname: iam_service\n      enabledelete: true\n\nmetrics:\n  path: /prometheus\n  group: nginx\n\nlogs:\n  parser: nginx\n\nservice:\n  type: ClusterIP\n  port: 80\n\ningress:\n  host: test.choerodon.staging.saas.hand-china.com\n\nenv:\n  open:\n    PRO_HTTP: http\n    PRO_COOKIE_SERVER: choerodon.staging.saas.hand-china.com\n    PRO_LOCAL: true\n    PRO_CLIENT_ID: testManager\n    PRO_TITLE_NAME: TestManager\n    PRO_API_HOST: api.staging.saas.hand-china.com\n    PRO_HEADER_TITLE_NAME: TestManager\n    PRO_AGILE_HOST: http://minio.staging.saas.hand-china.com/agile-service/\nresources:\n  # We usually recommend not to specify default resources and to leave this as a conscious\n  # choice for the user. This also increases chances chart run on environments with little\n  # resources,such as Minikube. If you do want to specify resources,uncomment the following\n  # lines,adjust them as necessary,and remove the curly braces after 'resources:'.\n  limits:\n    # cpu: 100m\n    # memory: 2Gi\n  requests:\n    # cpu: 100m\n    # memory: 1Gi\n\n\n",
  highlightMarkers: [{
    line: 32, endLine: 32, startIndex: 0, endIndex: 0, startColumn: 8, endColumn: 50, 
  }, { 
    line: 41, endLine: 41, startIndex: 0, endIndex: 0, startColumn: 18, endColumn: 49, 
  }, {
    line: 39, endLine: 39, startIndex: 0, endIndex: 0, startColumn: 19, endColumn: 30, 
  }, {
    line: 40, endLine: 40, startIndex: 0, endIndex: 0, startColumn: 20, endColumn: 31,
  }, {
    line: 42, endLine: 42, startIndex: 0, endIndex: 0, startColumn: 27, endColumn: 38, 
  }, {
    line: 37, endLine: 37, startIndex: 0, endIndex: 0, startColumn: 23, endColumn: 60, 
  }, { 
    line: 15, endLine: 15, startIndex: 0, endIndex: 0, startColumn: 16, endColumn: 20, 
  }, { 
    line: 13, endLine: 13, startIndex: 0, endIndex: 0, startColumn: 12, endColumn: 26,
  }, { 
    line: 16, endLine: 16, startIndex: 0, endIndex: 0, startColumn: 16, endColumn: 24, 
  }],
  totalLine: 57,
  errorMsg: null,
  errorLines: null,
  newLines: [43],
  deltaYaml: '\ningress:\n  host: test.choerodon.staging.saas.hand-china.com\npreJob:\n  preConfig:\n    mysql:\n      username: root\n      host: 192.168.12.156\n      password: handhand\nenv:\n  open:\n    PRO_API_HOST: api.staging.saas.hand-china.com\n    PRO_CLIENT_ID: testManager\n    PRO_TITLE_NAME: TestManager\n    PRO_HEADER_TITLE_NAME: TestManager\n    PRO_AGILE_HOST: http://minio.staging.saas.hand-china.com/agile-service/\n    PRO_COOKIE_SERVER: choerodon.staging.saas.hand-china.com\n',
});
Mock.mock(`${server}/devops/v1/projects/${144}/app_pod/${5}/containers/logs`, [{
  containerName: 'choerodon-front-test-manager-f7c84',
  logId: '99dcf052-e408-4b19-97c5-fefcd7236439',
  podName: 'choerodon-front-test-manager-f7c84-548db8b9b7-25vlz',
}]);
