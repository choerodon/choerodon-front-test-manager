/* eslint-disable no-param-reassign, no-use-before-define, no-underscore-dangle */

/**
 * 为普通元素添加resize监听
 * 思路：普通元素没有resize事件，所以为目标添加一个object元素，并设置为和目标元素相同位置和大小
 * 当object元素的contentDocument触发resize时，调用目标元素的resize事件，即做一层代理
 */
/**
 * 添加监听
 * @param {*} ele 
 * @param {*} handler 
 */
export function addResizeListener(ele, handler) {
  // 因为要为目标元素创建一个object子元素，所以先对样式进行处理
  if (getComputedStyle(ele, null).position === 'static') {
    ele.style.position = 'relative';
  }
  const object = ele._ResizeObject_;
  // 已经存在object元素
  if (object) {
    _addHandler(object, handler);
  } else {
    // 不存在时，创建object元素，并添加监听
    const objectElement = _createObjectElement(ele);
    _addHandler(objectElement, handler);
    // 将object元素保存在目标元素上
    ele._ResizeObject_ = objectElement;
  }
}
/**
 * 移除监听
 * @param {*} ele 
 * @param {*} handler 
 */
export function removeResizeListener(ele, handler) {
  // 存在object元素，说明加过监听
  const object = ele._ResizeObject_;
  if (ele._ResizeObject_) {
    _removeHandler(object, handler);
  }
}
function _createObjectElement(ele) {
  const objectElement = document.createElement('object');
  objectElement.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden;opacity: 0; pointer-events: none; z-index: -1;');
  objectElement.type = 'text/html';
  objectElement.data = 'about:blank';
  ele.appendChild(objectElement);
  return objectElement;
}

function _addHandler(objectElement, handler) {
  objectElement.contentDocument.defaultView.addEventListener('resize', handler);
}

function _removeHandler(objectElement, handler) {
  objectElement.contentDocument.defaultView.removeEventListener('resize', handler);
}
