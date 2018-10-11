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
