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
  yaml: "# Default values for api-gateway.\n# This is a YAML-formatted file.\n# Declare variables to be passed into your templates.\n\nreplicaCount: 1\n\nimage:\n  repository: registry.saas.hand-china.com/operation-test-manager/test-mocha\n  pullPolicy: Always\n\nframework: mocha\n\nenv:\n  open:\n    APIGATEWAY: http://api.staging.saas.hand-china.com\n    PROJECTID: 144\n    USERNAME: AutomationTestUser\n    PASSWORD: 123456\n    RESULTGATEWAY: http://api.staging.saas.hand-china.com\n    RESULTPATH: mochawesome-report\n    RESULTNAME: mochawesome\n    SLOW: 250\n    TIMEOUT: 15000\n\njob:\n  activeDeadlineSeconds: 1200\n\nresources:\n  # We usually recommend not to specify default resources and to leave this as a conscious\n  # choice for the user. This also increases chances chart run on environments with little\n  # resources,such as Minikube. If you do want to specify resources,uncomment the following\n  # lines,adjust them as necessary,and remove the curly braces after 'resources:'.\n  limits:\n    # cpu: 100m\n    # memory: 2Gi\n  requests:\n",
  highlightMarkers: [],
  totalLine: 37,
  errorMsg: null,
  errorLines: null,
  newLines: [],
  deltaYaml: '{}',
});
Mock.mock(`${server}/devops/v1/projects/${144}/app_pod/${5}/containers/logs`, [{
  containerName: 'choerodon-front-test-manager-f7c84',
  logId: '99dcf052-e408-4b19-97c5-fefcd7236439',
  podName: 'choerodon-front-test-manager-f7c84-548db8b9b7-25vlz',
}]);
