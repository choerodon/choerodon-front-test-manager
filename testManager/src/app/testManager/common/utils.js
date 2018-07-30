import { stores } from 'choerodon-front-boot';
import QuillDeltaToHtmlConverter from 'quill-delta-to-html';

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
  } catch (error) {
    temp = JSON.stringify([{ insert: description }]);
  }
  
  const delta = text2Delta(temp);
  const converter = new QuillDeltaToHtmlConverter(delta, config);
  const text = converter.convert();
  // if (text.substring(0, 3) === '<p>') {
  //   return text.substring(3);
  // } else {
  // console.log(text);
  return text;
  // }
}
export function delta2Text(delta) {
  return delta2Html(delta, { encodeHtml: false }).replace(/<[^>]+>/g, '');
}
export function escape(str) {
  return str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');
}
export function issueLink(issueId) {
  const menu = AppState.currentMenuType;
  const { type, id: projectId, name } = menu;
  return `/agile/issue?type=${type}&id=${projectId}&name=${name}&paramIssueId=${issueId}`;
}

