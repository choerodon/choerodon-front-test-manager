const QuillDeltaToHtmlConverter = require('quill-delta-to-html');

export function text2Delta(description) {
  if (
    description &&
    description.indexOf('[') === 0 &&
    description[description.length - 1] === ']'
  ) {
    return JSON.parse(description);
  }
  return description || '';
}
/**
 * 将quill特有的文本结构转为html
 * @param {*} delta
 */
export function delta2Html(description) {
  const delta = text2Delta(description);
  const converter = new QuillDeltaToHtmlConverter(delta, {});
  const text = converter.convert();
  // if (text.substring(0, 3) === '<p>') {
  //   return text.substring(3);
  // } else {
  return text;
  // }
}
export function delta2Text(delta) {
  return delta2Html(delta).replace(/<[^>]+>/g, '');
}
export function escape(str) {
  return str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');
}
