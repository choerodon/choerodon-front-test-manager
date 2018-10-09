import { stores } from 'choerodon-front-boot';
import QuillDeltaToHtmlConverter from 'quill-delta-to-html';
import { uploadImage, uploadFileAgile } from '../api/FileApi';
import { SERVICES_URL } from './Constant';

const { AppState } = stores;

export function text2Delta(description) {
  let temp = description;
  try {
    temp = JSON.parse(description);
  } catch (error) {
    temp = description;
  }
  return temp;
}
/**
 * 将quill特有的文本结构转为html
 * @param {*} delta
 */
export function delta2Html(description, config) {
  // 修复普通文本显示
  let temp = description;
  try {
    JSON.parse(description);
    const obj = JSON.parse(description);
    if (typeof obj !== 'object' || !obj) {
      throw new Error('不是JSON格式');
    }
  } catch (error) {
    // console.log(description, error);
    temp = JSON.stringify([{ insert: description }]);
  }
  
  const delta = text2Delta(temp);
  const converter = new QuillDeltaToHtmlConverter(delta, config);
  const text = converter.convert();
  // if (text.substring(0, 3) === '<p>') {
  //   return text.substring(3);
  // } else {
  // console.log(description, text);
  return text;
  // }
}
export function delta2Text(delta) {
  // console.log(delta2Html(delta, { encodeHtml: false }).replace(/<[^>]+>/g, ''));
  return delta2Html(delta, { encodeHtml: false }).replace(/<br\/>/g, '\n').replace(/<[^>]+>/g, '');
}
export function escape(str) {
  return str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');
}
export function issueLink(issueId, typeCode) {
  const menu = AppState.currentMenuType;
  const { type, id: projectId, name } = menu;
  if (typeCode === 'issue_test') {
    return `/testManager/IssueManage?type=${type}&id=${projectId}&name=${name}&paramIssueId=${issueId}`;
  } else {
    return `/agile/issue?type=${type}&id=${projectId}&name=${name}&paramIssueId=${issueId}`;
  }
}
export function createIssueLink() {
  const menu = AppState.currentMenuType;
  const { type, id: projectId, name } = menu;
  return `/agile/issue?type=${type}&id=${projectId}&name=${name}`;
}

/**
 * 将以base64的图片url数据转换为Blob
 * @param {string} urlData 用url方式表示的base64图片数据
 */
export function convertBase64UrlToBlob(urlData) {
  const bytes = window.atob(urlData.split(',')[1]); // 去掉url的头，并转换为byte

  // 处理异常,将ascii码小于0的转换为大于0
  const buffer = new ArrayBuffer(bytes.length);
  const unit8Array = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) {
    unit8Array[i] = bytes.charCodeAt(i);
  }

  return new Blob([buffer], { type: 'image/png' });
}
/**
 * 从deltaOps中获取图片数据
 * @param {DeltaOperation []} deltaOps
 */
export function getImgInDelta(deltaOps) {
  const imgBase = [];
  const formData = new FormData();
  deltaOps.forEach((item) => {
    if (item.insert && item.insert.image) {
      if (item.insert.image.split(':').length && item.insert.image.split(':')[0] === 'data') {
        imgBase.push(item.insert.image);
        formData.append('file', convertBase64UrlToBlob(item.insert.image), 'blob.png');
      }
    }
  });
  return { imgBase, formData };
}

/**
 * 将富文本中的base64图片替换为对应的url
 * @param {{url:string} []} imgUrlList 图标url对应的
 * @param {any []} imgBase base64图片数组
 * @param {*} text 富文本的文本结构
 */
export function replaceBase64ToUrl(imgUrlList, imgBase, text) {
  const deltaOps = text;
  const imgMap = {};
  imgUrlList.forEach((imgUrl, index) => {
    imgMap[imgBase[index]] = `${SERVICES_URL}${imgUrl}`;
  });
  deltaOps.forEach((item, index) => {
    if (item.insert && item.insert.image && imgBase.indexOf(item.insert.image) !== -1) {
      deltaOps[index].insert.image = imgMap[item.insert.image];
    }
  });
}

/**
 * 适用于各个issue的模态框编辑界面富文本上传
 * 富文本内容上传前的图片的检测与上传
 * @param {object} text 富文本的文本结构
 * @param {object} data 要发送的数据
 * @param {function} func 回调
 */
export function beforeTextUpload(text, data, func, pro = 'description') {
  const deltaOps = text;
  const send = data;
  const { imgBase, formData } = getImgInDelta(deltaOps);
  if (imgBase.length) {
    uploadImage(formData).then((imgUrlList) => {
      replaceBase64ToUrl(imgUrlList, imgBase, deltaOps);
      const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
      const html = converter.convert();
      // send.gitlabDescription = html;
      send[pro] = JSON.stringify(deltaOps);
      func(send);
    });
  } else {
    const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
    const html = converter.convert();
    // send.gitlabDescription = html;
    send[pro] = JSON.stringify(deltaOps);
    func(send);
  }
}

export function returnBeforeTextUpload(text, data, func, pro = 'description') {
  const deltaOps = text;
  const send = data;
  const { imgBase, formData } = getImgInDelta(deltaOps);
  if (imgBase.length) {
    return uploadImage(formData).then((imgUrlList) => {
      replaceBase64ToUrl(imgUrlList, imgBase, deltaOps);
      const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
      const html = converter.convert();
      // send.gitlabDescription = html;
      send[pro] = JSON.stringify(deltaOps);
      return func(send);
    });
  } else {
    const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
    const html = converter.convert();
    // send.gitlabDescription = html;
    send[pro] = JSON.stringify(deltaOps);
    return func(send);
  }
}

/**
 * 适用于富文本附件上传以及回调
 * @param {any []} propFileList 文件列表
 * @param {function} func 回调
 * @param {{issueType:string,issueId:number,fileName:string}} config 附件上传的额外信息
 */
export function handleFileUpload(propFileList, func, config) {
  const fileList = propFileList.filter(i => !i.url);
  const formData = new FormData();
  fileList.forEach((file) => {
    // file.name = encodeURI(encodeURI(file.name));
    formData.append('file', file);
  });
  uploadFileAgile(formData, config)
    .then((response) => {
      const newFileList = [
        {
          uid: -1,
          name: fileList[0].name,
          status: 'done',
          url: response,
        },
      ];
      Choerodon.prompt('上传成功');
      func(newFileList);
    })
    .catch((error) => {
      if (error.response) {
        Choerodon.prompt(error.response.data.message);
      } else {
        Choerodon.prompt(error.message);
      }
      const temp = propFileList.slice();
      temp.forEach((one) => {
        if (!one.url) {
          const tmp = one;
          tmp.status = 'error';
        }
      });
      func(temp);
    });
}

export function formatDate(str) {
  const MONTH = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  if (!str) {
    return '';
  }
  const arr = str.split(' ');
  if (arr.length < 1) {
    return '';
  }
  const date = arr[0];
  const time = arr[1];
  if (!arr[0] || !arr[1]) {
    return '';
  }
  const d = date.split('-');
  const t = time.split(':');
  if (d.length < 3 || t.length < 3) {
    return '';
  }
  return `${d[2]}/${MONTH[(d[1] * 1) - 1]}月/${d[0].slice(2)} ${t[0] < 12 ? t[0] : (t[0] * 1) - 12}:${t[1]}  ${t[0] * 1 < 12 ? ' 上' : ' 下'}午`;
}

export function getParams(url) {
  const theRequest = {};
  if (url.indexOf('?') !== -1) {
    const str = url.split('?')[1];
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i += 1) {
      theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
    }
  }
  return theRequest;
}
export function cycleLink(cycleId) {
  const menu = AppState.currentMenuType;
  const { type, id: projectId, name } = menu;
 
  return `/testManager/TestExecute?type=${type}&id=${projectId}&name=${name}&cycleId=${cycleId}`;
}
