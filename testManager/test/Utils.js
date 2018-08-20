/*eslint-disable */
const fs = require('fs');
const YAMLJS = require('yamljs');
const chai = require('chai');

chai.should();

function loadYAMLConfigFile(file) {
  return YAMLJS.parse(fs.readFileSync(file).toString());
}

function loadYAMLMessageFile(file) {
  return YAMLJS.parse(fs.readFileSync(file).toString());
}

const yamlConfig = loadYAMLConfigFile('./config.yaml');

const errors = loadYAMLMessageFile('messages_zh_CN.yaml');

const utils = {
  projectId: yamlConfig.projectId,
  gateway: yamlConfig.gateway,
  loginKey: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  loginName: yamlConfig.login.username,
  loginPass: yamlConfig.login.password,
};

/**
 * return the current month + date in a 4 digit format
 */
function getMonthAndDate() {
  const date = new Date();
  const month = (date.getMonth() + 1) < 10 ? (`0${date.getMonth() + 1}`) : (date.getMonth() + 1);
  const day = date.getDate();
  return month + day;
}

/**
 * sleep for a desiganted time passed as a parameter. 
 * @return {Promise} returns a promise.
 * @param {long} time  sleep time, in milliseconds.
 */
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * 
 * @param {string} password encode the password.
 */
function encode(password) {
  const loginKey = utils.loginKey;
  let output = '';
  let chr1,
    chr2,
    chr3 = '';
  let enc1,
    enc2,
    enc3,
    enc4 = '';
  let i = 0;
  do {
    chr1 = password.charCodeAt(i++);
    chr2 = password.charCodeAt(i++);
    chr3 = password.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output + loginKey.charAt(enc1) + loginKey.charAt(enc2)
      + loginKey.charAt(enc3) + loginKey.charAt(enc4);
  } while (i < password.length);
  return output;
}

/**
 * login function, pass in [message] to get expected results, successful login by default if no msg is passed.
 * @param {JSON} reqBody login message, including username and password (and verification code, if required).
 * @param {string} msg 
 */
function login(reqBody, msg) {
  console.log('login')
  if (!arguments[1]) { msg = 'success'; }
  global.user = {};
  if (!reqBody.username || !reqBody.password) {
    throw new Error('reqBody格式错误，必须包含username以及加密过的password!');
  }
  reqBody.password = encode(reqBody.password);
  const authorize = '/oauth/oauth/authorize?scope=default&redirect_uri=http://' +
    'api.staging.saas.hand-china.com&response_type=token&realm=default&state=client&client_id=client';
  return chai.request(utils.gateway)
    .get(authorize)
    .redirects(0)
    .then((res) => {
      // console.log(res.header)
      let cookie;
      cookie = res.header['set-cookie'][0].split(';')[0];
      if (msg == 'success') {
        console.log('login success')
        // Login success, pass token to global.user.token
        return chai.request(utils.gateway)
          .post('/oauth/login')
          .redirects(0)
          .set('Cookie', cookie)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(reqBody)
          .then((res) => {
            cookie = res.header['set-cookie'][0].split(';')[0];
            return chai.request(utils.gateway)
              .get(authorize)
              .redirects(0)
              .set('Cookie', cookie)
              .then((res) => {
                let location = res.header['location'];
                if (location === undefined) {
                  throw new Error("Error GET TOKEN");
                }
                // pass user info including login name and user token to global.user 
                global.user.username = reqBody.username;
                global.user.token = 'Bearer ' + location.split('#access_token=')[1].split('&token_type')[0];
                console.log("  [Login] User " + global.user.username + " logged in!\n");
              });
          });
      } else {
        console.log(reqBody);
        return chai.request(utils.gateway)
          .post('/oauth/login')
          // .redirects(0)
          .set('Cookie', cookie)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(reqBody)
          .then((res) => {
            console.log(res.header);
            return res;
          });
      }
    });
}

// function failedLogin(reqBody, msg) {
//     if (!reqBody.username || !reqBody.password) {
//         throw new Error("reqBody格式错误，必须包含username以及加密过的password!");
//     }
//     reqBody.password = encode(reqBody.password);

//     return chai.request(utils.gateway)
//                 .post("/oauth/login")
//                 // .redirects(0)
//                 .set('content-type', 'application/x-www-form-urlencoded')
//                 .send(reqBody)
//                 .then(function (res) {
//                     return res;
//                 });
// }

/**
 * logout function, logout the current user. 
 */
function logout() {
  return chai.request(utils.gateway)
    .get('/oauth/logout')
    .set('Authorization', global.user.token);
}

module.exports = { config: utils, login, logout, getMonthAndDate, sleep, errors };
