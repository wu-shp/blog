/**
 * IE9+
 **/
(function(global,doc,factory){
  var utils = factory(global,doc);
  //提供window.UI的接口
  global.utils = global.utils || utils;

  //提供CommonJS规范的接口
  global.define && define(function(){
    return utils;
  });
})(this,document,function(window,document){
  /**
   * 检测是否为数字
   * 兼容字符类数字 '23'
   */
  function isNum(ipt){
    return (ipt !== '') && (ipt == +ipt) ? true : false;
  }

  /**
   * 遍历
  **/
  function each(arr,fn,scope){
    //检测输入的值
    if(typeof(arr) == 'object' && typeof(fn) == 'function'){
      var Length = arr.length;
      if(isNum(Length)){
        for(var i=0;i<Length;i++){
          fn.call(scope,arr[i],i,this);
        }
      }else{
        for(var i in arr){
          if (!arr.hasOwnProperty(i)){
            continue;
          }
          fn.call(scope,arr[i],i,this);
        }
      }
    }
  }

  var matches = (function(){
    var node = document.createElement('div'),
        matches = node.matches || node.matchesSelector || node.msMatchesSelector || node.mozMatchesSelector || node.webkitMatchesSelector || node.oMatchesSelector;
    node = null;
    return matches;
  })()
  /**
   * 判断dom是否拥有某个class
   */
  function hasClass(dom,classSingle){
    return dom.className && dom.className.match(new RegExp('(\\s|^)' + classSingle + '(\\s|$)')) || false;
  }
  function addClass(dom, cls) {
    if (!hasClass(dom, cls)) dom.className += " " + cls;
  }
  function removeClass(dom, cls) {
    if (hasClass(dom, cls)) {
      var reg = new RegExp('(\\s+|^)' + cls + '(\\s+|$)');
      dom.className = dom.className.replace(reg, ' ');
    }
  }
  function toggleClass(dom, cls) {
    (hasClass(dom, cls) ? removeClass : addClass)(dom,cls);
  }
  /**
   * dom设置样式
   */
  function setStyle(elem,prop,value){
    prop = prop.toString();
    if (prop == "opacity") {
      elem.style.filter = 'alpha(opacity=' + (value * 100)+ ')';
      value = value;
    } else if ( isNum(value) && prop != 'zIndex'){
      value = value + "px";
    }
    elem.style[prop] = value;
  }
  function CSS(node,cssObj){
    if(!node || !cssObj){
      return;
    }
    /**
     * 为css3属性增加扩展
     */
    each(cssObj,function(value,key){
      if(key == 'transform' || key == 'transition'){
        each(['webkit','o','moz'],function(i,text){
          cssObj['-' + text + '-' + key] = value
        });
      }
    });
    each(cssObj,function(value,key){
      setStyle(node,key,value);
    });
  }

  //读取dom在页面中的位置
  function offset(elem){
   var box = {
     top : 0,
     left : 0,
     screen_top : 0,
     screen_left : 0
   },
   size;

   if (typeof(elem.getBoundingClientRect) !== 'undefined' ) {
     size = elem.getBoundingClientRect();
   }
   box.screen_top = size.top;
   box.screen_left = size.left;

   box.top = size.top + (document.documentElement.scrollTop == 0 ? document.body.scrollTop : document.documentElement.scrollTop);
   box.left = size.left + document.body.scrollLeft;

   return box;
  }
  /**
   * 事件绑定
   * elem:节点
   * type:事件类型
   * handler:回调
   */
  var bindHandler = (function() {
    // 标准浏览器
    if (window.addEventListener) {
      return function(elem, type, handler) {
        // 最后一个参数为true:在捕获阶段调用事件处理程序
        //为false:在冒泡阶段调用事件处理程序
        elem.addEventListener(type, handler, false);
      }
    } else if (window.attachEvent) {
      // IE浏览器
      return function(elem, type, handler) {
        elem.attachEvent("on" + type, handler);
      }
    }
  })();

  /**
   * 事件解除
   * elem:节点
   * type:事件类型
   * handler:回调
   */
  var removeHandler = (function() {
    // 标准浏览器
    if (window.removeEventListener) {
      return function(elem, type, handler) {
        elem.removeEventListener(type, handler, false);
      }
    } else if (window.detachEvent) {
      // IE浏览器
      return function(elem, type, handler) {
        elem.detachEvent("on" + type, handler);
      }
    }
  })();
  /**
   * 向上查找 dom
  **/
  function matchsElementBetweenNode(fromNode,selector,endNode){
    var target = fromNode;
    while (1) {
      if(target == endNode || !target){
        return false;
      }
      if(matches.call(target,selector)){
        return target;
      }
      target = target.parentNode;
    }
  }
  function bind(elem, type,a,b){
    var checkStr,checkEventFn,fn,
        elems = [].concat(elem),
        types = type.split(/\s+/),
        returns = {
          bind: function(type,a,b){
            bind(elem,type,a,b);
            return returns;
          }
        };
    each(elems,function(node){
      if(typeof(a) == 'function'){
        callback = a;
      }else if(typeof(a) == 'string' && typeof(b) == 'function'){
        callback = function(e){
          var target = event.srcElement || event.target,
              bingoDom = matchsElementBetweenNode(target,a,node);
          if(bingoDom){
            b && b.call(bingoDom,e);
          }
        };
      }
      each(types,function(event_name){
        bindHandler(node,event_name,callback);
      });
    });
    return returns;
  }

  function trigger(node,eventName){
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, false);
    node.dispatchEvent(event);
  }
  function createDom(html){
    var a = document.createElement('div');
    a.innerHTML = html;
    return a.childNodes[0];
  }
  // 字符化参数
  function paramStringify(data, baseKey){
    var dataArray = [],key,value;

    for(var i in data){
      key = baseKey ? baseKey + '[' + i + ']' : i,
      value = data[i];

      if(value && value != 0 && value != ''){
        if(typeof(value) == 'object'){
          dataArray.push(paramStringify(data[i],key));
        }else{
          dataArray.push(key + '=' + data[i]);
        }
      }
    }
    return dataArray.join('&');
  }
  function fetch(param){
    param = param || {};
    var url = param.url,
        callback = param.callback || null,
        headers = param.headers || {},
        data = param.data,
        dataStr = paramStringify(data),
        method = (param.type && param.type.match(/^(get|post)$/i)) ? param.type.toUpperCase() : 'GET',
        request = new XMLHttpRequest();

    headers.accept = "application/json, text/javascript";
    if(method == 'POST'){
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }else{
      url = dataStr.length ? (url + '?' + dataStr) : url;
      dataStr = undefined;
    }
    request.open(method, url, true);
    //设置 headers
    for(i in headers){
      request.setRequestHeader(i, headers[i]);
    }
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var resp = request.responseText;
        resp = JSON.parse(resp);
        callback && callback(null,resp,request);
      } else {
        callback && callback(request.status,resp,request);
      }
    };

    request.onerror = function() {
      callback && callback('connection fail',resp,request);
    };
    request.send(dataStr);
  }
  return {
    each: each,
    offset: offset,
    createDom: createDom,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    css: CSS,
    remove: function (node){
      node.parentNode.removeChild(node);
    },
    parents: matchsElementBetweenNode,
    bind: bind,
    trigger: trigger,
    fetch: fetch
  };
});