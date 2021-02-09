module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1612446519012, function(require, module, exports) {
let objectify = require('./objectifier')
let parse = require('./parser')
let async = require('./async')
let sync = require('./sync')

module.exports = {
  objectify,
  parse,
  async,
  sync
}

}, function(modId) {var map = {"./objectifier":1612446519013,"./parser":1612446519014,"./async":1612446519015,"./sync":1612446519017}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1612446519013, function(require, module, exports) {
let camelcase = require('camelcase-css')

let UNITLESS = {
  boxFlex: true,
  boxFlexGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  fillOpacity: true,
  strokeDashoffset: true,
  strokeOpacity: true,
  strokeWidth: true
}

function atRule (node) {
  if (typeof node.nodes === 'undefined') {
    return true
  } else {
    return process(node)
  }
}

function process (node) {
  let name
  let result = {}

  node.each(child => {
    if (child.type === 'atrule') {
      name = '@' + child.name
      if (child.params) name += ' ' + child.params
      if (typeof result[name] === 'undefined') {
        result[name] = atRule(child)
      } else if (Array.isArray(result[name])) {
        result[name].push(atRule(child))
      } else {
        result[name] = [result[name], atRule(child)]
      }
    } else if (child.type === 'rule') {
      let body = process(child)
      if (result[child.selector]) {
        for (let i in body) {
          result[child.selector][i] = body[i]
        }
      } else {
        result[child.selector] = body
      }
    } else if (child.type === 'decl') {
      if (child.prop[0] === '-' && child.prop[1] === '-') {
        name = child.prop
      } else {
        name = camelcase(child.prop)
      }
      let value = child.value
      if (!isNaN(child.value) && UNITLESS[name]) {
        value = parseFloat(child.value)
      }
      if (child.important) value += ' !important'
      if (typeof result[name] === 'undefined') {
        result[name] = value
      } else if (Array.isArray(result[name])) {
        result[name].push(value)
      } else {
        result[name] = [result[name], value]
      }
    }
  })
  return result
}

module.exports = process

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1612446519014, function(require, module, exports) {
let postcss = require('postcss')

let IMPORTANT = /\s*!important\s*$/i

let UNITLESS = {
  'box-flex': true,
  'box-flex-group': true,
  'column-count': true,
  'flex': true,
  'flex-grow': true,
  'flex-positive': true,
  'flex-shrink': true,
  'flex-negative': true,
  'font-weight': true,
  'line-clamp': true,
  'line-height': true,
  'opacity': true,
  'order': true,
  'orphans': true,
  'tab-size': true,
  'widows': true,
  'z-index': true,
  'zoom': true,
  'fill-opacity': true,
  'stroke-dashoffset': true,
  'stroke-opacity': true,
  'stroke-width': true
}

function dashify (str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/^ms-/, '-ms-')
    .toLowerCase()
}

function decl (parent, name, value) {
  if (value === false || value === null) return

  name = dashify(name)
  if (typeof value === 'number') {
    if (value === 0 || UNITLESS[name]) {
      value = value.toString()
    } else {
      value += 'px'
    }
  }

  if (name === 'css-float') name = 'float'

  if (IMPORTANT.test(value)) {
    value = value.replace(IMPORTANT, '')
    parent.push(postcss.decl({ prop: name, value, important: true }))
  } else {
    parent.push(postcss.decl({ prop: name, value }))
  }
}

function atRule (parent, parts, value) {
  let node = postcss.atRule({ name: parts[1], params: parts[3] || '' })
  if (typeof value === 'object') {
    node.nodes = []
    parse(value, node)
  }
  parent.push(node)
}

function parse (obj, parent) {
  let name, value, node
  for (name in obj) {
    value = obj[name]
    if (value === null || typeof value === 'undefined') {
      continue
    } else if (name[0] === '@') {
      let parts = name.match(/@(\S+)(\s+([\W\w]*)\s*)?/)
      if (Array.isArray(value)) {
        for (let i of value) {
          atRule(parent, parts, i)
        }
      } else {
        atRule(parent, parts, value)
      }
    } else if (Array.isArray(value)) {
      for (let i of value) {
        decl(parent, name, i)
      }
    } else if (typeof value === 'object') {
      node = postcss.rule({ selector: name })
      parse(value, node)
      parent.push(node)
    } else {
      decl(parent, name, value)
    }
  }
}

module.exports = function (obj) {
  let root = postcss.root()
  parse(obj, root)
  return root
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1612446519015, function(require, module, exports) {
let postcss = require('postcss')

let processResult = require('./process-result')
let parse = require('./parser')

module.exports = function async (plugins) {
  let processor = postcss(plugins)
  return async input => {
    let result = await processor.process(input, {
      parser: parse,
      from: undefined
    })
    return processResult(result)
  }
}

}, function(modId) { var map = {"./process-result":1612446519016,"./parser":1612446519014}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1612446519016, function(require, module, exports) {
let objectify = require('./objectifier')

module.exports = function processResult (result) {
  if (console && console.warn) {
    result.warnings().forEach(warn => {
      let source = warn.plugin || 'PostCSS'
      console.warn(source + ': ' + warn.text)
    })
  }
  return objectify(result.root)
}

}, function(modId) { var map = {"./objectifier":1612446519013}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1612446519017, function(require, module, exports) {
let postcss = require('postcss')

let processResult = require('./process-result')
let parse = require('./parser')

module.exports = function (plugins) {
  let processor = postcss(plugins)
  return input => {
    let result = processor.process(input, { parser: parse, from: undefined })
    return processResult(result)
  }
}

}, function(modId) { var map = {"./process-result":1612446519016,"./parser":1612446519014}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1612446519012);
})()
//# sourceMappingURL=index.js.map