const fs = require('fs');
const YAMLJS = require('yamljs');
const chai = require('chai');

function loadYAMLConfigFile(file) {
  return YAMLJS.parse(fs.readFileSync(file).toString());
}

function loadYAMLMessageFile(file) {
  return YAMLJS.parse(fs.readFileSync(file).toString());
}

const yamlConfig = loadYAMLConfigFile('./config.yaml');

const errors = loadYAMLMessageFile('messages_zh_CN.yaml');

const utils = {
  gateway: yamlConfig.gateway,
  loginKey: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  loginName: yamlConfig.login.username,
  loginPass: yamlConfig.login.password,
};

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

function logout(done, token) {
  chai.request(utils.gateway)
    .get('/oauth/logout')
    .set('Authorization', token.name)
    .end(() => {
      done();
    });
}

function login(done, accessToken) {
  const authorize = '/oauth/oauth/authorize?scope=default&redirect_uri=http://' +
        'api.staging.saas.hand-china.com&response_type=token&realm=default&state=client&client_id=client';
  chai.request(utils.gateway)
    .get(authorize)
    .redirects(0)
    .end((err, res) => {
      let cookie;
      if (!err) {
        cookie = res.header['set-cookie'][0].split(';')[0];
        chai.request(utils.gateway)
          .post('/oauth/login')
          .redirects(0)
          .set('Cookie', cookie)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({
            username: utils.loginName,
            password: encode(utils.loginPass),
          })
          .end((err, res) => {
            if (!err) {
              cookie = res.header['set-cookie'][0].split(';')[0];
              // console.log(res.body);
              chai.request(utils.gateway)
                .get(authorize)
                .redirects(0)
                .set('Cookie', cookie)
                .end((err, res) => {
                  if (!err) {
                    const location = res.header.location;
                    if (location === undefined) {
                      throw new Error('Error GET TOKEN');
                    }
                    accessToken.name = `Bearer ${  location.split('#access_token=')[1].split('&token_type')[0]}`;

                    done();
                  }
                });
            }
          });
      }
    });
}

module.exports = { config: utils, errors, login, logout };
