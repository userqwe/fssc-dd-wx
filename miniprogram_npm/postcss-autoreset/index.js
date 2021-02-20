module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1613828895869, function(require, module, exports) {
const { getRulesMatcher, getReset, createResetRule } = require("./lib");

function contains(array, item) {
  return array.indexOf(item) !== -1;
}

module.exports = (opts = {}) => {
  opts.rulesMatcher = opts.rulesMatcher || "bem";
  opts.reset = opts.reset || "initial";
  const rulesMatcher = getRulesMatcher(opts.rulesMatcher);
  const reset = getReset(opts.reset);
  return {
    postcssPlugin: "postcss-autoreset",
    prepare() {
      const matchedSelectors = [];
      return {
        Rule(rule) {
          const { selector } = rule;
          if (/^(-(webkit|moz|ms|o)-)?keyframes$/.test(rule.parent.name)) {
            return;
          }
          if (!contains(matchedSelectors, selector) && rulesMatcher(rule)) {
            matchedSelectors.push(selector);
          }
        },
        OnceExit(root) {
          if (!matchedSelectors.length) {
            return;
          }
          root.prepend(createResetRule(matchedSelectors, reset));
        },
      };
    },
  };
};
module.exports.postcss = true;

}, function(modId) {var map = {"./lib":1613828895870}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1613828895870, function(require, module, exports) {
module.exports = {
  getRulesMatcher: require("./rulesMatcher"),
  getReset: require("./resetRules"),
  createResetRule: require("./createResetRule"),
};

}, function(modId) { var map = {"./rulesMatcher":1613828895871,"./resetRules":1613828895872,"./createResetRule":1613828895873}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1613828895871, function(require, module, exports) {
/**
 * Demo - https://regex101.com/r/AA4xaq/3
 */
const suitRegex = /^\.(?:[a-z0-9]*-)?[A-Z](?:[a-zA-Z0-9]+)(?:-[a-zA-Z0-9]+)?$/;

const matchers = {
  bem({ selector }) {
    return !selector.match(/(--|:)/);
  },

  suit({ selector }) {
    return selector.charAt(0) === "." && suitRegex.test(selector);
  },
};

module.exports = function getRulesMatcher(value = "bem") {
  if (typeof value === "function") {
    return value;
  }

  switch (value) {
    case "suit":
      return matchers.suit;
    case "bem":
    default:
      return matchers.bem;
  }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1613828895872, function(require, module, exports) {
const resetSizes = {
  margin: 0,
  padding: 0,
  border: 0,
  fontSize: "100%",
  font: "inherit",
  verticalAlign: "baseline",
};

function isObject(variable) {
  return variable !== null && typeof variable === "object";
}

module.exports = function getReset(value = "initial") {
  if (isObject(value)) {
    return value;
  }
  switch (value) {
    case "sizes":
      return resetSizes;
    case "initial":
    default:
      return { all: "initial" };
  }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1613828895873, function(require, module, exports) {
const postcss = require("postcss");
const jsToCss = require("postcss-js/parser");
const Input = require("postcss/lib/input");

const source = {
  input: new Input("", { from: "postcss-autoreset" }),
  start: { line: 1, column: 1 },
  end: { line: 1, column: 1 },
};

function createResetRule(selectors, reset) {
  const selector = selectors.map((s) => s.trim()).join(",\n");
  const resetRule = postcss.rule({
    selector,
    source,
    raws: { between: " " },
  });
  const root = jsToCss(reset);
  root.each((node) => {
    node.source = resetRule.source;
  });
  resetRule.append(root);
  return resetRule;
}

module.exports = createResetRule;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1613828895869);
})()
//# sourceMappingURL=index.js.map