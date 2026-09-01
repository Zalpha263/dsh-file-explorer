window.__ModuleLoader__.load({
	id: "dsh-file-explorer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");

		/*__HLJS_BEGIN__*/
/* 内联 highlight.js v11.12.0（core + 34 种语言）——
   由 tools/inline-hljs.mjs 生成，勿手改；升级 hljs 后重跑该工具。 */
const hljs = (() => {
	const _core = (function (module) {
/* eslint-disable no-multi-assign */

function deepFreeze(obj) {
  if (obj instanceof Map) {
    obj.clear =
      obj.delete =
      obj.set =
        function () {
          throw new Error('map is read-only');
        };
  } else if (obj instanceof Set) {
    obj.add =
      obj.clear =
      obj.delete =
        function () {
          throw new Error('set is read-only');
        };
  }

  // Freeze self
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((name) => {
    const prop = obj[name];
    const type = typeof prop;

    // Freeze prop if it is an object or function and also not already frozen
    if ((type === 'object' || type === 'function') && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });

  return obj;
}

/** @typedef {import('highlight.js').CallbackResponse} CallbackResponse */
/** @typedef {import('highlight.js').CompiledMode} CompiledMode */
/** @implements CallbackResponse */

class Response {
  /**
   * @param {CompiledMode} mode
   */
  constructor(mode) {
    // eslint-disable-next-line no-undefined
    if (mode.data === undefined) mode.data = {};

    this.data = mode.data;
    this.isMatchIgnored = false;
  }

  ignoreMatch() {
    this.isMatchIgnored = true;
  }
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHTML(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * performs a shallow merge of multiple objects into one
 *
 * @template T
 * @param {T} original
 * @param {Record<string,any>[]} objects
 * @returns {T} a single new object
 */
function inherit$1(original, ...objects) {
  /** @type Record<string,any> */
  const result = Object.create(null);

  for (const key in original) {
    result[key] = original[key];
  }
  objects.forEach(function(obj) {
    for (const key in obj) {
      result[key] = obj[key];
    }
  });
  return /** @type {T} */ (result);
}

/**
 * @typedef {object} Renderer
 * @property {(text: string) => void} addText
 * @property {(node: Node) => void} openNode
 * @property {(node: Node) => void} closeNode
 * @property {() => string} value
 */

/** @typedef {{scope?: string, language?: string, sublanguage?: boolean}} Node */
/** @typedef {{walk: (r: Renderer) => void}} Tree */
/** */

const SPAN_CLOSE = '</span>';

/**
 * Determines if a node needs to be wrapped in <span>
 *
 * @param {Node} node */
const emitsWrappingTags = (node) => {
  // rarely we can have a sublanguage where language is undefined
  // TODO: track down why
  return !!node.scope;
};

/**
 *
 * @param {string} name
 * @param {{prefix:string}} options
 */
const scopeToCSSClass = (name, { prefix }) => {
  // sub-language
  if (name.startsWith("language:")) {
    return name.replace("language:", "language-");
  }
  // tiered scope: comment.line
  if (name.includes(".")) {
    const pieces = name.split(".");
    return [
      `${prefix}${pieces.shift()}`,
      ...(pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`))
    ].join(" ");
  }
  // simple scope
  return `${prefix}${name}`;
};

/** @type {Renderer} */
class HTMLRenderer {
  /**
   * Creates a new HTMLRenderer
   *
   * @param {Tree} parseTree - the parse tree (must support `walk` API)
   * @param {{classPrefix: string}} options
   */
  constructor(parseTree, options) {
    this.buffer = "";
    this.classPrefix = options.classPrefix;
    parseTree.walk(this);
  }

  /**
   * Adds texts to the output stream
   *
   * @param {string} text */
  addText(text) {
    this.buffer += escapeHTML(text);
  }

  /**
   * Adds a node open to the output stream (if needed)
   *
   * @param {Node} node */
  openNode(node) {
    if (!emitsWrappingTags(node)) return;

    const className = scopeToCSSClass(node.scope,
      { prefix: this.classPrefix });
    this.span(className);
  }

  /**
   * Adds a node close to the output stream (if needed)
   *
   * @param {Node} node */
  closeNode(node) {
    if (!emitsWrappingTags(node)) return;

    this.buffer += SPAN_CLOSE;
  }

  /**
   * returns the accumulated buffer
  */
  value() {
    return this.buffer;
  }

  // helpers

  /**
   * Builds a span element
   *
   * @param {string} className */
  span(className) {
    this.buffer += `<span class="${className}">`;
  }
}

/** @typedef {{scope?: string, language?: string, children: Node[]} | string} Node */
/** @typedef {{scope?: string, language?: string, children: Node[]} } DataNode */
/** @typedef {import('highlight.js').Emitter} Emitter */
/**  */

/** @returns {DataNode} */
const newNode = (opts = {}) => {
  /** @type DataNode */
  const result = { children: [] };
  Object.assign(result, opts);
  return result;
};

class TokenTree {
  constructor() {
    /** @type DataNode */
    this.rootNode = newNode();
    this.stack = [this.rootNode];
  }

  get top() {
    return this.stack[this.stack.length - 1];
  }

  get root() { return this.rootNode; }

  /** @param {Node} node */
  add(node) {
    this.top.children.push(node);
  }

  /** @param {string} scope */
  openNode(scope) {
    /** @type Node */
    const node = newNode({ scope });
    this.add(node);
    this.stack.push(node);
  }

  closeNode() {
    if (this.stack.length > 1) {
      return this.stack.pop();
    }
    // eslint-disable-next-line no-undefined
    return undefined;
  }

  closeAllNodes() {
    while (this.closeNode());
  }

  toJSON() {
    return JSON.stringify(this.rootNode, null, 4);
  }

  /**
   * @typedef { import("./html_renderer").Renderer } Renderer
   * @param {Renderer} builder
   */
  walk(builder) {
    // this does not
    return this.constructor._walk(builder, this.rootNode);
    // this works
    // return TokenTree._walk(builder, this.rootNode);
  }

  /**
   * @param {Renderer} builder
   * @param {Node} node
   */
  static _walk(builder, node) {
    if (typeof node === "string") {
      builder.addText(node);
    } else if (node.children) {
      builder.openNode(node);
      node.children.forEach((child) => this._walk(builder, child));
      builder.closeNode(node);
    }
    return builder;
  }

  /**
   * @param {Node} node
   */
  static _collapse(node) {
    if (typeof node === "string") return;
    if (!node.children) return;

    if (node.children.every(el => typeof el === "string")) {
      // node.text = node.children.join("");
      // delete node.children;
      node.children = [node.children.join("")];
    } else {
      node.children.forEach((child) => {
        TokenTree._collapse(child);
      });
    }
  }
}

/**
  Currently this is all private API, but this is the minimal API necessary
  that an Emitter must implement to fully support the parser.

  Minimal interface:

  - addText(text)
  - __addSublanguage(emitter, subLanguageName)
  - startScope(scope)
  - endScope()
  - finalize()
  - toHTML()

*/

/**
 * @implements {Emitter}
 */
class TokenTreeEmitter extends TokenTree {
  /**
   * @param {*} options
   */
  constructor(options) {
    super();
    this.options = options;
  }

  /**
   * @param {string} text
   */
  addText(text) {
    if (text === "") { return; }

    this.add(text);
  }

  /** @param {string} scope */
  startScope(scope) {
    this.openNode(scope);
  }

  endScope() {
    this.closeNode();
  }

  /**
   * @param {Emitter & {root: DataNode}} emitter
   * @param {string} name
   */
  __addSublanguage(emitter, name) {
    /** @type DataNode */
    const node = emitter.root;
    if (name) node.scope = `language:${name}`;

    this.add(node);
  }

  toHTML() {
    const renderer = new HTMLRenderer(this, this.options);
    return renderer.value();
  }

  finalize() {
    this.closeAllNodes();
    return true;
  }
}

/**
 * @param {string} value
 * @returns {RegExp}
 * */

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function source(re) {
  if (!re) return null;
  if (typeof re === "string") return re;

  return re.source;
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function lookahead(re) {
  return concat('(?=', re, ')');
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function anyNumberOfTimes(re) {
  return concat('(?:', re, ')*');
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function optional(re) {
  return concat('(?:', re, ')?');
}

/**
 * @param {...(RegExp | string) } args
 * @returns {string}
 */
function concat(...args) {
  const joined = args.map((x) => source(x)).join("");
  return joined;
}

/**
 * @param { Array<string | RegExp | Object> } args
 * @returns {object}
 */
function stripOptionsFromArgs(args) {
  const opts = args[args.length - 1];

  if (typeof opts === 'object' && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}

/** @typedef { {capture?: boolean} } RegexEitherOptions */

/**
 * Any of the passed expresssions may match
 *
 * Creates a huge this | this | that | that match
 * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
 * @returns {string}
 */
function either(...args) {
  /** @type { object & {capture?: boolean} }  */
  const opts = stripOptionsFromArgs(args);
  const joined = '('
    + (opts.capture ? "" : "?:")
    + args.map((x) => source(x)).join("|") + ")";
  return joined;
}

/**
 * @param {RegExp | string} re
 * @returns {number}
 */
function countMatchGroups(re) {
  return (new RegExp(re.toString() + '|')).exec('').length - 1;
}

/**
 * Does lexeme start with a regular expression match at the beginning
 * @param {RegExp} re
 * @param {string} lexeme
 */
function startsWith(re, lexeme) {
  const match = re && re.exec(lexeme);
  return match && match.index === 0;
}

// BACKREF_RE matches an open parenthesis or backreference. To avoid an
// incorrect parse, it also matches the constructs where the meaning of
// parentheses, escapes, or capture counting changes.
const BACKREF_RE = new RegExp(either(
  /\[(?:[^\\\]]|\\.)*\]/, // a character class, inside which ( and \ lose their meaning
  /\(\?<(?![=!])[^>]+>/, // a named capture group `(?<name>` (not a lookbehind `(?<=` / `(?<!`)
  /\(\?'[^']+'/, // a named capture group `(?'name'`
  /\(\??/, // an opening parenthesis, capturing or non-capturing / lookahead
  /\\([1-9][0-9]*)/, // a backreference like `\1`
  /\\./ // any other escape sequence
));

// **INTERNAL** Not intended for outside usage
// join logically computes regexps.join(separator), but fixes the
// backreferences so they continue to match.
// it also places each individual regular expression into it's own
// match group, keeping track of the sequencing of those match groups
// is currently an exercise for the caller. :-)
/**
 * @param {(string | RegExp)[]} regexps
 * @param {{joinWith: string}} opts
 * @returns {string}
 */
function _rewriteBackreferences(regexps, { joinWith }) {
  let numCaptures = 0;

  return regexps.map((regex) => {
    numCaptures += 1;
    const offset = numCaptures;
    let re = source(regex);
    let out = '';

    while (re.length > 0) {
      const match = BACKREF_RE.exec(re);
      if (!match) {
        out += re;
        break;
      }
      out += re.substring(0, match.index);
      re = re.substring(match.index + match[0].length);
      if (match[0][0] === '\\' && match[1]) {
        // Adjust the backreference.
        out += '\\' + String(Number(match[1]) + offset);
      } else {
        out += match[0];
        if (match[0] === '(' || /^\(\?[<']/.test(match[0])) {
          numCaptures++;
        }
      }
    }
    return out;
  }).map(re => `(${re})`).join(joinWith);
}

/** @typedef {import('highlight.js').Mode} Mode */
/** @typedef {import('highlight.js').ModeCallback} ModeCallback */

// Common regexps
const MATCH_NOTHING_RE = /\b\B/;
const IDENT_RE = '[a-zA-Z]\\w*';
const UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
const NUMBER_RE = '\\b\\d+(\\.\\d+)?';
const C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
const BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
const RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

/**
* @param { Partial<Mode> & {binary?: string | RegExp} } opts
*/
const SHEBANG = (opts = {}) => {
  const beginShebang = /^#![ ]*\//;
  if (opts.binary) {
    opts.begin = concat(
      beginShebang,
      /.*\b/,
      opts.binary,
      /\b.*/);
  }
  return inherit$1({
    scope: 'meta',
    begin: beginShebang,
    end: /$/,
    relevance: 0,
    /** @type {ModeCallback} */
    "on:begin": (m, resp) => {
      if (m.index !== 0) resp.ignoreMatch();
    }
  }, opts);
};

// Common modes
const BACKSLASH_ESCAPE = {
  begin: '\\\\[\\s\\S]', relevance: 0
};
const APOS_STRING_MODE = {
  scope: 'string',
  begin: '\'',
  end: '\'',
  illegal: '\\n',
  contains: [BACKSLASH_ESCAPE]
};
const QUOTE_STRING_MODE = {
  scope: 'string',
  begin: '"',
  end: '"',
  illegal: '\\n',
  contains: [BACKSLASH_ESCAPE]
};
const PHRASAL_WORDS_MODE = {
  begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
};
/**
 * Creates a comment mode
 *
 * @param {string | RegExp} begin
 * @param {string | RegExp} end
 * @param {Mode | {}} [modeOptions]
 * @returns {Partial<Mode>}
 */
const COMMENT = function(begin, end, modeOptions = {}) {
  const mode = inherit$1(
    {
      scope: 'comment',
      begin,
      end,
      contains: []
    },
    modeOptions
  );
  mode.contains.push({
    scope: 'doctag',
    // hack to avoid the space from being included. the space is necessary to
    // match here to prevent the plain text rule below from gobbling up doctags
    begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
    end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
    excludeBegin: true,
    relevance: 0
  });
  const ENGLISH_WORD = either(
    // list of common 1 and 2 letter words in English
    "I",
    "a",
    "is",
    "so",
    "us",
    "to",
    "at",
    "if",
    "in",
    "it",
    "on",
    // note: this is not an exhaustive list of contractions, just popular ones
    /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, // contractions - can't we'd they're let's, etc
    /[A-Za-z]+[-][a-z]+/, // `no-way`, etc.
    /[A-Za-z][a-z]{2,}/ // allow capitalized words at beginning of sentences
  );
  // looking like plain text, more likely to be a comment
  mode.contains.push(
    {
      // TODO: how to include ", (, ) without breaking grammars that use these for
      // comment delimiters?
      // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
      // ---

      // this tries to find sequences of 3 english words in a row (without any
      // "programming" type syntax) this gives us a strong signal that we've
      // TRULY found a comment - vs perhaps scanning with the wrong language.
      // It's possible to find something that LOOKS like the start of the
      // comment - but then if there is no readable text - good chance it is a
      // false match and not a comment.
      //
      // for a visual example please see:
      // https://github.com/highlightjs/highlight.js/issues/2827

      begin: concat(
        /[ ]+/, // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
        '(',
        ENGLISH_WORD,
        /[.]?[:]?([.][ ]|[ ])/,
        '){3}') // look for 3 words in a row
    }
  );
  return mode;
};
const C_LINE_COMMENT_MODE = COMMENT('//', '$');
const C_BLOCK_COMMENT_MODE = COMMENT('/\\*', '\\*/');
const HASH_COMMENT_MODE = COMMENT('#', '$');
const NUMBER_MODE = {
  scope: 'number',
  begin: NUMBER_RE,
  relevance: 0
};
const C_NUMBER_MODE = {
  scope: 'number',
  begin: C_NUMBER_RE,
  relevance: 0
};
const BINARY_NUMBER_MODE = {
  scope: 'number',
  begin: BINARY_NUMBER_RE,
  relevance: 0
};
const REGEXP_MODE = {
  scope: "regexp",
  begin: /\/(?=[^/\n]*\/)/,
  end: /\/[gimuy]*/,
  contains: [
    BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [BACKSLASH_ESCAPE]
    }
  ]
};
const TITLE_MODE = {
  scope: 'title',
  begin: IDENT_RE,
  relevance: 0
};
const UNDERSCORE_TITLE_MODE = {
  scope: 'title',
  begin: UNDERSCORE_IDENT_RE,
  relevance: 0
};
const METHOD_GUARD = {
  // excludes method names from keyword processing
  begin: '\\.\\s*' + UNDERSCORE_IDENT_RE,
  relevance: 0
};

/**
 * Adds end same as begin mechanics to a mode
 *
 * Your mode must include at least a single () match group as that first match
 * group is what is used for comparison
 * @param {Partial<Mode>} mode
 */
const END_SAME_AS_BEGIN = function(mode) {
  return Object.assign(mode,
    {
      /** @type {ModeCallback} */
      'on:begin': (m, resp) => { resp.data._beginMatch = m[1]; },
      /** @type {ModeCallback} */
      'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); }
    });
};

var MODES = /*#__PURE__*/Object.freeze({
  __proto__: null,
  APOS_STRING_MODE: APOS_STRING_MODE,
  BACKSLASH_ESCAPE: BACKSLASH_ESCAPE,
  BINARY_NUMBER_MODE: BINARY_NUMBER_MODE,
  BINARY_NUMBER_RE: BINARY_NUMBER_RE,
  COMMENT: COMMENT,
  C_BLOCK_COMMENT_MODE: C_BLOCK_COMMENT_MODE,
  C_LINE_COMMENT_MODE: C_LINE_COMMENT_MODE,
  C_NUMBER_MODE: C_NUMBER_MODE,
  C_NUMBER_RE: C_NUMBER_RE,
  END_SAME_AS_BEGIN: END_SAME_AS_BEGIN,
  HASH_COMMENT_MODE: HASH_COMMENT_MODE,
  IDENT_RE: IDENT_RE,
  MATCH_NOTHING_RE: MATCH_NOTHING_RE,
  METHOD_GUARD: METHOD_GUARD,
  NUMBER_MODE: NUMBER_MODE,
  NUMBER_RE: NUMBER_RE,
  PHRASAL_WORDS_MODE: PHRASAL_WORDS_MODE,
  QUOTE_STRING_MODE: QUOTE_STRING_MODE,
  REGEXP_MODE: REGEXP_MODE,
  RE_STARTERS_RE: RE_STARTERS_RE,
  SHEBANG: SHEBANG,
  TITLE_MODE: TITLE_MODE,
  UNDERSCORE_IDENT_RE: UNDERSCORE_IDENT_RE,
  UNDERSCORE_TITLE_MODE: UNDERSCORE_TITLE_MODE
});

/**
@typedef {import('highlight.js').CallbackResponse} CallbackResponse
@typedef {import('highlight.js').CompilerExt} CompilerExt
*/

// Grammar extensions / plugins
// See: https://github.com/highlightjs/highlight.js/issues/2833

// Grammar extensions allow "syntactic sugar" to be added to the grammar modes
// without requiring any underlying changes to the compiler internals.

// `compileMatch` being the perfect small example of now allowing a grammar
// author to write `match` when they desire to match a single expression rather
// than being forced to use `begin`.  The extension then just moves `match` into
// `begin` when it runs.  Ie, no features have been added, but we've just made
// the experience of writing (and reading grammars) a little bit nicer.

// ------

// TODO: We need negative look-behind support to do this properly
/**
 * Skip a match if it has a preceding dot
 *
 * This is used for `beginKeywords` to prevent matching expressions such as
 * `bob.keyword.do()`. The mode compiler automatically wires this up as a
 * special _internal_ 'on:begin' callback for modes with `beginKeywords`
 * @param {RegExpMatchArray} match
 * @param {CallbackResponse} response
 */
function skipIfHasPrecedingDot(match, response) {
  const before = match.input[match.index - 1];
  if (before === ".") {
    response.ignoreMatch();
  }
}

/**
 *
 * @type {CompilerExt}
 */
function scopeClassName(mode, _parent) {
  // eslint-disable-next-line no-undefined
  if (mode.className !== undefined) {
    mode.scope = mode.className;
    delete mode.className;
  }
}

/**
 * `beginKeywords` syntactic sugar
 * @type {CompilerExt}
 */
function beginKeywords(mode, parent) {
  if (!parent) return;
  if (!mode.beginKeywords) return;

  // for languages with keywords that include non-word characters checking for
  // a word boundary is not sufficient, so instead we check for a word boundary
  // or whitespace - this does no harm in any case since our keyword engine
  // doesn't allow spaces in keywords anyways and we still check for the boundary
  // first
  mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)';
  mode.__beforeBegin = skipIfHasPrecedingDot;
  mode.keywords = mode.keywords || mode.beginKeywords;
  delete mode.beginKeywords;

  // prevents double relevance, the keywords themselves provide
  // relevance, the mode doesn't need to double it
  // eslint-disable-next-line no-undefined
  if (mode.relevance === undefined) mode.relevance = 0;
}

/**
 * Allow `illegal` to contain an array of illegal values
 * @type {CompilerExt}
 */
function compileIllegal(mode, _parent) {
  if (!Array.isArray(mode.illegal)) return;

  mode.illegal = either(...mode.illegal);
}

/**
 * `match` to match a single expression for readability
 * @type {CompilerExt}
 */
function compileMatch(mode, _parent) {
  if (!mode.match) return;
  if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");

  mode.begin = mode.match;
  delete mode.match;
}

/**
 * provides the default 1 relevance to all modes
 * @type {CompilerExt}
 */
function compileRelevance(mode, _parent) {
  // eslint-disable-next-line no-undefined
  if (mode.relevance === undefined) mode.relevance = 1;
}

// allow beforeMatch to act as a "qualifier" for the match
// the full match begin must be [beforeMatch][begin]
const beforeMatchExt = (mode, parent) => {
  if (!mode.beforeMatch) return;
  // starts conflicts with endsParent which we need to make sure the child
  // rule is not matched multiple times
  if (mode.starts) throw new Error("beforeMatch cannot be used with starts");

  const originalMode = Object.assign({}, mode);
  Object.keys(mode).forEach((key) => { delete mode[key]; });

  mode.keywords = originalMode.keywords;
  mode.begin = concat(originalMode.beforeMatch, lookahead(originalMode.begin));
  mode.starts = {
    relevance: 0,
    contains: [
      Object.assign(originalMode, { endsParent: true })
    ]
  };
  mode.relevance = 0;

  delete originalMode.beforeMatch;
};

// keywords that should have no default relevance value
const COMMON_KEYWORDS = [
  'of',
  'and',
  'for',
  'in',
  'not',
  'or',
  'if',
  'then',
  'parent', // common variable name
  'list', // common variable name
  'value' // common variable name
];

const DEFAULT_KEYWORD_SCOPE = "keyword";

/**
 * Given raw keywords from a language definition, compile them.
 *
 * @param {string | Record<string,string|string[]> | Array<string>} rawKeywords
 * @param {boolean} caseInsensitive
 */
function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
  /** @type {import("highlight.js/private").KeywordDict} */
  const compiledKeywords = Object.create(null);

  // input can be a string of keywords, an array of keywords, or a object with
  // named keys representing scopeName (which can then point to a string or array)
  if (typeof rawKeywords === 'string') {
    compileList(scopeName, rawKeywords.split(" "));
  } else if (Array.isArray(rawKeywords)) {
    compileList(scopeName, rawKeywords);
  } else {
    Object.keys(rawKeywords).forEach(function(scopeName) {
      // collapse all our objects back into the parent object
      Object.assign(
        compiledKeywords,
        compileKeywords(rawKeywords[scopeName], caseInsensitive, scopeName)
      );
    });
  }
  return compiledKeywords;

  // ---

  /**
   * Compiles an individual list of keywords
   *
   * Ex: "for if when while|5"
   *
   * @param {string} scopeName
   * @param {Array<string>} keywordList
   */
  function compileList(scopeName, keywordList) {
    if (caseInsensitive) {
      keywordList = keywordList.map(x => x.toLowerCase());
    }
    keywordList.forEach(function(keyword) {
      const pair = keyword.split('|');
      compiledKeywords[pair[0]] = [scopeName, scoreForKeyword(pair[0], pair[1])];
    });
  }
}

/**
 * Returns the proper score for a given keyword
 *
 * Also takes into account comment keywords, which will be scored 0 UNLESS
 * another score has been manually assigned.
 * @param {string} keyword
 * @param {string} [providedScore]
 */
function scoreForKeyword(keyword, providedScore) {
  // manual scores always win over common keywords
  // so you can force a score of 1 if you really insist
  if (providedScore) {
    return Number(providedScore);
  }

  return commonKeyword(keyword) ? 0 : 1;
}

/**
 * Determines if a given keyword is common or not
 *
 * @param {string} keyword */
function commonKeyword(keyword) {
  return COMMON_KEYWORDS.includes(keyword.toLowerCase());
}

/*

For the reasoning behind this please see:
https://github.com/highlightjs/highlight.js/issues/2880#issuecomment-747275419

*/

/**
 * @type {Record<string, boolean>}
 */
const seenDeprecations = {};

/**
 * @param {string} message
 */
const error = (message) => {
  console.error(message);
};

/**
 * @param {string} message
 * @param {any} args
 */
const warn = (message, ...args) => {
  console.log(`WARN: ${message}`, ...args);
};

/**
 * @param {string} version
 * @param {string} message
 */
const deprecated = (version, message) => {
  if (seenDeprecations[`${version}/${message}`]) return;

  console.log(`Deprecated as of ${version}. ${message}`);
  seenDeprecations[`${version}/${message}`] = true;
};

/* eslint-disable no-throw-literal */

/**
@typedef {import('highlight.js').CompiledMode} CompiledMode
*/

const MultiClassError = new Error();

/**
 * Renumbers labeled scope names to account for additional inner match
 * groups that otherwise would break everything.
 *
 * Lets say we 3 match scopes:
 *
 *   { 1 => ..., 2 => ..., 3 => ... }
 *
 * So what we need is a clean match like this:
 *
 *   (a)(b)(c) => [ "a", "b", "c" ]
 *
 * But this falls apart with inner match groups:
 *
 * (a)(((b)))(c) => ["a", "b", "b", "b", "c" ]
 *
 * Our scopes are now "out of alignment" and we're repeating `b` 3 times.
 * What needs to happen is the numbers are remapped:
 *
 *   { 1 => ..., 2 => ..., 5 => ... }
 *
 * We also need to know that the ONLY groups that should be output
 * are 1, 2, and 5.  This function handles this behavior.
 *
 * @param {CompiledMode} mode
 * @param {Array<RegExp | string>} regexes
 * @param {{key: "beginScope"|"endScope"}} opts
 */
function remapScopeNames(mode, regexes, { key }) {
  let offset = 0;
  const scopeNames = mode[key];
  /** @type Record<number,boolean> */
  const emit = {};
  /** @type Record<number,string> */
  const positions = {};

  for (let i = 1; i <= regexes.length; i++) {
    positions[i + offset] = scopeNames[i];
    emit[i + offset] = true;
    offset += countMatchGroups(regexes[i - 1]);
  }
  // we use _emit to keep track of which match groups are "top-level" to avoid double
  // output from inside match groups
  mode[key] = positions;
  mode[key]._emit = emit;
  mode[key]._multi = true;
}

/**
 * @param {CompiledMode} mode
 */
function beginMultiClass(mode) {
  if (!Array.isArray(mode.begin)) return;

  if (mode.skip || mode.excludeBegin || mode.returnBegin) {
    error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
    throw MultiClassError;
  }

  if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
    error("beginScope must be object");
    throw MultiClassError;
  }

  remapScopeNames(mode, mode.begin, { key: "beginScope" });
  mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
}

/**
 * @param {CompiledMode} mode
 */
function endMultiClass(mode) {
  if (!Array.isArray(mode.end)) return;

  if (mode.skip || mode.excludeEnd || mode.returnEnd) {
    error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
    throw MultiClassError;
  }

  if (typeof mode.endScope !== "object" || mode.endScope === null) {
    error("endScope must be object");
    throw MultiClassError;
  }

  remapScopeNames(mode, mode.end, { key: "endScope" });
  mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
}

/**
 * this exists only to allow `scope: {}` to be used beside `match:`
 * Otherwise `beginScope` would necessary and that would look weird

  {
    match: [ /def/, /\w+/ ]
    scope: { 1: "keyword" , 2: "title" }
  }

 * @param {CompiledMode} mode
 */
function scopeSugar(mode) {
  if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
    mode.beginScope = mode.scope;
    delete mode.scope;
  }
}

/**
 * @param {CompiledMode} mode
 */
function MultiClass(mode) {
  scopeSugar(mode);

  if (typeof mode.beginScope === "string") {
    mode.beginScope = { _wrap: mode.beginScope };
  }
  if (typeof mode.endScope === "string") {
    mode.endScope = { _wrap: mode.endScope };
  }

  beginMultiClass(mode);
  endMultiClass(mode);
}

/**
@typedef {import('highlight.js').Mode} Mode
@typedef {import('highlight.js').CompiledMode} CompiledMode
@typedef {import('highlight.js').Language} Language
@typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
@typedef {import('highlight.js').CompiledLanguage} CompiledLanguage
*/

// compilation

/**
 * Compiles a language definition result
 *
 * Given the raw result of a language definition (Language), compiles this so
 * that it is ready for highlighting code.
 * @param {Language} language
 * @returns {CompiledLanguage}
 */
function compileLanguage(language) {
  /**
   * Builds a regex with the case sensitivity of the current language
   *
   * @param {RegExp | string} value
   * @param {boolean} [global]
   */
  function langRe(value, global) {
    return new RegExp(
      source(value),
      'm'
      + (language.case_insensitive ? 'i' : '')
      + (language.unicodeRegex ? 'u' : '')
      + (global ? 'g' : '')
    );
  }

  /**
    Stores multiple regular expressions and allows you to quickly search for
    them all in a string simultaneously - returning the first match.  It does
    this by creating a huge (a|b|c) regex - each individual item wrapped with ()
    and joined by `|` - using match groups to track position.  When a match is
    found checking which position in the array has content allows us to figure
    out which of the original regexes / match groups triggered the match.

    The match object itself (the result of `Regex.exec`) is returned but also
    enhanced by merging in any meta-data that was registered with the regex.
    This is how we keep track of which mode matched, and what type of rule
    (`illegal`, `begin`, end, etc).
  */
  class MultiRegex {
    constructor() {
      this.matchIndexes = {};
      // @ts-ignore
      this.regexes = [];
      this.matchAt = 1;
      this.position = 0;
    }

    // @ts-ignore
    addRule(re, opts) {
      opts.position = this.position++;
      // @ts-ignore
      this.matchIndexes[this.matchAt] = opts;
      this.regexes.push([opts, re]);
      this.matchAt += countMatchGroups(re) + 1;
    }

    compile() {
      if (this.regexes.length === 0) {
        // avoids the need to check length every time exec is called
        // @ts-ignore
        this.exec = () => null;
      }
      const terminators = this.regexes.map(el => el[1]);
      this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: '|' }), true);
      this.lastIndex = 0;
    }

    /** @param {string} s */
    exec(s) {
      this.matcherRe.lastIndex = this.lastIndex;
      const match = this.matcherRe.exec(s);
      if (!match) { return null; }

      // eslint-disable-next-line no-undefined
      const i = match.findIndex((el, i) => i > 0 && el !== undefined);
      // @ts-ignore
      const matchData = this.matchIndexes[i];
      // trim off any earlier non-relevant match groups (ie, the other regex
      // match groups that make up the multi-matcher)
      match.splice(0, i);

      return Object.assign(match, matchData);
    }
  }

  /*
    Created to solve the key deficiently with MultiRegex - there is no way to
    test for multiple matches at a single location.  Why would we need to do
    that?  In the future a more dynamic engine will allow certain matches to be
    ignored.  An example: if we matched say the 3rd regex in a large group but
    decided to ignore it - we'd need to started testing again at the 4th
    regex... but MultiRegex itself gives us no real way to do that.

    So what this class creates MultiRegexs on the fly for whatever search
    position they are needed.

    NOTE: These additional MultiRegex objects are created dynamically.  For most
    grammars most of the time we will never actually need anything more than the
    first MultiRegex - so this shouldn't have too much overhead.

    Say this is our search group, and we match regex3, but wish to ignore it.

      regex1 | regex2 | regex3 | regex4 | regex5    ' ie, startAt = 0

    What we need is a new MultiRegex that only includes the remaining
    possibilities:

      regex4 | regex5                               ' ie, startAt = 3

    This class wraps all that complexity up in a simple API... `startAt` decides
    where in the array of expressions to start doing the matching. It
    auto-increments, so if a match is found at position 2, then startAt will be
    set to 3.  If the end is reached startAt will return to 0.

    MOST of the time the parser will be setting startAt manually to 0.
  */
  class ResumableMultiRegex {
    constructor() {
      // @ts-ignore
      this.rules = [];
      // @ts-ignore
      this.multiRegexes = [];
      this.count = 0;

      this.lastIndex = 0;
      this.regexIndex = 0;
    }

    // @ts-ignore
    getMatcher(index) {
      if (this.multiRegexes[index]) return this.multiRegexes[index];

      const matcher = new MultiRegex();
      this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
      matcher.compile();
      this.multiRegexes[index] = matcher;
      return matcher;
    }

    resumingScanAtSamePosition() {
      return this.regexIndex !== 0;
    }

    considerAll() {
      this.regexIndex = 0;
    }

    // @ts-ignore
    addRule(re, opts) {
      this.rules.push([re, opts]);
      if (opts.type === "begin") this.count++;
    }

    /** @param {string} s */
    exec(s) {
      const m = this.getMatcher(this.regexIndex);
      m.lastIndex = this.lastIndex;
      let result = m.exec(s);

      // The following is because we have no easy way to say "resume scanning at the
      // existing position but also skip the current rule ONLY". What happens is
      // all prior rules are also skipped which can result in matching the wrong
      // thing. Example of matching "booger":

      // our matcher is [string, "booger", number]
      //
      // ....booger....

      // if "booger" is ignored then we'd really need a regex to scan from the
      // SAME position for only: [string, number] but ignoring "booger" (if it
      // was the first match), a simple resume would scan ahead who knows how
      // far looking only for "number", ignoring potential string matches (or
      // future "booger" matches that might be valid.)

      // So what we do: We execute two matchers, one resuming at the same
      // position, but the second full matcher starting at the position after:

      //     /--- resume first regex match here (for [number])
      //     |/---- full match here for [string, "booger", number]
      //     vv
      // ....booger....

      // Which ever results in a match first is then used. So this 3-4 step
      // process essentially allows us to say "match at this position, excluding
      // a prior rule that was ignored".
      //
      // 1. Match "booger" first, ignore. Also proves that [string] does non match.
      // 2. Resume matching for [number]
      // 3. Match at index + 1 for [string, "booger", number]
      // 4. If #2 and #3 result in matches, which came first?
      if (this.resumingScanAtSamePosition()) {
        if (result && result.index === this.lastIndex) ; else { // use the second matcher result
          const m2 = this.getMatcher(0);
          m2.lastIndex = this.lastIndex + 1;
          result = m2.exec(s);
        }
      }

      if (result) {
        this.regexIndex += result.position + 1;
        if (this.regexIndex === this.count) {
          // wrap-around to considering all matches again
          this.considerAll();
        }
      }

      return result;
    }
  }

  /**
   * Given a mode, builds a huge ResumableMultiRegex that can be used to walk
   * the content and find matches.
   *
   * @param {CompiledMode} mode
   * @returns {ResumableMultiRegex}
   */
  function buildModeRegex(mode) {
    const mm = new ResumableMultiRegex();

    mode.contains.forEach(term => mm.addRule(term.begin, { rule: term, type: "begin" }));

    if (mode.terminatorEnd) {
      mm.addRule(mode.terminatorEnd, { type: "end" });
    }
    if (mode.illegal) {
      mm.addRule(mode.illegal, { type: "illegal" });
    }

    return mm;
  }

  /** skip vs abort vs ignore
   *
   * @skip   - The mode is still entered and exited normally (and contains rules apply),
   *           but all content is held and added to the parent buffer rather than being
   *           output when the mode ends.  Mostly used with `sublanguage` to build up
   *           a single large buffer than can be parsed by sublanguage.
   *
   *             - The mode begin ands ends normally.
   *             - Content matched is added to the parent mode buffer.
   *             - The parser cursor is moved forward normally.
   *
   * @abort  - A hack placeholder until we have ignore.  Aborts the mode (as if it
   *           never matched) but DOES NOT continue to match subsequent `contains`
   *           modes.  Abort is bad/suboptimal because it can result in modes
   *           farther down not getting applied because an earlier rule eats the
   *           content but then aborts.
   *
   *             - The mode does not begin.
   *             - Content matched by `begin` is added to the mode buffer.
   *             - The parser cursor is moved forward accordingly.
   *
   * @ignore - Ignores the mode (as if it never matched) and continues to match any
   *           subsequent `contains` modes.  Ignore isn't technically possible with
   *           the current parser implementation.
   *
   *             - The mode does not begin.
   *             - Content matched by `begin` is ignored.
   *             - The parser cursor is not moved forward.
   */

  /**
   * Compiles an individual mode
   *
   * This can raise an error if the mode contains certain detectable known logic
   * issues.
   * @param {Mode} mode
   * @param {CompiledMode | null} [parent]
   * @returns {CompiledMode | never}
   */
  function compileMode(mode, parent) {
    const cmode = /** @type CompiledMode */ (mode);
    if (mode.isCompiled) return cmode;

    [
      scopeClassName,
      // do this early so compiler extensions generally don't have to worry about
      // the distinction between match/begin
      compileMatch,
      MultiClass,
      beforeMatchExt
    ].forEach(ext => ext(mode, parent));

    language.compilerExtensions.forEach(ext => ext(mode, parent));

    // __beforeBegin is considered private API, internal use only
    mode.__beforeBegin = null;

    [
      beginKeywords,
      // do this later so compiler extensions that come earlier have access to the
      // raw array if they wanted to perhaps manipulate it, etc.
      compileIllegal,
      // default to 1 relevance if not specified
      compileRelevance
    ].forEach(ext => ext(mode, parent));

    mode.isCompiled = true;

    let keywordPattern = null;
    if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
      // we need a copy because keywords might be compiled multiple times
      // so we can't go deleting $pattern from the original on the first
      // pass
      mode.keywords = Object.assign({}, mode.keywords);
      keywordPattern = mode.keywords.$pattern;
      delete mode.keywords.$pattern;
    }
    keywordPattern = keywordPattern || /\w+/;

    if (mode.keywords) {
      mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
    }

    cmode.keywordPatternRe = langRe(keywordPattern, true);

    if (parent) {
      if (!mode.begin) mode.begin = /\B|\b/;
      cmode.beginRe = langRe(cmode.begin);
      if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
      if (mode.end) cmode.endRe = langRe(cmode.end);
      cmode.terminatorEnd = source(cmode.end) || '';
      if (mode.endsWithParent && parent.terminatorEnd) {
        cmode.terminatorEnd += (mode.end ? '|' : '') + parent.terminatorEnd;
      }
    }
    if (mode.illegal) cmode.illegalRe = langRe(/** @type {RegExp | string} */ (mode.illegal));
    if (!mode.contains) mode.contains = [];

    mode.contains = [].concat(...mode.contains.map(function(c) {
      return expandOrCloneMode(c === 'self' ? mode : c);
    }));
    mode.contains.forEach(function(c) { compileMode(/** @type Mode */ (c), cmode); });

    if (mode.starts) {
      compileMode(mode.starts, parent);
    }

    cmode.matcher = buildModeRegex(cmode);
    return cmode;
  }

  if (!language.compilerExtensions) language.compilerExtensions = [];

  // self is not valid at the top-level
  if (language.contains && language.contains.includes('self')) {
    throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
  }

  // we need a null object, which inherit will guarantee
  language.classNameAliases = inherit$1(language.classNameAliases || {});

  return compileMode(/** @type Mode */ (language));
}

/**
 * Determines if a mode has a dependency on it's parent or not
 *
 * If a mode does have a parent dependency then often we need to clone it if
 * it's used in multiple places so that each copy points to the correct parent,
 * where-as modes without a parent can often safely be re-used at the bottom of
 * a mode chain.
 *
 * @param {Mode | null} mode
 * @returns {boolean} - is there a dependency on the parent?
 * */
function dependencyOnParent(mode) {
  if (!mode) return false;

  return mode.endsWithParent || dependencyOnParent(mode.starts);
}

/**
 * Expands a mode or clones it if necessary
 *
 * This is necessary for modes with parental dependenceis (see notes on
 * `dependencyOnParent`) and for nodes that have `variants` - which must then be
 * exploded into their own individual modes at compile time.
 *
 * @param {Mode} mode
 * @returns {Mode | Mode[]}
 * */
function expandOrCloneMode(mode) {
  if (mode.variants && !mode.cachedVariants) {
    mode.cachedVariants = mode.variants.map(function(variant) {
      return inherit$1(mode, { variants: null }, variant);
    });
  }

  // EXPAND
  // if we have variants then essentially "replace" the mode with the variants
  // this happens in compileMode, where this function is called from
  if (mode.cachedVariants) {
    return mode.cachedVariants;
  }

  // CLONE
  // if we have dependencies on parents then we need a unique
  // instance of ourselves, so we can be reused with many
  // different parents without issue
  if (dependencyOnParent(mode)) {
    return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
  }

  if (Object.isFrozen(mode)) {
    return inherit$1(mode);
  }

  // no special dependency issues, just return ourselves
  return mode;
}

var version = "11.12.0";

class HTMLInjectionError extends Error {
  constructor(reason, html) {
    super(reason);
    this.name = "HTMLInjectionError";
    this.html = html;
  }
}

/*
Syntax highlighting with language autodetection.
https://highlightjs.org/
*/



/**
@typedef {import('highlight.js').Mode} Mode
@typedef {import('highlight.js').CompiledMode} CompiledMode
@typedef {import('highlight.js').CompiledScope} CompiledScope
@typedef {import('highlight.js').Language} Language
@typedef {import('highlight.js').HLJSApi} HLJSApi
@typedef {import('highlight.js').HLJSPlugin} HLJSPlugin
@typedef {import('highlight.js').PluginEvent} PluginEvent
@typedef {import('highlight.js').HLJSOptions} HLJSOptions
@typedef {import('highlight.js').LanguageFn} LanguageFn
@typedef {import('highlight.js').HighlightedHTMLElement} HighlightedHTMLElement
@typedef {import('highlight.js').BeforeHighlightContext} BeforeHighlightContext
@typedef {import('highlight.js/private').MatchType} MatchType
@typedef {import('highlight.js/private').KeywordData} KeywordData
@typedef {import('highlight.js/private').EnhancedMatch} EnhancedMatch
@typedef {import('highlight.js/private').AnnotatedError} AnnotatedError
@typedef {import('highlight.js').AutoHighlightResult} AutoHighlightResult
@typedef {import('highlight.js').HighlightOptions} HighlightOptions
@typedef {import('highlight.js').HighlightResult} HighlightResult
*/


const escape = escapeHTML;
const inherit = inherit$1;
const NO_MATCH = Symbol("nomatch");
const MAX_KEYWORD_HITS = 7;

/**
 * @param {any} hljs - object that is extended (legacy)
 * @returns {HLJSApi}
 */
const HLJS = function(hljs) {
  // Global internal variables used within the highlight.js library.
  /** @type {Record<string, Language>} */
  const languages = Object.create(null);
  /** @type {Record<string, string>} */
  const aliases = Object.create(null);
  /** @type {HLJSPlugin[]} */
  const plugins = [];

  // safe/production mode - swallows more errors, tries to keep running
  // even if a single syntax or parse hits a fatal error
  let SAFE_MODE = true;
  const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
  /** @type {Language} */
  const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: 'Plain text', contains: [] };

  // Global options used when within external APIs. This is modified when
  // calling the `hljs.configure` function.
  /** @type HLJSOptions */
  let options = {
    ignoreUnescapedHTML: false,
    throwUnescapedHTML: false,
    noHighlightRe: /^(no-?highlight)$/i,
    languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
    classPrefix: 'hljs-',
    cssSelector: 'pre code',
    languages: null,
    // beta configuration options, subject to change, welcome to discuss
    // https://github.com/highlightjs/highlight.js/issues/1086
    __emitter: TokenTreeEmitter
  };

  /* Utility functions */

  /**
   * Tests a language name to see if highlighting should be skipped
   * @param {string} languageName
   */
  function shouldNotHighlight(languageName) {
    return options.noHighlightRe.test(languageName);
  }

  /**
   * @param {HighlightedHTMLElement} block - the HTML element to determine language for
   */
  function blockLanguage(block) {
    let classes = block.className + ' ';

    classes += block.parentNode ? block.parentNode.className : '';

    // language-* takes precedence over non-prefixed class names.
    const match = options.languageDetectRe.exec(classes);
    if (match) {
      const language = getLanguage(match[1]);
      if (!language) {
        warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
        warn("Falling back to no-highlight mode for this block.", block);
      }
      return language ? match[1] : 'no-highlight';
    }

    return classes
      .split(/\s+/)
      .find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
  }

  /**
   * Core highlighting function.
   *
   * OLD API
   * highlight(lang, code, ignoreIllegals, continuation)
   *
   * NEW API
   * highlight(code, {lang, ignoreIllegals})
   *
   * @param {string} codeOrLanguageName - the language to use for highlighting
   * @param {string | HighlightOptions} optionsOrCode - the code to highlight
   * @param {boolean} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
   *
   * @returns {HighlightResult} Result - an object that represents the result
   * @property {string} language - the language name
   * @property {number} relevance - the relevance score
   * @property {string} value - the highlighted HTML code
   * @property {string} code - the original raw code
   * @property {CompiledMode} top - top of the current mode stack
   * @property {boolean} illegal - indicates whether any illegal matches were found
  */
  function highlight(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
    let code = "";
    let languageName = "";
    if (typeof optionsOrCode === "object") {
      code = codeOrLanguageName;
      ignoreIllegals = optionsOrCode.ignoreIllegals;
      languageName = optionsOrCode.language;
    } else {
      // old API
      deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
      deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
      languageName = codeOrLanguageName;
      code = optionsOrCode;
    }

    // https://github.com/highlightjs/highlight.js/issues/3149
    // eslint-disable-next-line no-undefined
    if (ignoreIllegals === undefined) { ignoreIllegals = true; }

    /** @type {BeforeHighlightContext} */
    const context = {
      code,
      language: languageName
    };
    // the plugin can change the desired language or the code to be highlighted
    // just be changing the object it was passed
    fire("before:highlight", context);

    // a before plugin can usurp the result completely by providing it's own
    // in which case we don't even need to call highlight
    const result = context.result
      ? context.result
      : _highlight(context.language, context.code, ignoreIllegals);

    result.code = context.code;
    // the plugin can change anything in result to suite it
    fire("after:highlight", result);

    return result;
  }

  /**
   * private highlight that's used internally and does not fire callbacks
   *
   * @param {string} languageName - the language to use for highlighting
   * @param {string} codeToHighlight - the code to highlight
   * @param {boolean?} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
   * @param {CompiledMode?} [continuation] - current continuation mode, if any
   * @returns {HighlightResult} - result of the highlight operation
  */
  function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
    const keywordHits = Object.create(null);

    /**
     * Return keyword data if a match is a keyword
     * @param {CompiledMode} mode - current mode
     * @param {string} matchText - the textual match
     * @returns {KeywordData | false}
     */
    function keywordData(mode, matchText) {
      return mode.keywords[matchText];
    }

    function processKeywords() {
      if (!top.keywords) {
        emitter.addText(modeBuffer);
        return;
      }

      let lastIndex = 0;
      top.keywordPatternRe.lastIndex = 0;
      let match = top.keywordPatternRe.exec(modeBuffer);
      let buf = "";

      while (match) {
        buf += modeBuffer.substring(lastIndex, match.index);
        const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
        const data = keywordData(top, word);
        if (data) {
          const [kind, keywordRelevance] = data;
          emitter.addText(buf);
          buf = "";

          keywordHits[word] = (keywordHits[word] || 0) + 1;
          if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
          if (kind.startsWith("_")) {
            // _ implied for relevance only, do not highlight
            // by applying a class name
            buf += match[0];
          } else {
            const cssClass = language.classNameAliases[kind] || kind;
            emitKeyword(match[0], cssClass);
          }
        } else {
          buf += match[0];
        }
        lastIndex = top.keywordPatternRe.lastIndex;
        match = top.keywordPatternRe.exec(modeBuffer);
      }
      buf += modeBuffer.substring(lastIndex);
      emitter.addText(buf);
    }

    function processSubLanguage() {
      if (modeBuffer === "") return;
      /** @type HighlightResult */
      let result = null;

      if (typeof top.subLanguage === 'string') {
        if (!languages[top.subLanguage]) {
          emitter.addText(modeBuffer);
          return;
        }
        result = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
        continuations[top.subLanguage] = /** @type {CompiledMode} */ (result._top);
      } else {
        result = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
      }

      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Use case in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      emitter.__addSublanguage(result._emitter, result.language);
    }

    function processBuffer() {
      if (top.subLanguage != null) {
        processSubLanguage();
      } else {
        processKeywords();
      }
      modeBuffer = '';
    }

    /**
     * @param {string} text
     * @param {string} scope
     */
    function emitKeyword(keyword, scope) {
      if (keyword === "") return;

      emitter.startScope(scope);
      emitter.addText(keyword);
      emitter.endScope();
    }

    /**
     * @param {CompiledScope} scope
     * @param {RegExpMatchArray} match
     */
    function emitMultiClass(scope, match) {
      let i = 1;
      const max = match.length - 1;
      while (i <= max) {
        if (!scope._emit[i]) { i++; continue; }
        const klass = language.classNameAliases[scope[i]] || scope[i];
        const text = match[i];
        if (klass) {
          emitKeyword(text, klass);
        } else {
          modeBuffer = text;
          processKeywords();
          modeBuffer = "";
        }
        i++;
      }
    }

    /**
     * @param {CompiledMode} mode - new mode to start
     * @param {RegExpMatchArray} match
     */
    function startNewMode(mode, match) {
      if (mode.scope && typeof mode.scope === "string") {
        emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
      }
      if (mode.beginScope) {
        // beginScope just wraps the begin match itself in a scope
        if (mode.beginScope._wrap) {
          emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
          modeBuffer = "";
        } else if (mode.beginScope._multi) {
          // at this point modeBuffer should just be the match
          emitMultiClass(mode.beginScope, match);
          modeBuffer = "";
        }
      }

      top = Object.create(mode, { parent: { value: top } });
      return top;
    }

    /**
     * @param {CompiledMode } mode - the mode to potentially end
     * @param {RegExpMatchArray} match - the latest match
     * @param {string} matchPlusRemainder - match plus remainder of content
     * @returns {CompiledMode | void} - the next mode, or if void continue on in current mode
     */
    function endOfMode(mode, match, matchPlusRemainder) {
      let matched = startsWith(mode.endRe, matchPlusRemainder);

      if (matched) {
        if (mode["on:end"]) {
          const resp = new Response(mode);
          mode["on:end"](match, resp);
          if (resp.isMatchIgnored) matched = false;
        }

        if (matched) {
          while (mode.endsParent && mode.parent) {
            mode = mode.parent;
          }
          return mode;
        }
      }
      // even if on:end fires an `ignore` it's still possible
      // that we might trigger the end node because of a parent mode
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, match, matchPlusRemainder);
      }
    }

    /**
     * Handle matching but then ignoring a sequence of text
     *
     * @param {string} lexeme - string containing full match text
     */
    function doIgnore(lexeme) {
      if (top.matcher.regexIndex === 0) {
        // no more regexes to potentially match here, so we move the cursor forward one
        // space
        modeBuffer += lexeme[0];
        return 1;
      } else {
        // no need to move the cursor, we still have additional regexes to try and
        // match at this very spot
        resumeScanAtSamePosition = true;
        return 0;
      }
    }

    /**
     * Handle the start of a new potential mode match
     *
     * @param {EnhancedMatch} match - the current match
     * @returns {number} how far to advance the parse cursor
     */
    function doBeginMatch(match) {
      const lexeme = match[0];
      const newMode = match.rule;

      const resp = new Response(newMode);
      // first internal before callbacks, then the public ones
      const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
      for (const cb of beforeCallbacks) {
        if (!cb) continue;
        cb(match, resp);
        if (resp.isMatchIgnored) return doIgnore(lexeme);
      }

      if (newMode.skip) {
        modeBuffer += lexeme;
      } else {
        if (newMode.excludeBegin) {
          modeBuffer += lexeme;
        }
        processBuffer();
        if (!newMode.returnBegin && !newMode.excludeBegin) {
          modeBuffer = lexeme;
        }
      }
      startNewMode(newMode, match);
      return newMode.returnBegin ? 0 : lexeme.length;
    }

    /**
     * Handle the potential end of mode
     *
     * @param {RegExpMatchArray} match - the current match
     */
    function doEndMatch(match) {
      const lexeme = match[0];
      const matchPlusRemainder = codeToHighlight.substring(match.index);

      const endMode = endOfMode(top, match, matchPlusRemainder);
      if (!endMode) { return NO_MATCH; }

      const origin = top;
      if (top.endScope && top.endScope._wrap) {
        processBuffer();
        emitKeyword(lexeme, top.endScope._wrap);
      } else if (top.endScope && top.endScope._multi) {
        processBuffer();
        emitMultiClass(top.endScope, match);
      } else if (origin.skip) {
        modeBuffer += lexeme;
      } else {
        if (!(origin.returnEnd || origin.excludeEnd)) {
          modeBuffer += lexeme;
        }
        processBuffer();
        if (origin.excludeEnd) {
          modeBuffer = lexeme;
        }
      }
      do {
        if (top.scope) {
          emitter.closeNode();
        }
        if (!top.skip && !top.subLanguage) {
          relevance += top.relevance;
        }
        top = top.parent;
      } while (top !== endMode.parent);
      if (endMode.starts) {
        startNewMode(endMode.starts, match);
      }
      return origin.returnEnd ? 0 : lexeme.length;
    }

    function processContinuations() {
      const list = [];
      for (let current = top; current !== language; current = current.parent) {
        if (current.scope) {
          list.unshift(current.scope);
        }
      }
      list.forEach(item => emitter.openNode(item));
    }

    /** @type {{type?: MatchType, index?: number, rule?: Mode}}} */
    let lastMatch = {};

    /**
     *  Process an individual match
     *
     * @param {string} textBeforeMatch - text preceding the match (since the last match)
     * @param {EnhancedMatch} [match] - the match itself
     */
    function processLexeme(textBeforeMatch, match) {
      const lexeme = match && match[0];

      // add non-matched text to the current mode buffer
      modeBuffer += textBeforeMatch;

      if (lexeme == null) {
        processBuffer();
        return 0;
      }

      // we've found a 0 width match and we're stuck, so we need to advance
      // this happens when we have badly behaved rules that have optional matchers to the degree that
      // sometimes they can end up matching nothing at all
      // Ref: https://github.com/highlightjs/highlight.js/issues/2140
      if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
        // spit the "skipped" character that our regex choked on back into the output sequence
        modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
        if (!SAFE_MODE) {
          /** @type {AnnotatedError} */
          const err = new Error(`0 width match regex (${languageName})`);
          err.languageName = languageName;
          err.badRule = lastMatch.rule;
          throw err;
        }
        return 1;
      }
      lastMatch = match;

      if (match.type === "begin") {
        return doBeginMatch(match);
      } else if (match.type === "illegal" && !ignoreIllegals) {
        // illegal match, we do not continue processing
        /** @type {AnnotatedError} */
        const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || '<unnamed>') + '"');
        err.mode = top;
        throw err;
      } else if (match.type === "end") {
        const processed = doEndMatch(match);
        if (processed !== NO_MATCH) {
          return processed;
        }
      }

      // edge case for when illegal matches $ (end of line/text) which is technically
      // a 0 width match but not a begin/end match so it's not caught by the
      // first handler (when `ignoreIllegals` is true)
      if (match.type === "illegal" && lexeme === "") {
        if (match.index === codeToHighlight.length) ; else {
          // matched literal `\n` (with `$`) so we must manually add the newline
          // itself to the modeBuffer so it is not lost when we advance the cursor
          modeBuffer += "\n";
        }
        return 1;
      }

      // infinite loops are BAD, this is a last ditch catch all. if we have a
      // decent number of iterations yet our index (cursor position in our
      // parsing) still 3x behind our index then something is very wrong
      // so we bail
      if (iterations > 100000 && iterations > match.index * 3) {
        const err = new Error('potential infinite loop, way more iterations than matches');
        throw err;
      }

      /*
      Why might be find ourselves here?  An potential end match that was
      triggered but could not be completed.  IE, `doEndMatch` returned NO_MATCH.
      (this could be because a callback requests the match be ignored, etc)

      This causes no real harm other than stopping a few times too many.
      */

      modeBuffer += lexeme;
      return lexeme.length;
    }

    const language = getLanguage(languageName);
    if (!language) {
      error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
      throw new Error('Unknown language: "' + languageName + '"');
    }

    const md = compileLanguage(language);
    let result = '';
    /** @type {CompiledMode} */
    let top = continuation || md;
    /** @type Record<string,CompiledMode> */
    const continuations = {}; // keep continuations for sub-languages
    const emitter = new options.__emitter(options);
    processContinuations();
    let modeBuffer = '';
    let relevance = 0;
    let index = 0;
    let iterations = 0;
    let resumeScanAtSamePosition = false;

    try {
      if (!language.__emitTokens) {
        top.matcher.considerAll();

        for (;;) {
          iterations++;
          if (resumeScanAtSamePosition) {
            // only regexes not matched previously will now be
            // considered for a potential match
            resumeScanAtSamePosition = false;
          } else {
            top.matcher.considerAll();
          }
          top.matcher.lastIndex = index;

          const match = top.matcher.exec(codeToHighlight);
          // console.log("match", match[0], match.rule && match.rule.begin)

          if (!match) break;

          const beforeMatch = codeToHighlight.substring(index, match.index);
          const processedCount = processLexeme(beforeMatch, match);
          index = match.index + processedCount;
        }
        processLexeme(codeToHighlight.substring(index));
      } else {
        language.__emitTokens(codeToHighlight, emitter);
      }

      emitter.finalize();
      result = emitter.toHTML();

      return {
        language: languageName,
        value: result,
        relevance,
        illegal: false,
        _emitter: emitter,
        _top: top
      };
    } catch (err) {
      if (err.message && err.message.includes('Illegal')) {
        return {
          language: languageName,
          value: escape(codeToHighlight),
          illegal: true,
          relevance: 0,
          _illegalBy: {
            message: err.message,
            index,
            context: codeToHighlight.slice(index - 100, index + 100),
            mode: err.mode,
            resultSoFar: result
          },
          _emitter: emitter
        };
      } else if (SAFE_MODE) {
        return {
          language: languageName,
          value: escape(codeToHighlight),
          illegal: false,
          relevance: 0,
          errorRaised: err,
          _emitter: emitter,
          _top: top
        };
      } else {
        throw err;
      }
    }
  }

  /**
   * returns a valid highlight result, without actually doing any actual work,
   * auto highlight starts with this and it's possible for small snippets that
   * auto-detection may not find a better match
   * @param {string} code
   * @returns {HighlightResult}
   */
  function justTextHighlightResult(code) {
    const result = {
      value: escape(code),
      illegal: false,
      relevance: 0,
      _top: PLAINTEXT_LANGUAGE,
      _emitter: new options.__emitter(options)
    };
    result._emitter.addText(code);
    return result;
  }

  /**
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - secondBest (object with the same structure for second-best heuristically
    detected language, may be absent)

    @param {string} code
    @param {Array<string>} [languageSubset]
    @returns {AutoHighlightResult}
  */
  function highlightAuto(code, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    const plaintext = justTextHighlightResult(code);

    const results = languageSubset.filter(getLanguage).filter(autoDetection).map(name =>
      _highlight(name, code, false)
    );
    results.unshift(plaintext); // plaintext is always an option

    const sorted = results.sort((a, b) => {
      // sort base on relevance
      if (a.relevance !== b.relevance) return b.relevance - a.relevance;

      // always award the tie to the base language
      // ie if C++ and Arduino are tied, it's more likely to be C++
      if (a.language && b.language) {
        if (getLanguage(a.language).supersetOf === b.language) {
          return 1;
        } else if (getLanguage(b.language).supersetOf === a.language) {
          return -1;
        }
      }

      // otherwise say they are equal, which has the effect of sorting on
      // relevance while preserving the original ordering - which is how ties
      // have historically been settled, ie the language that comes first always
      // wins in the case of a tie
      return 0;
    });

    const [best, secondBest] = sorted;

    /** @type {AutoHighlightResult} */
    const result = best;
    result.secondBest = secondBest;

    return result;
  }

  /**
   * Builds new class name for block given the language name
   *
   * @param {HTMLElement} element
   * @param {string} [currentLang]
   * @param {string} [resultLang]
   */
  function updateClassName(element, currentLang, resultLang) {
    const language = (currentLang && aliases[currentLang]) || resultLang;

    element.classList.add("hljs");
    element.classList.add(`language-${language}`);
  }

  /**
   * Applies highlighting to a DOM node containing code.
   *
   * @param {HighlightedHTMLElement} element - the HTML element to highlight
  */
  function highlightElement(element) {
    /** @type HTMLElement */
    let node = null;
    const language = blockLanguage(element);

    if (shouldNotHighlight(language)) return;

    fire("before:highlightElement",
      { el: element, language });

    if (element.dataset.highlighted) {
      console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
      return;
    }

    // we should be all text, no child nodes (unescaped HTML) - this is possibly
    // an HTML injection attack - it's likely too late if this is already in
    // production (the code has likely already done its damage by the time
    // we're seeing it)... but we yell loudly about this so that hopefully it's
    // more likely to be caught in development before making it to production
    if (element.children.length > 0) {
      if (!options.ignoreUnescapedHTML) {
        console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
        console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
        console.warn("The element with unescaped HTML:");
        console.warn(element);
      }
      if (options.throwUnescapedHTML) {
        const err = new HTMLInjectionError(
          "One of your code blocks includes unescaped HTML.",
          element.innerHTML
        );
        throw err;
      }
    }

    node = element;
    const text = node.textContent;
    const result = language ? highlight(text, { language, ignoreIllegals: true }) : highlightAuto(text);

    element.innerHTML = result.value;
    element.dataset.highlighted = "yes";
    updateClassName(element, language, result.language);
    element.result = {
      language: result.language,
      // TODO: remove with version 11.0
      re: result.relevance,
      relevance: result.relevance
    };
    if (result.secondBest) {
      element.secondBest = {
        language: result.secondBest.language,
        relevance: result.secondBest.relevance
      };
    }

    fire("after:highlightElement", { el: element, result, text });
  }

  /**
   * Updates highlight.js global options with the passed options
   *
   * @param {Partial<HLJSOptions>} userOptions
   */
  function configure(userOptions) {
    options = inherit(options, userOptions);
  }

  // TODO: remove v12, deprecated
  const initHighlighting = () => {
    highlightAll();
    deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
  };

  // TODO: remove v12, deprecated
  function initHighlightingOnLoad() {
    highlightAll();
    deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
  }

  let wantsHighlight = false;

  /**
   * auto-highlights all pre>code elements on the page
   */
  function highlightAll() {
    function boot() {
      // if a highlight was requested before DOM was loaded, do now
      highlightAll();
    }

    // if we are called too early in the loading process
    if (document.readyState === "loading") {
      // make sure the event listener is only added once
      if (!wantsHighlight) {
        window.addEventListener('DOMContentLoaded', boot, false);
      }
      wantsHighlight = true;
      return;
    }

    const blocks = document.querySelectorAll(options.cssSelector);
    blocks.forEach(highlightElement);
  }

  /**
   * Register a language grammar module
   *
   * @param {string} languageName
   * @param {LanguageFn} languageDefinition
   */
  function registerLanguage(languageName, languageDefinition) {
    let lang = null;
    try {
      lang = languageDefinition(hljs);
    } catch (error$1) {
      error("Language definition for '{}' could not be registered.".replace("{}", languageName));
      // hard or soft error
      if (!SAFE_MODE) { throw error$1; } else { error(error$1); }
      // languages that have serious errors are replaced with essentially a
      // "plaintext" stand-in so that the code blocks will still get normal
      // css classes applied to them - and one bad language won't break the
      // entire highlighter
      lang = PLAINTEXT_LANGUAGE;
    }
    // give it a temporary name if it doesn't have one in the meta-data
    if (!lang.name) lang.name = languageName;
    languages[languageName] = lang;
    lang.rawDefinition = languageDefinition.bind(null, hljs);

    if (lang.aliases) {
      registerAliases(lang.aliases, { languageName });
    }
  }

  /**
   * Remove a language grammar module
   *
   * @param {string} languageName
   */
  function unregisterLanguage(languageName) {
    delete languages[languageName];
    for (const alias of Object.keys(aliases)) {
      if (aliases[alias] === languageName) {
        delete aliases[alias];
      }
    }
  }

  /**
   * @returns {string[]} List of language internal names
   */
  function listLanguages() {
    return Object.keys(languages);
  }

  /**
   * @param {string} name - name of the language to retrieve
   * @returns {Language | undefined}
   */
  function getLanguage(name) {
    name = (name || '').toLowerCase();
    return languages[name] || languages[aliases[name]];
  }

  /**
   *
   * @param {string|string[]} aliasList - single alias or list of aliases
   * @param {{languageName: string}} opts
   */
  function registerAliases(aliasList, { languageName }) {
    if (typeof aliasList === 'string') {
      aliasList = [aliasList];
    }
    aliasList.forEach(alias => { aliases[alias.toLowerCase()] = languageName; });
  }

  /**
   * Determines if a given language has auto-detection enabled
   * @param {string} name - name of the language
   */
  function autoDetection(name) {
    const lang = getLanguage(name);
    return lang && !lang.disableAutodetect;
  }

  /**
   * Upgrades the old highlightBlock plugins to the new
   * highlightElement API
   * @param {HLJSPlugin} plugin
   */
  function upgradePluginAPI(plugin) {
    // TODO: remove with v12
    if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
      plugin["before:highlightElement"] = (data) => {
        plugin["before:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
    if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
      plugin["after:highlightElement"] = (data) => {
        plugin["after:highlightBlock"](
          Object.assign({ block: data.el }, data)
        );
      };
    }
  }

  /**
   * @param {HLJSPlugin} plugin
   */
  function addPlugin(plugin) {
    upgradePluginAPI(plugin);
    plugins.push(plugin);
  }

  /**
   * @param {HLJSPlugin} plugin
   */
  function removePlugin(plugin) {
    const index = plugins.indexOf(plugin);
    if (index !== -1) {
      plugins.splice(index, 1);
    }
  }

  /**
   *
   * @param {PluginEvent} event
   * @param {any} args
   */
  function fire(event, args) {
    const cb = event;
    plugins.forEach(function(plugin) {
      if (plugin[cb]) {
        plugin[cb](args);
      }
    });
  }

  /**
   * DEPRECATED
   * @param {HighlightedHTMLElement} el
   */
  function deprecateHighlightBlock(el) {
    deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
    deprecated("10.7.0", "Please use highlightElement now.");

    return highlightElement(el);
  }

  /* Interface definition */
  Object.assign(hljs, {
    highlight,
    highlightAuto,
    highlightAll,
    highlightElement,
    // TODO: Remove with v12 API
    highlightBlock: deprecateHighlightBlock,
    configure,
    initHighlighting,
    initHighlightingOnLoad,
    registerLanguage,
    unregisterLanguage,
    listLanguages,
    getLanguage,
    registerAliases,
    autoDetection,
    inherit,
    addPlugin,
    removePlugin
  });

  hljs.debugMode = function() { SAFE_MODE = false; };
  hljs.safeMode = function() { SAFE_MODE = true; };
  hljs.versionString = version;

  hljs.regex = {
    concat: concat,
    lookahead: lookahead,
    either: either,
    optional: optional,
    anyNumberOfTimes: anyNumberOfTimes
  };

  for (const key in MODES) {
    // @ts-ignore
    if (typeof MODES[key] === "object") {
      // @ts-ignore
      deepFreeze(MODES[key]);
    }
  }

  // merge all the modes/regexes into our main object
  Object.assign(hljs, MODES);

  return hljs;
};

// Other names for the variable may break build script
const highlight = HLJS({});

// returns a new instance of the highlighter to be used for extensions
// check https://github.com/wooorm/lowlight/issues/47
highlight.newInstance = () => HLJS({});

module.exports = highlight;
highlight.HighlightJS = highlight;
highlight.default = highlight;

	return module.exports;
})({ exports: {} });
	const _langs = [
	['javascript', (function (module) {
const IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';

const KEYWORDS = [
  "as", // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
];
const LITERALS = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
const TYPES = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];

const ERROR_TYPES = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];

const BUILT_IN_GLOBALS = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",

  "require",
  "exports",

  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];

const BUILT_IN_VARIABLES = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "self",
  "global" // Node.js
];

const BUILT_INS = [].concat(
  BUILT_IN_GLOBALS,
  TYPES,
  ERROR_TYPES
);

/*
Language: JavaScript
Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
Category: common, scripting, web
Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
*/


/** @type LanguageFn */
function javascript(hljs) {
  const regex = hljs.regex;
  /**
   * Takes a string like "<Booger" and checks to see
   * if we can find a matching "</Booger" later in the
   * content.
   * @param {RegExpMatchArray} match
   * @param {{after:number}} param1
   */
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };

  const IDENT_RE$1 = IDENT_RE;
  const FRAGMENT = {
    begin: '<>',
    end: '</>'
  };
  // to avoid some special cases inside isTrulyOpeningTag
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" ||
        // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
        ) {
        response.ignoreMatch();
        return;
      }

      // `<something>`
      // Quite possibly a tag, lets look for a matching closing tag...
      if (nextChar === ">") {
        // if we cannot find a matching closing tag, then we
        // will ignore it
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }

      // `<blah />` (self-closing)
      // handled by simpleSelfClosing rule

      let m;
      const afterMatch = match.input.substring(afterMatchIndex);

      // some more template typing stuff
      //  <T = any>(key?: string) => Modify<
      if ((m = afterMatch.match(/^\s*=/))) {
        response.ignoreMatch();
        return;
      }

      // `<From extends string>`
      // technically this could be HTML, but it smells like a type
      // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
      if ((m = afterMatch.match(/^\s+extends\s+/))) {
        if (m.index === 0) {
          response.ignoreMatch();
          // eslint-disable-next-line no-useless-return
          return;
        }
      }
    }
  };
  const KEYWORDS$1 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_INS,
    "variable.language": BUILT_IN_VARIABLES
  };

  // https://tc39.es/ecma262/#sec-literals-numeric-literals
  const decimalDigits = '[0-9](_?[0-9])*';
  const frac = `\\.(${decimalDigits})`;
  // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
  // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: 'number',
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
        `[eE][+-]?(${decimalDigits})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },

      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },

      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" },
    ],
    relevance: 0
  };

  const SUBST = {
    className: 'subst',
    begin: '\\$\\{',
    end: '\\}',
    keywords: KEYWORDS$1,
    contains: [] // defined later
  };
  const HTML_TEMPLATE = {
    begin: '\.?html`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'xml'
    }
  };
  const CSS_TEMPLATE = {
    begin: '\.?css`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'css'
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: '\.?gql`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'graphql'
    }
  };
  const TEMPLATE_STRING = {
    className: 'string',
    begin: '`',
    end: '`',
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    '\\*/',
    {
      relevance: 0,
      contains: [
        {
          begin: '(?=@[A-Za-z]+)',
          relevance: 0,
          contains: [
            {
              className: 'doctag',
              begin: '@[A-Za-z]+'
            },
            {
              className: 'type',
              begin: '\\{',
              end: '\\}',
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: 'variable',
              begin: IDENT_RE$1 + '(?=\\s*(-)|$)',
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER,
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS
    .concat({
      // we need to pair up {} inside our subst to prevent
      // it from ending too early by matching another }
      begin: /\{/,
      end: /\}/,
      keywords: KEYWORDS$1,
      contains: [
        "self"
      ].concat(SUBST_INTERNALS)
    });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: KEYWORDS$1,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: 'params',
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/, // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1,
    contains: PARAMS_CONTAINS
  };

  // ES6 classes
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      },

    ]
  };

  const CLASS_REFERENCE = {
    relevance: 0,
    match:
    regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/,
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES,
        ...ERROR_TYPES
      ]
    }
  };

  const USE_STRICT = {
    label: "use_strict",
    className: 'meta',
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };

  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$1,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [ PARAMS ],
    illegal: /%/
  };

  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };

  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }

  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS,
        "super",
        "import",
        "await",
      ].map(x => `${x}\\s*\\(`)),
      IDENT_RE$1, regex.lookahead(/\s*\(/)),
    className: "title.function",
    relevance: 0
  };

  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$1,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };

  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$1,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      { // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };

  const FUNC_LEAD_IN_RE = '(\\(' +
    '[^()]*(\\(' +
    '[^()]*(\\(' +
    '[^()]*' +
    '\\)[^()]*)*' +
    '\\)[^()]*)*' +
    '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';

  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/, /\s+/,
      IDENT_RE$1, /\s*/,
      /=\s*/,
      /(async\s*)?/, // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };

  return {
    name: 'JavaScript',
    aliases: ['js', 'jsx', 'mjs', 'cjs'],
    keywords: KEYWORDS$1,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-Za-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: 'attr',
        match: IDENT_RE$1 + regex.lookahead(':'),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: 'function',
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: '\\s*=>',
            contains: [
              {
                className: 'params',
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$1,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          { // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          { // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                'on:begin': XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: 'xml',
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ['self']
              }
            ]
          }
        ],
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
          '\\(' + // first parens
          '[^()]*(\\(' +
            '[^()]*(\\(' +
              '[^()]*' +
            '\\)[^()]*)*' +
          '\\)[^()]*)*' +
          '\\)\\s*\\{', // end parens
        returnBegin:true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: '\\$' + IDENT_RE$1,
        relevance: 0
      },
      {
        match: [ /\bconstructor(?=\s*\()/ ],
        className: { 1: "title.function" },
        contains: [ PARAMS ]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}

module.exports = javascript;

	return module.exports;
})({ exports: {} })],
	['typescript', (function (module) {
const IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';

const KEYWORDS = [
  "as", // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
];
const LITERALS = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
const TYPES = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];

const ERROR_TYPES = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];

const BUILT_IN_GLOBALS = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",

  "require",
  "exports",

  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];

const BUILT_IN_VARIABLES = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "self",
  "global" // Node.js
];

const BUILT_INS = [].concat(
  BUILT_IN_GLOBALS,
  TYPES,
  ERROR_TYPES
);

/*
Language: JavaScript
Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
Category: common, scripting, web
Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
*/


/** @type LanguageFn */
function javascript(hljs) {
  const regex = hljs.regex;
  /**
   * Takes a string like "<Booger" and checks to see
   * if we can find a matching "</Booger" later in the
   * content.
   * @param {RegExpMatchArray} match
   * @param {{after:number}} param1
   */
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };

  const IDENT_RE$1 = IDENT_RE;
  const FRAGMENT = {
    begin: '<>',
    end: '</>'
  };
  // to avoid some special cases inside isTrulyOpeningTag
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" ||
        // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
        ) {
        response.ignoreMatch();
        return;
      }

      // `<something>`
      // Quite possibly a tag, lets look for a matching closing tag...
      if (nextChar === ">") {
        // if we cannot find a matching closing tag, then we
        // will ignore it
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }

      // `<blah />` (self-closing)
      // handled by simpleSelfClosing rule

      let m;
      const afterMatch = match.input.substring(afterMatchIndex);

      // some more template typing stuff
      //  <T = any>(key?: string) => Modify<
      if ((m = afterMatch.match(/^\s*=/))) {
        response.ignoreMatch();
        return;
      }

      // `<From extends string>`
      // technically this could be HTML, but it smells like a type
      // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
      if ((m = afterMatch.match(/^\s+extends\s+/))) {
        if (m.index === 0) {
          response.ignoreMatch();
          // eslint-disable-next-line no-useless-return
          return;
        }
      }
    }
  };
  const KEYWORDS$1 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_INS,
    "variable.language": BUILT_IN_VARIABLES
  };

  // https://tc39.es/ecma262/#sec-literals-numeric-literals
  const decimalDigits = '[0-9](_?[0-9])*';
  const frac = `\\.(${decimalDigits})`;
  // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
  // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: 'number',
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
        `[eE][+-]?(${decimalDigits})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },

      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },

      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" },
    ],
    relevance: 0
  };

  const SUBST = {
    className: 'subst',
    begin: '\\$\\{',
    end: '\\}',
    keywords: KEYWORDS$1,
    contains: [] // defined later
  };
  const HTML_TEMPLATE = {
    begin: '\.?html`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'xml'
    }
  };
  const CSS_TEMPLATE = {
    begin: '\.?css`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'css'
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: '\.?gql`',
    end: '',
    starts: {
      end: '`',
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: 'graphql'
    }
  };
  const TEMPLATE_STRING = {
    className: 'string',
    begin: '`',
    end: '`',
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    '\\*/',
    {
      relevance: 0,
      contains: [
        {
          begin: '(?=@[A-Za-z]+)',
          relevance: 0,
          contains: [
            {
              className: 'doctag',
              begin: '@[A-Za-z]+'
            },
            {
              className: 'type',
              begin: '\\{',
              end: '\\}',
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: 'variable',
              begin: IDENT_RE$1 + '(?=\\s*(-)|$)',
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER,
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS
    .concat({
      // we need to pair up {} inside our subst to prevent
      // it from ending too early by matching another }
      begin: /\{/,
      end: /\}/,
      keywords: KEYWORDS$1,
      contains: [
        "self"
      ].concat(SUBST_INTERNALS)
    });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: KEYWORDS$1,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: 'params',
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/, // to match the parms with
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1,
    contains: PARAMS_CONTAINS
  };

  // ES6 classes
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      },

    ]
  };

  const CLASS_REFERENCE = {
    relevance: 0,
    match:
    regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/,
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES,
        ...ERROR_TYPES
      ]
    }
  };

  const USE_STRICT = {
    label: "use_strict",
    className: 'meta',
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };

  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$1,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [ PARAMS ],
    illegal: /%/
  };

  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };

  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }

  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS,
        "super",
        "import",
        "await",
      ].map(x => `${x}\\s*\\(`)),
      IDENT_RE$1, regex.lookahead(/\s*\(/)),
    className: "title.function",
    relevance: 0
  };

  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$1,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };

  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$1,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      { // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };

  const FUNC_LEAD_IN_RE = '(\\(' +
    '[^()]*(\\(' +
    '[^()]*(\\(' +
    '[^()]*' +
    '\\)[^()]*)*' +
    '\\)[^()]*)*' +
    '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';

  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/, /\s+/,
      IDENT_RE$1, /\s*/,
      /=\s*/,
      /(async\s*)?/, // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };

  return {
    name: 'JavaScript',
    aliases: ['js', 'jsx', 'mjs', 'cjs'],
    keywords: KEYWORDS$1,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-Za-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        scope: 'attr',
        match: IDENT_RE$1 + regex.lookahead(':'),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: 'function',
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: '\\s*=>',
            contains: [
              {
                className: 'params',
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$1,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          { // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          { // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                'on:begin': XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: 'xml',
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ['self']
              }
            ]
          }
        ],
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
          '\\(' + // first parens
          '[^()]*(\\(' +
            '[^()]*(\\(' +
              '[^()]*' +
            '\\)[^()]*)*' +
          '\\)[^()]*)*' +
          '\\)\\s*\\{', // end parens
        returnBegin:true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: '\\$' + IDENT_RE$1,
        relevance: 0
      },
      {
        match: [ /\bconstructor(?=\s*\()/ ],
        className: { 1: "title.function" },
        contains: [ PARAMS ]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}

/*
Language: TypeScript
Author: Panu Horsmalahti <panu.horsmalahti@iki.fi>
Contributors: Ike Ku <dempfi@yahoo.com>
Description: TypeScript is a strict superset of JavaScript
Website: https://www.typescriptlang.org
Category: common, scripting
*/


/** @type LanguageFn */
function typescript(hljs) {
  const regex = hljs.regex;
  const tsLanguage = javascript(hljs);

  const IDENT_RE$1 = IDENT_RE;
  const TYPES = [
    "any",
    "void",
    "number",
    "boolean",
    "string",
    "object",
    "never",
    "symbol",
    "bigint",
    "unknown"
  ];
  const NAMESPACE = {
    begin: [
      /namespace/,
      /\s+/,
      hljs.IDENT_RE
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    }
  };
  const INTERFACE = {
    beginKeywords: 'interface',
    end: /\{/,
    excludeEnd: true,
    keywords: {
      keyword: 'interface extends',
      built_in: TYPES
    },
    contains: [ tsLanguage.exports.CLASS_REFERENCE ]
  };
  const USE_STRICT = {
    className: 'meta',
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  };
  const TS_SPECIFIC_KEYWORDS = [
    "type",
    // "namespace",
    "interface",
    "public",
    "private",
    "protected",
    "implements",
    "declare",
    "abstract",
    "readonly",
    "enum",
    "override",
    "satisfies"
  ];
  /*
    namespace is a TS keyword but it's fine to use it as a variable name too.
    const message = 'foo';
    const namespace = 'bar';
  */
  const KEYWORDS$1 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS.concat(TS_SPECIFIC_KEYWORDS),
    literal: LITERALS,
    built_in: BUILT_INS.concat(TYPES),
    "variable.language": BUILT_IN_VARIABLES
  };

  const DECORATOR = {
    className: 'meta',
    begin: '@' + IDENT_RE$1,
  };

  const swapMode = (mode, label, replacement) => {
    const indx = mode.contains.findIndex(m => m.label === label);
    if (indx === -1) { throw new Error("can not find mode to replace"); }

    mode.contains.splice(indx, 1, replacement);
  };


  // this should update anywhere keywords is used since
  // it will be the same actual JS object
  Object.assign(tsLanguage.keywords, KEYWORDS$1);

  tsLanguage.exports.PARAMS_CONTAINS.push(DECORATOR);

  // highlight the function params
  const ATTRIBUTE_HIGHLIGHT = tsLanguage.contains.find(c => c.scope === "attr");

  // take default attr rule and extend it to support optionals
  const OPTIONAL_KEY_OR_ARGUMENT = Object.assign({},
    ATTRIBUTE_HIGHLIGHT,
    { match: regex.concat(IDENT_RE$1, regex.lookahead(/\s*\?:/)) }
  );
  tsLanguage.exports.PARAMS_CONTAINS.push([
    tsLanguage.exports.CLASS_REFERENCE, // class reference for highlighting the params types
    ATTRIBUTE_HIGHLIGHT, // highlight the params key
    OPTIONAL_KEY_OR_ARGUMENT, // Added for optional property assignment highlighting
  ]);

  // Add the optional property assignment highlighting for objects or classes
  tsLanguage.contains = tsLanguage.contains.concat([
    DECORATOR,
    NAMESPACE,
    INTERFACE,
    OPTIONAL_KEY_OR_ARGUMENT, // Added for optional property assignment highlighting
  ]);

  // TS gets a simpler shebang rule than JS
  swapMode(tsLanguage, "shebang", hljs.SHEBANG());
  // JS use strict rule purposely excludes `asm` which makes no sense
  swapMode(tsLanguage, "use_strict", USE_STRICT);

  const functionDeclaration = tsLanguage.contains.find(m => m.label === "func.def");
  functionDeclaration.relevance = 0; // () => {} is more typical in TypeScript

  Object.assign(tsLanguage, {
    name: 'TypeScript',
    aliases: [
      'ts',
      'tsx',
      'mts',
      'cts'
    ]
  });

  return tsLanguage;
}

module.exports = typescript;

	return module.exports;
})({ exports: {} })],
	['json', (function (module) {
const EXTENDED_NUMBER_RE = '([-+]?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)|NaN|[-+]?Infinity'; // 0x..., 0..., decimal, float

const EXTENDED_NUMBER_MODE = {
  scope: 'number',
  match: EXTENDED_NUMBER_RE,
  relevance: 0
};

/*
Language: JSON
Description: JSON (JavaScript Object Notation) is a lightweight data-interchange format.
Websites: http://www.json.org, https://www.json5.org
Category: common, protocols, web
*/


function json(hljs) {
  const ATTRIBUTE = {
    className: 'attr',
    begin: /(("(\\.|[^\\"\r\n])*")|('(\\.|[^\\'\r\n])*'))(?=\s*:)/,
    relevance: 1.01
  };
  const PUNCTUATION = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  };
  const LITERALS = [
    "true",
    "false",
    "null"
  ];
  // NOTE: normally we would rely on `keywords` for this but using a mode here allows us
  // - to use the very tight `illegal: \S` rule later to flag any other character
  // - as illegal indicating that despite looking like JSON we do not truly have
  // - JSON and thus improve false-positively greatly since JSON will try and claim
  // - all sorts of JSON looking stuff
  const LITERALS_MODE = {
    scope: "literal",
    beginKeywords: LITERALS.join(" "),
  };

  return {
    name: 'JSON',
    aliases: ['jsonc', 'json5'],
    keywords:{
      literal: LITERALS,
    },
    contains: [
      ATTRIBUTE,
      PUNCTUATION,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      LITERALS_MODE,
      EXTENDED_NUMBER_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ],
    illegal: '\\S'
  };
}

module.exports = json;

	return module.exports;
})({ exports: {} })],
	['xml', (function (module) {
/*
Language: HTML, XML
Website: https://www.w3.org/XML/
Category: common, web
Audit: 2020
*/

/** @type LanguageFn */
function xml(hljs) {
  const regex = hljs.regex;
  // XML names can have the following additional letters: https://www.w3.org/TR/xml/#NT-NameChar
  // OTHER_NAME_CHARS = /[:\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]/;
  // Element names start with NAME_START_CHAR followed by optional other Unicode letters, ASCII digits, hyphens, underscores, and periods
  // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);;
  // const XML_IDENT_RE = /[A-Z_a-z:\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]+/;
  // const TAG_NAME_RE = regex.concat(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, regex.optional(/[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*:/), /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*/);
  // however, to cater for performance and more Unicode support rely simply on the Unicode letter class
  const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
  const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
  const XML_ENTITIES = {
    className: 'symbol',
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  };
  const XML_META_KEYWORDS = {
    begin: /\s/,
    contains: [
      {
        className: 'keyword',
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  };
  const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
    begin: /\(/,
    end: /\)/
  });
  const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: 'string' });
  const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: 'string' });
  const TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: 'attr',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: 'string',
            endsParent: true,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [ XML_ENTITIES ]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [ XML_ENTITIES ]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: 'HTML, XML',
    aliases: [
      'html',
      'xhtml',
      'rss',
      'atom',
      'xjb',
      'xsd',
      'xsl',
      'plist',
      'wsf',
      'svg'
    ],
    case_insensitive: true,
    unicodeRegex: true,
    contains: [
      {
        className: 'meta',
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          XML_META_KEYWORDS,
          QUOTE_META_STRING_MODE,
          APOS_META_STRING_MODE,
          XML_META_PAR_KEYWORDS,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: 'meta',
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  XML_META_KEYWORDS,
                  XML_META_PAR_KEYWORDS,
                  QUOTE_META_STRING_MODE,
                  APOS_META_STRING_MODE
                ]
              }
            ]
          }
        ]
      },
      hljs.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      XML_ENTITIES,
      // xml processing instructions
      {
        className: 'meta',
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              QUOTE_META_STRING_MODE
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/,
          }
        ]

      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: 'style' },
        contains: [ TAG_INTERNALS ],
        starts: {
          end: /<\/style>/,
          returnEnd: true,
          subLanguage: 'css'
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: 'script' },
        contains: [ TAG_INTERNALS ],
        starts: {
          end: /<\/script>/,
          returnEnd: true,
          subLanguage: 'javascript'
        }
      },
      // we need this for now for jSX
      {
        className: 'tag',
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: 'tag',
        begin: regex.concat(
          /</,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            // <tag/>
            // <tag>
            // <tag ...
            regex.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: 'name',
            begin: TAG_NAME_RE,
            relevance: 0,
            starts: TAG_INTERNALS
          }
        ]
      },
      // close tag
      {
        className: 'tag',
        begin: regex.concat(
          /<\//,
          regex.lookahead(regex.concat(
            TAG_NAME_RE, />/
          ))
        ),
        contains: [
          {
            className: 'name',
            begin: TAG_NAME_RE,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: true
          }
        ]
      }
    ]
  };
}

module.exports = xml;

	return module.exports;
})({ exports: {} })],
	['css', (function (module) {
const MODES = (hljs) => {
  return {
    IMPORTANT: {
      scope: 'meta',
      begin: '!important'
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: 'number',
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    UNICODE_RANGE: {
      scope: 'number',
      begin: /\b[Uu]\+[0-9A-Fa-f][0-9A-Fa-f?]{0,5}(-[0-9A-Fa-f][0-9A-Fa-f]{0,5})?/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: 'selector-attr',
      begin: /\[/,
      end: /\]/,
      illegal: '$',
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: 'number',
      begin: hljs.NUMBER_RE + '(' +
        '%|em|ex|ch|rem' +
        '|vw|vh|vmin|vmax' +
        '|cm|mm|in|pt|pc|px' +
        '|deg|grad|rad|turn' +
        '|s|ms' +
        '|Hz|kHz' +
        '|dpi|dpcm|dppx' +
        ')?',
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};

const HTML_TAGS = [
  'a',
  'abbr',
  'address',
  'article',
  'aside',
  'audio',
  'b',
  'blockquote',
  'body',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'dd',
  'del',
  'details',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'mark',
  'menu',
  'nav',
  'object',
  'ol',
  'optgroup',
  'option',
  'p',
  'picture',
  'q',
  'quote',
  'samp',
  'section',
  'select',
  'source',
  'span',
  'strong',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'ul',
  'var',
  'video'
];

const SVG_TAGS = [
  'defs',
  'g',
  'marker',
  'mask',
  'pattern',
  'svg',
  'switch',
  'symbol',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feFlood',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMorphology',
  'feOffset',
  'feSpecularLighting',
  'feTile',
  'feTurbulence',
  'linearGradient',
  'radialGradient',
  'stop',
  'circle',
  'ellipse',
  'image',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
  'use',
  'textPath',
  'tspan',
  'foreignObject',
  'clipPath'
];

const TAGS = [
  ...HTML_TAGS,
  ...SVG_TAGS,
];

// Sorting, then reversing makes sure longer attributes/elements like
// `font-weight` are matched fully instead of getting false positives on say `font`

const MEDIA_FEATURES = [
  'any-hover',
  'any-pointer',
  'aspect-ratio',
  'color',
  'color-gamut',
  'color-index',
  'device-aspect-ratio',
  'device-height',
  'device-width',
  'display-mode',
  'forced-colors',
  'grid',
  'height',
  'hover',
  'inverted-colors',
  'monochrome',
  'orientation',
  'overflow-block',
  'overflow-inline',
  'pointer',
  'prefers-color-scheme',
  'prefers-contrast',
  'prefers-reduced-motion',
  'prefers-reduced-transparency',
  'resolution',
  'scan',
  'scripting',
  'update',
  'width',
  // TODO: find a better solution?
  'min-width',
  'max-width',
  'min-height',
  'max-height'
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
const PSEUDO_CLASSES = [
  'active',
  'any-link',
  'blank',
  'checked',
  'current',
  'default',
  'defined',
  'dir', // dir()
  'disabled',
  'drop',
  'empty',
  'enabled',
  'first',
  'first-child',
  'first-of-type',
  'fullscreen',
  'future',
  'focus',
  'focus-visible',
  'focus-within',
  'has', // has()
  'host', // host or host()
  'host-context', // host-context()
  'hover',
  'indeterminate',
  'in-range',
  'invalid',
  'is', // is()
  'lang', // lang()
  'last-child',
  'last-of-type',
  'left',
  'link',
  'local-link',
  'not', // not()
  'nth-child', // nth-child()
  'nth-col', // nth-col()
  'nth-last-child', // nth-last-child()
  'nth-last-col', // nth-last-col()
  'nth-last-of-type', //nth-last-of-type()
  'nth-of-type', //nth-of-type()
  'only-child',
  'only-of-type',
  'optional',
  'out-of-range',
  'past',
  'placeholder-shown',
  'read-only',
  'read-write',
  'required',
  'right',
  'root',
  'scope',
  'target',
  'target-within',
  'user-invalid',
  'valid',
  'visited',
  'where' // where()
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
const PSEUDO_ELEMENTS = [
  'after',
  'backdrop',
  'before',
  'cue',
  'cue-region',
  'first-letter',
  'first-line',
  'grammar-error',
  'marker',
  'part',
  'placeholder',
  'selection',
  'slotted',
  'spelling-error'
].sort().reverse();

const ATTRIBUTES = [
  'accent-color',
  'align-content',
  'align-items',
  'align-self',
  'alignment-baseline',
  'all',
  'anchor-name',
  'animation',
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-range',
  'animation-range-end',
  'animation-range-start',
  'animation-timeline',
  'animation-timing-function',
  'appearance',
  'aspect-ratio',
  'backdrop-filter',
  'backface-visibility',
  'background',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-position-x',
  'background-position-y',
  'background-repeat',
  'background-size',
  'baseline-shift',
  'block-size',
  'border',
  'border-block',
  'border-block-color',
  'border-block-end',
  'border-block-end-color',
  'border-block-end-style',
  'border-block-end-width',
  'border-block-start',
  'border-block-start-color',
  'border-block-start-style',
  'border-block-start-width',
  'border-block-style',
  'border-block-width',
  'border-bottom',
  'border-bottom-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-style',
  'border-bottom-width',
  'border-collapse',
  'border-color',
  'border-end-end-radius',
  'border-end-start-radius',
  'border-image',
  'border-image-outset',
  'border-image-repeat',
  'border-image-slice',
  'border-image-source',
  'border-image-width',
  'border-inline',
  'border-inline-color',
  'border-inline-end',
  'border-inline-end-color',
  'border-inline-end-style',
  'border-inline-end-width',
  'border-inline-start',
  'border-inline-start-color',
  'border-inline-start-style',
  'border-inline-start-width',
  'border-inline-style',
  'border-inline-width',
  'border-left',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-radius',
  'border-right',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-spacing',
  'border-start-end-radius',
  'border-start-start-radius',
  'border-style',
  'border-top',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'border-width',
  'bottom',
  'box-align',
  'box-decoration-break',
  'box-direction',
  'box-flex',
  'box-flex-group',
  'box-lines',
  'box-ordinal-group',
  'box-orient',
  'box-pack',
  'box-shadow',
  'box-sizing',
  'break-after',
  'break-before',
  'break-inside',
  'caption-side',
  'caret-color',
  'clear',
  'clip',
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-profile',
  'color-rendering',
  'color-scheme',
  'column-count',
  'column-fill',
  'column-gap',
  'column-rule',
  'column-rule-color',
  'column-rule-style',
  'column-rule-width',
  'column-span',
  'column-width',
  'columns',
  'contain',
  'contain-intrinsic-block-size',
  'contain-intrinsic-height',
  'contain-intrinsic-inline-size',
  'contain-intrinsic-size',
  'contain-intrinsic-width',
  'container',
  'container-name',
  'container-type',
  'content',
  'content-visibility',
  'corner-bottom-left-shape',
  'corner-bottom-right-shape',
  'corner-shape',
  'corner-top-left-shape',
  'corner-top-right-shape',
  'counter-increment',
  'counter-reset',
  'counter-set',
  'cue',
  'cue-after',
  'cue-before',
  'cursor',
  'cx',
  'cy',
  'direction',
  'display',
  'dominant-baseline',
  'empty-cells',
  'enable-background',
  'field-sizing',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'float',
  'flood-color',
  'flood-opacity',
  'flow',
  'font',
  'font-display',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-optical-sizing',
  'font-palette',
  'font-size',
  'font-size-adjust',
  'font-smooth',
  'font-smoothing',
  'font-stretch',
  'font-style',
  'font-synthesis',
  'font-synthesis-position',
  'font-synthesis-small-caps',
  'font-synthesis-style',
  'font-synthesis-weight',
  'font-variant',
  'font-variant-alternates',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-emoji',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-variation-settings',
  'font-weight',
  'forced-color-adjust',
  'gap',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-gap',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'hanging-punctuation',
  'height',
  'hyphenate-character',
  'hyphenate-limit-chars',
  'hyphens',
  'icon',
  'image-orientation',
  'image-rendering',
  'image-resolution',
  'ime-mode',
  'initial-letter',
  'initial-letter-align',
  'inline-size',
  'inset',
  'inset-area',
  'inset-block',
  'inset-block-end',
  'inset-block-start',
  'inset-inline',
  'inset-inline-end',
  'inset-inline-start',
  'isolation',
  'justify-content',
  'justify-items',
  'justify-self',
  'kerning',
  'left',
  'letter-spacing',
  'lighting-color',
  'line-break',
  'line-height',
  'line-height-step',
  'list-style',
  'list-style-image',
  'list-style-position',
  'list-style-type',
  'margin',
  'margin-block',
  'margin-block-end',
  'margin-block-start',
  'margin-bottom',
  'margin-inline',
  'margin-inline-end',
  'margin-inline-start',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-trim',
  'marker',
  'marker-end',
  'marker-mid',
  'marker-start',
  'marks',
  'mask',
  'mask-border',
  'mask-border-mode',
  'mask-border-outset',
  'mask-border-repeat',
  'mask-border-slice',
  'mask-border-source',
  'mask-border-width',
  'mask-clip',
  'mask-composite',
  'mask-image',
  'mask-mode',
  'mask-origin',
  'mask-position',
  'mask-repeat',
  'mask-size',
  'mask-type',
  'masonry-auto-flow',
  'math-depth',
  'math-shift',
  'math-style',
  'max-block-size',
  'max-height',
  'max-inline-size',
  'max-width',
  'min-block-size',
  'min-height',
  'min-inline-size',
  'min-width',
  'mix-blend-mode',
  'nav-down',
  'nav-index',
  'nav-left',
  'nav-right',
  'nav-up',
  'none',
  'normal',
  'object-fit',
  'object-position',
  'offset',
  'offset-anchor',
  'offset-distance',
  'offset-path',
  'offset-position',
  'offset-rotate',
  'opacity',
  'order',
  'orphans',
  'outline',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  'overflow',
  'overflow-anchor',
  'overflow-block',
  'overflow-clip-margin',
  'overflow-inline',
  'overflow-wrap',
  'overflow-x',
  'overflow-y',
  'overlay',
  'overscroll-behavior',
  'overscroll-behavior-block',
  'overscroll-behavior-inline',
  'overscroll-behavior-x',
  'overscroll-behavior-y',
  'padding',
  'padding-block',
  'padding-block-end',
  'padding-block-start',
  'padding-bottom',
  'padding-inline',
  'padding-inline-end',
  'padding-inline-start',
  'padding-left',
  'padding-right',
  'padding-top',
  'page',
  'page-break-after',
  'page-break-before',
  'page-break-inside',
  'paint-order',
  'pause',
  'pause-after',
  'pause-before',
  'perspective',
  'perspective-origin',
  'place-content',
  'place-items',
  'place-self',
  'pointer-events',
  'position',
  'position-anchor',
  'position-visibility',
  'print-color-adjust',
  'quotes',
  'r',
  'resize',
  'rest',
  'rest-after',
  'rest-before',
  'right',
  'rotate',
  'row-gap',
  'ruby-align',
  'ruby-position',
  'scale',
  'scroll-behavior',
  'scroll-margin',
  'scroll-margin-block',
  'scroll-margin-block-end',
  'scroll-margin-block-start',
  'scroll-margin-bottom',
  'scroll-margin-inline',
  'scroll-margin-inline-end',
  'scroll-margin-inline-start',
  'scroll-margin-left',
  'scroll-margin-right',
  'scroll-margin-top',
  'scroll-padding',
  'scroll-padding-block',
  'scroll-padding-block-end',
  'scroll-padding-block-start',
  'scroll-padding-bottom',
  'scroll-padding-inline',
  'scroll-padding-inline-end',
  'scroll-padding-inline-start',
  'scroll-padding-left',
  'scroll-padding-right',
  'scroll-padding-top',
  'scroll-snap-align',
  'scroll-snap-stop',
  'scroll-snap-type',
  'scroll-timeline',
  'scroll-timeline-axis',
  'scroll-timeline-name',
  'scrollbar-color',
  'scrollbar-gutter',
  'scrollbar-width',
  'shape-image-threshold',
  'shape-margin',
  'shape-outside',
  'shape-rendering',
  'speak',
  'speak-as',
  'src', // @font-face
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'tab-size',
  'table-layout',
  'text-align',
  'text-align-all',
  'text-align-last',
  'text-anchor',
  'text-combine-upright',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-skip',
  'text-decoration-skip-ink',
  'text-decoration-style',
  'text-decoration-thickness',
  'text-emphasis',
  'text-emphasis-color',
  'text-emphasis-position',
  'text-emphasis-style',
  'text-indent',
  'text-justify',
  'text-orientation',
  'text-overflow',
  'text-rendering',
  'text-shadow',
  'text-size-adjust',
  'text-transform',
  'text-underline-offset',
  'text-underline-position',
  'text-wrap',
  'text-wrap-mode',
  'text-wrap-style',
  'timeline-scope',
  'top',
  'touch-action',
  'transform',
  'transform-box',
  'transform-origin',
  'transform-style',
  'transition',
  'transition-behavior',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'translate',
  'unicode-bidi',
  'unicode-range',
  'user-modify',
  'user-select',
  'vector-effect',
  'vertical-align',
  'view-timeline',
  'view-timeline-axis',
  'view-timeline-inset',
  'view-timeline-name',
  'view-transition-name',
  'visibility',
  'voice-balance',
  'voice-duration',
  'voice-family',
  'voice-pitch',
  'voice-range',
  'voice-rate',
  'voice-stress',
  'voice-volume',
  'white-space',
  'white-space-collapse',
  'widows',
  'width',
  'will-change',
  'word-break',
  'word-spacing',
  'word-wrap',
  'writing-mode',
  'x',
  'y',
  'z-index',
  'zoom'
].sort().reverse();

/*
Language: CSS
Category: common, css, web
Website: https://developer.mozilla.org/en-US/docs/Web/CSS
*/


/** @type LanguageFn */
function css(hljs) {
  const regex = hljs.regex;
  const modes = MODES(hljs);
  const VENDOR_PREFIX = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ };
  const AT_MODIFIERS = "and or not only";
  const AT_PROPERTY_RE = /@-?\w[\w]*(-\w+)*/; // @-webkit-keyframes
  const IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  const STRINGS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ];

  return {
    name: 'CSS',
    case_insensitive: true,
    illegal: /[=|'\$]/,
    keywords: { keyframePosition: "from to" },
    classNameAliases: {
      // for visual continuity with `tag {}` and because we
      // don't have a great class for this?
      keyframePosition: "selector-tag" },
    contains: [
      modes.BLOCK_COMMENT,
      VENDOR_PREFIX,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: 'selector-id',
        begin: /#[A-Za-z0-9_-]+/,
        relevance: 0
      },
      {
        className: 'selector-class',
        begin: '\\.' + IDENT_RE,
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: 'selector-pseudo',
        variants: [
          { begin: ':(' + PSEUDO_CLASSES.join('|') + ')' },
          { begin: ':(:)?(' + PSEUDO_ELEMENTS.join('|') + ')' }
        ]
      },
      // we may actually need this (12/2020)
      // { // pseudo-selector params
      //   begin: /\(/,
      //   end: /\)/,
      //   contains: [ hljs.CSS_NUMBER_MODE ]
      // },
      modes.CSS_VARIABLE,
      {
        className: 'attribute',
        begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b'
      },
      // attribute values
      {
        begin: /:/,
        end: /[;}{]/,
        contains: [
          modes.BLOCK_COMMENT,
          modes.HEXCOLOR,
          modes.IMPORTANT,
          modes.CSS_NUMBER_MODE,
          modes.UNICODE_RANGE,
          ...STRINGS,
          // needed to highlight these as strings and to avoid issues with
          // illegal characters that might be inside urls that would trigger the
          // languages illegal stack
          {
            begin: /(url|data-uri)\(/,
            end: /\)/,
            relevance: 0, // from keywords
            keywords: { built_in: "url data-uri" },
            contains: [
              ...STRINGS,
              {
                className: "string",
                // any character other than `)` as in `url()` will be the start
                // of a string, which ends with `)` (from the parent mode)
                begin: /[^)]/,
                endsWithParent: true,
                excludeEnd: true
              }
            ]
          },
          modes.FUNCTION_DISPATCH
        ]
      },
      {
        begin: regex.lookahead(/@/),
        end: '[{;]',
        relevance: 0,
        illegal: /:/, // break on Less variables @var: ...
        contains: [
          {
            className: 'keyword',
            begin: AT_PROPERTY_RE
          },
          {
            begin: /\s/,
            endsWithParent: true,
            excludeEnd: true,
            relevance: 0,
            keywords: {
              $pattern: /[a-z-]+/,
              keyword: AT_MODIFIERS,
              attribute: MEDIA_FEATURES.join(" ")
            },
            contains: [
              {
                begin: /[a-z-]+(?=:)/,
                className: "attribute"
              },
              ...STRINGS,
              modes.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: 'selector-tag',
        begin: '\\b(' + TAGS.join('|') + ')\\b'
      }
    ]
  };
}

module.exports = css;

	return module.exports;
})({ exports: {} })],
	['scss', (function (module) {
const MODES = (hljs) => {
  return {
    IMPORTANT: {
      scope: 'meta',
      begin: '!important'
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: 'number',
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    UNICODE_RANGE: {
      scope: 'number',
      begin: /\b[Uu]\+[0-9A-Fa-f][0-9A-Fa-f?]{0,5}(-[0-9A-Fa-f][0-9A-Fa-f]{0,5})?/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: 'selector-attr',
      begin: /\[/,
      end: /\]/,
      illegal: '$',
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: 'number',
      begin: hljs.NUMBER_RE + '(' +
        '%|em|ex|ch|rem' +
        '|vw|vh|vmin|vmax' +
        '|cm|mm|in|pt|pc|px' +
        '|deg|grad|rad|turn' +
        '|s|ms' +
        '|Hz|kHz' +
        '|dpi|dpcm|dppx' +
        ')?',
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};

const HTML_TAGS = [
  'a',
  'abbr',
  'address',
  'article',
  'aside',
  'audio',
  'b',
  'blockquote',
  'body',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'dd',
  'del',
  'details',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'mark',
  'menu',
  'nav',
  'object',
  'ol',
  'optgroup',
  'option',
  'p',
  'picture',
  'q',
  'quote',
  'samp',
  'section',
  'select',
  'source',
  'span',
  'strong',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'ul',
  'var',
  'video'
];

const SVG_TAGS = [
  'defs',
  'g',
  'marker',
  'mask',
  'pattern',
  'svg',
  'switch',
  'symbol',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feFlood',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMorphology',
  'feOffset',
  'feSpecularLighting',
  'feTile',
  'feTurbulence',
  'linearGradient',
  'radialGradient',
  'stop',
  'circle',
  'ellipse',
  'image',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
  'use',
  'textPath',
  'tspan',
  'foreignObject',
  'clipPath'
];

const TAGS = [
  ...HTML_TAGS,
  ...SVG_TAGS,
];

// Sorting, then reversing makes sure longer attributes/elements like
// `font-weight` are matched fully instead of getting false positives on say `font`

const MEDIA_FEATURES = [
  'any-hover',
  'any-pointer',
  'aspect-ratio',
  'color',
  'color-gamut',
  'color-index',
  'device-aspect-ratio',
  'device-height',
  'device-width',
  'display-mode',
  'forced-colors',
  'grid',
  'height',
  'hover',
  'inverted-colors',
  'monochrome',
  'orientation',
  'overflow-block',
  'overflow-inline',
  'pointer',
  'prefers-color-scheme',
  'prefers-contrast',
  'prefers-reduced-motion',
  'prefers-reduced-transparency',
  'resolution',
  'scan',
  'scripting',
  'update',
  'width',
  // TODO: find a better solution?
  'min-width',
  'max-width',
  'min-height',
  'max-height'
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
const PSEUDO_CLASSES = [
  'active',
  'any-link',
  'blank',
  'checked',
  'current',
  'default',
  'defined',
  'dir', // dir()
  'disabled',
  'drop',
  'empty',
  'enabled',
  'first',
  'first-child',
  'first-of-type',
  'fullscreen',
  'future',
  'focus',
  'focus-visible',
  'focus-within',
  'has', // has()
  'host', // host or host()
  'host-context', // host-context()
  'hover',
  'indeterminate',
  'in-range',
  'invalid',
  'is', // is()
  'lang', // lang()
  'last-child',
  'last-of-type',
  'left',
  'link',
  'local-link',
  'not', // not()
  'nth-child', // nth-child()
  'nth-col', // nth-col()
  'nth-last-child', // nth-last-child()
  'nth-last-col', // nth-last-col()
  'nth-last-of-type', //nth-last-of-type()
  'nth-of-type', //nth-of-type()
  'only-child',
  'only-of-type',
  'optional',
  'out-of-range',
  'past',
  'placeholder-shown',
  'read-only',
  'read-write',
  'required',
  'right',
  'root',
  'scope',
  'target',
  'target-within',
  'user-invalid',
  'valid',
  'visited',
  'where' // where()
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
const PSEUDO_ELEMENTS = [
  'after',
  'backdrop',
  'before',
  'cue',
  'cue-region',
  'first-letter',
  'first-line',
  'grammar-error',
  'marker',
  'part',
  'placeholder',
  'selection',
  'slotted',
  'spelling-error'
].sort().reverse();

const ATTRIBUTES = [
  'accent-color',
  'align-content',
  'align-items',
  'align-self',
  'alignment-baseline',
  'all',
  'anchor-name',
  'animation',
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-range',
  'animation-range-end',
  'animation-range-start',
  'animation-timeline',
  'animation-timing-function',
  'appearance',
  'aspect-ratio',
  'backdrop-filter',
  'backface-visibility',
  'background',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-position-x',
  'background-position-y',
  'background-repeat',
  'background-size',
  'baseline-shift',
  'block-size',
  'border',
  'border-block',
  'border-block-color',
  'border-block-end',
  'border-block-end-color',
  'border-block-end-style',
  'border-block-end-width',
  'border-block-start',
  'border-block-start-color',
  'border-block-start-style',
  'border-block-start-width',
  'border-block-style',
  'border-block-width',
  'border-bottom',
  'border-bottom-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-style',
  'border-bottom-width',
  'border-collapse',
  'border-color',
  'border-end-end-radius',
  'border-end-start-radius',
  'border-image',
  'border-image-outset',
  'border-image-repeat',
  'border-image-slice',
  'border-image-source',
  'border-image-width',
  'border-inline',
  'border-inline-color',
  'border-inline-end',
  'border-inline-end-color',
  'border-inline-end-style',
  'border-inline-end-width',
  'border-inline-start',
  'border-inline-start-color',
  'border-inline-start-style',
  'border-inline-start-width',
  'border-inline-style',
  'border-inline-width',
  'border-left',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-radius',
  'border-right',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-spacing',
  'border-start-end-radius',
  'border-start-start-radius',
  'border-style',
  'border-top',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'border-width',
  'bottom',
  'box-align',
  'box-decoration-break',
  'box-direction',
  'box-flex',
  'box-flex-group',
  'box-lines',
  'box-ordinal-group',
  'box-orient',
  'box-pack',
  'box-shadow',
  'box-sizing',
  'break-after',
  'break-before',
  'break-inside',
  'caption-side',
  'caret-color',
  'clear',
  'clip',
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-profile',
  'color-rendering',
  'color-scheme',
  'column-count',
  'column-fill',
  'column-gap',
  'column-rule',
  'column-rule-color',
  'column-rule-style',
  'column-rule-width',
  'column-span',
  'column-width',
  'columns',
  'contain',
  'contain-intrinsic-block-size',
  'contain-intrinsic-height',
  'contain-intrinsic-inline-size',
  'contain-intrinsic-size',
  'contain-intrinsic-width',
  'container',
  'container-name',
  'container-type',
  'content',
  'content-visibility',
  'corner-bottom-left-shape',
  'corner-bottom-right-shape',
  'corner-shape',
  'corner-top-left-shape',
  'corner-top-right-shape',
  'counter-increment',
  'counter-reset',
  'counter-set',
  'cue',
  'cue-after',
  'cue-before',
  'cursor',
  'cx',
  'cy',
  'direction',
  'display',
  'dominant-baseline',
  'empty-cells',
  'enable-background',
  'field-sizing',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'float',
  'flood-color',
  'flood-opacity',
  'flow',
  'font',
  'font-display',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-optical-sizing',
  'font-palette',
  'font-size',
  'font-size-adjust',
  'font-smooth',
  'font-smoothing',
  'font-stretch',
  'font-style',
  'font-synthesis',
  'font-synthesis-position',
  'font-synthesis-small-caps',
  'font-synthesis-style',
  'font-synthesis-weight',
  'font-variant',
  'font-variant-alternates',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-emoji',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-variation-settings',
  'font-weight',
  'forced-color-adjust',
  'gap',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-gap',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'hanging-punctuation',
  'height',
  'hyphenate-character',
  'hyphenate-limit-chars',
  'hyphens',
  'icon',
  'image-orientation',
  'image-rendering',
  'image-resolution',
  'ime-mode',
  'initial-letter',
  'initial-letter-align',
  'inline-size',
  'inset',
  'inset-area',
  'inset-block',
  'inset-block-end',
  'inset-block-start',
  'inset-inline',
  'inset-inline-end',
  'inset-inline-start',
  'isolation',
  'justify-content',
  'justify-items',
  'justify-self',
  'kerning',
  'left',
  'letter-spacing',
  'lighting-color',
  'line-break',
  'line-height',
  'line-height-step',
  'list-style',
  'list-style-image',
  'list-style-position',
  'list-style-type',
  'margin',
  'margin-block',
  'margin-block-end',
  'margin-block-start',
  'margin-bottom',
  'margin-inline',
  'margin-inline-end',
  'margin-inline-start',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-trim',
  'marker',
  'marker-end',
  'marker-mid',
  'marker-start',
  'marks',
  'mask',
  'mask-border',
  'mask-border-mode',
  'mask-border-outset',
  'mask-border-repeat',
  'mask-border-slice',
  'mask-border-source',
  'mask-border-width',
  'mask-clip',
  'mask-composite',
  'mask-image',
  'mask-mode',
  'mask-origin',
  'mask-position',
  'mask-repeat',
  'mask-size',
  'mask-type',
  'masonry-auto-flow',
  'math-depth',
  'math-shift',
  'math-style',
  'max-block-size',
  'max-height',
  'max-inline-size',
  'max-width',
  'min-block-size',
  'min-height',
  'min-inline-size',
  'min-width',
  'mix-blend-mode',
  'nav-down',
  'nav-index',
  'nav-left',
  'nav-right',
  'nav-up',
  'none',
  'normal',
  'object-fit',
  'object-position',
  'offset',
  'offset-anchor',
  'offset-distance',
  'offset-path',
  'offset-position',
  'offset-rotate',
  'opacity',
  'order',
  'orphans',
  'outline',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  'overflow',
  'overflow-anchor',
  'overflow-block',
  'overflow-clip-margin',
  'overflow-inline',
  'overflow-wrap',
  'overflow-x',
  'overflow-y',
  'overlay',
  'overscroll-behavior',
  'overscroll-behavior-block',
  'overscroll-behavior-inline',
  'overscroll-behavior-x',
  'overscroll-behavior-y',
  'padding',
  'padding-block',
  'padding-block-end',
  'padding-block-start',
  'padding-bottom',
  'padding-inline',
  'padding-inline-end',
  'padding-inline-start',
  'padding-left',
  'padding-right',
  'padding-top',
  'page',
  'page-break-after',
  'page-break-before',
  'page-break-inside',
  'paint-order',
  'pause',
  'pause-after',
  'pause-before',
  'perspective',
  'perspective-origin',
  'place-content',
  'place-items',
  'place-self',
  'pointer-events',
  'position',
  'position-anchor',
  'position-visibility',
  'print-color-adjust',
  'quotes',
  'r',
  'resize',
  'rest',
  'rest-after',
  'rest-before',
  'right',
  'rotate',
  'row-gap',
  'ruby-align',
  'ruby-position',
  'scale',
  'scroll-behavior',
  'scroll-margin',
  'scroll-margin-block',
  'scroll-margin-block-end',
  'scroll-margin-block-start',
  'scroll-margin-bottom',
  'scroll-margin-inline',
  'scroll-margin-inline-end',
  'scroll-margin-inline-start',
  'scroll-margin-left',
  'scroll-margin-right',
  'scroll-margin-top',
  'scroll-padding',
  'scroll-padding-block',
  'scroll-padding-block-end',
  'scroll-padding-block-start',
  'scroll-padding-bottom',
  'scroll-padding-inline',
  'scroll-padding-inline-end',
  'scroll-padding-inline-start',
  'scroll-padding-left',
  'scroll-padding-right',
  'scroll-padding-top',
  'scroll-snap-align',
  'scroll-snap-stop',
  'scroll-snap-type',
  'scroll-timeline',
  'scroll-timeline-axis',
  'scroll-timeline-name',
  'scrollbar-color',
  'scrollbar-gutter',
  'scrollbar-width',
  'shape-image-threshold',
  'shape-margin',
  'shape-outside',
  'shape-rendering',
  'speak',
  'speak-as',
  'src', // @font-face
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'tab-size',
  'table-layout',
  'text-align',
  'text-align-all',
  'text-align-last',
  'text-anchor',
  'text-combine-upright',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-skip',
  'text-decoration-skip-ink',
  'text-decoration-style',
  'text-decoration-thickness',
  'text-emphasis',
  'text-emphasis-color',
  'text-emphasis-position',
  'text-emphasis-style',
  'text-indent',
  'text-justify',
  'text-orientation',
  'text-overflow',
  'text-rendering',
  'text-shadow',
  'text-size-adjust',
  'text-transform',
  'text-underline-offset',
  'text-underline-position',
  'text-wrap',
  'text-wrap-mode',
  'text-wrap-style',
  'timeline-scope',
  'top',
  'touch-action',
  'transform',
  'transform-box',
  'transform-origin',
  'transform-style',
  'transition',
  'transition-behavior',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'translate',
  'unicode-bidi',
  'unicode-range',
  'user-modify',
  'user-select',
  'vector-effect',
  'vertical-align',
  'view-timeline',
  'view-timeline-axis',
  'view-timeline-inset',
  'view-timeline-name',
  'view-transition-name',
  'visibility',
  'voice-balance',
  'voice-duration',
  'voice-family',
  'voice-pitch',
  'voice-range',
  'voice-rate',
  'voice-stress',
  'voice-volume',
  'white-space',
  'white-space-collapse',
  'widows',
  'width',
  'will-change',
  'word-break',
  'word-spacing',
  'word-wrap',
  'writing-mode',
  'x',
  'y',
  'z-index',
  'zoom'
].sort().reverse();

/*
Language: SCSS
Description: Scss is an extension of the syntax of CSS.
Author: Kurt Emch <kurt@kurtemch.com>
Website: https://sass-lang.com
Category: common, css, web
*/


/** @type LanguageFn */
function scss(hljs) {
  const modes = MODES(hljs);
  const PSEUDO_ELEMENTS$1 = PSEUDO_ELEMENTS;
  const PSEUDO_CLASSES$1 = PSEUDO_CLASSES;

  const AT_IDENTIFIER = '@[a-z-]+'; // @font-face
  const AT_MODIFIERS = "and or not only";
  const IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  const VARIABLE = {
    className: 'variable',
    begin: '(\\$' + IDENT_RE + ')\\b',
    relevance: 0
  };

  return {
    name: 'SCSS',
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      modes.CSS_NUMBER_MODE,
      {
        className: 'selector-id',
        begin: '#[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'selector-class',
        begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: 'selector-tag',
        begin: '\\b(' + TAGS.join('|') + ')\\b',
        // was there, before, but why?
        relevance: 0
      },
      {
        className: 'selector-pseudo',
        begin: ':(' + PSEUDO_CLASSES$1.join('|') + ')'
      },
      {
        className: 'selector-pseudo',
        begin: ':(:)?(' + PSEUDO_ELEMENTS$1.join('|') + ')'
      },
      VARIABLE,
      { // pseudo-selector params
        begin: /\(/,
        end: /\)/,
        contains: [ modes.CSS_NUMBER_MODE ]
      },
      modes.CSS_VARIABLE,
      {
        className: 'attribute',
        begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b'
      },
      { begin: '\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b' },
      {
        begin: /:/,
        end: /[;}{]/,
        relevance: 0,
        contains: [
          modes.BLOCK_COMMENT,
          VARIABLE,
          modes.HEXCOLOR,
          modes.CSS_NUMBER_MODE,
          modes.UNICODE_RANGE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          modes.IMPORTANT,
          modes.FUNCTION_DISPATCH
        ]
      },
      // matching these here allows us to treat them more like regular CSS
      // rules so everything between the {} gets regular rule highlighting,
      // which is what we want for page and font-face
      {
        begin: '@(page|font-face)',
        keywords: {
          $pattern: AT_IDENTIFIER,
          keyword: '@page @font-face'
        }
      },
      {
        begin: '@',
        end: '[{;]',
        returnBegin: true,
        keywords: {
          $pattern: /[a-z-]+/,
          keyword: AT_MODIFIERS,
          attribute: MEDIA_FEATURES.join(" ")
        },
        contains: [
          {
            begin: AT_IDENTIFIER,
            className: "keyword"
          },
          {
            begin: /[a-z-]+(?=:)/,
            className: "attribute"
          },
          VARIABLE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          modes.HEXCOLOR,
          modes.CSS_NUMBER_MODE
        ]
      },
      modes.FUNCTION_DISPATCH
    ]
  };
}

module.exports = scss;

	return module.exports;
})({ exports: {} })],
	['less', (function (module) {
const MODES = (hljs) => {
  return {
    IMPORTANT: {
      scope: 'meta',
      begin: '!important'
    },
    BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
    HEXCOLOR: {
      scope: 'number',
      begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
    },
    UNICODE_RANGE: {
      scope: 'number',
      begin: /\b[Uu]\+[0-9A-Fa-f][0-9A-Fa-f?]{0,5}(-[0-9A-Fa-f][0-9A-Fa-f]{0,5})?/
    },
    FUNCTION_DISPATCH: {
      className: "built_in",
      begin: /[\w-]+(?=\()/
    },
    ATTRIBUTE_SELECTOR_MODE: {
      scope: 'selector-attr',
      begin: /\[/,
      end: /\]/,
      illegal: '$',
      contains: [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE
      ]
    },
    CSS_NUMBER_MODE: {
      scope: 'number',
      begin: hljs.NUMBER_RE + '(' +
        '%|em|ex|ch|rem' +
        '|vw|vh|vmin|vmax' +
        '|cm|mm|in|pt|pc|px' +
        '|deg|grad|rad|turn' +
        '|s|ms' +
        '|Hz|kHz' +
        '|dpi|dpcm|dppx' +
        ')?',
      relevance: 0
    },
    CSS_VARIABLE: {
      className: "attr",
      begin: /--[A-Za-z_][A-Za-z0-9_-]*/
    }
  };
};

const HTML_TAGS = [
  'a',
  'abbr',
  'address',
  'article',
  'aside',
  'audio',
  'b',
  'blockquote',
  'body',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'dd',
  'del',
  'details',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'mark',
  'menu',
  'nav',
  'object',
  'ol',
  'optgroup',
  'option',
  'p',
  'picture',
  'q',
  'quote',
  'samp',
  'section',
  'select',
  'source',
  'span',
  'strong',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'ul',
  'var',
  'video'
];

const SVG_TAGS = [
  'defs',
  'g',
  'marker',
  'mask',
  'pattern',
  'svg',
  'switch',
  'symbol',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feFlood',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMorphology',
  'feOffset',
  'feSpecularLighting',
  'feTile',
  'feTurbulence',
  'linearGradient',
  'radialGradient',
  'stop',
  'circle',
  'ellipse',
  'image',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
  'use',
  'textPath',
  'tspan',
  'foreignObject',
  'clipPath'
];

const TAGS = [
  ...HTML_TAGS,
  ...SVG_TAGS,
];

// Sorting, then reversing makes sure longer attributes/elements like
// `font-weight` are matched fully instead of getting false positives on say `font`

const MEDIA_FEATURES = [
  'any-hover',
  'any-pointer',
  'aspect-ratio',
  'color',
  'color-gamut',
  'color-index',
  'device-aspect-ratio',
  'device-height',
  'device-width',
  'display-mode',
  'forced-colors',
  'grid',
  'height',
  'hover',
  'inverted-colors',
  'monochrome',
  'orientation',
  'overflow-block',
  'overflow-inline',
  'pointer',
  'prefers-color-scheme',
  'prefers-contrast',
  'prefers-reduced-motion',
  'prefers-reduced-transparency',
  'resolution',
  'scan',
  'scripting',
  'update',
  'width',
  // TODO: find a better solution?
  'min-width',
  'max-width',
  'min-height',
  'max-height'
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
const PSEUDO_CLASSES = [
  'active',
  'any-link',
  'blank',
  'checked',
  'current',
  'default',
  'defined',
  'dir', // dir()
  'disabled',
  'drop',
  'empty',
  'enabled',
  'first',
  'first-child',
  'first-of-type',
  'fullscreen',
  'future',
  'focus',
  'focus-visible',
  'focus-within',
  'has', // has()
  'host', // host or host()
  'host-context', // host-context()
  'hover',
  'indeterminate',
  'in-range',
  'invalid',
  'is', // is()
  'lang', // lang()
  'last-child',
  'last-of-type',
  'left',
  'link',
  'local-link',
  'not', // not()
  'nth-child', // nth-child()
  'nth-col', // nth-col()
  'nth-last-child', // nth-last-child()
  'nth-last-col', // nth-last-col()
  'nth-last-of-type', //nth-last-of-type()
  'nth-of-type', //nth-of-type()
  'only-child',
  'only-of-type',
  'optional',
  'out-of-range',
  'past',
  'placeholder-shown',
  'read-only',
  'read-write',
  'required',
  'right',
  'root',
  'scope',
  'target',
  'target-within',
  'user-invalid',
  'valid',
  'visited',
  'where' // where()
].sort().reverse();

// https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
const PSEUDO_ELEMENTS = [
  'after',
  'backdrop',
  'before',
  'cue',
  'cue-region',
  'first-letter',
  'first-line',
  'grammar-error',
  'marker',
  'part',
  'placeholder',
  'selection',
  'slotted',
  'spelling-error'
].sort().reverse();

const ATTRIBUTES = [
  'accent-color',
  'align-content',
  'align-items',
  'align-self',
  'alignment-baseline',
  'all',
  'anchor-name',
  'animation',
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-range',
  'animation-range-end',
  'animation-range-start',
  'animation-timeline',
  'animation-timing-function',
  'appearance',
  'aspect-ratio',
  'backdrop-filter',
  'backface-visibility',
  'background',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-position-x',
  'background-position-y',
  'background-repeat',
  'background-size',
  'baseline-shift',
  'block-size',
  'border',
  'border-block',
  'border-block-color',
  'border-block-end',
  'border-block-end-color',
  'border-block-end-style',
  'border-block-end-width',
  'border-block-start',
  'border-block-start-color',
  'border-block-start-style',
  'border-block-start-width',
  'border-block-style',
  'border-block-width',
  'border-bottom',
  'border-bottom-color',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-style',
  'border-bottom-width',
  'border-collapse',
  'border-color',
  'border-end-end-radius',
  'border-end-start-radius',
  'border-image',
  'border-image-outset',
  'border-image-repeat',
  'border-image-slice',
  'border-image-source',
  'border-image-width',
  'border-inline',
  'border-inline-color',
  'border-inline-end',
  'border-inline-end-color',
  'border-inline-end-style',
  'border-inline-end-width',
  'border-inline-start',
  'border-inline-start-color',
  'border-inline-start-style',
  'border-inline-start-width',
  'border-inline-style',
  'border-inline-width',
  'border-left',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-radius',
  'border-right',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-spacing',
  'border-start-end-radius',
  'border-start-start-radius',
  'border-style',
  'border-top',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-style',
  'border-top-width',
  'border-width',
  'bottom',
  'box-align',
  'box-decoration-break',
  'box-direction',
  'box-flex',
  'box-flex-group',
  'box-lines',
  'box-ordinal-group',
  'box-orient',
  'box-pack',
  'box-shadow',
  'box-sizing',
  'break-after',
  'break-before',
  'break-inside',
  'caption-side',
  'caret-color',
  'clear',
  'clip',
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-profile',
  'color-rendering',
  'color-scheme',
  'column-count',
  'column-fill',
  'column-gap',
  'column-rule',
  'column-rule-color',
  'column-rule-style',
  'column-rule-width',
  'column-span',
  'column-width',
  'columns',
  'contain',
  'contain-intrinsic-block-size',
  'contain-intrinsic-height',
  'contain-intrinsic-inline-size',
  'contain-intrinsic-size',
  'contain-intrinsic-width',
  'container',
  'container-name',
  'container-type',
  'content',
  'content-visibility',
  'corner-bottom-left-shape',
  'corner-bottom-right-shape',
  'corner-shape',
  'corner-top-left-shape',
  'corner-top-right-shape',
  'counter-increment',
  'counter-reset',
  'counter-set',
  'cue',
  'cue-after',
  'cue-before',
  'cursor',
  'cx',
  'cy',
  'direction',
  'display',
  'dominant-baseline',
  'empty-cells',
  'enable-background',
  'field-sizing',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'float',
  'flood-color',
  'flood-opacity',
  'flow',
  'font',
  'font-display',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-optical-sizing',
  'font-palette',
  'font-size',
  'font-size-adjust',
  'font-smooth',
  'font-smoothing',
  'font-stretch',
  'font-style',
  'font-synthesis',
  'font-synthesis-position',
  'font-synthesis-small-caps',
  'font-synthesis-style',
  'font-synthesis-weight',
  'font-variant',
  'font-variant-alternates',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-emoji',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-variation-settings',
  'font-weight',
  'forced-color-adjust',
  'gap',
  'glyph-orientation-horizontal',
  'glyph-orientation-vertical',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-gap',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'hanging-punctuation',
  'height',
  'hyphenate-character',
  'hyphenate-limit-chars',
  'hyphens',
  'icon',
  'image-orientation',
  'image-rendering',
  'image-resolution',
  'ime-mode',
  'initial-letter',
  'initial-letter-align',
  'inline-size',
  'inset',
  'inset-area',
  'inset-block',
  'inset-block-end',
  'inset-block-start',
  'inset-inline',
  'inset-inline-end',
  'inset-inline-start',
  'isolation',
  'justify-content',
  'justify-items',
  'justify-self',
  'kerning',
  'left',
  'letter-spacing',
  'lighting-color',
  'line-break',
  'line-height',
  'line-height-step',
  'list-style',
  'list-style-image',
  'list-style-position',
  'list-style-type',
  'margin',
  'margin-block',
  'margin-block-end',
  'margin-block-start',
  'margin-bottom',
  'margin-inline',
  'margin-inline-end',
  'margin-inline-start',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-trim',
  'marker',
  'marker-end',
  'marker-mid',
  'marker-start',
  'marks',
  'mask',
  'mask-border',
  'mask-border-mode',
  'mask-border-outset',
  'mask-border-repeat',
  'mask-border-slice',
  'mask-border-source',
  'mask-border-width',
  'mask-clip',
  'mask-composite',
  'mask-image',
  'mask-mode',
  'mask-origin',
  'mask-position',
  'mask-repeat',
  'mask-size',
  'mask-type',
  'masonry-auto-flow',
  'math-depth',
  'math-shift',
  'math-style',
  'max-block-size',
  'max-height',
  'max-inline-size',
  'max-width',
  'min-block-size',
  'min-height',
  'min-inline-size',
  'min-width',
  'mix-blend-mode',
  'nav-down',
  'nav-index',
  'nav-left',
  'nav-right',
  'nav-up',
  'none',
  'normal',
  'object-fit',
  'object-position',
  'offset',
  'offset-anchor',
  'offset-distance',
  'offset-path',
  'offset-position',
  'offset-rotate',
  'opacity',
  'order',
  'orphans',
  'outline',
  'outline-color',
  'outline-offset',
  'outline-style',
  'outline-width',
  'overflow',
  'overflow-anchor',
  'overflow-block',
  'overflow-clip-margin',
  'overflow-inline',
  'overflow-wrap',
  'overflow-x',
  'overflow-y',
  'overlay',
  'overscroll-behavior',
  'overscroll-behavior-block',
  'overscroll-behavior-inline',
  'overscroll-behavior-x',
  'overscroll-behavior-y',
  'padding',
  'padding-block',
  'padding-block-end',
  'padding-block-start',
  'padding-bottom',
  'padding-inline',
  'padding-inline-end',
  'padding-inline-start',
  'padding-left',
  'padding-right',
  'padding-top',
  'page',
  'page-break-after',
  'page-break-before',
  'page-break-inside',
  'paint-order',
  'pause',
  'pause-after',
  'pause-before',
  'perspective',
  'perspective-origin',
  'place-content',
  'place-items',
  'place-self',
  'pointer-events',
  'position',
  'position-anchor',
  'position-visibility',
  'print-color-adjust',
  'quotes',
  'r',
  'resize',
  'rest',
  'rest-after',
  'rest-before',
  'right',
  'rotate',
  'row-gap',
  'ruby-align',
  'ruby-position',
  'scale',
  'scroll-behavior',
  'scroll-margin',
  'scroll-margin-block',
  'scroll-margin-block-end',
  'scroll-margin-block-start',
  'scroll-margin-bottom',
  'scroll-margin-inline',
  'scroll-margin-inline-end',
  'scroll-margin-inline-start',
  'scroll-margin-left',
  'scroll-margin-right',
  'scroll-margin-top',
  'scroll-padding',
  'scroll-padding-block',
  'scroll-padding-block-end',
  'scroll-padding-block-start',
  'scroll-padding-bottom',
  'scroll-padding-inline',
  'scroll-padding-inline-end',
  'scroll-padding-inline-start',
  'scroll-padding-left',
  'scroll-padding-right',
  'scroll-padding-top',
  'scroll-snap-align',
  'scroll-snap-stop',
  'scroll-snap-type',
  'scroll-timeline',
  'scroll-timeline-axis',
  'scroll-timeline-name',
  'scrollbar-color',
  'scrollbar-gutter',
  'scrollbar-width',
  'shape-image-threshold',
  'shape-margin',
  'shape-outside',
  'shape-rendering',
  'speak',
  'speak-as',
  'src', // @font-face
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'tab-size',
  'table-layout',
  'text-align',
  'text-align-all',
  'text-align-last',
  'text-anchor',
  'text-combine-upright',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-skip',
  'text-decoration-skip-ink',
  'text-decoration-style',
  'text-decoration-thickness',
  'text-emphasis',
  'text-emphasis-color',
  'text-emphasis-position',
  'text-emphasis-style',
  'text-indent',
  'text-justify',
  'text-orientation',
  'text-overflow',
  'text-rendering',
  'text-shadow',
  'text-size-adjust',
  'text-transform',
  'text-underline-offset',
  'text-underline-position',
  'text-wrap',
  'text-wrap-mode',
  'text-wrap-style',
  'timeline-scope',
  'top',
  'touch-action',
  'transform',
  'transform-box',
  'transform-origin',
  'transform-style',
  'transition',
  'transition-behavior',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'translate',
  'unicode-bidi',
  'unicode-range',
  'user-modify',
  'user-select',
  'vector-effect',
  'vertical-align',
  'view-timeline',
  'view-timeline-axis',
  'view-timeline-inset',
  'view-timeline-name',
  'view-transition-name',
  'visibility',
  'voice-balance',
  'voice-duration',
  'voice-family',
  'voice-pitch',
  'voice-range',
  'voice-rate',
  'voice-stress',
  'voice-volume',
  'white-space',
  'white-space-collapse',
  'widows',
  'width',
  'will-change',
  'word-break',
  'word-spacing',
  'word-wrap',
  'writing-mode',
  'x',
  'y',
  'z-index',
  'zoom'
].sort().reverse();

// some grammars use them all as a single group
const PSEUDO_SELECTORS = PSEUDO_CLASSES.concat(PSEUDO_ELEMENTS).sort().reverse();

/*
Language: Less
Description: It's CSS, with just a little more.
Author:   Max Mikhailov <seven.phases.max@gmail.com>
Website: http://lesscss.org
Category: common, css, web
*/


/** @type LanguageFn */
function less(hljs) {
  const modes = MODES(hljs);
  const PSEUDO_SELECTORS$1 = PSEUDO_SELECTORS;

  const AT_MODIFIERS = "and or not only";
  const IDENT_RE = '[\\w-]+'; // yes, Less identifiers may begin with a digit
  const INTERP_IDENT_RE = '(' + IDENT_RE + '|@\\{' + IDENT_RE + '\\})';

  /* Generic Modes */

  const RULES = []; const VALUE_MODES = []; // forward def. for recursive modes

  const STRING_MODE = function(c) {
    return {
    // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
      className: 'string',
      begin: '~?' + c + '.*?' + c
    };
  };

  const IDENT_MODE = function(name, begin, relevance) {
    return {
      className: name,
      begin: begin,
      relevance: relevance
    };
  };

  const AT_KEYWORDS = {
    $pattern: /[a-z-]+/,
    keyword: AT_MODIFIERS,
    attribute: MEDIA_FEATURES.join(" ")
  };

  const PARENS_MODE = {
    // used only to properly balance nested parens inside mixin call, def. arg list
    begin: '\\(',
    end: '\\)',
    contains: VALUE_MODES,
    keywords: AT_KEYWORDS,
    relevance: 0
  };

  // generic Less highlighter (used almost everywhere except selectors):
  VALUE_MODES.push(
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    STRING_MODE("'"),
    STRING_MODE('"'),
    modes.CSS_NUMBER_MODE, // fixme: it does not include dot for numbers like .5em :(
    {
      begin: '(url|data-uri)\\(',
      starts: {
        className: 'string',
        end: '[\\)\\n]',
        excludeEnd: true
      }
    },
    modes.UNICODE_RANGE,
    modes.HEXCOLOR,
    PARENS_MODE,
    IDENT_MODE('variable', '@@?' + IDENT_RE, 10),
    IDENT_MODE('variable', '@\\{' + IDENT_RE + '\\}'),
    IDENT_MODE('built_in', '~?`[^`]*?`'), // inline javascript (or whatever host language) *multiline* string
    { // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
      className: 'attribute',
      begin: IDENT_RE + '\\s*:',
      end: ':',
      returnBegin: true,
      excludeEnd: true
    },
    modes.IMPORTANT,
    { beginKeywords: 'and not' },
    modes.FUNCTION_DISPATCH
  );

  const VALUE_WITH_RULESETS = VALUE_MODES.concat({
    begin: /\{/,
    end: /\}/,
    contains: RULES
  });

  const MIXIN_GUARD_MODE = {
    beginKeywords: 'when',
    endsWithParent: true,
    contains: [ { beginKeywords: 'and not' } ].concat(VALUE_MODES) // using this form to override VALUE’s 'function' match
  };

  /* Rule-Level Modes */

  const RULE_MODE = {
    begin: INTERP_IDENT_RE + '\\s*:',
    returnBegin: true,
    end: /[;}]/,
    relevance: 0,
    contains: [
      { begin: /-(webkit|moz|ms|o)-/ },
      modes.CSS_VARIABLE,
      {
        className: 'attribute',
        begin: '\\b(' + ATTRIBUTES.join('|') + ')\\b',
        end: /(?=:)/,
        starts: {
          endsWithParent: true,
          illegal: '[<=$]',
          relevance: 0,
          contains: VALUE_MODES
        }
      }
    ]
  };

  const AT_RULE_MODE = {
    className: 'keyword',
    begin: '@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b',
    starts: {
      end: '[;{}]',
      keywords: AT_KEYWORDS,
      returnEnd: true,
      contains: VALUE_MODES,
      relevance: 0
    }
  };

  // variable definitions and calls
  const VAR_RULE_MODE = {
    className: 'variable',
    variants: [
      // using more strict pattern for higher relevance to increase chances of Less detection.
      // this is *the only* Less specific statement used in most of the sources, so...
      // (we’ll still often loose to the css-parser unless there's '//' comment,
      // simply because 1 variable just can't beat 99 properties :)
      {
        begin: '@' + IDENT_RE + '\\s*:',
        relevance: 15
      },
      { begin: '@' + IDENT_RE }
    ],
    starts: {
      end: '[;}]',
      returnEnd: true,
      contains: VALUE_WITH_RULESETS
    }
  };

  const SELECTOR_MODE = {
    // first parse unambiguous selectors (i.e. those not starting with tag)
    // then fall into the scary lookahead-discriminator variant.
    // this mode also handles mixin definitions and calls
    variants: [
      {
        begin: '[\\.#:&\\[>]',
        end: '[;{}]' // mixin calls end with ';'
      },
      {
        begin: INTERP_IDENT_RE,
        end: /\{/
      }
    ],
    returnBegin: true,
    returnEnd: true,
    illegal: '[<=\'$"]',
    relevance: 0,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      MIXIN_GUARD_MODE,
      IDENT_MODE('keyword', 'all\\b'),
      IDENT_MODE('variable', '@\\{' + IDENT_RE + '\\}'), // otherwise it’s identified as tag

      {
        begin: '\\b(' + TAGS.join('|') + ')\\b',
        className: 'selector-tag'
      },
      modes.CSS_NUMBER_MODE,
      IDENT_MODE('selector-tag', INTERP_IDENT_RE, 0),
      IDENT_MODE('selector-id', '#' + INTERP_IDENT_RE),
      IDENT_MODE('selector-class', '\\.' + INTERP_IDENT_RE, 0),
      IDENT_MODE('selector-tag', '&', 0),
      modes.ATTRIBUTE_SELECTOR_MODE,
      {
        className: 'selector-pseudo',
        begin: ':(' + PSEUDO_CLASSES.join('|') + ')'
      },
      {
        className: 'selector-pseudo',
        begin: ':(:)?(' + PSEUDO_ELEMENTS.join('|') + ')'
      },
      {
        begin: /\(/,
        end: /\)/,
        relevance: 0,
        contains: VALUE_WITH_RULESETS
      }, // argument list of parametric mixins
      { begin: '!important' }, // eat !important after mixin call or it will be colored as tag
      modes.FUNCTION_DISPATCH
    ]
  };

  const PSEUDO_SELECTOR_MODE = {
    begin: IDENT_RE + ':(:)?' + `(${PSEUDO_SELECTORS$1.join('|')})`,
    returnBegin: true,
    contains: [ SELECTOR_MODE ]
  };

  RULES.push(
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    AT_RULE_MODE,
    VAR_RULE_MODE,
    PSEUDO_SELECTOR_MODE,
    RULE_MODE,
    SELECTOR_MODE,
    MIXIN_GUARD_MODE,
    modes.FUNCTION_DISPATCH
  );

  return {
    name: 'Less',
    case_insensitive: true,
    illegal: '[=>\'/<($"]',
    contains: RULES
  };
}

module.exports = less;

	return module.exports;
})({ exports: {} })],
	['python', (function (module) {
/*
Language: Python
Description: Python is an interpreted, object-oriented, high-level programming language with dynamic semantics.
Website: https://www.python.org
Category: common
*/

function python(hljs) {
  const regex = hljs.regex;
  const IDENT_RE = /[\p{XID_Start}_]\p{XID_Continue}*/u;
  const RESERVED_WORDS = [
    'and',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'case',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'lazy',
    'match',
    'nonlocal|10',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'try',
    'while',
    'with',
    'yield'
  ];

  const BUILT_INS = [
    '__import__',
    'abs',
    'aiter',
    'all',
    'anext',
    'any',
    'ascii',
    'bin',
    'bool',
    'breakpoint',
    'bytearray',
    'bytes',
    'callable',
    'chr',
    'classmethod',
    'compile',
    'complex',
    'delattr',
    'dict',
    'dir',
    'divmod',
    'enumerate',
    'eval',
    'exec',
    'filter',
    'float',
    'format',
    'frozendict',
    'frozenset',
    'getattr',
    'globals',
    'hasattr',
    'hash',
    'help',
    'hex',
    'id',
    'input',
    'int',
    'isinstance',
    'issubclass',
    'iter',
    'len',
    'list',
    'locals',
    'map',
    'max',
    'memoryview',
    'min',
    'next',
    'object',
    'oct',
    'open',
    'ord',
    'pow',
    'print',
    'property',
    'range',
    'repr',
    'reversed',
    'round',
    'sentinel',
    'set',
    'setattr',
    'slice',
    'sorted',
    'staticmethod',
    'str',
    'sum',
    'super',
    'tuple',
    'type',
    'vars',
    'zip'
  ];

  const LITERALS = [
    '__debug__',
    'Ellipsis',
    'False',
    'None',
    'NotImplemented',
    'True'
  ];

  // https://docs.python.org/3/library/typing.html
  // TODO: Could these be supplemented by a CamelCase matcher in certain
  // contexts, leaving these remaining only for relevance hinting?
  const TYPES = [
    "Any",
    "Callable",
    "Coroutine",
    "Dict",
    "List",
    "Literal",
    "Generic",
    "Optional",
    "Sequence",
    "Set",
    "Tuple",
    "Type",
    "Union"
  ];

  const KEYWORDS = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: RESERVED_WORDS,
    built_in: BUILT_INS,
    literal: LITERALS,
    type: TYPES
  };

  const PROMPT = {
    className: 'meta',
    begin: /^(>>>|\.\.\.) /
  };

  const SUBST = {
    className: 'subst',
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS,
    illegal: /#/
  };

  const LITERAL_BRACKET = {
    begin: /\{\{/,
    relevance: 0
  };

  const STRING = {
    className: 'string',
    contains: [ hljs.BACKSLASH_ESCAPE ],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])'/,
        end: /'/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fFtT][rR]|[rR][fFtT]|[fFtT])"/,
        end: /"/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };

  // https://docs.python.org/3.9/reference/lexical_analysis.html#numeric-literals
  const digitpart = '[0-9](_?[0-9])*';
  const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
  // Whitespace after a number (or any lexical token) is needed only if its absence
  // would change the tokenization
  // https://docs.python.org/3.9/reference/lexical_analysis.html#whitespace-between-tokens
  // We deviate slightly, requiring a word boundary or a keyword
  // to avoid accidentally recognizing *prefixes* (e.g., `0` in `0x41` or `08` or `0__1`)
  const lookahead = `\\b|${RESERVED_WORDS.join('|')}`;
  const NUMBER = {
    className: 'number',
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?(?=${lookahead})`
      },
      {
        begin: `(${pointfloat})[jJ]?`
      },

      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${lookahead})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${lookahead})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${lookahead})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${lookahead})`
      },

      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${digitpart})[jJ](?=${lookahead})`
      }
    ]
  };
  const COMMENT_TYPE = {
    className: "comment",
    begin: regex.lookahead(/# type:/),
    end: /$/,
    keywords: KEYWORDS,
    contains: [
      { // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: true
      }
    ]
  };
  const PARAMS = {
    className: 'params',
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: true
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          'self',
          PROMPT,
          NUMBER,
          STRING,
          hljs.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  SUBST.contains = [
    STRING,
    NUMBER,
    PROMPT
  ];

  return {
    name: 'Python',
    aliases: [
      'py',
      'gyp',
      'ipython'
    ],
    unicodeRegex: true,
    keywords: KEYWORDS,
    illegal: /(<\/|\?)|=>/,
    contains: [
      PROMPT,
      NUMBER,
      {
        // very common convention
        scope: 'variable.language',
        match: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      { match: /\bor\b/, scope: "keyword" },
      STRING,
      COMMENT_TYPE,
      hljs.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/, /\s+/,
          IDENT_RE,
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [ PARAMS ]
      },
      {
        variants: [
          {
            match: [
              /\bclass/, /\s+/,
              IDENT_RE, /\s*/,
              /\(\s*/, IDENT_RE,/\s*\)/
            ],
          },
          {
            match: [
              /\bclass/, /\s+/,
              IDENT_RE
            ],
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited",
        }
      },
      {
        className: 'meta',
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          NUMBER,
          PARAMS,
          STRING
        ]
      }
    ]
  };
}

module.exports = python;

	return module.exports;
})({ exports: {} })],
	['java', (function (module) {
// https://docs.oracle.com/javase/specs/jls/se15/html/jls-3.html#jls-3.10
var decimalDigits = '[0-9](_*[0-9])*';
var frac = `\\.(${decimalDigits})`;
var hexDigits = '[0-9a-fA-F](_*[0-9a-fA-F])*';
var NUMERIC = {
  className: 'number',
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))` +
      `[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits})[fFdD]\\b` },

    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))` +
      `[pP][+-]?(${decimalDigits})[fFdD]?\\b` },

    // DecimalIntegerLiteral
    { begin: '\\b(0|[1-9](_*[0-9])*)[lL]?\\b' },

    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },

    // OctalIntegerLiteral
    { begin: '\\b0(_*[0-7])*[lL]?\\b' },

    // BinaryIntegerLiteral
    { begin: '\\b0[bB][01](_*[01])*[lL]?\\b' },
  ],
  relevance: 0
};

/*
Language: Java
Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
Category: common, enterprise
Website: https://www.java.com/
*/


/**
 * Allows recursive regex expressions to a given depth
 *
 * ie: recurRegex("(abc~~~)", /~~~/g, 2) becomes:
 * (abc(abc(abc)))
 *
 * @param {string} re
 * @param {RegExp} substitution (should be a g mode regex)
 * @param {number} depth
 * @returns {string}``
 */
function recurRegex(re, substitution, depth) {
  if (depth === -1) return "";

  return re.replace(substitution, _ => {
    return recurRegex(re, substitution, depth - 1);
  });
}

/** @type LanguageFn */
function java(hljs) {
  const regex = hljs.regex;

  // A Java identifier consisting of letters, digits, underscore or dollar sign, not beginning with a digit
  const JAVA_IDENT_RE = '[\u00C0-\u02B8a-zA-Z_$][\u00C0-\u02B8a-zA-Z_$0-9]*';

  // Optional 1..n pairs of square brackets identifying an array type
  const ARRAY_BRACKETS_OPTIONAL_RE = '(?:(?:\\s*\\[\\s*])+)?';

  // A simple Java type: a type name, optionally followed by type arguments and/or array brackets
  // '<@@@>' is replaced with the pattern for optional type arguments by recurRegex below.
  const SIMPLE_TYPE_RE = JAVA_IDENT_RE + '<@@@>' + ARRAY_BRACKETS_OPTIONAL_RE;

  // A bounded (? extends Number) or unbounded (?) wildcard type
  const WILDCARD_TYPE_RE = '\\?(?:\\s+(?:extends|super)\\s+' + SIMPLE_TYPE_RE + ')?';

  // A Java type argument, consisting of a wildcard or simple type
  const TYPE_ARG_RE = '(?:' + WILDCARD_TYPE_RE + '|' + SIMPLE_TYPE_RE + ')';

  // Pattern for optional generic type arguments in angle brackets with up to 2 levels of nested type arguments
  const TYPE_ARGS_OPTIONAL_RE = recurRegex('(?:\\s*<\\s*' + TYPE_ARG_RE + '(?:\\s*,\\s*' + TYPE_ARG_RE + ')*\\s*>)?',
                                           /<@@@>/g, 2);

  const MAIN_KEYWORDS = [
    'synchronized',
    'abstract',
    'private',
    'var',
    'static',
    'if',
    'const ',
    'for',
    'while',
    'strictfp',
    'finally',
    'protected',
    'import',
    'native',
    'final',
    'void',
    'enum',
    'else',
    'break',
    'transient',
    'catch',
    'instanceof',
    'volatile',
    'case',
    'assert',
    'package',
    'default',
    'public',
    'try',
    'switch',
    'continue',
    'throws',
    'protected',
    'public',
    'private',
    'module',
    'requires',
    'exports',
    'do',
    'sealed',
    'yield',
    'permits',
    'goto',
    'when'
  ];

  const BUILT_INS = [
    'super',
    'this'
  ];

  const LITERALS = [
    'false',
    'true',
    'null'
  ];

  const TYPES = [
    'char',
    'boolean',
    'long',
    'float',
    'int',
    'byte',
    'short',
    'double'
  ];

  const KEYWORDS = {
    keyword: MAIN_KEYWORDS,
    literal: LITERALS,
    type: TYPES,
    built_in: BUILT_INS
  };

  const ANNOTATION = {
    className: 'meta',
    begin: '@' + JAVA_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [ "self" ] // allow nested () inside our annotation
      }
    ]
  };
  const PARAMS = {
    className: 'params',
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS,
    relevance: 0,
    contains: [ hljs.C_BLOCK_COMMENT_MODE ],
    endsParent: true
  };

  return {
    name: 'Java',
    aliases: [ 'jsp' ],
    keywords: KEYWORDS,
    illegal: /<\/|#/,
    contains: [
      hljs.COMMENT(
        '/\\*\\*',
        '\\*/',
        {
          relevance: 0,
          contains: [
            {
              // eat up @'s in emails to prevent them to be recognized as doctags
              begin: /\w+@/,
              relevance: 0
            },
            {
              className: 'doctag',
              begin: '@[A-Za-z]+'
            }
          ]
        }
      ),
      // relevance boost
      {
        begin: /import java\.[a-z]+\./,
        keywords: "import",
        relevance: 2
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        begin: /"""/,
        end: /"""/,
        className: "string",
        contains: [ hljs.BACKSLASH_ESCAPE ]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        match: [
          /\b(?:class|interface|enum|extends|implements|new)/,
          /\s+/,
          JAVA_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        // Exceptions for hyphenated keywords
        match: /non-sealed/,
        scope: "keyword"
      },
      {
        // Expression keywords prevent keyword-led expressions from being
        // recognized as variable or method declarations.
        beginKeywords: 'new throw return else yield assert',
        relevance: 0
      },
      {
        begin: [
          JAVA_IDENT_RE,
          regex.concat(TYPE_ARGS_OPTIONAL_RE, ARRAY_BRACKETS_OPTIONAL_RE, /\s+/),
          JAVA_IDENT_RE,
          ARRAY_BRACKETS_OPTIONAL_RE,
          /\s*/,
          /=(?!=)/
        ],
        className: {
          1: "type",
          3: "variable",
          6: "operator"
        }
      },
      {
        begin: [
          /record/,
          /\s+/,
          JAVA_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        },
        contains: [
          PARAMS,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        begin: [
          JAVA_IDENT_RE,
          regex.concat(TYPE_ARGS_OPTIONAL_RE, ARRAY_BRACKETS_OPTIONAL_RE, /\s+/),
          JAVA_IDENT_RE,
          /\s*(?=\()/
        ],
        className: {
          1: "type",
          3: "title.function"
        },
        keywords: KEYWORDS,
        contains: [
          {
            className: 'params',
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS,
            relevance: 0,
            contains: [
              ANNOTATION,
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              NUMERIC,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      NUMERIC,
      ANNOTATION
    ]
  };
}

module.exports = java;

	return module.exports;
})({ exports: {} })],
	['kotlin', (function (module) {
// https://docs.oracle.com/javase/specs/jls/se15/html/jls-3.html#jls-3.10
var decimalDigits = '[0-9](_*[0-9])*';
var frac = `\\.(${decimalDigits})`;
var hexDigits = '[0-9a-fA-F](_*[0-9a-fA-F])*';
var NUMERIC = {
  className: 'number',
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))` +
      `[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits})[fFdD]\\b` },

    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))` +
      `[pP][+-]?(${decimalDigits})[fFdD]?\\b` },

    // DecimalIntegerLiteral
    { begin: '\\b(0|[1-9](_*[0-9])*)[lL]?\\b' },

    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },

    // OctalIntegerLiteral
    { begin: '\\b0(_*[0-7])*[lL]?\\b' },

    // BinaryIntegerLiteral
    { begin: '\\b0[bB][01](_*[01])*[lL]?\\b' },
  ],
  relevance: 0
};

/*
 Language: Kotlin
 Description: Kotlin is an OSS statically typed programming language that targets the JVM, Android, JavaScript and Native.
 Author: Sergey Mashkov <cy6erGn0m@gmail.com>
 Website: https://kotlinlang.org
 Category: common
 */


function kotlin(hljs) {
  const KEYWORDS = {
    keyword:
      'abstract as val var vararg get set class object open private protected public noinline '
      + 'crossinline dynamic final enum if else do while for when throw try catch finally '
      + 'import package is in fun override companion reified inline lateinit init '
      + 'interface annotation data sealed internal infix operator out by constructor super '
      + 'tailrec where const inner suspend typealias external expect actual',
    built_in:
      'Byte Short Char Int Long Boolean Float Double Void Unit Nothing',
    literal:
      'true false null'
  };
  const KEYWORDS_WITH_LABEL = {
    className: 'keyword',
    begin: /\b(break|continue|return|this)\b/,
    starts: { contains: [
      {
        className: 'symbol',
        begin: /@\w+/
      }
    ] }
  };
  const LABEL = {
    className: 'symbol',
    begin: hljs.UNDERSCORE_IDENT_RE + '@'
  };

  // for string templates
  const SUBST = {
    className: 'subst',
    begin: /\$\{/,
    end: /\}/,
    contains: [ hljs.C_NUMBER_MODE ]
  };
  const VARIABLE = {
    className: 'variable',
    begin: '\\$' + hljs.UNDERSCORE_IDENT_RE
  };
  const STRING = {
    className: 'string',
    variants: [
      {
        begin: '"""',
        end: '"""(?=[^"])',
        contains: [
          VARIABLE,
          SUBST
        ]
      },
      // Can't use built-in modes easily, as we want to use STRING in the meta
      // context as 'meta-string' and there's no syntax to remove explicitly set
      // classNames in built-in modes.
      {
        begin: '\'',
        end: '\'',
        illegal: /\n/,
        contains: [ hljs.BACKSLASH_ESCAPE ]
      },
      {
        begin: '"',
        end: '"',
        illegal: /\n/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          VARIABLE,
          SUBST
        ]
      }
    ]
  };
  SUBST.contains.push(STRING);

  const ANNOTATION_USE_SITE = {
    className: 'meta',
    begin: '@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*' + hljs.UNDERSCORE_IDENT_RE + ')?'
  };
  const ANNOTATION = {
    className: 'meta',
    begin: '@' + hljs.UNDERSCORE_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          hljs.inherit(STRING, { className: 'string' }),
          "self"
        ]
      }
    ]
  };

  // https://kotlinlang.org/docs/reference/whatsnew11.html#underscores-in-numeric-literals
  // According to the doc above, the number mode of kotlin is the same as java 8,
  // so the code below is copied from java.js
  const KOTLIN_NUMBER_MODE = NUMERIC;
  const KOTLIN_NESTED_COMMENT = hljs.COMMENT(
    '/\\*', '\\*/',
    { contains: [ hljs.C_BLOCK_COMMENT_MODE ] }
  );
  const KOTLIN_PAREN_TYPE = { variants: [
    {
      className: 'type',
      begin: hljs.UNDERSCORE_IDENT_RE
    },
    {
      begin: /\(/,
      end: /\)/,
      contains: [] // defined later
    }
  ] };
  const KOTLIN_PAREN_TYPE2 = KOTLIN_PAREN_TYPE;
  KOTLIN_PAREN_TYPE2.variants[1].contains = [ KOTLIN_PAREN_TYPE ];
  KOTLIN_PAREN_TYPE.variants[1].contains = [ KOTLIN_PAREN_TYPE2 ];

  return {
    name: 'Kotlin',
    aliases: [
      'kt',
      'kts',
      'ktm',
      'ktx'
    ],
    keywords: KEYWORDS,
    contains: [
      hljs.COMMENT(
        '/\\*\\*',
        '\\*/',
        {
          relevance: 0,
          contains: [
            {
              className: 'doctag',
              begin: '@[A-Za-z]+'
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      KOTLIN_NESTED_COMMENT,
      KEYWORDS_WITH_LABEL,
      LABEL,
      ANNOTATION_USE_SITE,
      ANNOTATION,
      {
        className: 'function',
        beginKeywords: 'fun',
        end: '[(]|$',
        returnBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS,
        relevance: 5,
        contains: [
          {
            begin: hljs.UNDERSCORE_IDENT_RE + '\\s*\\(',
            returnBegin: true,
            relevance: 0,
            contains: [ hljs.UNDERSCORE_TITLE_MODE ]
          },
          {
            className: 'type',
            begin: /</,
            end: />/,
            keywords: 'reified',
            relevance: 0
          },
          {
            className: 'params',
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS,
            relevance: 0,
            contains: [
              {
                begin: /:/,
                end: /[=,\/]/,
                endsWithParent: true,
                contains: [
                  KOTLIN_PAREN_TYPE,
                  hljs.C_LINE_COMMENT_MODE,
                  KOTLIN_NESTED_COMMENT
                ],
                relevance: 0
              },
              hljs.C_LINE_COMMENT_MODE,
              KOTLIN_NESTED_COMMENT,
              ANNOTATION_USE_SITE,
              ANNOTATION,
              STRING,
              hljs.C_NUMBER_MODE
            ]
          },
          KOTLIN_NESTED_COMMENT
        ]
      },
      {
        begin: [
          /class|interface|trait/,
          /\s+/,
          hljs.UNDERSCORE_IDENT_RE
        ],
        beginScope: {
          3: "title.class"
        },
        keywords: 'class interface trait',
        end: /[:\{(]|$/,
        excludeEnd: true,
        illegal: 'extends implements',
        contains: [
          { beginKeywords: 'public protected internal private constructor' },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: 'type',
            begin: /</,
            end: />/,
            excludeBegin: true,
            excludeEnd: true,
            relevance: 0
          },
          {
            className: 'type',
            begin: /[,:]\s*/,
            end: /[<\(,){\s]|$/,
            excludeBegin: true,
            returnEnd: true
          },
          ANNOTATION_USE_SITE,
          ANNOTATION
        ]
      },
      STRING,
      {
        className: 'meta',
        begin: "^#!/usr/bin/env",
        end: '$',
        illegal: '\n'
      },
      KOTLIN_NUMBER_MODE
    ]
  };
}

module.exports = kotlin;

	return module.exports;
})({ exports: {} })],
	['c', (function (module) {
/*
Language: C
Category: common, system
Website: https://en.wikipedia.org/wiki/C_(programming_language)
*/

/** @type LanguageFn */
function c(hljs) {
  const regex = hljs.regex;
  // added for historic reasons because `hljs.C_LINE_COMMENT_MODE` does
  // not include such support nor can we be sure all the grammars depending
  // on it would desire this behavior
  const C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$', { contains: [ { begin: /\\\n/ } ] });
  const DECLTYPE_AUTO_RE = 'decltype\\(auto\\)';
  const NAMESPACE_RE = '[a-zA-Z_]\\w*::';
  const TEMPLATE_ARGUMENT_RE = '<[^<>]+>';
  const FUNCTION_TYPE_RE = '('
    + DECLTYPE_AUTO_RE + '|'
    + regex.optional(NAMESPACE_RE)
    + '[a-zA-Z_]\\w*' + regex.optional(TEMPLATE_ARGUMENT_RE)
  + ')';


  // C11 <stdatomic.h> atomic type names. This is an explicit whitelist so that
  // C11 atomic *functions* (atomic_init, atomic_store, atomic_load,
  // atomic_fetch_add, ...) are not mistakenly highlighted as types. See #3837.
  const ATOMIC_TYPES = regex.concat(/\batomic_/, regex.either(
    'bool',
    'char',
    'schar',
    'uchar',
    'short',
    'ushort',
    'int',
    'uint',
    'long',
    'ulong',
    'llong',
    'ullong',
    'char16_t',
    'char32_t',
    'wchar_t',
    'int_least8_t',
    'uint_least8_t',
    'int_least16_t',
    'uint_least16_t',
    'int_least32_t',
    'uint_least32_t',
    'int_least64_t',
    'uint_least64_t',
    'int_fast8_t',
    'uint_fast8_t',
    'int_fast16_t',
    'uint_fast16_t',
    'int_fast32_t',
    'uint_fast32_t',
    'int_fast64_t',
    'uint_fast64_t',
    'intptr_t',
    'uintptr_t',
    'size_t',
    'ptrdiff_t',
    'intmax_t',
    'uintmax_t'
  ), /\b/);
  const TYPES = {
    className: 'type',
    variants: [
      { begin: '\\b[a-z\\d_]*_t\\b' },
      { match: ATOMIC_TYPES }
    ]

  };

  // https://en.cppreference.com/w/cpp/language/escape
  // \\ \x \xFF \u2837 \u00323747 \374
  const CHARACTER_ESCAPES = '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)';
  const STRINGS = {
    className: 'string',
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: '\\n',
        contains: [ hljs.BACKSLASH_ESCAPE ]
      },
      {
        begin: '(u8?|U|L)?\'(' + CHARACTER_ESCAPES + "|.)",
        end: '\'',
        illegal: '.'
      },
      // https://en.cppreference.com/w/cpp/language/string_literal
      // a d-char-sequence never contains parentheses, backslashes or whitespace;
      // quotes are excluded as well so the closing delimiter cannot swallow the
      // quote that actually terminates the literal
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\\s"]{0,16})\(/,
        end: /\)([^()\\\s"]{0,16})"/
      })
    ]
  };

  const NUMBERS = {
    className: 'number',
    variants: [
      { match: /\b(0b[01']+)/ },  
      { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },  
      { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },  
      { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }  
  ],
    relevance: 0
  };  
  
  // `#include` is the only preprocessor directive that takes an angle-bracket
  // quoted header (`#include <header>`). Scoping that rule to `#include` keeps
  // the greedy `<...>` match from eating a `>` that belongs to the body of
  // another directive (e.g. `#define what do { cout << ">"; } while (0)`),
  // which would otherwise leave an unbalanced `"` and break highlighting for
  // the rest of the file. See issue #3505.
  const PREPROCESSOR_INCLUDE = {
    scope: 'meta',
    begin: /#\s*include\b/,
    end: /$/,
    keywords: { keyword: 'include' },
    contains: [
      {
        // the `\` at the end of a line signaling continuation
        begin: /\\\n/,
      },
      STRINGS,
      {
        scope: 'string',
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };

  const PREPROCESSOR = {
    className: 'meta',
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword:
        'if else elif endif define undef warning error line '
        + 'pragma _Pragma ifdef ifndef elifdef elifndef include' },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: 'string' }),
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };

  const PREPROCESSORS = [
    PREPROCESSOR_INCLUDE,
    PREPROCESSOR
  ];

  const TITLE_MODE = {
    className: 'title',
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };

  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';
  // Bounded on purpose: an unbounded quantifier here consumes an arbitrarily
  // long run of words, and when no function title follows it the engine retries
  // the title at every token boundary of that run - quadratic in the size of
  // the document.  See #4362.
  const MAX_FUNCTION_TYPE_TOKENS = 12;

  const C_KEYWORDS = [
    "asm",
    "auto",
    "break",
    "case",
    "continue",
    "default",
    "do",
    "else",
    "enum",
    "extern",
    "for",
    "fortran",
    "goto",
    "if",
    "inline",
    "register",
    "restrict",
    "return",
    "sizeof",
    "typeof",
    "typeof_unqual",
    "struct",
    "switch",
    "typedef",
    "union",
    "volatile",
    "while",
    "_Alignas",
    "_Alignof",
    "_Atomic",
    "_Generic",
    "_Noreturn",
    "_Static_assert",
    "_Thread_local",
    // aliases
    "alignas",
    "alignof",
    "noreturn",
    "static_assert",
    "thread_local",
    // not a C keyword but is, for all intents and purposes, treated exactly like one.
    "_Pragma"
  ];

  const C_TYPES = [
    "float",
    "double",
    "signed",
    "unsigned",
    "int",
    "short",
    "long",
    "char",
    "void",
    "_Bool",
    "_BitInt",
    "_Complex",
    "_Imaginary",
    "_Decimal32",
    "_Decimal64",
    "_Decimal96",
    "_Decimal128",
    "_Decimal64x",
    "_Decimal128x",
    "_Float16",
    "_Float32",
    "_Float64",
    "_Float128",
    "_Float32x",
    "_Float64x",
    "_Float128x",
    // modifiers
    "const",
    "static",
    "constexpr",
    // aliases
    "complex",
    "bool",
    "imaginary"
  ];

  const KEYWORDS = {
    keyword: C_KEYWORDS,
    type: C_TYPES,
    literal: 'true false NULL',
    // TODO: apply hinting work similar to what was done in cpp.js
    built_in: 'std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream '
      + 'auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set '
      + 'unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos '
      + 'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp '
      + 'fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper '
      + 'isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow '
      + 'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp '
      + 'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan '
      + 'vfprintf vprintf vsprintf endl initializer_list unique_ptr',
  };

  const EXPRESSION_CONTAINS = [
    ...PREPROCESSORS,
    TYPES,
    C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    STRINGS
  ];

  const EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: 'new throw return else',
        end: /;/
      }
    ],
    keywords: KEYWORDS,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat([ 'self' ]),
        relevance: 0
      }
    ]),
    relevance: 0
  };

  const FUNCTION_DECLARATION = {
    begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+){1,' + MAX_FUNCTION_TYPE_TOKENS + '}' + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: KEYWORDS,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      { // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: KEYWORDS,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [ hljs.inherit(TITLE_MODE, { className: "title.function" }) ],
        relevance: 0
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: 'params',
        begin: /\(/,
        end: /\)/,
        keywords: KEYWORDS,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          TYPES,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: KEYWORDS,
            relevance: 0,
            contains: [
              'self',
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              TYPES
            ]
          }
        ]
      },
      TYPES,
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ...PREPROCESSORS
    ]
  };

  return {
    name: "C",
    aliases: [ 'h' ],
    keywords: KEYWORDS,
    // Until differentiations are added between `c` and `cpp`, `c` will
    // not be auto-detected to avoid auto-detect conflicts between C and C++
    disableAutodetect: true,
    illegal: '</',
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      EXPRESSION_CONTAINS,
      [
        ...PREPROCESSORS,
        {
          begin: hljs.IDENT_RE + '::',
          keywords: KEYWORDS
        },
        {
          className: 'class',
          beginKeywords: 'enum class struct union',
          end: /[{;:<>=]/,
          contains: [
            { beginKeywords: "final class struct" },
            hljs.TITLE_MODE
          ]
        }
      ]),
    exports: {
      preprocessor: PREPROCESSOR,
      strings: STRINGS,
      keywords: KEYWORDS
    }
  };
}

module.exports = c;

	return module.exports;
})({ exports: {} })],
	['cpp', (function (module) {
/*
Language: C++
Category: common, system
Website: https://isocpp.org
*/

/** @type LanguageFn */
function cpp(hljs) {
  const regex = hljs.regex;
  // added for historic reasons because `hljs.C_LINE_COMMENT_MODE` does
  // not include such support nor can we be sure all the grammars depending
  // on it would desire this behavior
  const C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$', { contains: [ { begin: /\\\n/ } ] });
  const DECLTYPE_AUTO_RE = 'decltype\\(auto\\)';
  const NAMESPACE_RE = '[a-zA-Z_]\\w*::';
  const TEMPLATE_ARGUMENT_RE = '<[^<>]+>';
  const FUNCTION_TYPE_RE = '(?!struct)('
    + DECLTYPE_AUTO_RE + '|'
    + regex.optional(NAMESPACE_RE)
    + '[a-zA-Z_]\\w*' + regex.optional(TEMPLATE_ARGUMENT_RE)
  + ')';

  const CPP_PRIMITIVE_TYPES = {
    className: 'type',
    begin: '\\b[a-z\\d_]*_t\\b'
  };

  // https://en.cppreference.com/w/cpp/language/escape
  // \\ \x \xFF \u2837 \u00323747 \374
  const CHARACTER_ESCAPES = '\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)';
  const STRINGS = {
    className: 'string',
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: '\\n',
        contains: [ hljs.BACKSLASH_ESCAPE ]
      },
      {
        begin: '(u8?|U|L)?\'(' + CHARACTER_ESCAPES + '|.)',
        end: '\'',
        illegal: '.'
      },
      // https://en.cppreference.com/w/cpp/language/string_literal
      // a d-char-sequence never contains parentheses, backslashes or whitespace;
      // quotes are excluded as well so the closing delimiter cannot swallow the
      // quote that actually terminates the literal
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\\s"]{0,16})\(/,
        end: /\)([^()\\\s"]{0,16})"/
      })
    ]
  };

  const NUMBERS = {
    className: 'number',
    variants: [
      // Floating-point literal.
      { begin:
        "[+-]?(?:" // Leading sign.
          // Decimal.
          + "(?:"
            + "\\b[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?"
            + "|\\.[0-9](?:'?[0-9])*"
          + ")(?:[Ee][+-]?[0-9](?:'?[0-9])*)?"
          + "|\\b[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*"
          // Hexadecimal.
          + "|\\b0[Xx](?:"
            +"[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?"
            + "|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*"
          + ")[Pp][+-]?[0-9](?:'?[0-9])*"
        + ")(?:" // Literal suffixes.
          + "[Ff](?:16|32|64|128)?"
          + "|(BF|bf)16"
          + "|[Ll]"
          + "|" // Literal suffix is optional.
        + ")"
      },
      // Integer literal.
      { begin:
        "[+-]?\\b(?:" // Leading sign.
          + "0[Bb][01](?:'?[01])*" // Binary.
          + "|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*" // Hexadecimal.
          + "|0(?:'?[0-7])*" // Octal or just a lone zero.
          + "|[1-9](?:'?[0-9])*" // Decimal.
        + ")(?:" // Literal suffixes.
          + "[Uu](?:LL?|ll?)"
          + "|[Uu][Zz]?"
          + "|(?:LL?|ll?)[Uu]?"
          + "|[Zz][Uu]"
          + "|" // Literal suffix is optional.
        + ")"
        // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
        // literal highlight actually makes it stand out more.
      }
    ],
    relevance: 0
  };

  // `#include` is the only preprocessor directive that takes an angle-bracket
  // quoted header (`#include <header>`). Scoping that rule to `#include` keeps
  // the greedy `<...>` match from eating a `>` that belongs to the body of
  // another directive (e.g. `#define what do { cout << ">"; } while (0)`),
  // which would otherwise leave an unbalanced `"` and break highlighting for
  // the rest of the file. See issue #3505.
  const PREPROCESSOR_INCLUDE = {
    scope: 'meta',
    begin: /#\s*include\b/,
    end: /$/,
    keywords: { keyword: 'include' },
    contains: [
      {
        // the `\` at the end of a line signaling continuation
        begin: /\\\n/,
      },
      STRINGS,
      {
        scope: 'string',
        begin: /<.*?>/
      },
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };

  const PREPROCESSOR = {
    className: 'meta',
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword:
        'if else elif endif define undef warning error line '
        + 'pragma _Pragma ifdef ifndef include' },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      hljs.inherit(STRINGS, { className: 'string' }),
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };

  const PREPROCESSORS = [
    PREPROCESSOR_INCLUDE,
    PREPROCESSOR
  ];

  const TITLE_MODE = {
    className: 'title',
    begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
    relevance: 0
  };

  const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';
  // Bounded on purpose: an unbounded quantifier here consumes an arbitrarily
  // long run of words, and when no function title follows it the engine retries
  // the title at every token boundary of that run - quadratic in the size of
  // the document.  See #4362.
  const MAX_FUNCTION_TYPE_TOKENS = 12;

  // https://en.cppreference.com/w/cpp/keyword
  const RESERVED_KEYWORDS = [
    'alignas',
    'alignof',
    'and',
    'and_eq',
    'asm',
    'atomic_cancel',
    'atomic_commit',
    'atomic_noexcept',
    'auto',
    'bitand',
    'bitor',
    'break',
    'case',
    'catch',
    'class',
    'co_await',
    'co_return',
    'co_yield',
    'compl',
    'concept',
    'const_cast|10',
    'consteval',
    'constexpr',
    'constinit',
    'continue',
    'decltype',
    'default',
    'delete',
    'do',
    'dynamic_cast|10',
    'else',
    'enum',
    'explicit',
    'export',
    'extern',
    'false',
    'final',
    'for',
    'friend',
    'goto',
    'if',
    'import',
    'inline',
    'module',
    'mutable',
    'namespace',
    'new',
    'noexcept',
    'not',
    'not_eq',
    'nullptr',
    'operator',
    'or',
    'or_eq',
    'override',
    'private',
    'protected',
    'public',
    'reflexpr',
    'register',
    'reinterpret_cast|10',
    'requires',
    'return',
    'sizeof',
    'static_assert',
    'static_cast|10',
    'struct',
    'switch',
    'synchronized',
    'template',
    'this',
    'thread_local',
    'throw',
    'transaction_safe',
    'transaction_safe_dynamic',
    'true',
    'try',
    'typedef',
    'typeid',
    'typename',
    'union',
    'using',
    'virtual',
    'volatile',
    'while',
    'xor',
    'xor_eq'
  ];

  // https://en.cppreference.com/w/cpp/keyword
  const RESERVED_TYPES = [
    'bool',
    'char',
    'char16_t',
    'char32_t',
    'char8_t',
    'double',
    'float',
    'int',
    'long',
    'short',
    'void',
    'wchar_t',
    'unsigned',
    'signed',
    'const',
    'static'
  ];

  const TYPE_HINTS = [
    'any',
    'auto_ptr',
    'barrier',
    'binary_semaphore',
    'bitset',
    'complex',
    'condition_variable',
    'condition_variable_any',
    'counting_semaphore',
    'deque',
    'false_type',
    'flat_map',
    'flat_set',
    'future',
    'imaginary',
    'initializer_list',
    'istringstream',
    'jthread',
    'latch',
    'lock_guard',
    'multimap',
    'multiset',
    'mutex',
    'optional',
    'ostringstream',
    'packaged_task',
    'pair',
    'promise',
    'priority_queue',
    'queue',
    'recursive_mutex',
    'recursive_timed_mutex',
    'scoped_lock',
    'set',
    'shared_future',
    'shared_lock',
    'shared_mutex',
    'shared_timed_mutex',
    'shared_ptr',
    'stack',
    'string_view',
    'stringstream',
    'timed_mutex',
    'thread',
    'true_type',
    'tuple',
    'unique_lock',
    'unique_ptr',
    'unordered_map',
    'unordered_multimap',
    'unordered_multiset',
    'unordered_set',
    'variant',
    'vector',
    'weak_ptr',
    'wstring',
    'wstring_view'
  ];

  const FUNCTION_HINTS = [
    'abort',
    'abs',
    'acos',
    'apply',
    'as_const',
    'asin',
    'atan',
    'atan2',
    'calloc',
    'ceil',
    'cerr',
    'cin',
    'clog',
    'cos',
    'cosh',
    'cout',
    'declval',
    'endl',
    'exchange',
    'exit',
    'exp',
    'fabs',
    'floor',
    'fmod',
    'forward',
    'fprintf',
    'fputs',
    'free',
    'frexp',
    'fscanf',
    'future',
    'invoke',
    'isalnum',
    'isalpha',
    'iscntrl',
    'isdigit',
    'isgraph',
    'islower',
    'isprint',
    'ispunct',
    'isspace',
    'isupper',
    'isxdigit',
    'labs',
    'launder',
    'ldexp',
    'log',
    'log10',
    'make_pair',
    'make_shared',
    'make_shared_for_overwrite',
    'make_tuple',
    'make_unique',
    'malloc',
    'memchr',
    'memcmp',
    'memcpy',
    'memset',
    'modf',
    'move',
    'pow',
    'printf',
    'putchar',
    'puts',
    'realloc',
    'scanf',
    'sin',
    'sinh',
    'snprintf',
    'sprintf',
    'sqrt',
    'sscanf',
    'std',
    'stderr',
    'stdin',
    'stdout',
    'strcat',
    'strchr',
    'strcmp',
    'strcpy',
    'strcspn',
    'strlen',
    'strncat',
    'strncmp',
    'strncpy',
    'strpbrk',
    'strrchr',
    'strspn',
    'strstr',
    'swap',
    'tan',
    'tanh',
    'terminate',
    'to_underlying',
    'tolower',
    'toupper',
    'vfprintf',
    'visit',
    'vprintf',
    'vsprintf'
  ];

  const LITERALS = [
    'NULL',
    'false',
    'nullopt',
    'nullptr',
    'true'
  ];

  // https://en.cppreference.com/w/cpp/keyword
  const BUILT_IN = [ '_Pragma' ];

  const CPP_KEYWORDS = {
    type: RESERVED_TYPES,
    keyword: RESERVED_KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_IN,
    _type_hints: TYPE_HINTS
  };

  const FUNCTION_DISPATCH = {
    className: 'function.dispatch',
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: FUNCTION_HINTS },
    begin: regex.concat(
      /\b/,
      `(?!${RESERVED_KEYWORDS.join('|')})`,
      hljs.IDENT_RE,
      regex.lookahead(/(<[^<>]+>|)\s*\(/))
  };

  const EXPRESSION_CONTAINS = [
    FUNCTION_DISPATCH,
    ...PREPROCESSORS,
    CPP_PRIMITIVE_TYPES,
    C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    STRINGS
  ];

  const EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: 'new throw return else',
        end: /;/
      }
    ],
    keywords: CPP_KEYWORDS,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat([ 'self' ]),
        relevance: 0
      }
    ]),
    relevance: 0
  };

  const FUNCTION_DECLARATION = {
    className: 'function',
    begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+){1,' + MAX_FUNCTION_TYPE_TOKENS + '}' + FUNCTION_TITLE,
    returnBegin: true,
    end: /[{;=]/,
    excludeEnd: true,
    keywords: CPP_KEYWORDS,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      { // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: CPP_KEYWORDS,
        relevance: 0
      },
      {
        begin: FUNCTION_TITLE,
        returnBegin: true,
        contains: [ TITLE_MODE ],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: true,
        contains: [
          STRINGS,
          NUMBERS
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: 'params',
        begin: /\(/,
        end: /\)/,
        keywords: CPP_KEYWORDS,
        relevance: 0,
        contains: [
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          STRINGS,
          NUMBERS,
          CPP_PRIMITIVE_TYPES,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: CPP_KEYWORDS,
            relevance: 0,
            contains: [
              'self',
              C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS,
              CPP_PRIMITIVE_TYPES
            ]
          }
        ]
      },
      CPP_PRIMITIVE_TYPES,
      C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      ...PREPROCESSORS
    ]
  };

  return {
    name: 'C++',
    aliases: [
      'cc',
      'c++',
      'h++',
      'hpp',
      'hh',
      'hxx',
      'cxx'
    ],
    keywords: CPP_KEYWORDS,
    illegal: '</',
    classNameAliases: { 'function.dispatch': 'built_in' },
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      FUNCTION_DISPATCH,
      EXPRESSION_CONTAINS,
      [
        ...PREPROCESSORS,
        { // containers: ie, `vector <int> rooms (9);`
          begin: '\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)',
          end: '>',
          keywords: CPP_KEYWORDS,
          contains: [
            'self',
            CPP_PRIMITIVE_TYPES
          ]
        },
        {
          begin: hljs.IDENT_RE + '::',
          keywords: CPP_KEYWORDS
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: 'keyword',
            3: 'title.class'
          }
        }
      ])
  };
}

module.exports = cpp;

	return module.exports;
})({ exports: {} })],
	['csharp', (function (module) {
/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
Contributor: Nicolas LLOBERA <nllobera@gmail.com>, Pieter Vantorre <pietervantorre@gmail.com>, David Pine <david.pine@microsoft.com>
Website: https://docs.microsoft.com/dotnet/csharp/
Category: common
*/

/** @type LanguageFn */
function csharp(hljs) {
  const BUILT_IN_KEYWORDS = [
    'bool',
    'byte',
    'char',
    'decimal',
    'delegate',
    'double',
    'dynamic',
    'enum',
    'float',
    'int',
    'long',
    'nint',
    'nuint',
    'object',
    'sbyte',
    'short',
    'string',
    'ulong',
    'uint',
    'ushort'
  ];
  const FUNCTION_MODIFIERS = [
    'public',
    'private',
    'protected',
    'static',
    'internal',
    'protected',
    'abstract',
    'async',
    'extern',
    'override',
    'unsafe',
    'virtual',
    'new',
    'sealed',
    'partial'
  ];
  const LITERAL_KEYWORDS = [
    'default',
    'false',
    'null',
    'true'
  ];
  const NORMAL_KEYWORDS = [
    'abstract',
    'as',
    'base',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'do',
    'else',
    'event',
    'explicit',
    'extern',
    'finally',
    'fixed',
    'for',
    'foreach',
    'goto',
    'if',
    'implicit',
    'in',
    'interface',
    'internal',
    'is',
    'lock',
    'namespace',
    'new',
    'operator',
    'out',
    'override',
    'params',
    'private',
    'protected',
    'public',
    'readonly',
    'record',
    'ref',
    'return',
    'scoped',
    'sealed',
    'sizeof',
    'stackalloc',
    'static',
    'struct',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'unchecked',
    'unsafe',
    'using',
    'virtual',
    'void',
    'volatile',
    'while'
  ];
  const CONTEXTUAL_KEYWORDS = [
    'add',
    'alias',
    'and',
    'ascending',
    'args',
    'async',
    'await',
    'by',
    'descending',
    'dynamic',
    'equals',
    'file',
    'from',
    'get',
    'global',
    'group',
    'init',
    'into',
    'join',
    'let',
    'nameof',
    'not',
    'notnull',
    'on',
    'or',
    'orderby',
    'partial',
    'record',
    'remove',
    'required',
    'scoped',
    'select',
    'set',
    'unmanaged',
    'value|0',
    'var',
    'when',
    'where',
    'with',
    'yield'
  ];

  const KEYWORDS = {
    keyword: NORMAL_KEYWORDS.concat(CONTEXTUAL_KEYWORDS),
    built_in: BUILT_IN_KEYWORDS,
    literal: LITERAL_KEYWORDS
  };
  const TITLE_MODE = hljs.inherit(hljs.TITLE_MODE, { begin: '[a-zA-Z](\\.?\\w)*' });
  // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types
  // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types
  // `_` separators sit between digits, and may also follow the `0x`/`0b` prefix
  const DIGITS = '\\d(_*\\d)*';
  const INTEGER_SUFFIX = '([uU][lL]?|[lL][uU]?)?';
  const REAL_SUFFIX = '([fFdDmM]|[uU][lL]?|[lL][uU]?)?';
  const NUMBERS = {
    className: 'number',
    variants: [
      { begin: '\\b0[bB]_*[01](_*[01])*' + INTEGER_SUFFIX },
      { begin: '(-?)\\b0[xX]_*[a-fA-F0-9](_*[a-fA-F0-9])*' + INTEGER_SUFFIX },
      { begin: '(-?)(\\b' + DIGITS + '(\\.(' + DIGITS + ')?)?|\\.' + DIGITS + ')([eE][-+]?' + DIGITS + ')?' + REAL_SUFFIX }
    ],
    relevance: 0
  };
  const RAW_STRING = {
    className: 'string',
    begin: /"""("*)(?!")(.|\n)*?"""\1/,
    relevance: 1
  };
  const VERBATIM_STRING = {
    className: 'string',
    begin: '@"',
    end: '"',
    contains: [ { begin: '""' } ]
  };
  const VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
  const SUBST = {
    className: 'subst',
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS
  };
  const SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
  const INTERPOLATED_STRING = {
    className: 'string',
    begin: /\$"/,
    end: '"',
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      hljs.BACKSLASH_ESCAPE,
      SUBST_NO_LF
    ]
  };
  const INTERPOLATED_VERBATIM_STRING = {
    className: 'string',
    begin: /\$@"/,
    end: '"',
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      SUBST
    ]
  };
  const INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      SUBST_NO_LF
    ]
  });
  SUBST.contains = [
    INTERPOLATED_VERBATIM_STRING,
    INTERPOLATED_STRING,
    VERBATIM_STRING,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    NUMBERS,
    hljs.C_BLOCK_COMMENT_MODE
  ];
  SUBST_NO_LF.contains = [
    INTERPOLATED_VERBATIM_STRING_NO_LF,
    INTERPOLATED_STRING,
    VERBATIM_STRING_NO_LF,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    NUMBERS,
    hljs.inherit(hljs.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
  ];
  const STRING = { variants: [
    RAW_STRING,
    INTERPOLATED_VERBATIM_STRING,
    INTERPOLATED_STRING,
    VERBATIM_STRING,
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ] };

  const GENERIC_MODIFIER = {
    begin: "<",
    end: ">",
    contains: [
      { beginKeywords: "in out" },
      TITLE_MODE
    ]
  };
  const TYPE_IDENT_RE = hljs.IDENT_RE + '(<' + hljs.IDENT_RE + '(\\s*,\\s*' + hljs.IDENT_RE + ')*>)?(\\[\\])?';
  const AT_IDENTIFIER = {
    // prevents expressions like `@class` from incorrect flagging
    // `class` as a keyword
    begin: "@" + hljs.IDENT_RE,
    relevance: 0
  };

  return {
    name: 'C#',
    aliases: [
      'cs',
      'c#'
    ],
    keywords: KEYWORDS,
    illegal: /::/,
    contains: [
      hljs.COMMENT(
        '///',
        '$',
        {
          returnBegin: true,
          contains: [
            {
              className: 'doctag',
              variants: [
                {
                  begin: '///',
                  relevance: 0
                },
                { begin: '<!--|-->' },
                {
                  begin: '</?',
                  end: '>'
                }
              ]
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'meta',
        begin: '#',
        end: '$',
        keywords: { keyword: 'if else elif endif define undef warning error line region endregion pragma checksum' }
      },
      STRING,
      NUMBERS,
      {
        beginKeywords: 'class interface',
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:,]/,
        contains: [
          { beginKeywords: "where class" },
          TITLE_MODE,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: 'namespace',
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: 'record',
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          TITLE_MODE,
          GENERIC_MODIFIER,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // [Attributes("")]
        className: 'meta',
        begin: '^\\s*\\[(?=[\\w])',
        excludeBegin: true,
        end: '\\]',
        excludeEnd: true,
        contains: [
          {
            className: 'string',
            begin: /"/,
            end: /"/
          }
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: 'new return throw await else',
        relevance: 0
      },
      {
        className: 'function',
        begin: '(' + TYPE_IDENT_RE + '\\s+)+' + hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
        returnBegin: true,
        end: /\s*[{;=]/,
        excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          // prevents these from being highlighted `title`
          {
            beginKeywords: FUNCTION_MODIFIERS.join(" "),
            relevance: 0
          },
          {
            begin: hljs.IDENT_RE + '\\s*(<[^=]+>\\s*)?\\(',
            returnBegin: true,
            contains: [
              hljs.TITLE_MODE,
              GENERIC_MODIFIER
            ],
            relevance: 0
          },
          { match: /\(\)/ },
          {
            className: 'params',
            begin: /\(/,
            end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS,
            relevance: 0,
            contains: [
              STRING,
              NUMBERS,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      AT_IDENTIFIER
    ]
  };
}

module.exports = csharp;

	return module.exports;
})({ exports: {} })],
	['go', (function (module) {
/*
Language: Go
Author: Stephan Kountso aka StepLg <steplg@gmail.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>
Description: Google go language (golang). For info about language
Website: http://golang.org/
Category: common, system
*/

function go(hljs) {
  const LITERALS = [
    "true",
    "false",
    "iota",
    "nil"
  ];
  const BUILT_INS = [
    "append",
    "cap",
    "close",
    "complex",
    "copy",
    "imag",
    "len",
    "make",
    "new",
    "panic",
    "print",
    "println",
    "real",
    "recover",
    "delete"
  ];
  const TYPES = [
    "bool",
    "byte",
    "complex64",
    "complex128",
    "error",
    "float32",
    "float64",
    "int8",
    "int16",
    "int32",
    "int64",
    "string",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "int",
    "uint",
    "uintptr",
    "rune"
  ];
  const KWS = [
    "break",
    "case",
    "chan",
    "const",
    "continue",
    "default",
    "defer",
    "else",
    "fallthrough",
    "for",
    "func",
    "go",
    "goto",
    "if",
    "import",
    "interface",
    "map",
    "package",
    "range",
    "return",
    "select",
    "struct",
    "switch",
    "type",
    "var",
  ];
  const KEYWORDS = {
    keyword: KWS,
    type: TYPES,
    literal: LITERALS,
    built_in: BUILT_INS
  };
  return {
    name: 'Go',
    aliases: [ 'golang' ],
    keywords: KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'string',
        variants: [
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          {
            begin: '`',
            end: '`'
          }
        ]
      },
      {
        className: 'number',
        variants: [
          {
            match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/, // hex without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/, // hex with a present digit before . (making a digit afterwards optional)
            relevance: 0
          },
          {
            match: /-?\b0[oO](_?[0-7])*i?/, // leading 0o octal
            relevance: 0
          },
          {
            match: /-?\b0[bB](_?[01])*i?/, // leading 0b binary
            relevance: 0
          },
          {
            match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/, // decimal without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/, // decimal with a present digit before . (making a digit afterwards optional)
            relevance: 0
          }
        ]
      },
      { begin: /:=/ // relevance booster
      },
      {
        className: 'function',
        beginKeywords: 'func',
        end: '\\s*(\\{|$)',
        excludeEnd: true,
        contains: [
          hljs.TITLE_MODE,
          {
            className: 'params',
            begin: /\(/,
            end: /\)/,
            endsParent: true,
            keywords: KEYWORDS,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}

module.exports = go;

	return module.exports;
})({ exports: {} })],
	['rust', (function (module) {
/*
Language: Rust
Author: Andrey Vlasovskikh <andrey.vlasovskikh@gmail.com>
Contributors: Roman Shmatov <romanshmatov@gmail.com>, Kasper Andersen <kma_untrusted@protonmail.com>
Website: https://www.rust-lang.org
Category: common, system
*/

/** @type LanguageFn */

function rust(hljs) {
  const regex = hljs.regex;
  // ============================================
  // Added to support the r# keyword, which is a raw identifier in Rust.
  const RAW_IDENTIFIER = /(r#)?/;
  const UNDERSCORE_IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.UNDERSCORE_IDENT_RE);
  const IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.IDENT_RE);
  // ============================================
  const FUNCTION_INVOKE = {
    scope: "title.function.invoke",
    relevance: 0,
    begin: regex.concat(
      /\b/,
      /(?!(?:let|for|while|if|else|match)\b)/,
      IDENT_RE,
      regex.lookahead(/\s*\(/))
  };
  const NUMBER_SUFFIX = '([ui](8|16|32|64|128|size)|f(16|32|64|128))\?';
  const KEYWORDS = [
    "abstract",
    "as",
    "async",
    "await",
    "become",
    "box",
    "break",
    "const",
    "continue",
    "crate",
    "do",
    "dyn",
    "else",
    "enum",
    "extern",
    "false",
    "final",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "macro",
    "match",
    "mod",
    "move",
    "mut",
    "override",
    "priv",
    "pub",
    "raw",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "try",
    "type",
    "typeof",
    "union",
    "unsafe",
    "unsized",
    "use",
    "virtual",
    "where",
    "while",
    "yield"
  ];
  const LITERALS = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ];
  const BUILTINS = [
    // functions
    'drop ',
    // traits
    "Copy",
    "Send",
    "Sized",
    "Sync",
    "Drop",
    "Fn",
    "FnMut",
    "FnOnce",
    "ToOwned",
    "Clone",
    "Debug",
    "PartialEq",
    "PartialOrd",
    "Eq",
    "Ord",
    "AsRef",
    "AsMut",
    "Into",
    "From",
    "Default",
    "Iterator",
    "Extend",
    "IntoIterator",
    "DoubleEndedIterator",
    "ExactSizeIterator",
    "SliceConcatExt",
    "ToString",
    // macros
    "assert!",
    "assert_eq!",
    "bitflags!",
    "bytes!",
    "cfg!",
    "col!",
    "concat!",
    "concat_idents!",
    "debug_assert!",
    "debug_assert_eq!",
    "env!",
    "eprintln!",
    "panic!",
    "file!",
    "format!",
    "format_args!",
    "include_bytes!",
    "include_str!",
    "line!",
    "local_data_key!",
    "module_path!",
    "option_env!",
    "print!",
    "println!",
    "select!",
    "stringify!",
    "try!",
    "unimplemented!",
    "unreachable!",
    "vec!",
    "write!",
    "writeln!",
    "macro_rules!",
    "assert_ne!",
    "debug_assert_ne!"
  ];
  const TYPES = [
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "isize",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "usize",
    "f16",
    "f32",
    "f64",
    "f128",
    "str",
    "char",
    "bool",
    "Box",
    "Option",
    "Result",
    "String",
    "Vec"
  ];
  return {
    name: 'Rust',
    aliases: [ 'rs' ],
    keywords: {
      $pattern: hljs.IDENT_RE + '!?',
      type: TYPES,
      keyword: KEYWORDS,
      literal: LITERALS,
      built_in: BUILTINS
    },
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.COMMENT('/\\*', '\\*/', { contains: [ 'self' ] }),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null
      }),
      {
        scope: 'symbol',
        // negative lookahead to avoid matching `'`
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*(?!')/
      },
      {
        scope: 'string',
        variants: [
          { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
          {
            begin: /b?'/,
            end: /'/,
            contains: [
              {
                scope: "char.escape",
                match: /\\('|"|\\|\w|x\w{2}|u\w{4}|U\w{8})/
              }
            ]
          }
        ]
      },
      {
        scope: 'number',
        variants: [
          { begin: '\\b0b([01_]+)' + NUMBER_SUFFIX },
          { begin: '\\b0o([0-7_]+)' + NUMBER_SUFFIX },
          { begin: '\\b0x([A-Fa-f0-9_]+)' + NUMBER_SUFFIX },
          { begin: '\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)'
                   + NUMBER_SUFFIX }
        ],
        relevance: 0
      },
      {
        begin: [
          /\bsafe/,
          /\s+/,
          /extern/,
        ],
        scope: {
          1: "keyword",
          3: "keyword",
        }
      },
      {
        begin: [
          /fn/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        }
      },
      {
        scope: 'meta',
        begin: '#!?\\[',
        end: '\\]',
        contains: [
          {
            scope: 'string',
            begin: /"/,
            end: /"/,
            contains: [
              hljs.BACKSLASH_ESCAPE
            ]
          }
        ]
      },
      {
        begin: [
          /let/,
          /\s+/,
          /(?:mut\s+)?/,
          UNDERSCORE_IDENT_RE
        ],
        scope: {
          1: "keyword",
          3: "keyword",
          4: "variable"
        }
      },
      // must come before impl/for rule later
      {
        begin: [
          /for/,
          /\s+/,
          UNDERSCORE_IDENT_RE,
          /\s+/,
          /in/
        ],
        scope: {
          1: "keyword",
          3: "variable",
          5: "keyword"
        }
      },
      {
        begin: [
          /type/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: [
          /(?:trait|enum|struct|union|impl|for)/,
          /\s+/,
          UNDERSCORE_IDENT_RE
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: hljs.IDENT_RE + '::',
        keywords: {
          keyword: "Self",
          built_in: BUILTINS,
          type: TYPES
        }
      },
      {
        scope: "punctuation",
        begin: '->'
      },
      FUNCTION_INVOKE
    ]
  };
}

module.exports = rust;

	return module.exports;
})({ exports: {} })],
	['ruby', (function (module) {
/*
Language: Ruby
Description: Ruby is a dynamic, open source programming language with a focus on simplicity and productivity.
Website: https://www.ruby-lang.org/
Author: Anton Kovalyov <anton@kovalyov.net>
Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>, Pascal Hurni <phi@ruby-reactive.org>, Cedric Sohrauer <sohrauer@googlemail.com>
Category: common, scripting
*/

function ruby(hljs) {
  const regex = hljs.regex;
  const RUBY_METHOD_RE = '([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)';
  // TODO: move concepts like CAMEL_CASE into `modes.js`
  const CLASS_NAME_RE = regex.either(
    /\b([A-Z]+[a-z0-9]+)+/,
    // ends in caps
    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/,
  )
  ;
  const CLASS_NAME_WITH_NAMESPACE_RE = regex.concat(CLASS_NAME_RE, /(::\w+)*/);
  // very popular ruby built-ins that one might even assume
  // are actual keywords (despite that not being the case)
  const PSEUDO_KWS = [
    "include",
    "extend",
    "prepend",
    "public",
    "private",
    "protected",
    "raise",
    "throw"
  ];
  const RUBY_KEYWORDS = {
    "variable.constant": [
      "__FILE__",
      "__LINE__",
      "__ENCODING__"
    ],
    "variable.language": [
      "self",
      "super",
    ],
    keyword: [
      "alias",
      "and",
      "begin",
      "BEGIN",
      "break",
      "case",
      "class",
      "defined",
      "do",
      "else",
      "elsif",
      "end",
      "END",
      "ensure",
      "for",
      "if",
      "in",
      "module",
      "next",
      "not",
      "or",
      "redo",
      "require",
      "rescue",
      "retry",
      "return",
      "then",
      "undef",
      "unless",
      "until",
      "when",
      "while",
      "yield",
      ...PSEUDO_KWS
    ],
    built_in: [
      "proc",
      "lambda",
      "attr_accessor",
      "attr_reader",
      "attr_writer",
      "define_method",
      "private_constant",
      "module_function"
    ],
    literal: [
      "true",
      "false",
      "nil"
    ]
  };
  const YARDOCTAG = {
    className: 'doctag',
    begin: '@[A-Za-z]+'
  };
  const IRB_OBJECT = {
    begin: '#<',
    end: '>'
  };
  const COMMENT_MODES = [
    hljs.COMMENT(
      '#',
      '$',
      { contains: [ YARDOCTAG ] }
    ),
    hljs.COMMENT(
      '^=begin',
      '^=end',
      {
        contains: [ YARDOCTAG ],
        relevance: 10
      }
    ),
    hljs.COMMENT('^__END__', hljs.MATCH_NOTHING_RE)
  ];
  const SUBST = {
    className: 'subst',
    begin: /#\{/,
    end: /\}/,
    keywords: RUBY_KEYWORDS
  };
  const STRING = {
    className: 'string',
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ],
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /`/,
        end: /`/
      },
      {
        begin: /%[qQwWx]?\(/,
        end: /\)/
      },
      {
        begin: /%[qQwWx]?\[/,
        end: /\]/
      },
      {
        begin: /%[qQwWx]?\{/,
        end: /\}/
      },
      {
        begin: /%[qQwWx]?</,
        end: />/
      },
      {
        begin: /%[qQwWx]?\//,
        end: /\//
      },
      {
        begin: /%[qQwWx]?%/,
        end: /%/
      },
      {
        begin: /%[qQwWx]?-/,
        end: /-/
      },
      {
        begin: /%[qQwWx]?\|/,
        end: /\|/
      },
      // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
      // where ? is the last character of a preceding identifier, as in: `func?4`
      { begin: /\B\?(\\\d{1,3})/ },
      { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
      { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
      { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
      { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
      { begin: /\B\?\\?\S/ },
      // heredocs
      {
        // this guard makes sure that we have an entire heredoc and not a false
        // positive (auto-detect, etc.)
        begin: regex.concat(
          /<<[-~]?'?/,
          regex.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
        ),
        contains: [
          hljs.END_SAME_AS_BEGIN({
            begin: /(\w+)/,
            end: /(\w+)/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ]
          })
        ]
      }
    ]
  };

  // Ruby syntax is underdocumented, but this grammar seems to be accurate
  // as of version 2.7.2 (confirmed with (irb and `Ripper.sexp(...)`)
  // https://docs.ruby-lang.org/en/2.7.0/doc/syntax/literals_rdoc.html#label-Numbers
  const decimal = '[1-9](_?[0-9])*|0';
  const digits = '[0-9](_?[0-9])*';
  const NUMBER = {
    className: 'number',
    relevance: 0,
    variants: [
      // decimal integer/float, optionally exponential or rational, optionally imaginary
      { begin: `\\b(${decimal})(\\.(${digits}))?([eE][+-]?(${digits})|r)?i?\\b` },

      // explicit decimal/binary/octal/hexadecimal integer,
      // optionally rational and/or imaginary
      { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },

      // 0-prefixed implicit octal integer, optionally rational and/or imaginary
      { begin: "\\b0(_?[0-7])+r?i?\\b" }
    ]
  };

  const PARAMS = {
    variants: [
      {
        match: /\(\)/,
      },
      {
        className: 'params',
        begin: /\(/,
        end: /(?=\))/,
        excludeBegin: true,
        endsParent: true,
        keywords: RUBY_KEYWORDS,
      }
    ]
  };

  const INCLUDE_EXTEND = {
    match: [
      /(include|extend)\s+/,
      CLASS_NAME_WITH_NAMESPACE_RE
    ],
    scope: {
      2: "title.class"
    },
    keywords: RUBY_KEYWORDS
  };

  const CLASS_DEFINITION = {
    variants: [
      {
        match: [
          /class\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE,
          /\s+<\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE
        ]
      },
      {
        match: [
          /\b(class|module)\s+/,
          CLASS_NAME_WITH_NAMESPACE_RE
        ]
      }
    ],
    scope: {
      2: "title.class",
      4: "title.class.inherited"
    },
    keywords: RUBY_KEYWORDS
  };

  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };

  const METHOD_DEFINITION = {
    match: [
      /def/, /\s+/,
      RUBY_METHOD_RE
    ],
    scope: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };

  const OBJECT_CREATION = {
    relevance: 0,
    match: [
      CLASS_NAME_WITH_NAMESPACE_RE,
      /\.new[. (]/
    ],
    scope: {
      1: "title.class"
    }
  };

  // CamelCase
  const CLASS_REFERENCE = {
    relevance: 0,
    match: CLASS_NAME_RE,
    scope: "title.class"
  };

  const RUBY_DEFAULT_CONTAINS = [
    STRING,
    CLASS_DEFINITION,
    INCLUDE_EXTEND,
    OBJECT_CREATION,
    UPPER_CASE_CONSTANT,
    CLASS_REFERENCE,
    METHOD_DEFINITION,
    {
      // swallow the scope resolution operator so `::` is not read as a symbol
      begin: '::'
    },
    {
      className: 'symbol',
      begin: hljs.UNDERSCORE_IDENT_RE + '(!|\\?)?:',
      relevance: 0
    },
    {
      className: 'symbol',
      begin: ':(?!\\s)',
      contains: [
        STRING,
        { begin: RUBY_METHOD_RE }
      ],
      relevance: 0
    },
    NUMBER,
    {
      // negative-look forward attempts to prevent false matches like:
      // @ident@ or $ident$ that might indicate this is not ruby at all
      className: "variable",
      begin: '(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])' + `(?![A-Za-z])(?![@$?'])`
    },
    {
      className: 'params',
      begin: /\|(?!=)/,
      end: /\|/,
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0, // this could be a lot of things (in other languages) other than params
      keywords: RUBY_KEYWORDS
    },
    { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + '|unless)\\s*',
      keywords: 'unless',
      contains: [
        {
          className: 'regexp',
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          illegal: /\n/,
          variants: [
            {
              begin: '/',
              end: '/[a-z]*'
            },
            {
              begin: /%r\{/,
              end: /\}[a-z]*/
            },
            {
              begin: '%r\\(',
              end: '\\)[a-z]*'
            },
            {
              begin: '%r!',
              end: '![a-z]*'
            },
            {
              begin: '%r\\[',
              end: '\\][a-z]*'
            }
          ]
        }
      ].concat(IRB_OBJECT, COMMENT_MODES),
      relevance: 0
    }
  ].concat(IRB_OBJECT, COMMENT_MODES);

  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  PARAMS.contains = RUBY_DEFAULT_CONTAINS;

  // >>
  // ?>
  const SIMPLE_PROMPT = "[>?]>";
  // irb(main):001:0>
  const DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]";
  const RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>";

  const IRB_DEFAULT = [
    {
      begin: /^\s*=>/,
      starts: {
        end: '$',
        contains: RUBY_DEFAULT_CONTAINS
      }
    },
    {
      className: 'meta.prompt',
      begin: '^(' + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + '|' + RVM_PROMPT + ')(?=[ ])',
      starts: {
        end: '$',
        keywords: RUBY_KEYWORDS,
        contains: RUBY_DEFAULT_CONTAINS
      }
    }
  ];

  COMMENT_MODES.unshift(IRB_OBJECT);

  return {
    name: 'Ruby',
    aliases: [
      'rb',
      'gemspec',
      'podspec',
      'thor',
      'irb'
    ],
    keywords: RUBY_KEYWORDS,
    illegal: /\/\*/,
    contains: [ hljs.SHEBANG({ binary: "ruby" }) ]
      .concat(IRB_DEFAULT)
      .concat(COMMENT_MODES)
      .concat(RUBY_DEFAULT_CONTAINS)
  };
}

module.exports = ruby;

	return module.exports;
})({ exports: {} })],
	['php', (function (module) {
/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
Website: https://www.php.net
Description: Use this for plain PHP code, i.e. code that does not include the
             surrounding `<?php ... ?>` tags. If your snippet mixes PHP with
             HTML markup and the opening/closing tags, use `php-template`
             instead.
Category: common
*/

/**
 * @param {HLJSApi} hljs
 * @returns {LanguageDetail}
 * */
function php(hljs) {
  const regex = hljs.regex;
  // negative look-ahead tries to avoid matching patterns that are not
  // Perl at all like $ident$, @ident@, etc.
  const NOT_PERL_ETC = /(?![A-Za-z0-9])(?![$])/;
  const IDENT_RE = regex.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    NOT_PERL_ETC);
  // Will not detect camelCase classes
  const PASCAL_CASE_CLASS_NAME_RE = regex.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    NOT_PERL_ETC);
  const UPCASE_NAME_RE = regex.concat(
    /[A-Z]+/,
    NOT_PERL_ETC);
  const VARIABLE = {
    scope: 'variable',
    match: '\\$+' + IDENT_RE,
  };
  const PREPROCESSOR = {
    scope: "meta",
    variants: [
      { begin: /<\?php/, relevance: 10 }, // boost for obvious PHP
      { begin: /<\?=/ },
      // less relevant per PSR-1 which says not to use short-tags
      { begin: /<\?/, relevance: 0.1 },
      { begin: /\?>/ } // end php tag
    ]
  };
  const SUBST = {
    scope: 'subst',
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  };
  const SINGLE_QUOTED = hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null, });
  const DOUBLE_QUOTED = hljs.inherit(hljs.QUOTE_STRING_MODE, {
    illegal: null,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
  });

  const HEREDOC = {
    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
    end: /[ \t]*(\w+)\b/,
    contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
    'on:begin': (m, resp) => { resp.data._beginMatch = m[1] || m[2]; },
    'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); },
  };

  const NOWDOC = hljs.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*'(\w+)'\n/,
    end: /[ \t]*(\w+)\b/,
  });
  // list of valid whitespaces because non-breaking space might be part of a IDENT_RE
  const WHITESPACE = '[ \t\n]';
  const STRING = {
    scope: 'string',
    variants: [
      DOUBLE_QUOTED,
      SINGLE_QUOTED,
      HEREDOC,
      NOWDOC
    ]
  };
  const NUMBER = {
    scope: 'number',
    variants: [
      { begin: `\\b0[bB][01]+(?:_[01]+)*\\b` }, // Binary w/ underscore support
      { begin: `\\b0[oO][0-7]+(?:_[0-7]+)*\\b` }, // Octals w/ underscore support
      { begin: `\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b` }, // Hex w/ underscore support
      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
      { begin: `(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?` }
    ],
    relevance: 0
  };
  const LITERALS = [
    "false",
    "null",
    "true"
  ];
  const KWS = [
    // Magic constants:
    // <https://www.php.net/manual/en/language.constants.predefined.php>
    "__CLASS__",
    "__DIR__",
    "__FILE__",
    "__FUNCTION__",
    "__COMPILER_HALT_OFFSET__",
    "__LINE__",
    "__METHOD__",
    "__NAMESPACE__",
    "__TRAIT__",
    // Function that look like language construct or language construct that look like function:
    // List of keywords that may not require parenthesis
    "die",
    "echo",
    "exit",
    "include",
    "include_once",
    "print",
    "require",
    "require_once",
    // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
    // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
    // Other keywords:
    // <https://www.php.net/manual/en/reserved.php>
    // <https://www.php.net/manual/en/language.types.type-juggling.php>
    "array",
    "abstract",
    "and",
    "as",
    "binary",
    "bool",
    "boolean",
    "break",
    "callable",
    "case",
    "catch",
    "class",
    "clone",
    "const",
    "continue",
    "declare",
    "default",
    "do",
    "double",
    "else",
    "elseif",
    "empty",
    "enddeclare",
    "endfor",
    "endforeach",
    "endif",
    "endswitch",
    "endwhile",
    "enum",
    "eval",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "foreach",
    "from",
    "global",
    "goto",
    "if",
    "implements",
    "instanceof",
    "insteadof",
    "int",
    "integer",
    "interface",
    "isset",
    "iterable",
    "list",
    "match|0",
    "mixed",
    "new",
    "never",
    "object",
    "or",
    "private",
    "protected",
    "public",
    "readonly",
    "real",
    "return",
    "string",
    "switch",
    "throw",
    "trait",
    "try",
    "unset",
    "use",
    "var",
    "void",
    "while",
    "xor",
    "yield"
  ];

  const BUILT_INS = [
    // Standard PHP library:
    // <https://www.php.net/manual/en/book.spl.php>
    "Error|0",
    "AppendIterator",
    "ArgumentCountError",
    "ArithmeticError",
    "ArrayIterator",
    "ArrayObject",
    "AssertionError",
    "BadFunctionCallException",
    "BadMethodCallException",
    "CachingIterator",
    "CallbackFilterIterator",
    "CompileError",
    "Countable",
    "DirectoryIterator",
    "DivisionByZeroError",
    "DomainException",
    "EmptyIterator",
    "ErrorException",
    "Exception",
    "FilesystemIterator",
    "FilterIterator",
    "GlobIterator",
    "InfiniteIterator",
    "InvalidArgumentException",
    "IteratorIterator",
    "LengthException",
    "LimitIterator",
    "LogicException",
    "MultipleIterator",
    "NoRewindIterator",
    "OutOfBoundsException",
    "OutOfRangeException",
    "OuterIterator",
    "OverflowException",
    "ParentIterator",
    "ParseError",
    "RangeException",
    "RecursiveArrayIterator",
    "RecursiveCachingIterator",
    "RecursiveCallbackFilterIterator",
    "RecursiveDirectoryIterator",
    "RecursiveFilterIterator",
    "RecursiveIterator",
    "RecursiveIteratorIterator",
    "RecursiveRegexIterator",
    "RecursiveTreeIterator",
    "RegexIterator",
    "RuntimeException",
    "SeekableIterator",
    "SplDoublyLinkedList",
    "SplFileInfo",
    "SplFileObject",
    "SplFixedArray",
    "SplHeap",
    "SplMaxHeap",
    "SplMinHeap",
    "SplObjectStorage",
    "SplObserver",
    "SplPriorityQueue",
    "SplQueue",
    "SplStack",
    "SplSubject",
    "SplTempFileObject",
    "TypeError",
    "UnderflowException",
    "UnexpectedValueException",
    "UnhandledMatchError",
    // Reserved interfaces:
    // <https://www.php.net/manual/en/reserved.interfaces.php>
    "ArrayAccess",
    "BackedEnum",
    "Closure",
    "Fiber",
    "Generator",
    "Iterator",
    "IteratorAggregate",
    "Serializable",
    "Stringable",
    "Throwable",
    "Traversable",
    "UnitEnum",
    "WeakReference",
    "WeakMap",
    // Reserved classes:
    // <https://www.php.net/manual/en/reserved.classes.php>
    "Directory",
    "__PHP_Incomplete_Class",
    "parent",
    "php_user_filter",
    "self",
    "static",
    "stdClass"
  ];

  /** Dual-case keywords
   *
   * ["then","FILE"] =>
   *     ["then", "THEN", "FILE", "file"]
   *
   * @param {string[]} items */
  const dualCase = (items) => {
    /** @type string[] */
    const result = [];
    items.forEach(item => {
      result.push(item);
      if (item.toLowerCase() === item) {
        result.push(item.toUpperCase());
      } else {
        result.push(item.toLowerCase());
      }
    });
    return result;
  };

  const KEYWORDS = {
    keyword: KWS,
    literal: dualCase(LITERALS),
    built_in: BUILT_INS,
  };

  /**
   * @param {string[]} items */
  const normalizeKeywords = (items) => {
    return items.map(item => {
      return item.replace(/\|\d+$/, "");
    });
  };

  const CONSTRUCTOR_CALL = { variants: [
    {
      match: [
        /new/,
        regex.concat(WHITESPACE, "+"),
        // to prevent built ins from being confused as the class constructor call
        regex.concat("(?!", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
        PASCAL_CASE_CLASS_NAME_RE,
      ],
      scope: {
        1: "keyword",
        4: "title.class",
      },
    }
  ] };

  const CONSTANT_REFERENCE = regex.concat(IDENT_RE, "\\b(?!\\()");

  const LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON = { variants: [
    {
      match: [
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE,
      ],
      scope: { 2: "variable.constant", },
    },
    {
      match: [
        /::/,
        /class/,
      ],
      scope: { 2: "variable.language", },
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          /::/,
          regex.lookahead(/(?!class\b)/)
        ),
        CONSTANT_REFERENCE,
      ],
      scope: {
        1: "title.class",
        3: "variable.constant",
      },
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        regex.concat(
          "::",
          regex.lookahead(/(?!class\b)/)
        ),
      ],
      scope: { 1: "title.class", },
    },
    {
      match: [
        PASCAL_CASE_CLASS_NAME_RE,
        /::/,
        /class/,
      ],
      scope: {
        1: "title.class",
        3: "variable.language",
      },
    }
  ] };

  const NAMED_ARGUMENT = {
    scope: 'attr',
    match: regex.concat(IDENT_RE, regex.lookahead(':'), regex.lookahead(/(?!::)/)),
  };
  const PARAMS_MODE = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS,
    contains: [
      NAMED_ARGUMENT,
      VARIABLE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      STRING,
      NUMBER,
      CONSTRUCTOR_CALL,
    ],
  };
  const FUNCTION_INVOKE = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      regex.concat("(?!fn\\b|function\\b|", normalizeKeywords(KWS).join("\\b|"), "|", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
      IDENT_RE,
      regex.concat(WHITESPACE, "*"),
      regex.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke", },
    contains: [ PARAMS_MODE ]
  };
  PARAMS_MODE.contains.push(FUNCTION_INVOKE);

  const ATTRIBUTE_CONTAINS = [
    NAMED_ARGUMENT,
    LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
    hljs.C_BLOCK_COMMENT_MODE,
    hljs.C_LINE_COMMENT_MODE,
    hljs.HASH_COMMENT_MODE,
    STRING,
    NUMBER,
    CONSTRUCTOR_CALL,
  ];

  const ATTRIBUTES = {
    begin: regex.concat(/#\[\s*\\?/,
      regex.either(
        PASCAL_CASE_CLASS_NAME_RE,
        UPCASE_NAME_RE
      )
    ),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: LITERALS,
      keyword: [
        'new',
        'array',
      ]
    },
    contains: [
      {
        begin: /\[/,
        end: /]/,
        keywords: {
          literal: LITERALS,
          keyword: [
            'new',
            'array',
          ]
        },
        contains: [
          'self',
          ...ATTRIBUTE_CONTAINS,
        ]
      },
      ...ATTRIBUTE_CONTAINS,
      {
        scope: 'meta',
        variants: [
          { match: PASCAL_CASE_CLASS_NAME_RE },
          { match: UPCASE_NAME_RE }
        ]
      }
    ]
  };

  return {
    case_insensitive: false,
    keywords: KEYWORDS,
    contains: [
      ATTRIBUTES,
      hljs.HASH_COMMENT_MODE,
      hljs.COMMENT('//', '$'),
      hljs.COMMENT(
        '/\\*',
        '\\*/',
        { contains: [
          {
            scope: 'doctag',
            match: '@[A-Za-z]+'
          }
        ] }
      ),
      {
        match: /__halt_compiler\(\);/,
        keywords: '__halt_compiler',
        starts: {
          scope: "comment",
          end: hljs.MATCH_NOTHING_RE,
          contains: [
            {
              match: /\?>/,
              scope: "meta",
              endsParent: true
            }
          ]
        }
      },
      PREPROCESSOR,
      {
        scope: 'variable.language',
        match: /\$this\b/
      },
      VARIABLE,
      FUNCTION_INVOKE,
      LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
      {
        match: [
          /const/,
          /\s/,
          IDENT_RE,
        ],
        scope: {
          1: "keyword",
          3: "variable.constant",
        },
      },
      CONSTRUCTOR_CALL,
      {
        scope: 'function',
        relevance: 0,
        beginKeywords: 'fn function',
        end: /[;{]/,
        excludeEnd: true,
        illegal: '[$%\\[]',
        contains: [
          { beginKeywords: 'use', },
          hljs.UNDERSCORE_TITLE_MODE,
          {
            begin: '=>', // No markup, just a relevance booster
            endsParent: true
          },
          {
            scope: 'params',
            begin: '\\(',
            end: '\\)',
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS,
            contains: [
              'self',
              ATTRIBUTES,
              VARIABLE,
              LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
              hljs.C_BLOCK_COMMENT_MODE,
              hljs.C_LINE_COMMENT_MODE,
              hljs.HASH_COMMENT_MODE,
              STRING,
              NUMBER
            ]
          },
        ]
      },
      {
        scope: 'class',
        variants: [
          {
            beginKeywords: "enum",
            illegal: /[($"]/
          },
          {
            beginKeywords: "class interface trait",
            illegal: /[:($"]/
          }
        ],
        relevance: 0,
        end: /\{/,
        excludeEnd: true,
        contains: [
          { beginKeywords: 'extends implements' },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      // both use and namespace still use "old style" rules (vs multi-match)
      // because the namespace name can include `\` and we still want each
      // element to be treated as its own *individual* title
      {
        beginKeywords: 'namespace',
        relevance: 0,
        end: ';',
        illegal: /[.']/,
        contains: [ hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, { scope: "title.class" }) ]
      },
      {
        beginKeywords: 'use',
        relevance: 0,
        end: ';',
        contains: [
          // TODO: title.function vs title.class
          {
            match: /\b(as|const|function)\b/,
            scope: "keyword"
          },
          // TODO: could be title.class or title.function
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      STRING,
      NUMBER,
    ]
  };
}

module.exports = php;

	return module.exports;
})({ exports: {} })],
	['swift', (function (module) {
/**
 * @param {string} value
 * @returns {RegExp}
 * */

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function source(re) {
  if (!re) return null;
  if (typeof re === "string") return re;

  return re.source;
}

/**
 * @param {RegExp | string } re
 * @returns {string}
 */
function lookahead(re) {
  return concat('(?=', re, ')');
}

/**
 * @param {...(RegExp | string) } args
 * @returns {string}
 */
function concat(...args) {
  const joined = args.map((x) => source(x)).join("");
  return joined;
}

/**
 * @param { Array<string | RegExp | Object> } args
 * @returns {object}
 */
function stripOptionsFromArgs(args) {
  const opts = args[args.length - 1];

  if (typeof opts === 'object' && opts.constructor === Object) {
    args.splice(args.length - 1, 1);
    return opts;
  } else {
    return {};
  }
}

/** @typedef { {capture?: boolean} } RegexEitherOptions */

/**
 * Any of the passed expresssions may match
 *
 * Creates a huge this | this | that | that match
 * @param {(RegExp | string)[] | [...(RegExp | string)[], RegexEitherOptions]} args
 * @returns {string}
 */
function either(...args) {
  /** @type { object & {capture?: boolean} }  */
  const opts = stripOptionsFromArgs(args);
  const joined = '('
    + (opts.capture ? "" : "?:")
    + args.map((x) => source(x)).join("|") + ")";
  return joined;
}

// BACKREF_RE matches an open parenthesis or backreference. To avoid an
// incorrect parse, it also matches the constructs where the meaning of
// parentheses, escapes, or capture counting changes.
new RegExp(either(
  /\[(?:[^\\\]]|\\.)*\]/, // a character class, inside which ( and \ lose their meaning
  /\(\?<(?![=!])[^>]+>/, // a named capture group `(?<name>` (not a lookbehind `(?<=` / `(?<!`)
  /\(\?'[^']+'/, // a named capture group `(?'name'`
  /\(\??/, // an opening parenthesis, capturing or non-capturing / lookahead
  /\\([1-9][0-9]*)/, // a backreference like `\1`
  /\\./ // any other escape sequence
));

const keywordWrapper = keyword => concat(
  /\b/,
  keyword,
  /\w$/.test(keyword) ? /\b/ : /\B/
);

// Keywords that require a leading dot.
const dotKeywords = [
  'Protocol', // contextual
  'Type' // contextual
].map(keywordWrapper);

// Keywords that may have a leading dot.
const optionalDotKeywords = [
  'init',
  'self'
].map(keywordWrapper);

// should register as keyword, not type
const keywordTypes = [
  'Any',
  'Self'
];

// Regular keywords and literals.
const keywords = [
  // strings below will be fed into the regular `keywords` engine while regex
  // will result in additional modes being created to scan for those keywords to
  // avoid conflicts with other rules
  'actor',
  'any', // contextual
  'associatedtype',
  'async',
  'await',
  /as\?/, // operator
  /as!/, // operator
  'as', // operator
  'borrowing', // contextual
  'break',
  'case',
  'catch',
  'class',
  'consume', // contextual
  'consuming', // contextual
  'continue',
  'convenience', // contextual
  'copy', // contextual
  'default',
  'defer',
  'deinit',
  'didSet', // contextual
  'distributed',
  'do',
  'dynamic', // contextual
  'each',
  'else',
  'enum',
  'extension',
  'fallthrough',
  /fileprivate\(set\)/,
  'fileprivate',
  'final', // contextual
  'for',
  'func',
  'get', // contextual
  'guard',
  'if',
  'import',
  'indirect', // contextual
  'infix', // contextual
  /init\?/,
  /init!/,
  'inout',
  /internal\(set\)/,
  'internal',
  'in',
  'is', // operator
  'isolated', // contextual
  'nonisolated', // contextual
  'lazy', // contextual
  'let',
  'macro',
  'mutating', // contextual
  'nonmutating', // contextual
  /open\(set\)/, // contextual
  'open', // contextual
  'operator',
  'optional', // contextual
  'override', // contextual
  'package',
  'postfix', // contextual
  'precedencegroup',
  'prefix', // contextual
  /private\(set\)/,
  'private',
  'protocol',
  /public\(set\)/,
  'public',
  'repeat',
  'required', // contextual
  'rethrows',
  'return',
  'set', // contextual
  'some', // contextual
  'static',
  'struct',
  'subscript',
  'super',
  'switch',
  'throws',
  'throw',
  /try\?/, // operator
  /try!/, // operator
  'try', // operator
  'typealias',
  /unowned\(safe\)/, // contextual
  /unowned\(unsafe\)/, // contextual
  'unowned', // contextual
  'var',
  'weak', // contextual
  'where',
  'while',
  'willSet' // contextual
];

// NOTE: Contextual keywords are reserved only in specific contexts.
// Ideally, these should be matched using modes to avoid false positives.

// Literals.
const literals = [
  'false',
  'nil',
  'true'
];

// Keywords used in precedence groups.
const precedencegroupKeywords = [
  'assignment',
  'associativity',
  'higherThan',
  'left',
  'lowerThan',
  'none',
  'right'
];

// Keywords that start with a number sign (#).
// #(un)available is handled separately.
const numberSignKeywords = [
  '#colorLiteral',
  '#column',
  '#dsohandle',
  '#else',
  '#elseif',
  '#endif',
  '#error',
  '#file',
  '#fileID',
  '#fileLiteral',
  '#filePath',
  '#function',
  '#if',
  '#imageLiteral',
  '#keyPath',
  '#line',
  '#selector',
  '#sourceLocation',
  '#warning'
];

// Global functions in the Standard Library.
const builtIns = [
  'abs',
  'all',
  'any',
  'assert',
  'assertionFailure',
  'debugPrint',
  'dump',
  'fatalError',
  'getVaList',
  'isKnownUniquelyReferenced',
  'max',
  'min',
  'numericCast',
  'pointwiseMax',
  'pointwiseMin',
  'precondition',
  'preconditionFailure',
  'print',
  'readLine',
  'repeatElement',
  'sequence',
  'stride',
  'swap',
  'swift_unboxFromSwiftValueWithType',
  'transcode',
  'type',
  'unsafeBitCast',
  'unsafeDowncast',
  'withExtendedLifetime',
  'withUnsafeMutablePointer',
  'withUnsafePointer',
  'withVaList',
  'withoutActuallyEscaping',
  'zip'
];

// Valid first characters for operators.
const operatorHead = either(
  /[/=\-+!*%<>&|^~?]/,
  /[\u00A1-\u00A7]/,
  /[\u00A9\u00AB]/,
  /[\u00AC\u00AE]/,
  /[\u00B0\u00B1]/,
  /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
  /[\u2016-\u2017]/,
  /[\u2020-\u2027]/,
  /[\u2030-\u203E]/,
  /[\u2041-\u2053]/,
  /[\u2055-\u205E]/,
  /[\u2190-\u23FF]/,
  /[\u2500-\u2775]/,
  /[\u2794-\u2BFF]/,
  /[\u2E00-\u2E7F]/,
  /[\u3001-\u3003]/,
  /[\u3008-\u3020]/,
  /[\u3030]/
);

// Valid characters for operators.
const operatorCharacter = either(
  operatorHead,
  /[\u0300-\u036F]/,
  /[\u1DC0-\u1DFF]/,
  /[\u20D0-\u20FF]/,
  /[\uFE00-\uFE0F]/,
  /[\uFE20-\uFE2F]/
  // TODO: The following characters are also allowed, but the regex isn't supported yet.
  // /[\u{E0100}-\u{E01EF}]/u
);

// Valid operator.
const operator = concat(operatorHead, operatorCharacter, '*');

// Valid first characters for identifiers.
const identifierHead = either(
  /[a-zA-Z_]/,
  /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
  /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
  /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
  /[\u1E00-\u1FFF]/,
  /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
  /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
  /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
  /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
  /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
  /[\uFE47-\uFEFE\uFF00-\uFFFD]/ // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
  // The following characters are also allowed, but the regexes aren't supported yet.
  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
);

// Valid characters for identifiers.
const identifierCharacter = either(
  identifierHead,
  /\d/,
  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
);

// Valid identifier.
const identifier = concat(identifierHead, identifierCharacter, '*');

// Valid type identifier.
const typeIdentifier = concat(/[A-Z]/, identifierCharacter, '*');

// Built-in attributes, which are highlighted as keywords.
// @available is handled separately.
// https://docs.swift.org/swift-book/documentation/the-swift-programming-language/attributes
const keywordAttributes = [
  'attached',
  'autoclosure',
  concat(/convention\(/, either('swift', 'block', 'c'), /\)/),
  'discardableResult',
  'dynamicCallable',
  'dynamicMemberLookup',
  'escaping',
  'freestanding',
  'frozen',
  'GKInspectable',
  'IBAction',
  'IBDesignable',
  'IBInspectable',
  'IBOutlet',
  'IBSegueAction',
  'inlinable',
  'main',
  'nonobjc',
  'NSApplicationMain',
  'NSCopying',
  'NSManaged',
  concat(/objc\(/, identifier, /\)/),
  'objc',
  'objcMembers',
  'propertyWrapper',
  'requires_stored_property_inits',
  'resultBuilder',
  'Sendable',
  'testable',
  'UIApplicationMain',
  'unchecked',
  'unknown',
  'usableFromInline',
  'warn_unqualified_access'
];

// Contextual keywords used in @available and #(un)available.
const availabilityKeywords = [
  'iOS',
  'iOSApplicationExtension',
  'macOS',
  'macOSApplicationExtension',
  'macCatalyst',
  'macCatalystApplicationExtension',
  'watchOS',
  'watchOSApplicationExtension',
  'tvOS',
  'tvOSApplicationExtension',
  'swift'
];

/*
Language: Swift
Description: Swift is a general-purpose programming language built using a modern approach to safety, performance, and software design patterns.
Author: Steven Van Impe <steven.vanimpe@icloud.com>
Contributors: Chris Eidhof <chris@eidhof.nl>, Nate Cook <natecook@gmail.com>, Alexander Lichter <manniL@gmx.net>, Richard Gibson <gibson042@github>
Website: https://swift.org
Category: common, system
*/


/** @type LanguageFn */
function swift(hljs) {
  const WHITESPACE = {
    match: /\s+/,
    relevance: 0
  };
  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID411
  const BLOCK_COMMENT = hljs.COMMENT(
    '/\\*',
    '\\*/',
    { contains: [ 'self' ] }
  );
  const COMMENTS = [
    hljs.C_LINE_COMMENT_MODE,
    BLOCK_COMMENT
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID413
  // https://docs.swift.org/swift-book/ReferenceManual/zzSummaryOfTheGrammar.html
  const DOT_KEYWORD = {
    match: [
      /\./,
      either(...dotKeywords, ...optionalDotKeywords)
    ],
    className: { 2: "keyword" }
  };
  const KEYWORD_GUARD = {
    // Consume .keyword to prevent highlighting properties and methods as keywords.
    match: concat(/\./, either(...keywords)),
    relevance: 0
  };
  const PLAIN_KEYWORDS = keywords
    .filter(kw => typeof kw === 'string')
    .concat([ "_|0" ]); // seems common, so 0 relevance
  const REGEX_KEYWORDS = keywords
    .filter(kw => typeof kw !== 'string') // find regex
    .concat(keywordTypes)
    .map(keywordWrapper);
  const KEYWORD = { variants: [
    {
      className: 'keyword',
      match: either(...REGEX_KEYWORDS, ...optionalDotKeywords)
    }
  ] };
  // find all the regular keywords
  const KEYWORDS = {
    $pattern: either(
      /\b\w+/, // regular keywords
      /#\w+/ // number keywords
    ),
    keyword: PLAIN_KEYWORDS
      .concat(numberSignKeywords),
    literal: literals
  };
  const KEYWORD_MODES = [
    DOT_KEYWORD,
    KEYWORD_GUARD,
    KEYWORD
  ];

  // https://github.com/apple/swift/tree/main/stdlib/public/core
  const BUILT_IN_GUARD = {
    // Consume .built_in to prevent highlighting properties and methods.
    match: concat(/\./, either(...builtIns)),
    relevance: 0
  };
  const BUILT_IN = {
    className: 'built_in',
    match: concat(/\b/, either(...builtIns), /(?=\()/)
  };
  const BUILT_INS = [
    BUILT_IN_GUARD,
    BUILT_IN
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID418
  const OPERATOR_GUARD = {
    // Prevent -> from being highlighting as an operator.
    match: /->/,
    relevance: 0
  };
  const OPERATOR = {
    className: 'operator',
    relevance: 0,
    variants: [
      { match: operator },
      {
        // dot-operator: only operators that start with a dot are allowed to use dots as
        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
        // characters that may also include dots.
        match: `\\.(\\.|${operatorCharacter})+` }
    ]
  };
  const OPERATORS = [
    OPERATOR_GUARD,
    OPERATOR
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#grammar_numeric-literal
  // TODO: Update for leading `-` after lookbehind is supported everywhere
  const decimalDigits = '([0-9]_*)+';
  const hexDigits = '([0-9a-fA-F]_*)+';
  const NUMBER = {
    className: 'number',
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${decimalDigits})(\\.(${decimalDigits}))?` + `([eE][+-]?(${decimalDigits}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0x(${hexDigits})(\\.(${hexDigits}))?` + `([pP][+-]?(${decimalDigits}))?\\b` },
      // octal-literal
      { match: /\b0o([0-7]_*)+\b/ },
      // binary-literal
      { match: /\b0b([01]_*)+\b/ }
    ]
  };

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#grammar_string-literal
  const ESCAPED_CHARACTER = (rawDelimiter = "") => ({
    className: 'subst',
    variants: [
      { match: concat(/\\/, rawDelimiter, /[0\\tnr"']/) },
      { match: concat(/\\/, rawDelimiter, /u\{[0-9a-fA-F]{1,8}\}/) }
    ]
  });
  const ESCAPED_NEWLINE = (rawDelimiter = "") => ({
    className: 'subst',
    match: concat(/\\/, rawDelimiter, /[\t ]*(?:[\r\n]|\r\n)/)
  });
  const INTERPOLATION = (rawDelimiter = "") => ({
    className: 'subst',
    label: "interpol",
    begin: concat(/\\/, rawDelimiter, /\(/),
    end: /\)/
  });
  const MULTILINE_STRING = (rawDelimiter = "") => ({
    begin: concat(rawDelimiter, /"""/),
    end: concat(/"""/, rawDelimiter),
    contains: [
      ESCAPED_CHARACTER(rawDelimiter),
      ESCAPED_NEWLINE(rawDelimiter),
      INTERPOLATION(rawDelimiter)
    ]
  });
  const SINGLE_LINE_STRING = (rawDelimiter = "") => ({
    begin: concat(rawDelimiter, /"/),
    end: concat(/"/, rawDelimiter),
    contains: [
      ESCAPED_CHARACTER(rawDelimiter),
      INTERPOLATION(rawDelimiter)
    ]
  });
  const STRING = {
    className: 'string',
    variants: [
      MULTILINE_STRING(),
      MULTILINE_STRING("#"),
      MULTILINE_STRING("##"),
      MULTILINE_STRING("###"),
      SINGLE_LINE_STRING(),
      SINGLE_LINE_STRING("#"),
      SINGLE_LINE_STRING("##"),
      SINGLE_LINE_STRING("###")
    ]
  };

  const REGEXP_CONTENTS = [
    hljs.BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [ hljs.BACKSLASH_ESCAPE ]
    }
  ];

  const BARE_REGEXP_LITERAL = {
    begin: /\/[^\s](?=[^/\n]*\/)/,
    end: /\//,
    contains: REGEXP_CONTENTS
  };

  const EXTENDED_REGEXP_LITERAL = (rawDelimiter) => {
    const begin = concat(rawDelimiter, /\//);
    const end = concat(/\//, rawDelimiter);
    return {
      begin,
      end,
      contains: [
        ...REGEXP_CONTENTS,
        {
          scope: "comment",
          begin: `#(?!.*${end})`,
          end: /$/,
        },
      ],
    };
  };

  // https://docs.swift.org/swift-book/documentation/the-swift-programming-language/lexicalstructure/#Regular-Expression-Literals
  const REGEXP = {
    scope: "regexp",
    variants: [
      EXTENDED_REGEXP_LITERAL('###'),
      EXTENDED_REGEXP_LITERAL('##'),
      EXTENDED_REGEXP_LITERAL('#'),
      BARE_REGEXP_LITERAL
    ]
  };

  // https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#ID412
  const QUOTED_IDENTIFIER = { match: concat(/`/, identifier, /`/) };
  const IMPLICIT_PARAMETER = {
    className: 'variable',
    match: /\$\d+/
  };
  const PROPERTY_WRAPPER_PROJECTION = {
    className: 'variable',
    match: `\\$${identifierCharacter}+`
  };
  const IDENTIFIERS = [
    QUOTED_IDENTIFIER,
    IMPLICIT_PARAMETER,
    PROPERTY_WRAPPER_PROJECTION
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/Attributes.html
  const AVAILABLE_ATTRIBUTE = {
    match: /(@|#(un)?)available/,
    scope: 'keyword',
    starts: { contains: [
      {
        begin: /\(/,
        end: /\)/,
        keywords: availabilityKeywords,
        contains: [
          ...OPERATORS,
          NUMBER,
          STRING
        ]
      }
    ] }
  };

  const KEYWORD_ATTRIBUTE = {
    scope: 'keyword',
    match: concat(/@/, either(...keywordAttributes), lookahead(either(/\(/, /\s+/))),
  };

  const USER_DEFINED_ATTRIBUTE = {
    scope: 'meta',
    match: concat(/@/, identifier)
  };

  const ATTRIBUTES = [
    AVAILABLE_ATTRIBUTE,
    KEYWORD_ATTRIBUTE,
    USER_DEFINED_ATTRIBUTE
  ];

  // https://docs.swift.org/swift-book/ReferenceManual/Types.html
  const TYPE = {
    match: lookahead(/\b[A-Z]/),
    relevance: 0,
    contains: [
      { // Common Apple frameworks, for relevance boost
        className: 'type',
        match: concat(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, identifierCharacter, '+')
      },
      { // Type identifier
        className: 'type',
        match: typeIdentifier,
        relevance: 0
      },
      { // Optional type
        match: /[?!]+/,
        relevance: 0
      },
      { // Variadic parameter
        match: /\.\.\./,
        relevance: 0
      },
      { // Protocol composition
        match: concat(/\s+&\s+/, lookahead(typeIdentifier)),
        relevance: 0
      }
    ]
  };
  const GENERIC_ARGUMENTS = {
    begin: /</,
    end: />/,
    keywords: KEYWORDS,
    contains: [
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...ATTRIBUTES,
      OPERATOR_GUARD,
      TYPE
    ]
  };
  TYPE.contains.push(GENERIC_ARGUMENTS);

  // https://docs.swift.org/swift-book/ReferenceManual/Expressions.html#ID552
  // Prevents element names from being highlighted as keywords.
  const TUPLE_ELEMENT_NAME = {
    match: concat(identifier, /\s*:/),
    keywords: "_|0",
    relevance: 0
  };
  // Matches tuples as well as the parameter list of a function type.
  const TUPLE = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    keywords: KEYWORDS,
    contains: [
      'self',
      TUPLE_ELEMENT_NAME,
      ...COMMENTS,
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES,
      TYPE
    ]
  };

  const GENERIC_PARAMETERS = {
    begin: /</,
    end: />/,
    keywords: 'repeat each',
    contains: [
      ...COMMENTS,
      TYPE
    ]
  };
  const FUNCTION_PARAMETER_NAME = {
    begin: either(
      lookahead(concat(identifier, /\s*:/)),
      lookahead(concat(identifier, /\s+/, identifier, /\s*:/))
    ),
    end: /:/,
    relevance: 0,
    contains: [
      {
        className: 'keyword',
        match: /\b_\b/
      },
      {
        className: 'params',
        match: identifier
      }
    ]
  };
  const FUNCTION_PARAMETERS = {
    begin: /\(/,
    end: /\)/,
    keywords: KEYWORDS,
    contains: [
      FUNCTION_PARAMETER_NAME,
      ...COMMENTS,
      ...KEYWORD_MODES,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...ATTRIBUTES,
      TYPE,
      TUPLE
    ],
    endsParent: true,
    illegal: /["']/
  };
  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID362
  // https://docs.swift.org/swift-book/documentation/the-swift-programming-language/declarations/#Macro-Declaration
  const FUNCTION_OR_MACRO = {
    match: [
      /(func|macro)/,
      /\s+/,
      either(QUOTED_IDENTIFIER.match, identifier, operator)
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      GENERIC_PARAMETERS,
      FUNCTION_PARAMETERS,
      WHITESPACE
    ],
    illegal: [
      /\[/,
      /%/
    ]
  };

  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID375
  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID379
  const INIT_SUBSCRIPT = {
    match: [
      /\b(?:subscript|init[?!]?)/,
      /\s*(?=[<(])/,
    ],
    className: { 1: "keyword" },
    contains: [
      GENERIC_PARAMETERS,
      FUNCTION_PARAMETERS,
      WHITESPACE
    ],
    illegal: /\[|%/
  };
  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID380
  const OPERATOR_DECLARATION = {
    match: [
      /operator/,
      /\s+/,
      operator
    ],
    className: {
      1: "keyword",
      3: "title"
    }
  };

  // https://docs.swift.org/swift-book/ReferenceManual/Declarations.html#ID550
  const PRECEDENCEGROUP = {
    begin: [
      /precedencegroup/,
      /\s+/,
      typeIdentifier
    ],
    className: {
      1: "keyword",
      3: "title"
    },
    contains: [ TYPE ],
    keywords: [
      ...precedencegroupKeywords,
      ...literals
    ],
    end: /}/
  };

  const CLASS_FUNC_DECLARATION = {
    match: [
      /class\b/,          
      /\s+/,
      /func\b/,
      /\s+/,
      /\b[A-Za-z_][A-Za-z0-9_]*\b/ 
    ],
    scope: {
      1: "keyword",
      3: "keyword",
      5: "title.function"
    }
  };

  const CLASS_VAR_DECLARATION = {
    match: [
      /class\b/,
      /\s+/,          
      /var\b/, 
    ],
    scope: {
      1: "keyword",
      3: "keyword"
    }
  };

  const TYPE_DECLARATION = {
    begin: [
      /(struct|protocol|class|extension|enum|actor)/,
      /\s+/,
      identifier,
      /\s*/,
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    },
    keywords: KEYWORDS,
    contains: [
      GENERIC_PARAMETERS,
      ...KEYWORD_MODES,
      {
        begin: /:/,
        end: /\{/,
        keywords: KEYWORDS,
        contains: [
          {
            scope: "title.class.inherited",
            match: typeIdentifier,
          },
          ...KEYWORD_MODES,
        ],
        relevance: 0,
      },
    ]
  };

  // Add supported submodes to string interpolation.
  for (const variant of STRING.variants) {
    const interpolation = variant.contains.find(mode => mode.label === "interpol");
    // TODO: Interpolation can contain any expression, so there's room for improvement here.
    interpolation.keywords = KEYWORDS;
    const submodes = [
      ...KEYWORD_MODES,
      ...BUILT_INS,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS
    ];
    interpolation.contains = [
      ...submodes,
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          'self',
          ...submodes
        ]
      }
    ];
  }

  return {
    name: 'Swift',
    keywords: KEYWORDS,
    contains: [
      ...COMMENTS,
      FUNCTION_OR_MACRO,
      INIT_SUBSCRIPT,
      CLASS_FUNC_DECLARATION,
      CLASS_VAR_DECLARATION,
      TYPE_DECLARATION,
      OPERATOR_DECLARATION,
      PRECEDENCEGROUP,
      {
        beginKeywords: 'import',
        end: /$/,
        contains: [ ...COMMENTS ],
        relevance: 0
      },
      REGEXP,
      ...KEYWORD_MODES,
      ...BUILT_INS,
      ...OPERATORS,
      NUMBER,
      STRING,
      ...IDENTIFIERS,
      ...ATTRIBUTES,
      TYPE,
      TUPLE
    ]
  };
}

module.exports = swift;

	return module.exports;
})({ exports: {} })],
	['lua', (function (module) {
/*
Language: Lua
Description: Lua is a powerful, efficient, lightweight, embeddable scripting language.
Author: Andrew Fedorov <dmmdrs@mail.ru>
Category: common, gaming, scripting
Website: https://www.lua.org
*/

function lua(hljs) {
  const OPENING_LONG_BRACKET = '\\[=*\\[';
  const CLOSING_LONG_BRACKET = '\\]=*\\]';
  const LONG_BRACKETS = {
    begin: OPENING_LONG_BRACKET,
    end: CLOSING_LONG_BRACKET,
    contains: [ 'self' ]
  };
  const COMMENTS = [
    hljs.COMMENT('--(?!' + OPENING_LONG_BRACKET + ')', '$'),
    hljs.COMMENT(
      '--' + OPENING_LONG_BRACKET,
      CLOSING_LONG_BRACKET,
      {
        contains: [ LONG_BRACKETS ],
        relevance: 10
      }
    )
  ];
  return {
    name: 'Lua',
    aliases: ['pluto'],
    keywords: {
      $pattern: hljs.UNDERSCORE_IDENT_RE,
      literal: "true false nil",
      keyword: "and break do else elseif end for goto if in local global not or repeat return then until while",
      built_in:
        // Metatags and globals:
        '_G _ENV _VERSION __index __newindex __mode __call __metatable __tostring __len '
        + '__gc __add __sub __mul __div __mod __pow __concat __unm __eq __lt __le assert '
        // Standard methods and properties:
        + 'collectgarbage dofile error getfenv getmetatable ipairs load loadfile loadstring '
        + 'module next pairs pcall print rawequal rawget rawset require select setfenv '
        + 'setmetatable tonumber tostring type unpack xpcall arg self '
        // Library methods and properties (one line per library):
        + 'coroutine resume yield status wrap create running debug getupvalue '
        + 'debug sethook getmetatable gethook setmetatable setlocal traceback setfenv getinfo setupvalue getlocal getregistry getfenv '
        + 'io lines write close flush open output type read stderr stdin input stdout popen tmpfile '
        + 'math log max acos huge ldexp pi cos tanh pow deg tan cosh sinh random randomseed frexp ceil floor rad abs sqrt modf asin min mod fmod log10 atan2 exp sin atan '
        + 'os exit setlocale date getenv difftime remove time clock tmpname rename execute package preload loadlib loaded loaders cpath config path seeall '
        + 'string sub upper len gfind rep find match char dump gmatch reverse byte format gsub lower '
        + 'table setn insert getn foreachi maxn foreach concat sort remove'
    },
    contains: COMMENTS.concat([
      {
        className: 'function',
        beginKeywords: 'function',
        end: '\\)',
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: '([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*' }),
          {
            className: 'params',
            begin: '\\(',
            endsWithParent: true,
            contains: COMMENTS
          }
        ].concat(COMMENTS)
      },
      hljs.C_NUMBER_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: OPENING_LONG_BRACKET,
        end: CLOSING_LONG_BRACKET,
        contains: [ LONG_BRACKETS ],
        relevance: 5
      }
    ])
  };
}

module.exports = lua;

	return module.exports;
})({ exports: {} })],
	['perl', (function (module) {
/*
Language: Perl
Author: Peter Leonov <gojpeg@yandex.ru>
Website: https://www.perl.org
Category: common
*/

/** @type LanguageFn */
function perl(hljs) {
  const regex = hljs.regex;
  const KEYWORDS = [
    'abs',
    'accept',
    'alarm',
    'and',
    'atan2',
    'bind',
    'binmode',
    'bless',
    'break',
    'caller',
    'chdir',
    'chmod',
    'chomp',
    'chop',
    'chown',
    'chr',
    'chroot',
    'class',
    'close',
    'closedir',
    'connect',
    'continue',
    'cos',
    'crypt',
    'dbmclose',
    'dbmopen',
    'defined',
    'delete',
    'die',
    'do',
    'dump',
    'each',
    'else',
    'elsif',
    'endgrent',
    'endhostent',
    'endnetent',
    'endprotoent',
    'endpwent',
    'endservent',
    'eof',
    'eval',
    'exec',
    'exists',
    'exit',
    'exp',
    'fcntl',
    'field',
    'fileno',
    'flock',
    'for',
    'foreach',
    'fork',
    'format',
    'formline',
    'getc',
    'getgrent',
    'getgrgid',
    'getgrnam',
    'gethostbyaddr',
    'gethostbyname',
    'gethostent',
    'getlogin',
    'getnetbyaddr',
    'getnetbyname',
    'getnetent',
    'getpeername',
    'getpgrp',
    'getpriority',
    'getprotobyname',
    'getprotobynumber',
    'getprotoent',
    'getpwent',
    'getpwnam',
    'getpwuid',
    'getservbyname',
    'getservbyport',
    'getservent',
    'getsockname',
    'getsockopt',
    'given',
    'glob',
    'gmtime',
    'goto',
    'grep',
    'gt',
    'hex',
    'if',
    'index',
    'int',
    'ioctl',
    'join',
    'keys',
    'kill',
    'last',
    'lc',
    'lcfirst',
    'length',
    'link',
    'listen',
    'local',
    'localtime',
    'log',
    'lstat',
    'lt',
    'ma',
    'map',
    'method',
    'mkdir',
    'msgctl',
    'msgget',
    'msgrcv',
    'msgsnd',
    'my',
    'ne',
    'next',
    'no',
    'not',
    'oct',
    'open',
    'opendir',
    'or',
    'ord',
    'our',
    'pack',
    'package',
    'pipe',
    'pop',
    'pos',
    'print',
    'printf',
    'prototype',
    'push',
    'q|0',
    'qq',
    'quotemeta',
    'qw',
    'qx',
    'rand',
    'read',
    'readdir',
    'readline',
    'readlink',
    'readpipe',
    'recv',
    'redo',
    'ref',
    'rename',
    'require',
    'reset',
    'return',
    'reverse',
    'rewinddir',
    'rindex',
    'rmdir',
    'say',
    'scalar',
    'seek',
    'seekdir',
    'select',
    'semctl',
    'semget',
    'semop',
    'send',
    'setgrent',
    'sethostent',
    'setnetent',
    'setpgrp',
    'setpriority',
    'setprotoent',
    'setpwent',
    'setservent',
    'setsockopt',
    'shift',
    'shmctl',
    'shmget',
    'shmread',
    'shmwrite',
    'shutdown',
    'sin',
    'sleep',
    'socket',
    'socketpair',
    'sort',
    'splice',
    'split',
    'sprintf',
    'sqrt',
    'srand',
    'stat',
    'state',
    'study',
    'sub',
    'substr',
    'symlink',
    'syscall',
    'sysopen',
    'sysread',
    'sysseek',
    'system',
    'syswrite',
    'tell',
    'telldir',
    'tie',
    'tied',
    'time',
    'times',
    'tr',
    'truncate',
    'uc',
    'ucfirst',
    'umask',
    'undef',
    'unless',
    'unlink',
    'unpack',
    'unshift',
    'untie',
    'until',
    'use',
    'utime',
    'values',
    'vec',
    'wait',
    'waitpid',
    'wantarray',
    'warn',
    'when',
    'while',
    'write',
    'x|0',
    'xor',
    'y|0'
  ];

  // https://perldoc.perl.org/perlre#Modifiers
  const REGEX_MODIFIERS = /[dualxmsipngr]{0,12}/; // aa and xx are valid, making max length 12
  const PERL_KEYWORDS = {
    $pattern: /[\w.]+/,
    keyword: KEYWORDS.join(" ")
  };
  const SUBST = {
    className: 'subst',
    begin: '[$@]\\{',
    end: '\\}',
    keywords: PERL_KEYWORDS
  };
  const METHOD = {
    begin: /->\{/,
    end: /\}/
    // contains defined later
  };
  const ATTR = {
    scope: 'attr',
    match: /\s+:\s*\w+(\s*\(.*?\))?/,
  };
  const VAR = {
    scope: 'variable',
    variants: [
      { begin: /\$\d/ },
      { begin: regex.concat(
        /[$%@](?!")(\^\w\b|#\w+(::\w+)*|\{\w+\}|\w+(::\w*)*)/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        `(?![A-Za-z])(?![@$%])`
        )
      },
      {
        // Only $= is a special Perl variable and one can't declare @= or %=.
        begin: /[$%@](?!")[^\s\w{=]|\$=/,
        relevance: 0
      }
    ],
    contains: [ ATTR ],
  };
  const NUMBER = {
    className: 'number',
    variants: [
      // decimal numbers:
      // include the case where a number starts with a dot (eg. .9), and
      // the leading 0? avoids mixing the first and second match on 0.x cases
      { match: /0?\.[0-9][0-9_]+\b/ },
      // include the special versioned number (eg. v5.38)
      { match: /\bv?(0|[1-9][0-9_]*(\.[0-9_]+)?|[1-9][0-9_]*)\b/ },
      // non-decimal numbers:
      { match: /\b0[0-7][0-7_]*\b/ },
      { match: /\b0x[0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { match: /\b0b[0-1][0-1_]*\b/ },
    ],
    relevance: 0
  };
  const STRING_CONTAINS = [
    hljs.BACKSLASH_ESCAPE,
    SUBST,
    VAR
  ];
  const REGEX_DELIMS = [
    /!/,
    /\//,
    /\|/,
    /\?/,
    /'/,
    /"/, // valid but infrequent and weird
    /#/ // valid but infrequent and weird
  ];
  /**
   * @param {string|RegExp} prefix
   * @param {string|RegExp} open
   * @param {string|RegExp} close
   */
  const PAIRED_DOUBLE_RE = (prefix, open, close = '\\1') => {
    const middle = (close === '\\1')
      ? close
      : regex.concat(close, open);
    return regex.concat(
      regex.concat("(?:", prefix, ")"),
      open,
      /(?:\\.|[^\\\/])*?/,
      middle,
      /(?:\\.|[^\\\/])*?/,
      close,
      REGEX_MODIFIERS
    );
  };
  /**
   * @param {string|RegExp} prefix
   * @param {string|RegExp} open
   * @param {string|RegExp} close
   */
  const PAIRED_RE = (prefix, open, close) => {
    return regex.concat(
      regex.concat("(?:", prefix, ")"),
      open,
      /(?:\\.|[^\\\/])*?/,
      close,
      REGEX_MODIFIERS
    );
  };
  const PERL_DEFAULT_CONTAINS = [
    VAR,
    hljs.HASH_COMMENT_MODE,
    hljs.COMMENT(
      /^=\w/,
      /=cut/,
      { endsWithParent: true }
    ),
    METHOD,
    {
      className: 'string',
      contains: STRING_CONTAINS,
      variants: [
        {
          begin: 'q[qwxr]?\\s*\\(',
          end: '\\)',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\[',
          end: '\\]',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\{',
          end: '\\}',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\|',
          end: '\\|',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*<',
          end: '>',
          relevance: 5
        },
        {
          begin: 'qw\\s+q',
          end: 'q',
          relevance: 5
        },
        {
          begin: '\'',
          end: '\'',
          contains: [ hljs.BACKSLASH_ESCAPE ]
        },
        {
          begin: '"',
          end: '"'
        },
        {
          begin: '`',
          end: '`',
          contains: [ hljs.BACKSLASH_ESCAPE ]
        },
        {
          begin: /\{\w+\}/,
          relevance: 0
        },
        {
          begin: '-?\\w+\\s*=>',
          relevance: 0
        }
      ]
    },
    NUMBER,
    { // regexp container
      begin: '(\\/\\/|' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
      keywords: 'split return print reverse grep',
      relevance: 0,
      contains: [
        hljs.HASH_COMMENT_MODE,
        {
          className: 'regexp',
          variants: [
            // allow matching common delimiters
            { begin: PAIRED_DOUBLE_RE("s|tr|y", regex.either(...REGEX_DELIMS, { capture: true })) },
            // and then paired delmis
            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\(", "\\)") },
            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\[", "\\]") },
            { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\{", "\\}") }
          ],
          relevance: 2
        },
        {
          className: 'regexp',
          variants: [
            {
              // could be a comment in many languages so do not count
              // as relevant
              begin: /(m|qr)\/\//,
              relevance: 0
            },
            // prefix is optional with /regex/
            { begin: PAIRED_RE("(?:m|qr)?", /\//, /\//) },
            // allow matching common delimiters
            { begin: PAIRED_RE("m|qr", regex.either(...REGEX_DELIMS, { capture: true }), /\1/) },
            // allow common paired delmins
            { begin: PAIRED_RE("m|qr", /\(/, /\)/) },
            { begin: PAIRED_RE("m|qr", /\[/, /\]/) },
            { begin: PAIRED_RE("m|qr", /\{/, /\}/) }
          ]
        }
      ]
    },
    {
      className: 'function',
      beginKeywords: 'sub method',
      end: '(\\s*\\(.*?\\))?[;{]',
      excludeEnd: true,
      relevance: 5,
      contains: [ hljs.TITLE_MODE, ATTR ]
    },
    {
      className: 'class',
      beginKeywords: 'class',
      end: '[;{]',
      excludeEnd: true,
      relevance: 5,
      contains: [ hljs.TITLE_MODE, ATTR, NUMBER ]
    },
    {
      begin: '-\\w\\b',
      relevance: 0
    },
    {
      begin: "^__DATA__$",
      end: "^__END__$",
      subLanguage: 'mojolicious',
      contains: [
        {
          begin: "^@@.*",
          end: "$",
          className: "comment"
        }
      ]
    }
  ];
  SUBST.contains = PERL_DEFAULT_CONTAINS;
  METHOD.contains = PERL_DEFAULT_CONTAINS;

  return {
    name: 'Perl',
    aliases: [
      'pl',
      'pm'
    ],
    keywords: PERL_KEYWORDS,
    contains: PERL_DEFAULT_CONTAINS
  };
}

module.exports = perl;

	return module.exports;
})({ exports: {} })],
	['bash', (function (module) {
/*
Language: Bash
Author: vah <vahtenberg@gmail.com>
Contributrors: Benjamin Pannell <contact@sierrasoftworks.com>
Website: https://www.gnu.org/software/bash/
Category: common, scripting
*/

/** @type LanguageFn */
function bash(hljs) {
  const regex = hljs.regex;
  const VAR = {};
  const BRACED_VAR = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [ VAR ]
      } // default values
    ]
  };
  Object.assign(VAR, {
    className: 'variable',
    variants: [
      { begin: regex.concat(/\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        `(?![\\w\\d])(?![$])`) },
      BRACED_VAR
    ]
  });

  const SUBST = {
    className: 'subst',
    begin: /\$\(/,
    end: /\)/,
    contains: [ hljs.BACKSLASH_ESCAPE ]
  };
  const COMMENT = hljs.inherit(
    hljs.COMMENT(),
    {
      match: [
        /(^|\s)/,
        /#.*$/
      ],
      scope: {
        2: 'comment'
      }
    }
  );
  const HERE_DOC = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      hljs.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: 'string'
      })
    ] }
  };
  const QUOTE_STRING = {
    className: 'string',
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      SUBST
    ]
  };
  SUBST.contains.push(QUOTE_STRING);
  const ESCAPED_QUOTE = {
    match: /\\"/
  };
  const APOS_STRING = {
    className: 'string',
    begin: /'/,
    end: /'/
  };
  const ESCAPED_APOS = {
    match: /\\'/
  };
  const ARITHMETIC = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      hljs.NUMBER_MODE,
      VAR
    ]
  };
  const SH_LIKE_SHELLS = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh",
  ];
  const KNOWN_SHEBANG = hljs.SHEBANG({
    binary: `(${SH_LIKE_SHELLS.join("|")})`,
    relevance: 10
  });
  const FUNCTION = {
    className: 'function',
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: true,
    contains: [ hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ }) ],
    relevance: 0
  };

  const KEYWORDS = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "time",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "coproc",
    "function",
    "select"
  ];

  const LITERALS = [
    "true",
    "false"
  ];

  // to consume paths to prevent keyword matches inside them
  const PATH_MODE = { match: /(\/[a-z._-]+)+/ };

  // http://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
  const SHELL_BUILT_INS = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ];

  const BASH_BUILT_INS = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "sudo",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ];

  const ZSH_BUILT_INS = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ];

  const GNU_CORE_UTILS = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];

  return {
    name: 'Bash',
    aliases: [
      'sh',
      'zsh'
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: KEYWORDS,
      literal: LITERALS,
      built_in: [
        ...SHELL_BUILT_INS,
        ...BASH_BUILT_INS,
        // Shell modifiers
        "set",
        "shopt",
        ...ZSH_BUILT_INS,
        ...GNU_CORE_UTILS
      ]
    },
    contains: [
      KNOWN_SHEBANG, // to catch known shells and boost relevancy
      hljs.SHEBANG(), // to catch unknown shells but still highlight the shebang
      FUNCTION,
      ARITHMETIC,
      COMMENT,
      HERE_DOC,
      PATH_MODE,
      QUOTE_STRING,
      ESCAPED_QUOTE,
      APOS_STRING,
      ESCAPED_APOS,
      VAR
    ]
  };
}

module.exports = bash;

	return module.exports;
})({ exports: {} })],
	['powershell', (function (module) {
/*
Language: PowerShell
Description: PowerShell is a task-based command-line shell and scripting language built on .NET.
Author: David Mohundro <david@mohundro.com>
Contributors: Nicholas Blumhardt <nblumhardt@nblumhardt.com>, Victor Zhou <OiCMudkips@users.noreply.github.com>, Nicolas Le Gall <contact@nlegall.fr>
Website: https://docs.microsoft.com/en-us/powershell/
Category: scripting
*/

function powershell(hljs) {
  const TYPES = [
    "string",
    "char",
    "byte",
    "int",
    "long",
    "bool",
    "decimal",
    "single",
    "double",
    "DateTime",
    "xml",
    "array",
    "hashtable",
    "void"
  ];

  // https://docs.microsoft.com/en-us/powershell/scripting/developer/cmdlet/approved-verbs-for-windows-powershell-commands
  const VALID_VERBS =
    'Add|Clear|Close|Copy|Enter|Exit|Find|Format|Get|Hide|Join|Lock|'
    + 'Move|New|Open|Optimize|Pop|Push|Redo|Remove|Rename|Reset|Resize|'
    + 'Search|Select|Set|Show|Skip|Split|Step|Switch|Undo|Unlock|'
    + 'Watch|Backup|Checkpoint|Compare|Compress|Convert|ConvertFrom|'
    + 'ConvertTo|Dismount|Edit|Expand|Export|Group|Import|Initialize|'
    + 'Limit|Merge|Mount|Out|Publish|Restore|Save|Sync|Unpublish|Update|'
    + 'Approve|Assert|Build|Complete|Confirm|Deny|Deploy|Disable|Enable|Install|Invoke|'
    + 'Register|Request|Restart|Resume|Start|Stop|Submit|Suspend|Uninstall|'
    + 'Unregister|Wait|Debug|Measure|Ping|Repair|Resolve|Test|Trace|Connect|'
    + 'Disconnect|Read|Receive|Send|Write|Block|Grant|Protect|Revoke|Unblock|'
    + 'Unprotect|Use|ForEach|Sort|Tee|Where';

  const COMPARISON_OPERATORS =
    '-and|-as|-band|-bnot|-bor|-bxor|-casesensitive|-ccontains|-ceq|-cge|-cgt|'
    + '-cle|-clike|-clt|-cmatch|-cne|-cnotcontains|-cnotlike|-cnotmatch|-contains|'
    + '-creplace|-csplit|-eq|-exact|-f|-file|-ge|-gt|-icontains|-ieq|-ige|-igt|'
    + '-ile|-ilike|-ilt|-imatch|-in|-ine|-inotcontains|-inotlike|-inotmatch|'
    + '-ireplace|-is|-isnot|-isplit|-join|-le|-like|-lt|-match|-ne|-not|'
    + '-notcontains|-notin|-notlike|-notmatch|-or|-regex|-replace|-shl|-shr|'
    + '-split|-wildcard|-xor';

  const KEYWORDS = {
    $pattern: /-?[A-z\.\-]+\b/,
    keyword:
      'if else foreach return do while until elseif begin for trap data dynamicparam '
      + 'end break throw param continue finally in switch exit filter try process catch '
      + 'hidden static parameter',
    // "echo" relevance has been set to 0 to avoid auto-detect conflicts with shell transcripts
    built_in:
      'ac asnp cat cd CFS chdir clc clear clhy cli clp cls clv cnsn compare copy cp '
      + 'cpi cpp curl cvpa dbp del diff dir dnsn ebp echo|0 epal epcsv epsn erase etsn exsn fc fhx '
      + 'fl ft fw gal gbp gc gcb gci gcm gcs gdr gerr ghy gi gin gjb gl gm gmo gp gps gpv group '
      + 'gsn gsnp gsv gtz gu gv gwmi h history icm iex ihy ii ipal ipcsv ipmo ipsn irm ise iwmi '
      + 'iwr kill lp ls man md measure mi mount move mp mv nal ndr ni nmo npssc nsn nv ogv oh '
      + 'popd ps pushd pwd r rbp rcjb rcsn rd rdr ren ri rjb rm rmdir rmo rni rnp rp rsn rsnp '
      + 'rujb rv rvpa rwmi sajb sal saps sasv sbp sc scb select set shcm si sl sleep sls sort sp '
      + 'spjb spps spsv start stz sujb sv swmi tee trcm type wget where wjb write'
    // TODO: 'validate[A-Z]+' can't work in keywords
  };

  const TITLE_NAME_RE = /\w[\w\d]*((-)[\w\d]+)*/;

  const BACKTICK_ESCAPE = {
    begin: '`[\\s\\S]',
    relevance: 0
  };

  const VAR = {
    className: 'variable',
    variants: [
      { begin: /\$\B/ },
      {
        className: 'keyword',
        begin: /\$this/
      },
      { begin: /\$[\w\d][\w\d_:]*/ }
    ]
  };

  const LITERAL = {
    className: 'literal',
    begin: /\$(null|true|false)\b/
  };

  const QUOTE_STRING = {
    className: "string",
    variants: [
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /@"/,
        end: /^"@/
      }
    ],
    contains: [
      BACKTICK_ESCAPE,
      VAR,
      {
        className: 'variable',
        begin: /\$[A-z]/,
        end: /[^A-z]/
      }
    ]
  };

  const APOS_STRING = {
    className: 'string',
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /@'/,
        end: /^'@/
      }
    ]
  };

  const PS_HELPTAGS = {
    className: "doctag",
    variants: [
      /* no paramater help tags */
      { begin: /\.(synopsis|description|example|inputs|outputs|notes|link|component|role|functionality)/ },
      /* one parameter help tags */
      { begin: /\.(parameter|forwardhelptargetname|forwardhelpcategory|remotehelprunspace|externalhelp)\s+\S+/ }
    ]
  };

  const PS_COMMENT = hljs.inherit(
    hljs.COMMENT(null, null),
    {
      variants: [
        /* single-line comment */
        {
          begin: /#/,
          end: /$/
        },
        /* multi-line comment */
        {
          begin: /<#/,
          end: /#>/
        }
      ],
      contains: [ PS_HELPTAGS ]
    }
  );

  const CMDLETS = {
    className: 'built_in',
    variants: [ { begin: '('.concat(VALID_VERBS, ')+(-)[\\w\\d]+') } ]
  };

  const PS_CLASS = {
    className: 'class',
    beginKeywords: 'class enum',
    end: /\s*[{]/,
    excludeEnd: true,
    relevance: 0,
    contains: [ hljs.TITLE_MODE ]
  };

  const PS_FUNCTION = {
    className: 'function',
    begin: /function\s+/,
    end: /\s*\{|$/,
    excludeEnd: true,
    returnBegin: true,
    relevance: 0,
    contains: [
      {
        begin: "function",
        relevance: 0,
        className: "keyword"
      },
      {
        className: "title",
        begin: TITLE_NAME_RE,
        relevance: 0
      },
      {
        begin: /\(/,
        end: /\)/,
        className: "params",
        relevance: 0,
        contains: [ VAR ]
      }
      // CMDLETS
    ]
  };

  // Using statment, plus type, plus assembly name.
  const PS_USING = {
    begin: /using\s/,
    end: /$/,
    returnBegin: true,
    contains: [
      QUOTE_STRING,
      APOS_STRING,
      {
        className: 'keyword',
        begin: /(using|assembly|command|module|namespace|type)/
      }
    ]
  };

  // Comperison operators & function named parameters.
  const PS_ARGUMENTS = { variants: [
    // PS literals are pretty verbose so it's a good idea to accent them a bit.
    {
      className: 'operator',
      begin: '('.concat(COMPARISON_OPERATORS, ')\\b')
    },
    {
      className: 'literal',
      begin: /(-){1,2}[\w\d-]+/,
      relevance: 0
    }
  ] };

  const HASH_SIGNS = {
    className: 'selector-tag',
    begin: /@\B/,
    relevance: 0
  };

  // It's a very general rule so I'll narrow it a bit with some strict boundaries
  // to avoid any possible false-positive collisions!
  const PS_METHODS = {
    className: 'function',
    begin: /\[.*\]\s*[\w]+[ ]??\(/,
    end: /$/,
    returnBegin: true,
    relevance: 0,
    contains: [
      {
        className: 'keyword',
        begin: '('.concat(
          KEYWORDS.keyword.toString().replace(/\s/g, '|'
          ), ')\\b'),
        endsParent: true,
        relevance: 0
      },
      hljs.inherit(hljs.TITLE_MODE, { endsParent: true })
    ]
  };

  const GENTLEMANS_SET = [
    // STATIC_MEMBER,
    PS_METHODS,
    PS_COMMENT,
    BACKTICK_ESCAPE,
    hljs.NUMBER_MODE,
    QUOTE_STRING,
    APOS_STRING,
    // PS_NEW_OBJECT_TYPE,
    CMDLETS,
    VAR,
    LITERAL,
    HASH_SIGNS
  ];

  const PS_TYPE = {
    begin: /\[/,
    end: /\]/,
    excludeBegin: true,
    excludeEnd: true,
    relevance: 0,
    contains: [].concat(
      'self',
      GENTLEMANS_SET,
      {
        begin: "(" + TYPES.join("|") + ")",
        className: "built_in",
        relevance: 0
      },
      {
        className: 'type',
        begin: /[\.\w\d]+/,
        relevance: 0
      }
    )
  };

  PS_METHODS.contains.unshift(PS_TYPE);

  return {
    name: 'PowerShell',
    aliases: [
      "pwsh",
      "ps",
      "ps1"
    ],
    case_insensitive: true,
    keywords: KEYWORDS,
    contains: GENTLEMANS_SET.concat(
      PS_CLASS,
      PS_FUNCTION,
      PS_USING,
      PS_ARGUMENTS,
      PS_TYPE
    )
  };
}

module.exports = powershell;

	return module.exports;
})({ exports: {} })],
	['dos', (function (module) {
/*
Language: Batch file (DOS)
Author: Alexander Makarov <sam@rmcreative.ru>
Contributors: Anton Kochkov <anton.kochkov@gmail.com>
Website: https://en.wikipedia.org/wiki/Batch_file
Category: scripting
*/

/** @type LanguageFn */
function dos(hljs) {
  const COMMENT = hljs.COMMENT(
    /^\s*@?rem\b/, /$/,
    { relevance: 10 }
  );
  const LABEL = {
    begin: '^\\s*[A-Za-z._?][A-Za-z0-9_$#@~.?]*(:|\\s+label)'};
  const KEYWORDS = [
    "if",
    "else",
    "goto",
    "for",
    "in",
    "do",
    "call",
    "exit",
    "not",
    "exist",
    "errorlevel",
    "defined",
    "equ",
    "neq",
    "lss",
    "leq",
    "gtr",
    "geq"
  ];
  const BUILT_INS = [
    "prn",
    "nul",
    "lpt3",
    "lpt2",
    "lpt1",
    "con",
    "com4",
    "com3",
    "com2",
    "com1",
    "aux",
    "shift",
    "cd",
    "dir",
    "echo",
    "setlocal",
    "endlocal",
    "set",
    "pause",
    "copy",
    "append",
    "assoc",
    "at",
    "attrib",
    "break",
    "cacls",
    "cd",
    "chcp",
    "chdir",
    "chkdsk",
    "chkntfs",
    "cls",
    "cmd",
    "color",
    "comp",
    "compact",
    "convert",
    "date",
    "dir",
    "diskcomp",
    "diskcopy",
    "doskey",
    "erase",
    "fs",
    "find",
    "findstr",
    "format",
    "ftype",
    "graftabl",
    "help",
    "keyb",
    "label",
    "md",
    "mkdir",
    "mode",
    "more",
    "move",
    "path",
    "pause",
    "print",
    "popd",
    "pushd",
    "promt",
    "rd",
    "recover",
    "rem",
    "rename",
    "replace",
    "restore",
    "rmdir",
    "shift",
    "sort",
    "start",
    "subst",
    "time",
    "title",
    "tree",
    "type",
    "ver",
    "verify",
    "vol",
    // winutils
    "ping",
    "net",
    "ipconfig",
    "taskkill",
    "xcopy",
    "ren",
    "del"
  ];
  return {
    name: 'Batch file (DOS)',
    aliases: [
      'bat',
      'batch',
      'cmd'
    ],
    case_insensitive: true,
    illegal: /\/\*/,
    keywords: {
      keyword: KEYWORDS,
      built_in: BUILT_INS
    },
    contains: [
      {
        className: 'variable',
        begin: /%%[^ ]|%[^ ]+?%|![^ ]+?!/
      },
      {
        className: 'function',
        begin: LABEL.begin,
        end: 'goto:eof',
        contains: [
          hljs.inherit(hljs.TITLE_MODE, { begin: '([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*' }),
          COMMENT
        ]
      },
      {
        className: 'number',
        begin: '\\b\\d+',
        relevance: 0
      },
      COMMENT
    ]
  };
}

module.exports = dos;

	return module.exports;
})({ exports: {} })],
	['sql', (function (module) {
/*
 Language: SQL
 Website: https://en.wikipedia.org/wiki/SQL
 Category: common, database
 */

/*

Goals:

SQL is intended to highlight basic/common SQL keywords and expressions

- If pretty much every single SQL server includes supports, then it's a canidate.
- It is NOT intended to include tons of vendor specific keywords (Oracle, MySQL,
  PostgreSQL) although the list of data types is purposely a bit more expansive.
- For more specific SQL grammars please see:
  - PostgreSQL and PL/pgSQL - core
  - T-SQL - https://github.com/highlightjs/highlightjs-tsql
  - sql_more (core)

 */

function sql(hljs) {
  const regex = hljs.regex;
  const COMMENT_MODE = hljs.COMMENT('--', '$');
  const STRING = {
    scope: 'string',
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [ { match: /''/ } ]
      }
    ]
  };
  const QUOTED_IDENTIFIER = {
    begin: /"/,
    end: /"/,
    contains: [ { match: /""/ } ]
  };

  const LITERALS = [
    "true",
    "false",
    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
    // "null",
    "unknown"
  ];

  const MULTI_WORD_TYPES = [
    "double precision",
    "large object",
    "with timezone",
    "without timezone"
  ];

  const TYPES = [
    'bigint',
    'binary',
    'blob',
    'boolean',
    'char',
    'character',
    'clob',
    'date',
    'dec',
    'decfloat',
    'decimal',
    'float',
    'int',
    'integer',
    'interval',
    'nchar',
    'nclob',
    'national',
    'numeric',
    'real',
    'row',
    'smallint',
    'time',
    'timestamp',
    'varchar',
    'varying', // modifier (character varying)
    'varbinary'
  ];

  const NON_RESERVED_WORDS = [
    "add",
    "asc",
    "collation",
    "desc",
    "final",
    "first",
    "last",
    "view"
  ];

  // https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html#reserved-word
  const RESERVED_WORDS = [
    "abs",
    "acos",
    "all",
    "allocate",
    "alter",
    "and",
    "any",
    "are",
    "array",
    "array_agg",
    "array_max_cardinality",
    "as",
    "asensitive",
    "asin",
    "asymmetric",
    "at",
    "atan",
    "atomic",
    "authorization",
    "avg",
    "begin",
    "begin_frame",
    "begin_partition",
    "between",
    "bigint",
    "binary",
    "blob",
    "boolean",
    "both",
    "by",
    "call",
    "called",
    "cardinality",
    "cascaded",
    "case",
    "cast",
    "ceil",
    "ceiling",
    "char",
    "char_length",
    "character",
    "character_length",
    "check",
    "classifier",
    "clob",
    "close",
    "coalesce",
    "collate",
    "collect",
    "column",
    "commit",
    "condition",
    "connect",
    "constraint",
    "contains",
    "convert",
    "copy",
    "corr",
    "corresponding",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "create",
    "cross",
    "cube",
    "cume_dist",
    "current",
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_row",
    "current_schema",
    "current_time",
    "current_timestamp",
    "current_path",
    "current_role",
    "current_transform_group_for_type",
    "current_user",
    "cursor",
    "cycle",
    "date",
    "day",
    "deallocate",
    "dec",
    "decimal",
    "decfloat",
    "declare",
    "default",
    "define",
    "delete",
    "dense_rank",
    "deref",
    "describe",
    "deterministic",
    "disconnect",
    "distinct",
    "double",
    "drop",
    "dynamic",
    "each",
    "element",
    "else",
    "empty",
    "end",
    "end_frame",
    "end_partition",
    "end-exec",
    "equals",
    "escape",
    "every",
    "except",
    "exec",
    "execute",
    "exists",
    "exp",
    "external",
    "extract",
    "false",
    "fetch",
    "filter",
    "first_value",
    "float",
    "floor",
    "for",
    "foreign",
    "frame_row",
    "free",
    "from",
    "full",
    "function",
    "fusion",
    "get",
    "global",
    "grant",
    "group",
    "grouping",
    "groups",
    "having",
    "hold",
    "hour",
    "identity",
    "in",
    "indicator",
    "initial",
    "inner",
    "inout",
    "insensitive",
    "insert",
    "int",
    "integer",
    "intersect",
    "intersection",
    "interval",
    "into",
    "is",
    "join",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "language",
    "large",
    "last_value",
    "lateral",
    "lead",
    "leading",
    "left",
    "like",
    "like_regex",
    "listagg",
    "ln",
    "local",
    "localtime",
    "localtimestamp",
    "log",
    "log10",
    "lower",
    "match",
    "match_number",
    "match_recognize",
    "matches",
    "max",
    "member",
    "merge",
    "method",
    "min",
    "minute",
    "mod",
    "modifies",
    "module",
    "month",
    "multiset",
    "national",
    "natural",
    "nchar",
    "nclob",
    "new",
    "no",
    "none",
    "normalize",
    "not",
    "nth_value",
    "ntile",
    "null",
    "nullif",
    "numeric",
    "octet_length",
    "occurrences_regex",
    "of",
    "offset",
    "old",
    "omit",
    "on",
    "one",
    "only",
    "open",
    "or",
    "order",
    "out",
    "outer",
    "over",
    "overlaps",
    "overlay",
    "parameter",
    "partition",
    "pattern",
    "per",
    "percent",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "period",
    "portion",
    "position",
    "position_regex",
    "power",
    "precedes",
    "precision",
    "prepare",
    "primary",
    "procedure",
    "ptf",
    "range",
    "rank",
    "reads",
    "real",
    "recursive",
    "ref",
    "references",
    "referencing",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "release",
    "result",
    "return",
    "returns",
    "revoke",
    "right",
    "rollback",
    "rollup",
    "row",
    "row_number",
    "rows",
    "running",
    "savepoint",
    "scope",
    "scroll",
    "search",
    "second",
    "seek",
    "select",
    "sensitive",
    "session_user",
    "set",
    "show",
    "similar",
    "sin",
    "sinh",
    "skip",
    "smallint",
    "some",
    "specific",
    "specifictype",
    "sql",
    "sqlexception",
    "sqlstate",
    "sqlwarning",
    "sqrt",
    "start",
    "static",
    "stddev_pop",
    "stddev_samp",
    "submultiset",
    "subset",
    "substring",
    "substring_regex",
    "succeeds",
    "sum",
    "symmetric",
    "system",
    "system_time",
    "system_user",
    "table",
    "tablesample",
    "tan",
    "tanh",
    "then",
    "time",
    "timestamp",
    "timezone_hour",
    "timezone_minute",
    "to",
    "trailing",
    "translate",
    "translate_regex",
    "translation",
    "treat",
    "trigger",
    "trim",
    "trim_array",
    "true",
    "truncate",
    "uescape",
    "union",
    "unique",
    "unknown",
    "unnest",
    "update",
    "upper",
    "user",
    "using",
    "value",
    "values",
    "value_of",
    "var_pop",
    "var_samp",
    "varbinary",
    "varchar",
    "varying",
    "versioning",
    "when",
    "whenever",
    "where",
    "width_bucket",
    "window",
    "with",
    "within",
    "without",
    "year",
  ];

  // these are reserved words we have identified to be functions
  // and should only be highlighted in a dispatch-like context
  // ie, array_agg(...), etc.
  const RESERVED_FUNCTIONS = [
    "abs",
    "acos",
    "array_agg",
    "asin",
    "atan",
    "avg",
    "cast",
    "ceil",
    "ceiling",
    "coalesce",
    "corr",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "cume_dist",
    "dense_rank",
    "deref",
    "element",
    "exp",
    "extract",
    "first_value",
    "floor",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "last_value",
    "lead",
    "listagg",
    "ln",
    "log",
    "log10",
    "lower",
    "max",
    "min",
    "mod",
    "nth_value",
    "ntile",
    "nullif",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "position",
    "position_regex",
    "power",
    "rank",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "row_number",
    "sin",
    "sinh",
    "sqrt",
    "stddev_pop",
    "stddev_samp",
    "substring",
    "substring_regex",
    "sum",
    "tan",
    "tanh",
    "translate",
    "translate_regex",
    "treat",
    "trim",
    "trim_array",
    "unnest",
    "upper",
    "value_of",
    "var_pop",
    "var_samp",
    "width_bucket",
  ];

  // these functions can
  const POSSIBLE_WITHOUT_PARENS = [
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_schema",
    "current_transform_group_for_type",
    "current_user",
    "session_user",
    "system_time",
    "system_user",
    "current_time",
    "localtime",
    "current_timestamp",
    "localtimestamp"
  ];

  // those exist to boost relevance making these very
  // "SQL like" keyword combos worth +1 extra relevance
  const COMBOS = [
    "create table",
    "insert into",
    "primary key",
    "foreign key",
    "not null",
    "alter table",
    "add constraint",
    "grouping sets",
    "on overflow",
    "character set",
    "respect nulls",
    "ignore nulls",
    "nulls first",
    "nulls last",
    "depth first",
    "breadth first"
  ];

  const FUNCTIONS = RESERVED_FUNCTIONS;

  const KEYWORDS = [
    ...RESERVED_WORDS,
    ...NON_RESERVED_WORDS
  ].filter((keyword) => {
    return !RESERVED_FUNCTIONS.includes(keyword);
  });

  const VARIABLE = {
    scope: "variable",
    match: /@[a-z0-9][a-z0-9_]*/,
  };

  const OPERATOR = {
    scope: "operator",
    match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0,
  };

  const FUNCTION_CALL = {
    match: regex.concat(/\b/, regex.either(...FUNCTIONS), /\s*\(/),
    relevance: 0,
    keywords: { built_in: FUNCTIONS }
  };

  // turns a multi-word keyword combo into a regex that doesn't
  // care about extra whitespace etc.
  // input: "START QUERY"
  // output: /\bSTART\s+QUERY\b/
  function kws_to_regex(list) {
    return regex.concat(
      /\b/,
      regex.either(...list.map((kw) => {
        return kw.replace(/\s+/, "\\s+")
      })),
      /\b/
    )
  }

  const MULTI_WORD_KEYWORDS = {
    scope: "keyword",
    match: kws_to_regex(COMBOS),
    relevance: 0,
  };

  // keywords with less than 3 letters are reduced in relevancy
  function reduceRelevancy(list, {
    exceptions, when
  } = {}) {
    const qualifyFn = when;
    exceptions = exceptions || [];
    return list.map((item) => {
      if (item.match(/\|\d+$/) || exceptions.includes(item)) {
        return item;
      } else if (qualifyFn(item)) {
        return `${item}|0`;
      } else {
        return item;
      }
    });
  }

  return {
    name: 'SQL',
    case_insensitive: true,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword:
        reduceRelevancy(KEYWORDS, { when: (x) => x.length < 3 }),
      literal: LITERALS,
      type: TYPES,
      built_in: POSSIBLE_WITHOUT_PARENS
    },
    contains: [
      {
        scope: "type",
        match: kws_to_regex(MULTI_WORD_TYPES)
      },
      MULTI_WORD_KEYWORDS,
      FUNCTION_CALL,
      VARIABLE,
      STRING,
      QUOTED_IDENTIFIER,
      hljs.C_NUMBER_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE,
      OPERATOR
    ]
  };
}

module.exports = sql;

	return module.exports;
})({ exports: {} })],
	['yaml', (function (module) {
/*
Language: YAML
Description: Yet Another Markdown Language
Author: Stefan Wienert <stwienert@gmail.com>
Contributors: Carl Baxter <carl@cbax.tech>
Requires: ruby.js
Website: https://yaml.org
Category: common, config
*/
function yaml(hljs) {
  const LITERALS = 'true false yes no null';

  // YAML spec allows non-reserved URI characters in tags.
  const URI_CHARACTERS = '[\\w#;/?:@&=+$,.~*\'()[\\]]+';

  // Define keys as starting with a word character
  // ...containing word chars, spaces, colons, forward-slashes, hyphens and periods
  // ...and ending with a colon followed immediately by a space, tab or newline.
  // The YAML spec allows for much more than this, but this covers most use-cases.
  const KEY = {
    className: 'attr',
    variants: [
      // added brackets support and special char support
      { begin: /[\w*@][\w*@ :()\./-]*:(?=[ \t]|$)/ },
      { // double quoted keys - with brackets and special char support
        begin: /"[\w*@][\w*@ :()\./-]*":(?=[ \t]|$)/ },
      { // single quoted keys - with brackets and special char support
        begin: /'[\w*@][\w*@ :()\./-]*':(?=[ \t]|$)/ },
    ]
  };
  
  const TEMPLATE_VARIABLES = {
    className: 'template-variable',
    variants: [
      { // jinja templates Ansible
        begin: /\{\{/,
        end: /\}\}/
      },
      { // Ruby i18n
        begin: /%\{/,
        end: /\}/
      }
    ]
  };

  const SINGLE_QUOTE_STRING = {
    className: 'string',
    relevance: 0,
    begin: /'/,
    end: /'/,
    contains: [
      {
        match: /''/,
        scope: 'char.escape',
        relevance: 0
      }
    ]
  };

  const STRING = {
    className: 'string',
    relevance: 0,
    variants: [
      {
        begin: /"/,
        end: /"/
      },
      { begin: /\S+/ }
    ],
    contains: [
      hljs.BACKSLASH_ESCAPE,
      TEMPLATE_VARIABLES
    ]
  };

  // Strings inside of value containers (objects) can't contain braces,
  // brackets, or commas
  const CONTAINER_STRING = hljs.inherit(STRING, { variants: [
    {
      begin: /'/,
      end: /'/,
      contains: [
        {
          begin: /''/,
          relevance: 0
        }
      ]
    },
    {
      begin: /"/,
      end: /"/
    },
    { begin: /[^\s,{}[\]]+/ }
  ] });

  const DATE_RE = '[0-9]{4}(-[0-9][0-9]){0,2}';
  const TIME_RE = '([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?';
  const FRACTION_RE = '(\\.[0-9]*)?';
  const ZONE_RE = '([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?';
  const TIMESTAMP = {
    className: 'number',
    begin: '\\b' + DATE_RE + TIME_RE + FRACTION_RE + ZONE_RE + '\\b'
  };

  const VALUE_CONTAINER = {
    end: ',',
    endsWithParent: true,
    excludeEnd: true,
    keywords: LITERALS,
    relevance: 0
  };
  const OBJECT = {
    begin: /\{/,
    end: /\}/,
    contains: [ VALUE_CONTAINER ],
    illegal: '\\n',
    relevance: 0
  };
  const ARRAY = {
    begin: '\\[',
    end: '\\]',
    contains: [ VALUE_CONTAINER ],
    illegal: '\\n',
    relevance: 0
  };

  const MODES = [
    KEY,
    {
      className: 'meta',
      begin: '^---\\s*$',
      relevance: 10
    },
    { // multi line string
      // Blocks start with a | or > followed by a newline
      //
      // Indentation of subsequent lines must be the same to
      // be considered part of the block
      className: 'string',
      begin: '[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*'
    },
    { // Ruby/Rails erb
      begin: '<%[%=-]?',
      end: '[%-]?%>',
      subLanguage: 'ruby',
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0
    },
    { // named tags
      className: 'type',
      begin: '!\\w+!' + URI_CHARACTERS
    },
    // https://yaml.org/spec/1.2/spec.html#id2784064
    { // verbatim tags
      className: 'type',
      begin: '!<' + URI_CHARACTERS + ">"
    },
    { // primary tags
      className: 'type',
      begin: '!' + URI_CHARACTERS
    },
    { // secondary tags
      className: 'type',
      begin: '!!' + URI_CHARACTERS
    },
    { // fragment id &ref
      className: 'meta',
      begin: '&' + hljs.UNDERSCORE_IDENT_RE + '$'
    },
    { // fragment reference *ref
      className: 'meta',
      begin: '\\*' + hljs.UNDERSCORE_IDENT_RE + '$'
    },
    { // array listing
      className: 'bullet',
      // TODO: remove |$ hack when we have proper look-ahead support
      begin: '-(?=[ ]|$)',
      relevance: 0
    },
    hljs.HASH_COMMENT_MODE,
    {
      beginKeywords: LITERALS,
      keywords: { literal: LITERALS }
    },
    TIMESTAMP,
    // numbers are any valid C-style number that
    // sit isolated from other words
    {
      className: 'number',
      begin: hljs.C_NUMBER_RE + '\\b',
      relevance: 0
    },
    OBJECT,
    ARRAY,
    SINGLE_QUOTE_STRING,
    STRING
  ];

  const VALUE_MODES = [ ...MODES ];
  VALUE_MODES.pop();
  VALUE_MODES.push(CONTAINER_STRING);
  VALUE_CONTAINER.contains = VALUE_MODES;

  return {
    name: 'YAML',
    case_insensitive: true,
    aliases: [ 'yml' ],
    contains: MODES
  };
}

module.exports = yaml;

	return module.exports;
})({ exports: {} })],
	['ini', (function (module) {
/*
Language: TOML, also INI
Description: TOML aims to be a minimal configuration file format that's easy to read due to obvious semantics.
Contributors: Guillaume Gomez <guillaume1.gomez@gmail.com>
Category: common, config
Website: https://github.com/toml-lang/toml
*/

function ini(hljs) {
  const regex = hljs.regex;
  const NUMBERS = {
    className: 'number',
    relevance: 0,
    variants: [
      { begin: /([+-]+)?[\d]+_[\d_]+/ },
      { begin: hljs.NUMBER_RE }
    ]
  };
  const COMMENTS = hljs.COMMENT();
  COMMENTS.variants = [
    {
      begin: /;/,
      end: /$/
    },
    {
      begin: /#/,
      end: /$/
    }
  ];
  const VARIABLES = {
    className: 'variable',
    variants: [
      { begin: /\$[\w\d"][\w\d_]*/ },
      { begin: /\$\{(.*?)\}/ }
    ]
  };
  const LITERALS = {
    className: 'literal',
    begin: /\bon|off|true|false|yes|no\b/
  };
  const STRINGS = {
    className: "string",
    contains: [ hljs.BACKSLASH_ESCAPE ],
    variants: [
      {
        begin: "'''",
        end: "'''",
        relevance: 10
      },
      {
        begin: '"""',
        end: '"""',
        relevance: 10
      },
      {
        begin: '"',
        end: '"'
      },
      {
        begin: "'",
        end: "'"
      }
    ]
  };
  const ARRAY = {
    begin: /\[/,
    end: /\]/,
    contains: [
      COMMENTS,
      LITERALS,
      VARIABLES,
      STRINGS,
      NUMBERS,
      'self'
    ],
    relevance: 0
  };

  const BARE_KEY = /[A-Za-z0-9_-]+/;
  const QUOTED_KEY_DOUBLE_QUOTE = /"(\\"|[^"])*"/;
  const QUOTED_KEY_SINGLE_QUOTE = /'[^']*'/;
  const ANY_KEY = regex.either(
    BARE_KEY, QUOTED_KEY_DOUBLE_QUOTE, QUOTED_KEY_SINGLE_QUOTE
  );
  const DOTTED_KEY = regex.concat(
    ANY_KEY, '(\\s*\\.\\s*', ANY_KEY, ')*',
    regex.lookahead(/\s*=\s*[^#\s]/)
  );

  return {
    name: 'TOML, also INI',
    aliases: [ 'toml' ],
    case_insensitive: true,
    illegal: /\S/,
    contains: [
      COMMENTS,
      {
        className: 'section',
        begin: /\[+/,
        end: /\]+/
      },
      {
        begin: DOTTED_KEY,
        className: 'attr',
        starts: {
          end: /$/,
          contains: [
            COMMENTS,
            ARRAY,
            LITERALS,
            VARIABLES,
            STRINGS,
            NUMBERS
          ]
        }
      }
    ]
  };
}

module.exports = ini;

	return module.exports;
})({ exports: {} })],
	['dockerfile', (function (module) {
/*
Language: Dockerfile
Requires: bash.js
Author: Alexis Hénaut <alexis@henaut.net>
Description: language definition for Dockerfile files
Website: https://docs.docker.com/engine/reference/builder/
Category: config
*/

/** @type LanguageFn */
function dockerfile(hljs) {
  const KEYWORDS = [
    "from",
    "maintainer",
    "expose",
    "env",
    "arg",
    "user",
    "onbuild",
    "stopsignal"
  ];
  return {
    name: 'Dockerfile',
    aliases: [ 'docker' ],
    case_insensitive: true,
    keywords: KEYWORDS,
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE,
      {
        beginKeywords: 'run cmd entrypoint volume add copy workdir label healthcheck shell',
        starts: {
          end: /[^\\]$/,
          subLanguage: 'bash'
        }
      }
    ],
    illegal: '</'
  };
}

module.exports = dockerfile;

	return module.exports;
})({ exports: {} })],
	['makefile', (function (module) {
/*
Language: Makefile
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Contributors: Joël Porquet <joel@porquet.org>
Website: https://www.gnu.org/software/make/manual/html_node/Introduction.html
Category: common, build-system
*/

function makefile(hljs) {
  /* Variables: simple (eg $(var)) and special (eg $@) */
  const VARIABLE = {
    className: 'variable',
    variants: [
      {
        begin: '\\$\\(' + hljs.UNDERSCORE_IDENT_RE + '\\)',
        contains: [ hljs.BACKSLASH_ESCAPE ]
      },
      { begin: /\$[@%<?\^\+\*]/ }
    ]
  };
  /* Quoted string with variables inside */
  const QUOTE_STRING = {
    className: 'string',
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VARIABLE
    ]
  };
  /* Function: $(func arg,...) */
  const FUNC = {
    className: 'variable',
    begin: /\$\([\w-]+\s/,
    end: /\)/,
    keywords: { built_in:
        'subst patsubst strip findstring filter filter-out sort '
        + 'word wordlist firstword lastword dir notdir suffix basename '
        + 'addsuffix addprefix join wildcard realpath abspath error warning '
        + 'shell origin flavor foreach if or and call eval file value' },
    contains: [ 
      VARIABLE,
      QUOTE_STRING // Added QUOTE_STRING as they can be a part of functions
    ]
  };
  /* Variable assignment */
  const ASSIGNMENT = { begin: '^' + hljs.UNDERSCORE_IDENT_RE + '\\s*(?=[:+?]?=)' };
  /* Meta targets (.PHONY) */
  const META = {
    className: 'meta',
    begin: /^\.PHONY:/,
    end: /$/,
    keywords: {
      $pattern: /[\.\w]+/,
      keyword: '.PHONY'
    }
  };
  /* Targets */
  const TARGET = {
    className: 'section',
    begin: /^[^\s]+:/,
    end: /$/,
    contains: [ VARIABLE ]
  };
  return {
    name: 'Makefile',
    aliases: [
      'mk',
      'mak',
      'make',
    ],
    keywords: {
      $pattern: /[\w-]+/,
      keyword: 'define endef undefine ifdef ifndef ifeq ifneq else endif '
      + 'include -include sinclude override export unexport private vpath'
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      VARIABLE,
      QUOTE_STRING,
      FUNC,
      ASSIGNMENT,
      META,
      TARGET
    ]
  };
}

module.exports = makefile;

	return module.exports;
})({ exports: {} })],
	['diff', (function (module) {
/*
Language: Diff
Description: Unified and context diff
Author: Vasily Polovnyov <vast@whiteants.net>
Website: https://www.gnu.org/software/diffutils/
Category: common
*/

/** @type LanguageFn */
function diff(hljs) {
  const regex = hljs.regex;
  return {
    name: 'Diff',
    aliases: [ 'patch' ],
    contains: [
      {
        className: 'meta',
        relevance: 10,
        match: regex.either(
          /^@@ +-\d+,\d+ +\+\d+,\d+ +@@/, // @@ -1,2 +1,2 @@
          /^@@ +-\d+ +\+\d+,\d+ +@@/,     // @@ -1 +1,2 @@
          /^@@ +-\d+,\d+ +\+\d+ +@@/,     // @@ -1,2 +1 @@
          /^@@ +-\d+ +\+\d+ +@@/,         // @@ -1 +1 @@
          /^\*\*\* +\d+,\d+ +\*\*\*\*$/,
          /^--- +\d+,\d+ +----$/
        )
      },
      {
        className: 'comment',
        variants: [
          {
            begin: regex.either(
              /Index: /,
              /^index/,
              /={3,}/,
              /^-{3}/,
              /^\*{3} /,
              /^\+{3}/,
              /^diff --git/
            ),
            end: /$/
          },
          { match: /^\*{15}$/ }
        ]
      },
      {
        className: 'addition',
        begin: /^\+/,
        end: /$/
      },
      {
        className: 'deletion',
        begin: /^-/,
        end: /$/
      },
      {
        className: 'addition',
        begin: /^!/,
        end: /$/
      }
    ]
  };
}

module.exports = diff;

	return module.exports;
})({ exports: {} })],
	['groovy', (function (module) {
// https://docs.oracle.com/javase/specs/jls/se15/html/jls-3.html#jls-3.10
var decimalDigits = '[0-9](_*[0-9])*';
var frac = `\\.(${decimalDigits})`;
var hexDigits = '[0-9a-fA-F](_*[0-9a-fA-F])*';
var NUMERIC = {
  className: 'number',
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))` +
      `[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${frac})[fFdD]?\\b` },
    { begin: `\\b(${decimalDigits})[fFdD]\\b` },

    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))` +
      `[pP][+-]?(${decimalDigits})[fFdD]?\\b` },

    // DecimalIntegerLiteral
    { begin: '\\b(0|[1-9](_*[0-9])*)[lL]?\\b' },

    // HexIntegerLiteral
    { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },

    // OctalIntegerLiteral
    { begin: '\\b0(_*[0-7])*[lL]?\\b' },

    // BinaryIntegerLiteral
    { begin: '\\b0[bB][01](_*[01])*[lL]?\\b' },
  ],
  relevance: 0
};

/*
 Language: Groovy
 Author: Guillaume Laforge <glaforge@gmail.com>
 Description: Groovy programming language implementation inspired from Vsevolod's Java mode
 Website: https://groovy-lang.org
 Category: system
 */


function variants(variants, obj = {}) {
  obj.variants = variants;
  return obj;
}

function groovy(hljs) {
  const regex = hljs.regex;
  const IDENT_RE = '[A-Za-z0-9_$]+';
  const COMMENT = variants([
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    hljs.COMMENT(
      '/\\*\\*',
      '\\*/',
      {
        relevance: 0,
        contains: [
          {
            // eat up @'s in emails to prevent them to be recognized as doctags
            begin: /\w+@/,
            relevance: 0
          },
          {
            className: 'doctag',
            begin: '@[A-Za-z]+'
          }
        ]
      }
    )
  ]);
  const REGEXP = {
    className: 'regexp',
    begin: /~?\/[^\/\n]+\//,
    contains: [ hljs.BACKSLASH_ESCAPE ]
  };
  // Groovy uses the same numeric literal grammar as Java, including
  // underscores as digit separators (e.g. 1_000, 0xFF_EC, 0b1010_0101).
  const NUMBER = NUMERIC;
  const STRING = variants([
    {
      begin: /"""/,
      end: /"""/
    },
    {
      begin: /'''/,
      end: /'''/
    },
    {
      begin: "\\$/",
      end: "/\\$",
      relevance: 10
    },
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ],
  { className: "string" }
  );

  const CLASS_DEFINITION = {
    match: [
      /(class|interface|trait|enum|record|extends|implements)/,
      /\s+/,
      hljs.UNDERSCORE_IDENT_RE
    ],
    scope: {
      1: "keyword",
      3: "title.class",
    }
  };
  const TYPES = [
    "byte",
    "short",
    "char",
    "int",
    "long",
    "boolean",
    "float",
    "double",
    "void"
  ];
  const KEYWORDS = [
    // groovy specific keywords
    "def",
    "as",
    "in",
    "assert",
    "trait",
    // common keywords with Java
    "abstract",
    "static",
    "volatile",
    "transient",
    "public",
    "private",
    "protected",
    "synchronized",
    "final",
    "class",
    "interface",
    "enum",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "case",
    "break",
    "default",
    "continue",
    "throw",
    "throws",
    "try",
    "catch",
    "finally",
    "implements",
    "extends",
    "new",
    "import",
    "package",
    "return",
    "instanceof",
    "var"
  ];

  return {
    name: 'Groovy',
    keywords: {
      "variable.language": 'this super',
      literal: 'true false null',
      type: TYPES,
      keyword: KEYWORDS
    },
    contains: [
      hljs.SHEBANG({
        binary: "groovy",
        relevance: 10
      }),
      COMMENT,
      STRING,
      REGEXP,
      NUMBER,
      CLASS_DEFINITION,
      {
        className: 'meta',
        begin: '@[A-Za-z]+',
        relevance: 0
      },
      {
        // highlight map keys and named parameters as attrs
        className: 'attr',
        begin: IDENT_RE + '[ \t]*:',
        relevance: 0
      },
      {
        // catch middle element of the ternary operator
        // to avoid highlight it as a label, named parameter, or map key
        begin: /\?/,
        end: /:/,
        relevance: 0,
        contains: [
          COMMENT,
          STRING,
          REGEXP,
          NUMBER,
          'self'
        ]
      },
      {
        // highlight labeled statements
        className: 'symbol',
        begin: '^[ \t]*' + regex.lookahead(IDENT_RE + ':'),
        excludeBegin: true,
        end: IDENT_RE + ':',
        relevance: 0
      }
    ],
    illegal: /#|<\//
  };
}

module.exports = groovy;

	return module.exports;
})({ exports: {} })],
	['gradle', (function (module) {
/*
Language: Gradle
Description: Gradle is an open-source build automation tool focused on flexibility and performance.
Website: https://gradle.org
Author: Damian Mee <mee.damian@gmail.com>
Category: build-system
*/

function gradle(hljs) {
  const KEYWORDS = [
    "task",
    "project",
    "allprojects",
    "subprojects",
    "artifacts",
    "buildscript",
    "configurations",
    "dependencies",
    "repositories",
    "sourceSets",
    "description",
    "delete",
    "from",
    "into",
    "include",
    "exclude",
    "source",
    "classpath",
    "destinationDir",
    "includes",
    "options",
    "sourceCompatibility",
    "targetCompatibility",
    "group",
    "flatDir",
    "doLast",
    "doFirst",
    "flatten",
    "todir",
    "fromdir",
    "ant",
    "def",
    "abstract",
    "break",
    "case",
    "catch",
    "continue",
    "default",
    "do",
    "else",
    "extends",
    "final",
    "finally",
    "for",
    "if",
    "implements",
    "instanceof",
    "native",
    "new",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "switch",
    "synchronized",
    "throw",
    "throws",
    "transient",
    "try",
    "volatile",
    "while",
    "strictfp",
    "package",
    "import",
    "false",
    "null",
    "super",
    "this",
    "true",
    "antlrtask",
    "checkstyle",
    "codenarc",
    "copy",
    "boolean",
    "byte",
    "char",
    "class",
    "double",
    "float",
    "int",
    "interface",
    "long",
    "short",
    "void",
    "compile",
    "runTime",
    "file",
    "fileTree",
    "abs",
    "any",
    "append",
    "asList",
    "asWritable",
    "call",
    "collect",
    "compareTo",
    "count",
    "div",
    "dump",
    "each",
    "eachByte",
    "eachFile",
    "eachLine",
    "every",
    "find",
    "findAll",
    "flatten",
    "getAt",
    "getErr",
    "getIn",
    "getOut",
    "getText",
    "grep",
    "immutable",
    "inject",
    "inspect",
    "intersect",
    "invokeMethods",
    "isCase",
    "join",
    "leftShift",
    "minus",
    "multiply",
    "newInputStream",
    "newOutputStream",
    "newPrintWriter",
    "newReader",
    "newWriter",
    "next",
    "plus",
    "pop",
    "power",
    "previous",
    "print",
    "println",
    "push",
    "putAt",
    "read",
    "readBytes",
    "readLines",
    "reverse",
    "reverseEach",
    "round",
    "size",
    "sort",
    "splitEachLine",
    "step",
    "subMap",
    "times",
    "toInteger",
    "toList",
    "tokenize",
    "upto",
    "waitForOrKill",
    "withPrintWriter",
    "withReader",
    "withStream",
    "withWriter",
    "withWriterAppend",
    "write",
    "writeLine"
  ];
  return {
    name: 'Gradle',
    case_insensitive: true,
    keywords: KEYWORDS,
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.NUMBER_MODE,
      hljs.REGEXP_MODE

    ]
  };
}

module.exports = gradle;

	return module.exports;
})({ exports: {} })],
	['r', (function (module) {
/*
Language: R
Description: R is a free software environment for statistical computing and graphics.
Author: Joe Cheng <joe@rstudio.org>
Contributors: Konrad Rudolph <konrad.rudolph@gmail.com>
Website: https://www.r-project.org
Category: common,scientific
*/

/** @type LanguageFn */
function r(hljs) {
  const regex = hljs.regex;
  // Identifiers in R cannot start with `_`, but they can start with `.` if it
  // is not immediately followed by a digit.
  // R also supports quoted identifiers, which are near-arbitrary sequences
  // delimited by backticks (`…`), which may contain escape sequences. These are
  // handled in a separate mode. See `test/markup/r/names.txt` for examples.
  // FIXME: Support Unicode identifiers.
  const IDENT_RE = /(?:(?:[a-zA-Z]|\.[._a-zA-Z])[._a-zA-Z0-9]*)|\.(?!\d)/;
  const NUMBER_TYPES_RE = regex.either(
    // Special case: only hexadecimal binary powers can contain fractions
    /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/,
    // Hexadecimal numbers without fraction and optional binary power
    /0[xX][0-9a-fA-F]+(?:[pP][+-]?\d+)?[Li]?/,
    // Decimal numbers
    /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[Li]?/
  );
  const OPERATORS_RE = /[=!<>:]=|\|\||&&|:::?|<-|<<-|->>|->|\|>|[-+*\/?!$&|:<=>@^~]|\*\*/;
  const PUNCTUATION_RE = regex.either(
    /[()]/,
    /[{}]/,
    /\[\[/,
    /[[\]]/,
    /\\/,
    /,/
  );

  return {
    name: 'R',

    keywords: {
      $pattern: IDENT_RE,
      keyword:
        'function if in break next repeat else for while',
      literal:
        'NULL NA TRUE FALSE Inf NaN NA_integer_|10 NA_real_|10 '
        + 'NA_character_|10 NA_complex_|10',
      built_in:
        // Builtin constants
        'LETTERS letters month.abb month.name pi T F '
        // Primitive functions
        // These are all the functions in `base` that are implemented as a
        // `.Primitive`, minus those functions that are also keywords.
        + 'abs acos acosh all any anyNA Arg as.call as.character '
        + 'as.complex as.double as.environment as.integer as.logical '
        + 'as.null.default as.numeric as.raw asin asinh atan atanh attr '
        + 'attributes baseenv browser c call ceiling class Conj cos cosh '
        + 'cospi cummax cummin cumprod cumsum digamma dim dimnames '
        + 'emptyenv exp expression floor forceAndCall gamma gc.time '
        + 'globalenv Im interactive invisible is.array is.atomic is.call '
        + 'is.character is.complex is.double is.environment is.expression '
        + 'is.finite is.function is.infinite is.integer is.language '
        + 'is.list is.logical is.matrix is.na is.name is.nan is.null '
        + 'is.numeric is.object is.pairlist is.raw is.recursive is.single '
        + 'is.symbol lazyLoadDBfetch length lgamma list log max min '
        + 'missing Mod names nargs nzchar oldClass on.exit pos.to.env '
        + 'proc.time prod quote range Re rep retracemem return round '
        + 'seq_along seq_len seq.int sign signif sin sinh sinpi sqrt '
        + 'standardGeneric substitute sum switch tan tanh tanpi tracemem '
        + 'trigamma trunc unclass untracemem UseMethod xtfrm',
    },

    contains: [
      // Roxygen comments
      hljs.COMMENT(
        /#'/,
        /$/,
        { contains: [
          {
            // Handle `@examples` separately to cause all subsequent code
            // until the next `@`-tag on its own line to be kept as-is,
            // preventing highlighting. This code is example R code, so nested
            // doctags shouldn’t be treated as such. See
            // `test/markup/r/roxygen.txt` for an example.
            scope: 'doctag',
            match: /@examples/,
            starts: {
              end: regex.lookahead(regex.either(
                // end if another doc comment
                /\n^#'\s*(?=@[a-zA-Z]+)/,
                // or a line with no comment
                /\n^(?!#')/
              )),
              endsParent: true
            }
          },
          {
            // Handle `@param` to highlight the parameter name following
            // after.
            scope: 'doctag',
            begin: '@param',
            end: /$/,
            contains: [
              {
                scope: 'variable',
                variants: [
                  { match: IDENT_RE },
                  { match: /`(?:\\.|[^`\\])+`/ }
                ],
                endsParent: true
              }
            ]
          },
          {
            scope: 'doctag',
            match: /@[a-zA-Z]+/
          },
          {
            scope: 'keyword',
            match: /\\[a-zA-Z]+/
          }
        ] }
      ),

      hljs.HASH_COMMENT_MODE,

      {
        scope: 'string',
        contains: [ hljs.BACKSLASH_ESCAPE ],
        variants: [
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\(/,
            end: /\)(-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\{/,
            end: /\}(-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\[/,
            end: /\](-*)"/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\(/,
            end: /\)(-*)'/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\{/,
            end: /\}(-*)'/
          }),
          hljs.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\[/,
            end: /\](-*)'/
          }),
          {
            begin: '"',
            end: '"',
            relevance: 0
          },
          {
            begin: "'",
            end: "'",
            relevance: 0
          }
        ],
      },

      // Matching numbers immediately following punctuation and operators is
      // tricky since we need to look at the character ahead of a number to
      // ensure the number is not part of an identifier, and we cannot use
      // negative look-behind assertions. So instead we explicitly handle all
      // possible combinations of (operator|punctuation), number.
      // TODO: replace with negative look-behind when available
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/ },
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+([pP][+-]?\d+)?[Li]?/ },
      // { begin: /(?<![a-zA-Z0-9._])(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[Li]?/ }
      {
        relevance: 0,
        variants: [
          {
            scope: {
              1: 'operator',
              2: 'number'
            },
            match: [
              OPERATORS_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: 'operator',
              2: 'number'
            },
            match: [
              /%[^%]*%/,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: {
              1: 'punctuation',
              2: 'number'
            },
            match: [
              PUNCTUATION_RE,
              NUMBER_TYPES_RE
            ]
          },
          {
            scope: { 2: 'number' },
            match: [
              /[^a-zA-Z0-9._]|^/, // not part of an identifier, or start of document
              NUMBER_TYPES_RE
            ]
          }
        ]
      },

      // Operators/punctuation when they're not directly followed by numbers
      {
        // Relevance boost for the most common assignment form.
        scope: { 3: 'operator' },
        match: [
          IDENT_RE,
          /\s+/,
          /<-/,
          /\s+/
        ]
      },

      {
        scope: 'operator',
        relevance: 0,
        variants: [
          { match: OPERATORS_RE },
          { match: /%[^%]*%/ }
        ]
      },

      {
        scope: 'punctuation',
        relevance: 0,
        match: PUNCTUATION_RE
      },

      {
        // Escaped identifier
        begin: '`',
        end: '`',
        contains: [ { begin: /\\./ } ]
      }
    ]
  };
}

module.exports = r;

	return module.exports;
})({ exports: {} })],
	['dart', (function (module) {
/*
Language: Dart
Requires: markdown.js
Author: Maxim Dikun <dikmax@gmail.com>
Description: Dart a modern, object-oriented language developed by Google. For more information see https://www.dartlang.org/
Website: https://dart.dev
Category: scripting
*/

/** @type LanguageFn */
function dart(hljs) {

  const regex = hljs.regex;

  const SUBST = {
    className: 'subst',
    variants: [ { begin: '\\$[A-Za-z0-9_]+' } ]
  };

  const BRACED_SUBST = {
    className: 'subst',
    variants: [
      {
        begin: /\$\{/,
        end: /\}/
      }
    ],
    keywords: 'true false null this is new super'
  };

  const NUMBER = {
    className: 'number',
    relevance: 0,
    variants: [
      { match: /\b[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?\b/ },
      { match: /\b0[xX][0-9A-Fa-f][0-9A-Fa-f_]*\b/ }
    ]
  };

  const STRING = {
    className: 'string',
    variants: [
      {
        begin: 'r\'\'\'',
        end: '\'\'\''
      },
      {
        begin: 'r"""',
        end: '"""'
      },
      {
        begin: 'r\'',
        end: '\'',
        illegal: '\\n'
      },
      {
        begin: 'r"',
        end: '"',
        illegal: '\\n'
      },
      {
        begin: '\'\'\'',
        end: '\'\'\'',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: '"""',
        end: '"""',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: '\'',
        end: '\'',
        illegal: '\\n',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      },
      {
        begin: '"',
        end: '"',
        illegal: '\\n',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          BRACED_SUBST
        ]
      }
    ]
  };
  BRACED_SUBST.contains = [
    NUMBER,
    STRING
  ];

  const BUILT_IN_TYPES = [
    // dart:core
    'Comparable',
    'DateTime',
    'Duration',
    'Function',
    'Iterable',
    'Iterator',
    'List',
    'Map',
    'Match',
    'Object',
    'Pattern',
    'RegExp',
    'Set',
    'Stopwatch',
    'String',
    'StringBuffer',
    'StringSink',
    'Symbol',
    'Type',
    'Uri',
    'bool',
    'double',
    'int',
    'num',
    // dart:html
    'Element',
    'ElementList'
  ];
  const NULLABLE_BUILT_IN_TYPES = BUILT_IN_TYPES.map((e) => `${e}?`);

  const BASIC_KEYWORDS = [
    "abstract",
    "as",
    "assert",
    "async",
    "await",
    "base",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "covariant",
    "default",
    "deferred",
    "do",
    "dynamic",
    "else",
    "enum",
    "export",
    "extends",
    "extension",
    "external",
    "factory",
    "false",
    "final",
    "finally",
    "for",
    "Function",
    "get",
    "hide",
    "if",
    "implements",
    "import",
    "in",
    "interface",
    "is",
    "late",
    "library",
    "mixin",
    "new",
    "null",
    "on",
    "operator",
    "part",
    "required",
    "rethrow",
    "return",
    "sealed",
    "set",
    "show",
    "static",
    "super",
    "switch",
    "sync",
    "this",
    "throw",
    "true",
    "try",
    "typedef",
    "var",
    "void",
    "when",
    "while",
    "with",
    "yield"
  ];

  const KEYWORDS = {
    keyword: BASIC_KEYWORDS,
    built_in:
      BUILT_IN_TYPES
        .concat(NULLABLE_BUILT_IN_TYPES)
        .concat([
          // dart:core
          'Never',
          'Null',
          'dynamic',
          'print',
          // dart:html
          'document',
          'querySelector',
          'querySelectorAll',
          'window'
        ]),
    $pattern: /[A-Za-z][A-Za-z0-9_]*\??/
  };

  const CLASS_NAME_RE = regex.concat(
    /\b_?/,
    regex.either(
      /(?:[A-Z]+[a-z0-9]+)+/,
      /(?:[A-Z]+[a-z0-9]+)+[A-Z]+/
    ),
    /(?![A-Za-z0-9_])/
  );

  const CLASS_REFERENCE = {
    match: CLASS_NAME_RE,
    scope: "title.class"
  };

  const FUNCTION_REFERENCE = {
    match: /\b(?!(?:assert|catch|for|if|switch|while)\b)[a-z_][A-Za-z0-9_]*(?=\()/,
    scope: "title.function"
  };

  return {
    name: 'Dart',
    keywords: KEYWORDS,
    contains: [
      STRING,
      hljs.COMMENT(
        /\/\*\*(?!\/)/,
        /\*\//,
        {
          subLanguage: 'markdown',
          relevance: 0
        }
      ),
      hljs.COMMENT(
        /\/{3,} ?/,
        /$/, { contains: [
          {
            subLanguage: 'markdown',
            begin: '.',
            end: '$',
            relevance: 0
          }
        ] }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'class',
        beginKeywords: 'class interface',
        end: /\{/,
        excludeEnd: true,
        contains: [
          { beginKeywords: 'extends implements' },
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      CLASS_REFERENCE,
      FUNCTION_REFERENCE,
      NUMBER,
      {
        className: 'meta',
        begin: '@[A-Za-z]+'
      }
    ]
  };
}

module.exports = dart;

	return module.exports;
})({ exports: {} })],
	['markdown', (function (module) {
/*
Language: Markdown
Requires: xml.js
Author: John Crepezzi <john.crepezzi@gmail.com>
Website: https://daringfireball.net/projects/markdown/
Category: common, markup
*/

function markdown(hljs) {
  const regex = hljs.regex;
  const INLINE_HTML = {
    begin: /<\/?[A-Za-z_]/,
    end: '>',
    subLanguage: 'xml',
    relevance: 0
  };
  // https://spec.commonmark.org/0.31.2/#thematic-breaks
  // three or more `-`, `*` or `_`, all the same character, optionally
  // separated and followed by spaces or tabs, and nothing else on the line
  const HORIZONTAL_RULE = { match: /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/ };
  const CODE = {
    className: 'code',
    variants: [
      // TODO: fix to allow these to work with sublanguage also
      { begin: '(`{3,})[^`](.|\\n)*?\\1`*[ ]*' },
      { begin: '(~{3,})[^~](.|\\n)*?\\1~*[ ]*' },
      // needed to allow markdown as a sublanguage to work
      {
        begin: '```',
        end: '```+[ ]*$'
      },
      {
        begin: '~~~',
        end: '~~~+[ ]*$'
      },
      { begin: '`.+?`' },
      {
        begin: '(?=^( {4}|\\t))',
        // use contains to gobble up multiple lines to allow the block to be whatever size
        // but only have a single open/close tag vs one per line
        contains: [
          {
            begin: '^( {4}|\\t)',
            end: '(\\n)$'
          }
        ],
        relevance: 0
      }
    ]
  };
  const LIST = {
    className: 'bullet',
    begin: '^[ \t]*([*+-]|(\\d+\\.))(?=\\s+)',
    end: '\\s+',
    excludeEnd: true
  };
  const LINK_REFERENCE = {
    begin: /^\[[^\n]+\]:/,
    returnBegin: true,
    contains: [
      {
        className: 'symbol',
        begin: /\[/,
        end: /\]/,
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: 'link',
        begin: /:\s*/,
        end: /$/,
        excludeBegin: true
      }
    ]
  };
  const URL_SCHEME = /[A-Za-z][A-Za-z0-9+.-]*/;
  const LINK = {
    variants: [
      // too much like nested array access in so many languages
      // to have any real relevance
      {
        begin: /\[.+?\]\[.*?\]/,
        relevance: 0
      },
      // popular internet URLs
      {
        begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
        relevance: 2
      },
      {
        begin: regex.concat(/\[.+?\]\(/, URL_SCHEME, /:\/\/.*?\)/),
        relevance: 2
      },
      // relative urls
      {
        begin: /\[.+?\]\([./?&#].*?\)/,
        relevance: 1
      },
      // whatever else, lower relevance (might not be a link at all)
      {
        begin: /\[.*?\]\(.*?\)/,
        relevance: 0
      }
    ],
    returnBegin: true,
    contains: [
      {
        // empty strings for alt or link text
        match: /\[(?=\])/ },
      {
        className: 'string',
        relevance: 0,
        begin: '\\[',
        end: '\\]',
        excludeBegin: true,
        returnEnd: true
      },
      {
        className: 'link',
        relevance: 0,
        begin: '\\]\\(',
        end: '\\)',
        excludeBegin: true,
        excludeEnd: true
      },
      {
        className: 'symbol',
        relevance: 0,
        begin: '\\]\\[',
        end: '\\]',
        excludeBegin: true,
        excludeEnd: true
      }
    ]
  };
  const BOLD = {
    className: 'strong',
    contains: [], // defined later
    variants: [
      {
        begin: /_{2}(?!\s)/,
        end: /_{2}/
      },
      {
        begin: /\*{2}(?!\s)/,
        end: /\*{2}/
      }
    ]
  };
  const ITALIC = {
    className: 'emphasis',
    contains: [], // defined later
    variants: [
      {
        begin: /\*(?![*\s])/,
        end: /\*/
      },
      {
        begin: /_(?![_\s])/,
        end: /_/,
        relevance: 0
      }
    ]
  };

  // 3 level deep nesting is not allowed because it would create confusion
  // in cases like `***testing***` because where we don't know if the last
  // `***` is starting a new bold/italic or finishing the last one
  const BOLD_WITHOUT_ITALIC = hljs.inherit(BOLD, { contains: [] });
  const ITALIC_WITHOUT_BOLD = hljs.inherit(ITALIC, { contains: [] });
  BOLD.contains.push(ITALIC_WITHOUT_BOLD);
  ITALIC.contains.push(BOLD_WITHOUT_ITALIC);

  let CONTAINABLE = [
    INLINE_HTML,
    LINK
  ];

  [
    BOLD,
    ITALIC,
    BOLD_WITHOUT_ITALIC,
    ITALIC_WITHOUT_BOLD
  ].forEach(m => {
    m.contains = m.contains.concat(CONTAINABLE);
  });

  CONTAINABLE = CONTAINABLE.concat(BOLD, ITALIC);

  const HEADER = {
    className: 'section',
    variants: [
      {
        begin: '^#{1,6}',
        end: '$',
        contains: CONTAINABLE
      },
      {
        begin: '(?=^.+?\\n[=-]{2,}$)',
        contains: [
          { begin: '^[=-]*$' },
          {
            begin: '^',
            end: "\\n",
            contains: CONTAINABLE
          }
        ]
      }
    ]
  };

  const BLOCKQUOTE = {
    className: 'quote',
    begin: '^>\\s+',
    contains: CONTAINABLE,
    end: '$'
  };

  const ENTITY = {
    //https://spec.commonmark.org/0.31.2/#entity-references
    scope: 'literal',
    match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
  };

  return {
    name: 'Markdown',
    aliases: [
      'md',
      'mkdown',
      'mkd'
    ],
    contains: [
      HEADER,
      INLINE_HTML,
      LIST,
      // must come before BOLD/ITALIC so that a `***` or `___` thematic break
      // isn't mistaken for the start of bold text
      HORIZONTAL_RULE,
      BOLD,
      ITALIC,
      BLOCKQUOTE,
      CODE,
      LINK,
      LINK_REFERENCE,
      ENTITY
    ]
  };
}

module.exports = markdown;

	return module.exports;
})({ exports: {} })],
	];
	for (const [name, factory] of _langs) _core.registerLanguage(name, factory);
	return _core;
})();
/*__HLJS_END__*/

		/** Package-owned <style> host — the persistent client has no `styles` builtin. */
		let styleEl = null;
		function insertCss(css) {
			if (styleEl === null || !document.contains(styleEl)) {
				styleEl = document.createElement("style");
				styleEl.setAttribute("data-plugin-css", "dsh-file-explorer");
				document.head.appendChild(styleEl);
			}
			const node = document.createTextNode(css);
			styleEl.appendChild(node);
			return function dispose() {
				if (node.parentNode === styleEl) styleEl.removeChild(node);
			};
		}

		const CSS = `
.fexp-host { display: contents; }
.fexp-toggle { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; padding: 0 8px; border: none; background: transparent; border-radius: 6px; color: inherit; cursor: pointer; font-size: 14px; line-height: 1; flex-shrink: 1; }
.fexp-toggle:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.16)); }
.fexp-toggle.fexp-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 28%, transparent); }
.fexp-toggle-wide { min-width: 64px; padding: 0 10px; }
.fexp-panel { position: fixed; width: 400px; max-width: calc(100vw - 24px); height: min(640px, 78vh); display: flex; flex-direction: column; background: var(--dsw-specific-sidebar-fill, #f6f7f9); color: var(--dsw-alias-label-primary, #1f2328); border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.35)); border-radius: 12px; box-shadow: var(--dsw-shadow-lv3, 0 10px 40px rgba(0,0,0,.28)); overflow: hidden; pointer-events: auto; z-index: 500; font-size: 14px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px; cursor: move; user-select: none; font-weight: 600; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-header-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fexp-x { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; padding: 0; border: none; background: transparent; cursor: pointer; border-radius: 6px; color: inherit; }
.fexp-x:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-dockbtn { border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3)); background: transparent; color: inherit; border-radius: 5px; padding: 1px 6px; font-size: 12px; cursor: pointer; }
.fexp-dockbtn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-dockbtn.fexp-on { background: var(--dsw-alias-interactive-bg-hover, rgba(90,140,255,.25)); }
.fexp-toolbar { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 8px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-tbtn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3)); background: transparent; color: inherit; border-radius: 8px; padding: 3px 10px; font-size: 13px; line-height: 1.5; cursor: pointer; transition: background var(--ds-transition-duration, .2s) var(--ds-ease-in-out, ease), border-color var(--ds-transition-duration, .2s) var(--ds-ease-in-out, ease), color var(--ds-transition-duration, .2s) var(--ds-ease-in-out, ease); }
.fexp-tbtn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-tbtn.fexp-on { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-tbtn-ic { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; font-size: 14px; line-height: 1; flex: none; }
.fexp-tree { flex: 1; overflow: auto; padding: 4px 0; min-height: 0; }
.fexp-row { display: flex; align-items: center; gap: 4px; padding: 2px 8px; cursor: pointer; white-space: nowrap; border-radius: 4px; }
.fexp-row:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-caret { width: 14px; flex: none; font-size: 11px; opacity: .7; }
.fexp-ic { flex: none; font-size: 14px; }
.fexp-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.fexp-size { flex: none; opacity: .6; font-size: 12px; margin-left: 6px; }
.fexp-err { color: var(--dsw-alias-state-error-primary, #d33); cursor: default; }
.fexp-dim { opacity: .55; }
.fexp-preview { flex: none; height: 260px; min-height: 60px; display: flex; flex-direction: column; border-top: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-phead { display: flex; align-items: center; gap: 6px; padding: 6px 10px; font-size: 13px; font-weight: 600; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.15)); }
.fexp-pname { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fexp-pre { flex: 1; overflow: auto; margin: 0; padding: 8px 10px; font-family: Consolas, 'Cascadia Code', monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; tab-size: 4; }
.fexp-pbody { flex: 1; overflow: auto; padding: 8px 10px; }
.fexp-row.fexp-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 18%, transparent); }
/* v1.9.16：缩放 chrome —— 独立 overlay 层（ui-beautify 式跨骑把手）
   边条 6px 跨骑边界（±3px）、两端让 12px；四角 12×12 外凸 6px；
   宿主 pointer-events:none、把手 auto；平时透明仅光标、拖动中高亮。 */
.fexp-chrome { position: fixed; left: 0; top: 0; width: 1px; height: 1px; pointer-events: none; }
.fexp-chrome-handle { position: absolute; pointer-events: auto; touch-action: none; }
.fexp-chrome-handle.fexp-chrome-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 26%, transparent); border-radius: 4px; }
.fexp-ch-dir-n { left: 12px; right: 12px; top: -3px; height: 6px; cursor: ns-resize; }
.fexp-ch-dir-s { left: 12px; right: 12px; bottom: -3px; height: 6px; cursor: ns-resize; }
.fexp-ch-dir-e { top: 12px; bottom: 12px; right: -3px; width: 6px; cursor: ew-resize; }
.fexp-ch-dir-w { top: 12px; bottom: 12px; left: -3px; width: 6px; cursor: ew-resize; }
.fexp-ch-dir-nw { left: -6px; top: -6px; width: 12px; height: 12px; cursor: nwse-resize; }
.fexp-ch-dir-ne { right: -6px; top: -6px; width: 12px; height: 12px; cursor: nesw-resize; }
.fexp-ch-dir-sw { left: -6px; bottom: -6px; width: 12px; height: 12px; cursor: nesw-resize; }
.fexp-ch-dir-se { right: -6px; bottom: -6px; width: 12px; height: 12px; cursor: nwse-resize; }
.fexp-panel.fexp-narrow .fexp-size { display: none; }
/* --- v1.3: editing + context menu --- */
.fexp-editbtn { border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3)); background: transparent; color: inherit; border-radius: 5px; padding: 1px 6px; font-size: 12px; cursor: pointer; }
.fexp-editbtn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); }
.fexp-editbtn.fexp-on { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 25%, transparent); }
.fexp-editor { flex: 1; display: flex; flex-direction: column; min-height: 0; border-top: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-editor-bar { display: flex; align-items: center; gap: 6px; padding: 5px 10px; font-size: 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.15)); }
.fexp-editor-bar .fexp-dim { flex: 1; }
/* v1.9.7 编辑器：字体/字号/行高由 .fexp-code-font 统一提供（13px/20px，与
   行号栏逐行对齐）——旧规则在此写死 12px/1.5 会覆盖类样式导致错位，已删除 */
.fexp-menu { position: fixed; min-width: 168px; max-width: 280px; background: var(--dsw-specific-sidebar-fill, #f6f7f9); color: var(--dsw-alias-label-primary, #1f2328); border: 1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.35)); border-radius: 8px; box-shadow: var(--dsw-shadow-lv3, 0 6px 24px rgba(0,0,0,.28)); padding: 4px; z-index: 600; pointer-events: auto; font-size: 13px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-menu-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 5px; cursor: pointer; white-space: nowrap; }
.fexp-menu-item:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 22%, transparent); }
.fexp-menu-item.fexp-disabled { opacity: .45; cursor: default; }
.fexp-menu-item.fexp-disabled:hover { background: transparent; }
.fexp-menu-item.fexp-danger { color: var(--dsw-alias-state-error-primary, #e5484d); }
.fexp-menu-item.fexp-danger:hover { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 16%, transparent); }
.fexp-menu-sep { height: 1px; margin: 4px 6px; background: var(--dsw-alias-border-l1, rgba(127,127,127,.22)); }
.fexp-menu-ic { width: 16px; text-align: center; flex: none; }
.fexp-menu-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.fexp-input-host { position: fixed; z-index: 610; pointer-events: auto; }
.fexp-input { box-sizing: border-box; width: 100%; padding: 4px 8px; border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 80%, transparent); border-radius: 5px; outline: none; background: var(--dsw-alias-bg-layer-1, #ffffff); color: var(--dsw-alias-label-primary, #1f2328); font-size: 13px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.fexp-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); max-width: 70vw; padding: 8px 16px; border-radius: 8px; background: rgba(30,30,34,.92); color: #f2f2f2; font-size: 13px; z-index: 700; pointer-events: none; box-shadow: 0 4px 16px rgba(0,0,0,.3); }
.fexp-editing-row { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 14%, transparent); }
.fexp-row.fexp-clipboard-src { outline: 1px dashed color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 60%, transparent); outline-offset: -1px; }
/* --- v1.5: drag & drop --- */
.fexp-row.fexp-dragging { opacity: .45; }
.fexp-row.fexp-drop-target, .fexp-tree.fexp-drop-target { outline: 2px solid color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 70%, transparent); outline-offset: -1px; background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 12%, transparent); }
.fexp-tree.fexp-drop-target { outline-offset: 0; border-radius: 6px; }
/* --- v1.6: ui-beautify card-mode host integration ---
   Inside the dock host (tabbed card / floating glass window) the panel
   fills its container and inherits the card chrome (background, border,
   radius, shadow) — only the inner explorer layout stays. */
.fexp-panel.fexp-hostpanel { position: static; width: 100%; height: 100%; max-width: none; border: none; border-radius: 0; box-shadow: none; background: transparent; }
.fexp-panel.fexp-hostpanel .fexp-header { cursor: default; }
/* ============================================================
   v1.9.0：HIG 风格体系（全平台统一）
   字体 / 圆角间距 / 深浅色材质 / 图标 / 动效 —— Apple HIG 语义，
   全部经由 --dsw-alias-* 变量适配当前主题。
   ============================================================ */
.fexp-panel, .fexp-menu, .fexp-input, .fexp-help, .fexp-toast { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "Microsoft YaHei", sans-serif; }
.fexp-code-font, .fexp-cline, .fexp-codeview textarea, .fexp-md-code code, .fexp-pre { font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Cascadia Code", monospace; font-size: 13px; line-height: 20px; }
/* --- 搜索条（树顶部，胶囊） --- */
.fexp-searchbar { display: flex; align-items: center; gap: 6px; margin: 6px 10px 2px; padding: 0 10px; height: 30px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); flex: none; transition: border-color 150ms ease-out, box-shadow 150ms ease-out; }
.fexp-searchbar:focus-within { border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent); }
.fexp-searchbar input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; }
.fexp-searchbar input::placeholder { color: var(--dsw-alias-label-tertiary); }
.fexp-search-clear { appearance: none; border: none; background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; display: inline-flex; padding: 4px; border-radius: 8px; flex: none; min-width: 24px; min-height: 24px; justify-content: center; align-items: center; }
.fexp-search-clear:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.fexp-search-count { font-size: 11px; color: var(--dsw-alias-label-tertiary); flex: none; font-variant-numeric: tabular-nums; }
.fexp-search-ic { color: var(--dsw-alias-label-tertiary); flex: none; display: inline-flex; }
/* 匹配子串高亮 */
.fexp-mark { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 32%, transparent); color: inherit; border-radius: 3px; padding: 0 1px; }
/* 空状态 */
.fexp-empty { padding: 14px 12px; color: var(--dsw-alias-label-tertiary); font-size: 12px; text-align: center; }
/* --- 代码/文本视图：行号列 + 内容列 --- */
.fexp-codeview { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.fexp-code-head { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); flex: none; }
.fexp-code-head .fexp-meta { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fexp-code-scroll { display: flex; flex: 1; min-height: 0; overflow: auto; position: relative; }
.fexp-codelines { flex: 1; min-width: 0; padding: 8px 12px 8px 0; }
.fexp-cline { white-space: pre-wrap; overflow-wrap: anywhere; min-height: 20px; color: var(--dsw-alias-label-primary); tab-size: 4; }
.fexp-cline.fexp-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent); border-radius: 4px; }
.fexp-overlong { opacity: 1; }
.fexp-overlong-mark { color: var(--dsw-alias-label-tertiary); font-style: italic; font-size: 11px; }
.fexp-more { display: flex; justify-content: center; padding: 6px 0 10px; flex: none; }
/* --- Markdown 富文本视图 --- */
.fexp-mdview { flex: 1; min-height: 0; overflow: auto; display: flex; justify-content: center; }
.fexp-md-body { max-width: 760px; width: 100%; padding: 14px 24px 28px; font-size: 14px; line-height: 1.7; color: var(--dsw-alias-label-primary); }
.fexp-md-body h1 { font-size: 22px; font-weight: 700; line-height: 1.3; margin: 20px 0 10px; }
.fexp-md-body h2 { font-size: 18px; font-weight: 600; line-height: 1.35; margin: 18px 0 8px; }
.fexp-md-body h3 { font-size: 15px; font-weight: 600; line-height: 1.4; margin: 14px 0 6px; }
.fexp-md-body p { margin: 8px 0; }
.fexp-md-body ul, .fexp-md-body ol { margin: 8px 0; padding-left: 22px; }
.fexp-md-body li { margin: 3px 0; }
.fexp-md-body blockquote { margin: 10px 0; padding: 2px 14px; border-left: 3px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary); }
.fexp-md-body table { border-collapse: collapse; margin: 10px 0; font-size: 13px; }
.fexp-md-body th, .fexp-md-body td { border: 1px solid var(--dsw-alias-border-l1); padding: 5px 10px; text-align: left; }
.fexp-md-body th { background: var(--dsw-alias-bg-layer-1); font-weight: 600; }
.fexp-md-body code { font-family: ui-monospace, "SF Mono", Menlo, Consolas, "Cascadia Code", monospace; font-size: 12.5px; background: var(--dsw-alias-bg-layer-1); border-radius: 5px; padding: 1px 4px; }
.fexp-md-body pre { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; padding: 12px; overflow: auto; position: relative; margin: 10px 0; }
.fexp-md-body pre code { background: transparent; padding: 0; border-radius: 0; font-size: 13px; line-height: 1.6; display: block; }
.fexp-md-body a { color: var(--dsw-alias-brand-primary); text-decoration: none; }
.fexp-md-body a:hover { text-decoration: underline; }
.fexp-md-body hr { border: none; border-top: 1px solid var(--dsw-alias-border-l1); margin: 16px 0; }
.fexp-md-body input[type="checkbox"] { accent-color: var(--dsw-alias-brand-primary); margin-right: 6px; }
.fexp-md-imgph { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.fexp-md-copy { position: absolute; top: 6px; right: 6px; appearance: none; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); border-radius: 8px; padding: 2px 8px; font-size: 11px; line-height: 18px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; opacity: 0; transition: opacity 150ms ease-out; }
.fexp-md-body pre:hover .fexp-md-copy { opacity: 1; }
.fexp-md-copy:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-label-dimmed); }
/* TOC */
.fexp-toc { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); margin: 12px 0; font-size: 13px; }
.fexp-toc-head { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; color: var(--dsw-alias-label-secondary); font-weight: 600; }
.fexp-toc-head:hover { background: var(--dsw-alias-interactive-bg-hover); border-radius: 10px; }
.fexp-toc-list { padding: 2px 12px 10px; display: flex; flex-direction: column; gap: 2px; }
.fexp-toc-item { appearance: none; border: none; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; text-align: left; padding: 3px 8px; border-radius: 6px; cursor: pointer; line-height: 1.5; }
.fexp-toc-item:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.fexp-toc-item.l2 { padding-left: 20px; }
.fexp-toc-item.l3 { padding-left: 32px; font-size: 12px; }
/* --- 预览头按钮（HIG 分段控件风格） --- */
.fexp-pbtn { appearance: none; font: inherit; border: none; background: transparent; color: var(--dsw-alias-label-secondary); border-radius: 8px; padding: 3px 10px; font-size: 12px; line-height: 18px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; min-height: 24px; }
.fexp-pbtn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.fexp-pbtn.fexp-on { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent); color: var(--dsw-alias-brand-primary); font-weight: 600; }
.fexp-pbtn-group { display: inline-flex; gap: 2px; padding: 2px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; }
.fexp-pbtn-ic { display: inline-flex; }
/* --- 帮助浮层 --- */
.fexp-help { position: fixed; z-index: 760; width: 360px; max-width: calc(100vw - 24px); border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 86%, transparent); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); box-shadow: var(--dsw-shadow-lv3, 0 10px 40px rgba(0,0,0,.28)); color: var(--dsw-alias-label-primary); padding: 14px 16px; font-size: 13px; animation: fexp-pop 180ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes fexp-pop { from { opacity: 0; transform: scale(0.96) translateY(-4px); } to { opacity: 1; transform: none; } }
.fexp-help h3 { margin: 0 0 8px; font-size: 14px; font-weight: 700; }
.fexp-help-head { cursor: move; user-select: none; font-size: 14px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
.fexp-help-head::after { content: "⠿"; color: var(--dsw-alias-label-tertiary); font-size: 12px; cursor: move; }
.fexp-help table { width: 100%; border-collapse: collapse; }
.fexp-help td { padding: 3px 0; vertical-align: top; }
.fexp-help td:first-child { color: var(--dsw-alias-label-secondary); white-space: nowrap; padding-right: 14px; font-variant-numeric: tabular-nums; }
.fexp-help .kbd { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 11px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); border-radius: 5px; padding: 1px 5px; }
.fexp-help-close { margin-top: 10px; width: 100%; }
/* --- HIG 按钮统一样式（覆盖旧按钮） --- */
.fexp-btn { appearance: none; font: inherit; cursor: pointer; color: var(--dsw-alias-label-primary); background: transparent; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 3px 12px; font-size: 12px; line-height: 20px; min-height: 28px; transition: background 150ms ease-out, border-color 150ms ease-out; }
.fexp-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.fexp-btn:disabled { opacity: .5; cursor: default; }
.fexp-btn-primary { color: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
/* 行号/文本视图的编辑区 */
.fexp-editor-bar .fexp-btn { min-height: 24px; padding: 1px 8px; }
/* --- hljs 配色：亮色（github 风格） --- */
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs { color: #24292f; background: transparent; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-keyword, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-selector-tag, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-literal, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-meta .hljs-keyword, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-doctag { color: #cf222e; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-string, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-regexp, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-addition, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-attribute { color: #0a3069; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-number, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-symbol { color: #0550ae; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-comment, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-quote { color: #6e7781; font-style: italic; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-title, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-title.function_, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-section { color: #8250df; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-title.class_, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-type { color: #953800; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-built_in, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-params { color: #953800; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-variable, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-template-variable { color: #24292f; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-attr, :where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-attribute { color: #0550ae; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-deletion { color: #82071e; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-meta { color: #0550ae; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-emphasis { font-style: italic; }
:where(.fexp-panel, .fexp-preview-card):not([data-fexp-theme="dark"]) .hljs-strong { font-weight: 600; }
/* --- hljs 配色：暗色（github-dark 风格） --- */
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs { color: #c9d1d9; background: transparent; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-keyword, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-selector-tag, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-literal, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-doctag { color: #ff7b72; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-string, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-regexp, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-addition { color: #a5d6ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-number, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-symbol { color: #79c0ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-comment, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-quote { color: #8b949e; font-style: italic; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-title, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-section { color: #d2a8ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-title.class_, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-type { color: #ffa657; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-built_in, :where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-params { color: #ffa657; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-attr { color: #79c0ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-attribute { color: #ffa657; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-deletion { color: #ffa198; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-meta { color: #79c0ff; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-emphasis { font-style: italic; }
:where(.fexp-panel, .fexp-preview-card)[data-fexp-theme="dark"] .hljs-strong { font-weight: 600; }
/* ============================================================
   v1.9.1：预览独立卡片（浮动窗，面板内预览区退役）
   ============================================================ */
.fexp-preview-card { position: fixed; z-index: 800; display: flex; flex-direction: column; min-width: 480px; min-height: 320px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 88%, transparent); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; box-shadow: var(--dsw-shadow-lv3, 0 12px 48px rgba(0,0,0,.32)); overflow: hidden; animation: fexp-card-in 180ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes fexp-card-in { from { opacity: 0; transform: scale(0.97) translateY(6px); } to { opacity: 1; transform: none; } }
.fexp-preview-card.fexp-maximized { border-radius: 0; }
.fexp-preview-card .fexp-phead { cursor: move; flex: none; }
/* v1.9.16: 卡片缩放把手已移至独立 chrome 层（.fexp-chrome*，见上）——
   不再作为卡片子元素，避免遮挡内容/滚动条/按钮，也不受卡片圆角与 overflow 影响 */
/* ============================================================
   v1.9.6：行视图 —— 原生 table 布局（只读：截断/降级）
   tr 高度 = max(td)：行号与内容天然同步；内容 pre-wrap 软换行
   撑高整行，行号锚定逻辑行首、不占新行号、绝无重叠。
   ============================================================ */
.fexp-linetable { border-collapse: collapse; width: 100%; table-layout: fixed; }
.fexp-linetable td { vertical-align: top; }
.fexp-linetable td.fexp-lineno { text-align: right; padding: 0 10px 0 0; color: var(--dsw-alias-label-tertiary); user-select: none; font-size: 12px; line-height: 20px; white-space: nowrap; box-sizing: border-box; overflow: hidden; background: var(--dsw-alias-bg-layer-2); }
.fexp-linetable td.fexp-cline { padding: 0 12px 0 8px; min-width: 0; }
/* ============================================================
   v1.9.15：实时高亮编辑器 —— 单一滚动容器（无镜像层）
   行号 span 与高亮 span 在同一行结构、同一 scrollTop；
   光标/选区/IME 覆盖像素位置由编辑器几何计算（与渲染同一函数）。
   行号列 sticky 固定左侧；white-space:pre 不软换行，
   每逻辑行恰好 20px 行高；textarea 显式锁定 13px/20px 字体指标。
   ============================================================ */
.fexp-editor-scroller { position: absolute; top: 0; bottom: 0; left: 0; right: 0; overflow: auto; }
.fexp-editor-rows { position: relative; padding: 8px 0; min-width: 100%; box-sizing: border-box; width: max-content; }
.fexp-editor-row { display: flex; height: 20px; line-height: 20px; }
.fexp-editor-lineno { position: sticky; left: 0; flex: none; width: var(--fexp-noW, 44px); box-sizing: border-box; padding-right: 8px; text-align: right; color: var(--dsw-alias-label-tertiary); user-select: none; background: var(--dsw-alias-bg-layer-2); white-space: nowrap; font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Cascadia Code', monospace; font-size: 13px; }
.fexp-editor-row .fexp-cline { position: relative; flex: 1; min-width: 0; padding-left: 12px; white-space: pre; overflow: hidden; }
/* v1.9.15 编辑器光标/选区/合成覆盖：像素位置由编辑器几何计算，与文本同一坐标系 */
.fexp-editor { user-select: none; -webkit-user-select: none; }
.fexp-ed-caret { position: absolute; width: 2px; height: 18px; background: var(--dsw-alias-label-primary); border-radius: 1px; opacity: 0; pointer-events: none; z-index: 4; }
.fexp-editor.fexp-focused .fexp-ed-caret { opacity: 1; animation: fexp-blink 1.06s step-end infinite; }
@keyframes fexp-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
.fexp-ed-sel { position: absolute; top: 0; bottom: 0; background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 24%, transparent); border-radius: 2px; pointer-events: none; }
.fexp-ed-tok { position: relative; white-space: pre; }
.fexp-ed-comp { position: absolute; top: 0; bottom: 0; background: color-mix(in srgb, var(--dsw-alias-brand-primary, #5a8cff) 16%, transparent); border-bottom: 2px solid var(--dsw-alias-brand-primary, #5a8cff); color: var(--dsw-alias-label-primary); pointer-events: none; white-space: pre; }
`;

		// --- Pure helpers (no apply-scope state) ------------------------------
		// Everything here is side-effect free or touches only browser globals, so
		// it lives at factory level; apply() keeps only stateful helpers.

		// v1.9.0: SF Symbols 风格内联 SVG 图标库（stroke 1.6 圆头，24 视框）。
		// 替代 emoji 图标，保证全平台观感一致（HIG 图标规范）。
		const ICON_PATHS = {
			search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
			folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
			file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
			refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
			eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
			close: '<path d="M6 6l12 12M18 6L6 18"/>',
			help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2 1-1.2 1.8"/><path d="M12 17h.01"/>',
			copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
			check: '<path d="M4 12.5l5 5L20 6.5"/>',
			chevronRight: '<path d="M9 6l6 6-6 6"/>',
			chevronDown: '<path d="M6 9l6 6 6-6"/>',
			trash: '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/>',
			edit: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M13.5 6.5l3 3"/>',
			external: '<path d="M14 4h6v6"/><path d="M20 4L11 13"/><path d="M20 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
			doc: '<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/>',
		};
		/** 生成 SF Symbols 风格 SVG 字符串（供 innerHTML 使用）。 */
		function makeIcon(name, size) {
			const d = ICON_PATHS[name] || ICON_PATHS.doc;
			const s = size || 14;
			return '<svg class="fexp-ic-svg" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
		}
		/** 生成带图标的按钮元素（HIG 风格）。 */
		function iconBtn(icon, label, title, onClick, cls) {
			const b = document.createElement("button");
			b.className = "fexp-btn" + (cls ? " " + cls : "");
			b.title = title || label || "";
			b.type = "button";
			const ic = document.createElement("span");
			ic.className = "fexp-pbtn-ic";
			ic.innerHTML = makeIcon(icon, 13);
			b.appendChild(ic);
			if (label) {
				const t = document.createElement("span");
				t.textContent = label;
				b.appendChild(t);
			}
			if (onClick) b.addEventListener("click", onClick);
			return b;
		}

		// Directories hidden from the tree (dotfiles + noisy dependency dirs).
		const SKIP_DIRS = new Set(["node_modules", "venv", "__pycache__", "dist", "build", ".next", "coverage", ".cache"]);
		function isHiddenName(name) {
			return name.charAt(0) === "." || SKIP_DIRS.has(name);
		}
		function formatSize(bytes) {
			if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return "";
			if (bytes < 1024) return bytes + " B";
			const units = ["KB", "MB", "GB", "TB"];
			let value = bytes / 1024;
			let i = 0;
			while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
			return value.toFixed(1) + " " + units[i];
		}
		function baseName(p) {
			const parts = p.split(/[\\/]/).filter(Boolean);
			return parts.length > 0 ? parts[parts.length - 1] : p;
		}

		// ============ v1.9.15 编辑器几何（坐标单一来源）============
		// 所有像素位置（行号列宽、文本起点、光标、选区、鼠标映射、IME 覆盖）
		// 均由同一组常量与函数计算：渲染层与输入层共用，从机制上杜绝
		// "两层各自推算坐标"造成的错位（对齐 VS Code：字符宽度测量 + 行高常量化）。
		// 常量与 .fexp-cline CSS 必须保持一致：13px 等宽、tab-size:4、行高 20px。
		let _editCharW = 0;
		/** 等宽字符宽度（px）：canvas 按与 .fexp-cline 相同的字体串测量一次并缓存。 */
		function editCharW() {
			if (_editCharW > 0) return _editCharW;
			try {
				const ctx = document.createElement("canvas").getContext("2d");
				if (ctx) {
					ctx.font = "13px ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Cascadia Code', monospace";
					_editCharW = ctx.measureText("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ").width / 62;
				}
			} catch (err) { /* 回退到保守值 */ }
			if (!(_editCharW > 0)) _editCharW = 7.8;
			return _editCharW;
		}
		/** 行号列宽（px）：与 --fexp-noW 同一公式。 */
		function edNoWFor(lineCount) {
			return Math.max(44, 14 + String(lineCount).length * 8);
		}
		/** 列 → x（px）。tab 按 4 列步进（tab-size:4），等宽 1 字符 = 1 列。 */
		function edColToX(text, col, chW) {
			let cols = 0;
			const n = col < text.length ? col : text.length;
			for (let i = 0; i < n; i += 1) cols += text.charCodeAt(i) === 9 ? 4 - (cols % 4) : 1;
			return cols * chW;
		}
		/** x → 列（px，中点规则；越界返回行尾列）。 */
		function edXToCol(text, x, chW) {
			const target = x / chW;
			let cols = 0;
			for (let i = 0; i < text.length; i += 1) {
				const step = text.charCodeAt(i) === 9 ? 4 - (cols % 4) : 1;
				if (cols + step / 2 >= target) return i;
				cols += step;
			}
			return text.length;
		}
		/** 行起点数组：每行起始字符索引（末行若为空（尾换行）也会入列）。 */
		function edLineStarts(text) {
			const starts = [0];
			for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 10) starts.push(i + 1);
			return starts;
		}
		/** 索引 → {line, col}（二分）。 */
		function edIdxToLineCol(starts, idx) {
			let lo = 0, hi = starts.length - 1;
			while (lo < hi) {
				const mid = (lo + hi + 1) >> 1;
				if (starts[mid] <= idx) lo = mid;
				else hi = mid - 1;
			}
			return { line: lo, col: idx - starts[lo] };
		}
		/** (line, col) → 索引。 */
		function edLineColToIdx(starts, line, col) {
			const l = line < starts.length ? line : starts.length - 1;
			return starts[l] + Math.max(0, col);
		}

		// ============ v1.9.16 缩放 chrome（ui-beautify 式跨骑把手，独立 overlay 层）============
		// 与 ui-beautify 浮动卡逐像素一致：边条 6px 跨骑边界（3px 内 + 3px 外）、
		// 两端各让 12px；四角 12×12 外凸 6px；把手位于表面之外的独立 fixed 层
		// （宿主 pointer-events:none、把手 auto），平时透明仅光标、拖动中高亮。
		// 表面 overflow:hidden 不再裁剪把手；把手不遮挡表面内内容（滚动条/按钮）。
		const CHROME_DIRS = [
			["n", "fexp-ch-dir-n", "ns-resize"],
			["s", "fexp-ch-dir-s", "ns-resize"],
			["e", "fexp-ch-dir-e", "ew-resize"],
			["w", "fexp-ch-dir-w", "ew-resize"],
			["nw", "fexp-ch-dir-nw", "nwse-resize"],
			["ne", "fexp-ch-dir-ne", "nesw-resize"],
			["sw", "fexp-ch-dir-sw", "nesw-resize"],
			["se", "fexp-ch-dir-se", "nwse-resize"]
		];
		/** 为浮动表面（预览卡片/独立面板）创建缩放 chrome。
		 *  opts: { getRect:()=>({left,top,width,height})|null, dirs:[...],
		 *         onDown(mode,ev), onMove?(ev), onUp?(ev), zIndex } */
		function makeResizeChrome(opts) {
			const el = document.createElement("div");
			el.className = "fexp-chrome";
			el.style.display = "none";
			if (opts.zIndex) el.style.zIndex = String(opts.zIndex);
			document.body.appendChild(el);
			const handles = new Map();
			const addHandle = (mode) => {
				if (handles.has(mode)) return;
				let cls = "";
				let cursor = "default";
				for (const [m, c, cur] of CHROME_DIRS) {
					if (m === mode) { cls = c; cursor = cur; break; }
				}
				const h = document.createElement("div");
				h.className = "fexp-chrome-handle " + cls;
				h.style.cursor = cursor;
				h.addEventListener("pointerdown", (ev) => {
					if (ev.button !== 0) return;
					h.classList.add("fexp-chrome-active");
					opts.onDown(mode, ev);
				});
				h.addEventListener("pointermove", (ev) => { if (opts.onMove) opts.onMove(ev); });
				h.addEventListener("pointerup", () => {
					h.classList.remove("fexp-chrome-active");
					if (opts.onUp) opts.onUp();
				});
				h.addEventListener("pointercancel", () => {
					h.classList.remove("fexp-chrome-active");
					if (opts.onUp) opts.onUp();
				});
				el.appendChild(h);
				handles.set(mode, h);
			};
			const updateDirs = (dirs) => {
				for (const [mode] of CHROME_DIRS) {
					if (dirs.indexOf(mode) !== -1) addHandle(mode);
					else if (handles.has(mode)) {
						handles.get(mode).remove();
						handles.delete(mode);
					}
				}
			};
			updateDirs(opts.dirs);
			return {
				el,
				update() {
					const r = typeof opts.getRect === "function" ? opts.getRect() : null;
					if (!r || el.style.display === "none") return;
					el.style.left = r.left + "px";
					el.style.top = r.top + "px";
					el.style.width = Math.max(1, r.width) + "px";
					el.style.height = Math.max(1, r.height) + "px";
				},
				updateDirs,
				setHidden(hidden) {
					el.style.display = hidden ? "none" : "block";
					if (!hidden) this.update();
				},
				dispose() {
					el.remove();
					handles.clear();
				}
			};
		}

		// LocalStorage accessors — every read validates its shape and falls back
		// gracefully (storage can be unavailable or hold stale/corrupt values).
		const POS_KEY = "dsh-file-explorer:pos";
		const DOCK_KEY = "dsh-file-explorer:dock";
		const DWIDTH_KEY = "dsh-file-explorer:dwidth";
		const FWIDTH_KEY = "dsh-file-explorer:fwidth";
		const FHEIGHT_KEY = "dsh-file-explorer:fheight";
		const CLIPBOARD_KEY = "dsh-file-explorer:clipboard";
		const PREVIEW_MODE_KEY = "dsh-file-explorer:preview-mode";
		/** v1.9.0: 按文件类型记忆上次预览模式（render/source/edit）。 */
		function readPreviewMode(kind) {
			try {
				const raw = window.localStorage.getItem(PREVIEW_MODE_KEY);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				const v = parsed && typeof parsed === "object" ? parsed[kind] : null;
				return v === "render" || v === "source" || v === "edit" ? v : null;
			} catch (err) { return null; }
		}
		function writePreviewMode(kind, mode) {
			try {
				const raw = window.localStorage.getItem(PREVIEW_MODE_KEY);
				const parsed = (() => { try { return raw ? JSON.parse(raw) : {}; } catch (err) { return {}; } })();
				parsed[kind] = mode;
				window.localStorage.setItem(PREVIEW_MODE_KEY, JSON.stringify(parsed));
			} catch (err) {}
		}
		function readJson(key) {
			try {
				const raw = window.localStorage.getItem(key);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.left === "number" && typeof parsed.top === "number") return parsed;
				return null;
			} catch (err) { return null; }
		}
		function writeJson(key, value) {
			try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (err) {}
		}
		function readDock() {
			try {
				const v = window.localStorage.getItem(DOCK_KEY);
				return v === "right" || v === "middle" ? v : "float";
			} catch (err) { return "float"; }
		}
		function writeDock(d) {
			try { window.localStorage.setItem(DOCK_KEY, d); } catch (err) {}
		}
		function readWidth(key, fallback) {
			try {
				const v = parseInt(window.localStorage.getItem(key), 10);
				return Number.isFinite(v) && v >= 40 && v <= 2000 ? v : fallback;
			} catch (err) { return fallback; }
		}
		function writeWidth(key, w) {
			try { window.localStorage.setItem(key, String(w)); } catch (err) {}
		}
		function readClipboard() {
			try {
				const raw = window.localStorage.getItem(CLIPBOARD_KEY);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.path === "string" && (parsed.type === "file" || parsed.type === "dir")) return parsed;
				return null;
			} catch (err) { return null; }
		}

		// New-file content templates by extension (context-menu "新建文件…").
		const NEW_FILE_TEMPLATES = {
			txt: "",
			md: "# 标题\n\n正文…\n",
			py: "#!/usr/bin/env python3\n# -*- coding: utf-8 -*-\n\ndef main():\n    pass\n\n\nif __name__ == \"__main__\":\n    main()\n",
			js: "// JavaScript\n",
			json: "{}\n",
			ts: "// TypeScript\n",
			html: "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>页面</title>\n</head>\n<body>\n\n</body>\n</html>\n",
			css: "/* CSS */\n"
		};
		function templateFor(name) {
			const dot = name.lastIndexOf(".");
			if (dot < 0) return "";
			const ext = name.slice(dot + 1).toLowerCase();
			return NEW_FILE_TEMPLATES[ext] !== undefined ? NEW_FILE_TEMPLATES[ext] : "";
		}

		// Named constants for magic numbers used across apply().
		const MIN_W = 200;            // minimum panel width while dragging grips
		const MIN_H = 180;            // minimum panel height while dragging grips
		const POLL_MS = 800;          // workspace-follow / dock-sync interval
		const TOAST_MS = 2600;        // toast lifetime
		const INPUT_BLUR_MS = 120;    // inline-input blur grace

		/** DOM close icon — a 16-viewBox stroke SVG centers perfectly and
		 * inherits the text color (the ✕ text glyph rendered off-center). */
		function makeCloseIcon(size) {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("width", String(size));
			svg.setAttribute("height", String(size));
			svg.setAttribute("viewBox", "0 0 16 16");
			svg.setAttribute("fill", "none");
			svg.setAttribute("aria-hidden", "true");
			svg.style.display = "block";
			const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.setAttribute("d", "M4 4 L12 12 M12 4 L4 12");
			p.setAttribute("stroke", "currentColor");
			p.setAttribute("stroke-width", "1.6");
			p.setAttribute("stroke-linecap", "round");
			svg.appendChild(p);
			return svg;
		}
		/** Context-menu separator row. */
		function menuSep() {
			const sep = document.createElement("div");
			sep.className = "fexp-menu-sep";
			return sep;
		}

		// --- Remote namespace contribution --------------------------------------
		// The `remote.fileExplorer` namespace is mounted by THIS entry (the shipped
		// namespaces are mounted by @deepseek-ai/dsh-api-remotes). It must therefore
		// never appear in `inject` — that would deadlock the entry. Codecs are
		// "strict" with passthrough schemas: the client-side Gateway only calls
		// `codec.schema.parse(value)`; the Host Gateway validates via SRC markers.
		function passthroughSchema() {
			return { parse: (value) => value };
		}
		function strictCodec(typeSymbol) {
			return { mode: "strict", typeSymbol: typeSymbol, schema: passthroughSchema() };
		}
		const CONTRIBUTION = {
			package: "dsh-file-explorer",
			descriptors: [
				{
					id: "dsh-file-explorer#fileExplorer/fsList",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsList",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsList:path") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsList:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsRead",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsRead",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRead:path") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsRead:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsRender",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsRender",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRender:path") },
						{ name: "maxBytes", wire: "maxBytes", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRender:maxBytes") },
						{ name: "offsetChars", wire: "offsetChars", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRender:offsetChars") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsRender:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/wsRoot",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "wsRoot",
					invocation: { kind: "direct" },
					parameters: [],
					result: strictCodec("dsh-file-explorer#fileExplorer/wsRoot:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/wsList",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "wsList",
					invocation: { kind: "direct" },
					parameters: [],
					result: strictCodec("dsh-file-explorer#fileExplorer/wsList:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsWrite",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsWrite",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsWrite:path") },
						{ name: "content", wire: "content", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsWrite:content") },
						{ name: "expectedVersion", wire: "expectedVersion", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsWrite:expectedVersion") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsWrite:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsCreate",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsCreate",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCreate:path") },
						{ name: "type", wire: "type", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCreate:type") },
						{ name: "content", wire: "content", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCreate:content") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsCreate:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsRename",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsRename",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "from", wire: "from", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRename:from") },
						{ name: "to", wire: "to", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsRename:to") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsRename:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsCopy",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsCopy",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "from", wire: "from", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCopy:from") },
						{ name: "toDir", wire: "toDir", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsCopy:toDir") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsCopy:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsDelete",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsDelete",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "path", wire: "path", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsDelete:path") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsDelete:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				},
				{
					id: "dsh-file-explorer#fileExplorer/fsMove",
					service: "fileExplorer",
					namespace: "fileExplorer",
					method: "fsMove",
					invocation: { kind: "direct" },
					parameters: [
						{ name: "from", wire: "from", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsMove:from") },
						{ name: "toDir", wire: "toDir", source: "json", codec: strictCodec("dsh-file-explorer#fileExplorer/fsMove:toDir") }
					],
					result: strictCodec("dsh-file-explorer#fileExplorer/fsMove:result"),
					sourceLocation: { "file": "dsh-file-explorer/lib/client.js", "line": 1, "column": 1 }
				}
			]
		};

		async function apply(ctx) {
			const slots = ctx.get("slots");
			if (slots === undefined) return;

			ctx.effect(function installCss() {
				return insertCss(CSS);
			});

			try {
				const disposeMount = await ctx.remote.$mount(CONTRIBUTION);
				ctx.effect(function ownMount() {
					return () => {
						try { disposeMount(); } catch (err) {}
					};
				});
			} catch (err) {
				console.error("[dsh-file-explorer] remote namespace mount failed:", err);
				return;
			}

			// Remote call helpers: namespace methods resolve to { ok, value } envelopes.
			// IMPORTANT: never access `ctx.remote.fileExplorer` as a property — that
			// path resolves through the caller fiber's ancestry and THROWS for a
			// namespace mounted by this very entry (the namespace fiber is a sibling,
			// not an ancestor; only injected namespaces resolve that way). `ctx.get()`
			// reads the shared store directly and always sees it. Everything here is
			// wrapped so a missing namespace rejects instead of throwing synchronously
			// (a sync throw inside buildPanel would abdicate the panel entry).
			function unwrap(result) {
				if (result && result.ok === true) return result.value;
				const error = result && result.error;
				throw new Error((error && error.message) || "fileExplorer remote call failed");
			}
			function call(method) {
				const args = Array.prototype.slice.call(arguments, 1);
				return Promise.resolve().then(() => {
					const ns = ctx.get("remote.fileExplorer");
					if (ns === undefined) throw new Error("fileExplorer namespace unavailable");
					return ns[method].apply(ns, args);
				}).then(unwrap);
			}
			function remote() {
				return {
					fsList: (path) => call("fsList", path),
					fsRead: (path) => call("fsRead", path),
					fsRender: (path, maxBytes, offsetChars) => call("fsRender", path, maxBytes, offsetChars),
					fsWrite: (path, content, expectedVersion) => call("fsWrite", path, content, expectedVersion),
					fsCreate: (path, type, content) => call("fsCreate", path, type, content),
					fsRename: (from, to) => call("fsRename", from, to),
					fsCopy: (from, toDir) => call("fsCopy", from, toDir),
					fsDelete: (path) => call("fsDelete", path),
					fsMove: (from, toDir) => call("fsMove", from, toDir),
					wsRoot: () => call("wsRoot"),
					wsList: () => call("wsList")
				};
			}

			function joinPath(parent, name) {
				if (!parent) return name;
				const sep = pathSep();
				if (parent.endsWith("/") || parent.endsWith("\\")) return parent + name;
				return parent + sep + name;
			}
			function parentDir(p) {
				const parts = p.split(/[\\/]/).filter(Boolean);
				parts.pop();
				return parts.length > 0 ? parts.join(pathSep()) : null;
			}
			function relativeToRoot(p) {
				if (!state.root || typeof p !== "string") return p;
				const sep = pathSep();
				const rootNorm = state.root.replace(/[\\/]+$/, "");
				const pNorm = p.replace(/[\\/]+$/, "");
				const comparable = (s) => (state.platform === "win32" ? s.toLowerCase() : s);
				if (comparable(pNorm) === comparable(rootNorm)) return ".";
				if (comparable(pNorm).startsWith(comparable(rootNorm) + sep)) return pNorm.slice(rootNorm.length + 1);
				if (sep !== "\\" && comparable(pNorm).startsWith(comparable(rootNorm) + "\\")) return pNorm.slice(rootNorm.length + 1);
				return pNorm;
			}
			function hideToast() {
				if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
				if (toastEl) { toastEl.remove(); toastEl = null; }
			}
			function showToast(message) {
				/* v1.9.7: 设置打开时 Toast 会浮在设置之上，直接跳过 */
				if (settingsOpen) return;
				hideToast();
				toastEl = document.createElement("div");
				toastEl.className = "fexp-toast";
				toastEl.textContent = message;
				document.body.appendChild(toastEl);
				toastTimer = setTimeout(() => {
					if (toastEl) { toastEl.remove(); toastEl = null; }
				}, TOAST_MS);
			}
			function copyText(text) {
				if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
					return navigator.clipboard.writeText(text).then(
						function () { showToast("已复制到剪贴板"); },
						function () { showToast("复制失败：剪贴板不可用"); }
					);
				}
				showToast("复制失败：浏览器不支持剪贴板 API");
				return Promise.resolve();
			}
			function sidebarWidth() {
				try {
					const frame = document.querySelector("[data-dragging]") || document.querySelector("[data-sidebar-collapsed]") || document.querySelector(".pI_x6G_frame");
					if (frame) {
						const cols = window.getComputedStyle(frame).gridTemplateColumns;
						const m = cols.match(/(\d+(?:\.\d+)?)px/);
						if (m) return parseFloat(m[1]);
					}
				} catch (err) {}
				return 280;
			}

			const state = {
				open: false,
				root: null,
				platform: "win32",
				dock: readDock(),
				workspaces: [],
				cache: new Map(),
				expanded: new Set(),
				showHidden: false,
				preview: null,
				pos: readJson(POS_KEY),
				editing: null,       // { path, name, version, original, text } while the preview editor is open
				clipboard: readClipboard(),
				input: null,         // { x, y, width, value, placeholder, kind, onCommit } inline rename/create input
				search: { query: "", active: false, index: -1 } // v1.9.0 树内搜索状态
			};
			// --- Stateful helpers (depend on `state`/DOM refs; stay in apply) ---
			function writeClipboard() {
				try {
					window.localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(state.clipboard || { path: "", type: "file" }));
				} catch (err) {}
			}
			function pathSep() {
				return state.platform === "win32" ? "\\" : "/";
			}
			const inflight = new Set();
			const btnEls = new Map();
			const dockBtnEls = new Map();
			/* v1.9.16: 面板缩放 chrome（独立 overlay 层，buildPanelInto 创建/rebuild 时重挂） */
			let panelChrome = null;
			/* --- v1.6: ui-beautify card-mode host integration --- */
			const PANEL_ID = "file-explorer";
			let hostMode = false;         // dock host (ui-beautify) owns the panel surface
			let hostPanelActive = false;  // refs currently point into a mounted host panel
			let dockApiRef = undefined;   // optional `dock` service (ui-beautify)
			let dockDispose = null;       // registerPanel disposer
			let dockUnsub = null;         // subscribe disposer
			let standaloneRefs = null;    // captured classic-panel node refs for re-pointing
			/* v1.7: the header entry hides itself once the dock host takes over —
			   listeners let the React entry re-render when `dock` appears/unloads. */
			const entryListeners = new Set();
			function bumpEntryListeners() {
				for (const fn of [...entryListeners]) { try { fn(); } catch (err) {} }
			}
			let hostEl = null;
			let panelEl = null;
			let treeEl = null;
			let previewEl = null;
			let headerTitleEl = null;
			let hiddenBtn = null;
			let searchBarEl = null;   // v1.9.0 树内搜索条（buildPanelInto 重建）
			let searchInputEl = null;
			let searchCountEl = null;
			let drag = null;
			let gripDrag = null;
			let wsListLoaded = false;
			let wsProbeBusy = false;   // v1.7.2: workspace-follow probe in flight
			let declinedFollowRoot = null; // v1.8.1: workspace the user declined (stop re-prompting)
			let settingsOpen = false;  // v1.9.7: 设置弹窗打开时隐藏本插件全部浮层
			let settingsSeat = null;   // [data-slot="sidebar.settings"] 元素（重挂载自愈）
			let settingsMo = null;     // 监听 seat 子元素变化的 MutationObserver
			let menuEl = null;
			let inputHostEl = null;
			let toastEl = null;
			let toastTimer = null;
			let lastMenuPos = null;
			let dragSrcPath = null;
			let dropTargetEl = null;

			function updateHeader() {
				if (headerTitleEl) headerTitleEl.textContent = state.root ? baseName(state.root) : "文件浏览器";
			}
			function updateDockButtons() {
				for (const [mode, el] of dockBtnEls) el.classList.toggle("fexp-on", state.dock === mode);
			}
			/** v1.9.16: 独立面板缩放 chrome 同步——方向随 dock 模式（float=8 向 /
			 *  right=仅 w / middle=仅 e）；可见性随面板与宿主状态；位置取面板实时矩形。 */
			function syncPanelChrome() {
				if (panelChrome === null) return;
				if (panelEl === null || hostMode || settingsOpen || panelEl.classList.contains("fexp-hostpanel")) {
					panelChrome.setHidden(true);
					return;
				}
				const visible = panelEl.style.display !== "none";
				panelChrome.updateDirs(state.dock === "right" ? ["w"] : state.dock === "middle" ? ["e"] : ["n", "s", "e", "w", "se", "ne", "sw", "nw"]);
				panelChrome.setHidden(!visible);
				panelChrome.update();
			}
			function applyNarrow(w) {
				if (panelEl) panelEl.classList.toggle("fexp-narrow", w < 280);
			}
			const DOCK_TOP_INSET = 76; // header: 12px pad-top + 32px titleRow + 4px margin + 27px tabs — pinned to 0.1.0-rc.6 bundles, verified for 0.1.0-rc.7

			function applyDock() {
				if (!panelEl) return;
				if (state.dock === "right") {
					const w = readWidth(DWIDTH_KEY, 400);
					panelEl.style.left = "";
					panelEl.style.right = "0px";
					panelEl.style.top = DOCK_TOP_INSET + "px";
					panelEl.style.bottom = "0px";
					panelEl.style.height = "auto";
					panelEl.style.width = w + "px";
					panelEl.style.maxWidth = "";
					applyNarrow(w);
				} else if (state.dock === "middle") {
					const w = readWidth(DWIDTH_KEY, 340);
					const sw = sidebarWidth();
					panelEl.style.left = sw + "px";
					panelEl.style.right = "";
					panelEl.style.top = DOCK_TOP_INSET + "px";
					panelEl.style.bottom = "0px";
					panelEl.style.height = "auto";
					panelEl.style.width = w + "px";
					panelEl.style.maxWidth = "";
					applyNarrow(w);
				} else {
					const fw = readWidth(FWIDTH_KEY, 400);
					const fh = readWidth(FHEIGHT_KEY, 0);
					panelEl.style.width = fw + "px";
					panelEl.style.maxWidth = "";
					panelEl.style.height = fh > 0 ? fh + "px" : "";
					panelEl.style.bottom = "";
					if (state.pos) {
						/* v1.5.6: clamp the saved float position into the current viewport —
						 * a position saved under a larger window/display previously left
						 * the panel permanently off-screen (appeared as "cannot open"). */
						const p = clampFloatPos(state.pos.left, state.pos.top);
						panelEl.style.left = p.left + "px";
						panelEl.style.top = p.top + "px";
						panelEl.style.right = "";
					} else {
						panelEl.style.right = "24px";
						panelEl.style.top = "96px";
						panelEl.style.left = "";
					}
					applyNarrow(fw);
				}
				updateDockButtons();
				syncPanelChrome();
			}
			function setDock(d) {
				state.dock = d;
				writeDock(d);
				applyDock();
			}
			function switchRoot(path) {
				if (state.root === path) {
					if (state.cache.get(path) === undefined) fetchDir(path);
					return true;
				}
				/* v1.8.1: 用户拒绝过的工作区目标不再反复询问——周期跟随探测
				   每 800ms 都会命中同一目标，没有这个守卫会弹窗轰炸。目标
				   实际变化（≠ declinedFollowRoot）时由调用方清除该记录。 */
				if (declinedFollowRoot === path) return false;
				/* Only block on unsaved edits while the editor is actually
				   visible — a closed panel keeps `state.editing` (by design, to
				   preserve the text across tab switches) but must not pop a
				   phantom native confirm on workspace follow. */
				const editorVisible = state.editing && panelEl && panelEl.isConnected && panelEl.offsetParent !== null;
				if (editorVisible) {
					const proceed = window.confirm("当前文件有未保存的编辑，切换工作区将丢失改动。确定继续吗？");
					if (!proceed) {
						declinedFollowRoot = path;
						return false;
					}
				}
				declinedFollowRoot = null;
				state.root = path;
				state.cache = new Map();
				state.expanded = new Set();
				state.preview = null;
				closeEditor();
				updateHeader();
				renderPreview();
				fetchDir(path);
				return true;
			}
			function ensureWsList() {
				if (wsListLoaded) return Promise.resolve();
				return remote().wsList().then((res) => {
					wsListLoaded = true;
					if (res && Array.isArray(res.workspaces)) {
						state.workspaces = res.workspaces;
					}
				}).catch(() => {});
			}
			const dirSeq = new Map();
			/* v1.7.2: cap the in-memory directory cache. Directory listings stay
			   cached per workspace; without a cap a long session browsing many
			   directories grows state.cache and dirSeq without bound. Eviction is
			   FIFO (oldest loaded first); an evicted directory simply re-fetches
			   ("加载中…") the next time it is expanded. File contents (preview /
			   editor) are never cached, so they are unaffected. */
			const CACHE_MAX = 300;
			function pruneCache() {
				while (state.cache.size > CACHE_MAX) {
					/* evict the oldest NON-in-flight entry (an in-flight fetch was
					   just inserted and its response is expected soon) */
					let victim = null;
					for (const key of state.cache.keys()) {
						if (!inflight.has(key)) { victim = key; break; }
					}
					if (victim === null) break;
					state.cache.delete(victim);
					dirSeq.delete(victim);
				}
			}
			function fetchDir(path) {
				if (inflight.has(path)) return;
				inflight.add(path);
				const seq = (dirSeq.get(path) || 0) + 1;
				dirSeq.set(path, seq);
				state.cache.set(path, { loading: true, entries: null, error: null });
				pruneCache();
				renderTree();
				remote().fsList(path).then((res) => {
					if (dirSeq.get(path) !== seq) return; // stale response, a newer fetch is in flight
					state.cache.set(path, { loading: false, entries: res.entries, error: null });
					renderTree();
				}).catch((err) => {
					if (dirSeq.get(path) !== seq) return;
					state.cache.set(path, { loading: false, entries: null, error: String((err && err.message) || err) });
					renderTree();
				}).finally(() => {
					if (dirSeq.get(path) === seq) inflight.delete(path);
				});
			}
			function rowEl(text, depth, cls) {
				const row = document.createElement("div");
				row.className = "fexp-row" + (cls ? " " + cls : "");
				row.style.paddingLeft = (8 + depth * 14) + "px";
				row.textContent = text;
				return row;
			}
			// ================= v1.9.0 树内搜索 =================
			// state.search = { query, active, index }；只过滤已加载节点
			// （目录层级保留：目录自身匹配或其下存在匹配后代才显示）。
			function searchMatches(name) {
				const q = state.search.query;
				return q === "" || name.toLowerCase().indexOf(q) !== -1;
			}
			/** 目录下是否存在匹配项（递归已加载缓存）。 */
			function dirHasMatch(dirPath) {
				const dir = state.cache.get(dirPath);
				if (!dir || !dir.entries) return false;
				return dir.entries.some((e) => {
					if (searchMatches(e.name)) return true;
					if (e.type === "directory" && dirHasMatch(e.path)) return true;
					return false;
				});
			}
			/** 文件名渲染：搜索激活时命中子串加 <mark> 高亮。 */
			function nameSpan(name) {
				const span = document.createElement("span");
				span.className = "fexp-name";
				if (state.search.active && state.search.query !== "") {
					const q = state.search.query;
					const lower = name.toLowerCase();
					const idx = lower.indexOf(q);
					if (idx >= 0) {
						const frag = document.createDocumentFragment();
						frag.appendChild(document.createTextNode(name.slice(0, idx)));
						const m = document.createElement("mark");
						m.className = "fexp-mark";
						m.textContent = name.slice(idx, idx + q.length);
						frag.appendChild(m);
						frag.appendChild(document.createTextNode(name.slice(idx + q.length)));
						span.appendChild(frag);
						return span;
					}
				}
				span.textContent = name;
				return span;
			}
			function updateSearchCount() {
				if (!searchCountEl) return;
				if (!state.search.active) { searchCountEl.textContent = ""; return; }
				const rows = treeEl ? treeEl.querySelectorAll(".fexp-row[data-path]") : [];
				searchCountEl.textContent = rows.length > 0 ? rows.length + " 个匹配" : "";
			}
			function moveSearchIndex(delta) {
				if (!treeEl) return;
				const rows = Array.from(treeEl.querySelectorAll(".fexp-row[data-path]"));
				if (rows.length === 0) return;
				state.search.index = (state.search.index + delta + rows.length) % rows.length;
				rows.forEach((r, i) => r.classList.toggle("fexp-active", i === state.search.index));
				const el = rows[state.search.index];
				if (el) el.scrollIntoView({ block: "nearest" });
			}
			function activateSearchIndex() {
				if (!treeEl) return;
				const rows = Array.from(treeEl.querySelectorAll(".fexp-row[data-path]"));
				const el = state.search.index >= 0 && state.search.index < rows.length ? rows[state.search.index] : rows[0];
				if (!el) return;
				const path = el.dataset.path;
				const type = el.dataset.type;
				if (type === "dir") {
					toggleDir(path);
					return;
				}
				const parent = parentDir(path);
				const list = parent ? state.cache.get(parent) : null;
				let entry = null;
				if (list && Array.isArray(list.entries)) {
					entry = list.entries.find((e) => e.path === path) || null;
				}
				openFile(entry || { path: path, name: baseName(path), size: null });
			}
			/** Ctrl+F 呼出搜索条并聚焦；Esc 关闭恢复全树。 */
			function focusSearch() {
				if (!searchBarEl) return;
				searchBarEl.style.display = "flex";
				const input = searchBarEl.querySelector("input");
				if (input) { input.focus(); if (state.search.query !== "") input.select(); }
			}
			function closeSearch() {
				state.search.query = "";
				state.search.active = false;
				state.search.index = -1;
				if (searchInputEl) searchInputEl.value = "";
				if (searchBarEl) searchBarEl.style.display = "none";
				renderTree();
			}
			/** 构建树顶部 HIG 风格搜索条（buildPanelInto 调用）。 */
			function buildSearchBar() {
				const bar = document.createElement("div");
				bar.className = "fexp-searchbar";
				bar.style.display = state.search.active ? "flex" : "none";
				const ic = document.createElement("span");
				ic.className = "fexp-search-ic";
				ic.innerHTML = makeIcon("search", 13);
				const input = document.createElement("input");
				input.type = "text";
				input.placeholder = "过滤文件名（Ctrl+F / Esc 关闭）";
				input.spellcheck = false;
				input.value = state.search.query;
				const clear = document.createElement("button");
				clear.className = "fexp-search-clear";
				clear.title = "清除";
				clear.innerHTML = makeIcon("close", 12);
				const count = document.createElement("span");
				count.className = "fexp-search-count";
				bar.appendChild(ic);
				bar.appendChild(input);
				bar.appendChild(count);
				bar.appendChild(clear);
				searchInputEl = input;
				searchCountEl = count;
				let timer = null;
				input.addEventListener("input", () => {
					window.clearTimeout(timer);
					timer = window.setTimeout(() => {
						state.search.query = input.value.trim().toLowerCase();
						state.search.active = state.search.query !== "";
						state.search.index = -1;
						renderTree();
						updateSearchCount();
					}, 120);
				});
				input.addEventListener("keydown", (ev) => {
					if (ev.key === "Escape") { ev.preventDefault(); closeSearch(); }
					else if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); moveSearchIndex(ev.key === "ArrowDown" ? 1 : -1); }
					else if (ev.key === "Enter") { ev.preventDefault(); activateSearchIndex(); }
					else if (ev.key === "ArrowRight") { ev.preventDefault(); if (state.root) toggleDir(state.root); }
				});
				clear.addEventListener("click", () => {
					// x = 完整关闭搜索（与 Esc 一致：清空查询并收起搜索栏）
					closeSearch();
				});
				return bar;
			}
			function walkTree(container, path, depth) {
				const dir = state.cache.get(path);
				if (!dir) {
					container.appendChild(rowEl("加载中…", depth, "fexp-dim"));
					fetchDir(path);
					return;
				}
				if (dir.loading) {
					container.appendChild(rowEl("加载中…", depth, "fexp-dim"));
					return;
				}
				if (dir.error) {
					container.appendChild(rowEl("⚠ " + dir.error, depth, "fexp-err"));
					return;
				}
				const visible = dir.entries.filter((e) => state.showHidden || !isHiddenName(e.name));
				const dirs = visible.filter((e) => e.type === "directory");
				const files = visible.filter((e) => e.type !== "directory");
				for (const e of dirs) {
					if (state.search.active && !searchMatches(e.name) && !dirHasMatch(e.path)) continue;
					const isOpen = state.expanded.has(e.path);
					const row = document.createElement("div");
					row.className = "fexp-row fexp-dir" + (isOpen ? " fexp-open" : "") + (state.clipboard && state.clipboard.path === e.path ? " fexp-clipboard-src" : "");
					row.style.paddingLeft = (8 + depth * 14) + "px";
					row.title = e.path;
					row.dataset.path = e.path;
					row.dataset.type = "dir";
					const caret = document.createElement("span");
					caret.className = "fexp-caret";
					caret.innerHTML = makeIcon(isOpen ? "chevronDown" : "chevronRight", 11);
					const ic = document.createElement("span");
					ic.className = "fexp-ic";
					ic.innerHTML = makeIcon("folder", 13);
					const name = nameSpan(e.name);
					const size = document.createElement("span");
					size.className = "fexp-size";
					size.textContent = "/";
					row.appendChild(caret);
					row.appendChild(ic);
					row.appendChild(name);
					row.appendChild(size);
					row.addEventListener("click", () => toggleDir(e.path));
					row.addEventListener("contextmenu", (ev) => onContextMenu(ev, e.path, "dir", e.name));
					row.draggable = true;
					row.addEventListener("dragstart", (ev) => onDragStart(ev, e.path));
					row.addEventListener("dragend", onDragEnd);
					row.addEventListener("dragover", (ev) => onDragOver(ev, e.path));
					row.addEventListener("dragleave", (ev) => onDragLeave(ev));
					row.addEventListener("drop", (ev) => onDrop(ev, e.path));
					container.appendChild(row);
					if (isOpen) walkTree(container, e.path, depth + 1);
				}
				for (const e of files) {
					if (state.search.active && !searchMatches(e.name)) continue;
					const row = document.createElement("div");
					row.className = "fexp-row fexp-file" + (state.preview && state.preview.path === e.path ? " fexp-active" : "") + (state.clipboard && state.clipboard.path === e.path ? " fexp-clipboard-src" : "");
					row.style.paddingLeft = (8 + depth * 14) + "px";
					row.title = e.path;
					row.dataset.path = e.path;
					row.dataset.type = "file";
					const caret = document.createElement("span");
					caret.className = "fexp-caret";
					caret.innerHTML = makeIcon("file", 11);
					caret.style.opacity = ".55";
					const ic = document.createElement("span");
					ic.className = "fexp-ic";
					ic.innerHTML = makeIcon("file", 13);
					const name = nameSpan(e.name);
					const size = document.createElement("span");
					size.className = "fexp-size";
					size.textContent = formatSize(e.size);
					row.appendChild(caret);
					row.appendChild(ic);
					row.appendChild(name);
					row.appendChild(size);
					row.addEventListener("click", () => openFile(e));
					row.addEventListener("contextmenu", (ev) => onContextMenu(ev, e.path, "file", e.name));
					row.draggable = true;
					row.addEventListener("dragstart", (ev) => onDragStart(ev, e.path));
					row.addEventListener("dragend", onDragEnd);
					container.appendChild(row);
				}
			}
			function renderTree() {
				if (!treeEl) return;
				treeEl.textContent = "";
				if (state.root === null) {
					treeEl.appendChild(rowEl("正在定位当前工作区…", 0, "fexp-dim"));
				} else {
					walkTree(treeEl, state.root, 0);
					// 搜索空状态
					if (state.search.active && treeEl.querySelector(".fexp-row[data-path]") === null && !treeEl.querySelector(".fexp-dim")) {
						const empty = document.createElement("div");
						empty.className = "fexp-empty";
						empty.textContent = "无匹配项";
						treeEl.appendChild(empty);
					}
				}
				updateSearchCount();
			}
			function toggleDir(path) {
				if (state.expanded.has(path)) {
					state.expanded.delete(path);
				} else {
					state.expanded.add(path);
					if (!state.cache.has(path)) fetchDir(path);
				}
				renderTree();
			}

			// ================= v1.9.0 预览视图 =================
			// 数据模型：state.preview = { path, name, size, version, kind,
			//   language, mode('render'|'source'|'edit'), data{ lines?, html?,
			//   toc?, text?, lineCount, totalLines?, truncated, offsetChars },
			//   status, binary, error, loadingMore }
			// 模式语义按 kind 解释：markdown render=富文本 source=源码(行号)；
			// code render=高亮 source=纯文本；text 无 render。edit 一律行号+textarea。
			const PREVIEW_BYTES = 512 * 1024; // 每段读取上限（服务端 cap 4MB）
			const LINE_H = 20; // 行视图固定行高（px），与 .fexp-cline 一致
			const VIRTUALIZE_THRESHOLD = 10000; // 超过则虚拟化渲染（只建可视行 DOM）

			function previewModes(kind) {
				// v1.9.10：源码/纯文本只读视图已随编辑器整合删除。
				// markdown 保留 [渲染, 编辑]；代码/文本只有 [编辑]（单一模式）。
				if (kind === "markdown") return ["render", "edit"];
				return ["edit"];
			}
			function modeLabel(kind, mode) {
				if (kind === "markdown") return mode === "render" ? "渲染" : "编辑";
				return "编辑";
			}
			function previewBodyEl(text, isError) {
				const el = document.createElement("div");
				el.className = "fexp-pbody fexp-dim";
				if (isError) el.className = "fexp-pbody fexp-err";
				el.textContent = text;
				return el;
			}
			/** 预览头部：图标 + 名称 + 语言/行数标签 + 模式按钮组 + 关闭。 */
			function buildPreviewHead(p) {
				const head = document.createElement("div");
				head.className = "fexp-phead";
				const ic = document.createElement("span");
				ic.className = "fexp-ic";
				ic.innerHTML = makeIcon(p.kind === "markdown" ? "doc" : "file", 13);
				const name = document.createElement("span");
				name.className = "fexp-pname";
				name.textContent = p.name + (p.size !== null && p.size !== undefined ? "  (" + formatSize(p.size) + ")" : "");
				head.appendChild(ic);
				head.appendChild(name);
				if (p.status === "done" && !p.binary) {
					const meta = document.createElement("span");
					meta.className = "fexp-dim";
					meta.style.cssText = "font-size:11px;flex:none;";
					const parts = [];
					if (p.language) parts.push(p.language);
					if (p.data && p.data.lineCount) parts.push(p.data.lineCount + " 行");
					if (p.data && p.data.truncated) parts.push("已截断");
					meta.textContent = parts.join(" · ");
					head.appendChild(meta);
					// 模式切换按钮组（HIG 分段控件）；仅多模式时显示
					const modes = previewModes(p.kind);
					if (modes.length > 1) {
						const group = document.createElement("div");
						group.className = "fexp-pbtn-group";
						for (const m of modes) {
							const disabled = (m === "edit" && !!(p.data && p.data.truncated));
							const b = document.createElement("button");
							b.className = "fexp-pbtn" + (p.mode === m ? " fexp-on" : "");
							b.textContent = modeLabel(p.kind, m);
							b.disabled = !!disabled;
							b.title = m === "edit" ? "编辑（Ctrl+S 保存）" : "渲染视图（Ctrl+] 切换）";
							b.addEventListener("click", () => {
								if (p.mode === m) return;
								state.preview = Object.assign({}, state.preview, { mode: m });
								if (p.kind) writePreviewMode(p.kind, m);
								renderPreview();
							});
							group.appendChild(b);
						}
						head.appendChild(group);
					}
				}
				const x = document.createElement("button");
				x.className = "fexp-x";
				x.title = "关闭预览（Esc）";
				x.appendChild(makeCloseIcon(14));
				x.addEventListener("click", closePreview);
				head.appendChild(x);
				return head;
			}
			/** 行号列 + 内容列的只读视图（截断文件/渲染降级）。htmlLines 非空时
			 *  逐行插入高亮片段，否则按 data.text 分行（纯文本）。行数超过阈值
			 *  走虚拟化。保留 v1.9.6 table 布局：软换行（pre-wrap）+ 行高同步。 */
			function buildLineView(p, htmlLines) {
				const text = p.data && typeof p.data.text === "string" ? p.data.text : "";
				const lines = htmlLines || text.split("\n");
				const total = lines.length;
				const wrap = document.createElement("div");
				wrap.className = "fexp-codeview";
				wrap.setAttribute("data-fexp-version", "1.9.6");
				const scroll = document.createElement("div");
				scroll.className = "fexp-code-scroll";
				// v1.9.6：原生 table 布局 —— 表格行高同步是浏览器最成熟的
				// 机制（tr 高度 = max(td)），从机制上排除内容与行号错位/重叠
				const table = document.createElement("table");
				table.className = "fexp-linetable fexp-code-font";
				const tbody = document.createElement("tbody");
				table.appendChild(tbody);
				scroll.appendChild(table);
				wrap.appendChild(scroll);
				// 行号列宽度随总行数位数自适应
				const digits = String(total).length;
				const noW = 14 + digits * 8;
				const renderRange = (first, count) => {
					tbody.textContent = "";
					const frag = document.createDocumentFragment();
					const addSpacer = (heightPx) => {
						if (heightPx <= 0) return;
						const tr = document.createElement("tr");
						const td = document.createElement("td");
						td.colSpan = 2;
						td.style.height = heightPx + "px";
						td.style.padding = "0";
						tr.appendChild(td);
						frag.appendChild(tr);
					};
					addSpacer(first * LINE_H);
					for (let i = 0; i < count; i += 1) {
						const n = first + i;
						const tr = document.createElement("tr");
						tr.style.height = LINE_H + "px";
						const no = document.createElement("td");
						no.className = "fexp-lineno";
						no.style.width = noW + "px";
						no.textContent = String(n + 1);
						const tx = document.createElement("td");
						tx.className = "fexp-cline";
						if (htmlLines) tx.innerHTML = htmlLines[n] !== undefined ? htmlLines[n] : "";
						else tx.textContent = lines[n] !== undefined ? lines[n] : "";
						tr.appendChild(no);
						tr.appendChild(tx);
						frag.appendChild(tr);
					}
					addSpacer((total - (first + count)) * LINE_H);
					tbody.appendChild(frag);
				};
				if (total <= VIRTUALIZE_THRESHOLD) {
					renderRange(0, total);
				} else {
					// 虚拟化：只渲染可视窗口 ± 缓冲行；上下 spacer 行撑出滚动高度
					const onScroll = () => {
						const first = Math.max(0, Math.floor(scroll.scrollTop / LINE_H) - 25);
						const vis = Math.ceil(scroll.clientHeight / LINE_H) + 50;
						renderRange(first, Math.min(vis, total - first));
					};
					scroll.addEventListener("scroll", onScroll, { passive: true });
					requestAnimationFrame(onScroll);
				}
				// 截断续读：底部「继续加载」
				if (p.data && p.data.truncated) {
					const more = document.createElement("div");
					more.className = "fexp-more";
					const b = document.createElement("button");
					b.className = "fexp-btn";
					b.textContent = "继续加载（已显示 " + (p.data.lineCount || 0) + " / " + (p.data.totalLines || "?") + " 行）";
					b.disabled = !!p.loadingMore;
					b.addEventListener("click", () => {
						// data.offsetChars 语义 = 下一段的起始字符偏移（见
						// loadPreviewSegment：请求偏移 + 本段长度）。旧实现
						// 把请求偏移 + 累计文本长度相加，第二次点击起每次
						// 多跳一段，静默丢内容。
						loadPreviewSegment(p.path, p.data.offsetChars, true);
					});
					more.appendChild(b);
					wrap.appendChild(more);
				}
				return wrap;
			}
			/** Markdown 富文本视图：折叠目录 + 限宽正文 + 代码块复制按钮。 */
			function buildMarkdownView(p) {
				const wrap = document.createElement("div");
				wrap.className = "fexp-mdview";
				const col = document.createElement("div");
				col.className = "fexp-md-body";
				if (p.data && p.data.toc && p.data.toc.length > 0) col.appendChild(buildToc(p.data.toc));
				const article = document.createElement("div");
				article.innerHTML = p.data.html || "";
				// 代码块复制（事件委托，一次性绑定）
				article.addEventListener("click", (ev) => {
					const btn = ev.target.closest(".fexp-md-copy");
					if (!btn || !btn.closest("pre")) return;
					const code = btn.closest("pre").querySelector("code");
					if (!code) return;
					copyText(code.innerText);
					btn.textContent = "已复制 ✓";
					window.setTimeout(() => { btn.textContent = "复制"; }, 1500);
				});
				// 为每个代码块挂复制按钮（服务端已产出 <pre class="fexp-md-code">）
				article.querySelectorAll("pre.fexp-md-code").forEach((pre) => {
					const b = document.createElement("button");
					b.className = "fexp-md-copy";
					b.type = "button";
					b.textContent = "复制";
					pre.appendChild(b);
				});
				col.appendChild(article);
				wrap.appendChild(col);
				return wrap;
			}
			/** 折叠目录（h1-h3，点击平滑滚动到锚点）。 */
			function buildToc(toc) {
				const box = document.createElement("div");
				box.className = "fexp-toc";
				const head = document.createElement("div");
				head.className = "fexp-toc-head";
				const ic = document.createElement("span");
				ic.className = "fexp-pbtn-ic";
				ic.innerHTML = makeIcon("chevronDown", 12);
				const t = document.createElement("span");
				t.textContent = "目录";
				head.appendChild(ic);
				head.appendChild(t);
				const list = document.createElement("div");
				list.className = "fexp-toc-list";
				list.style.display = "none";
				let open = false;
				head.addEventListener("click", () => {
					open = !open;
					list.style.display = open ? "flex" : "none";
					ic.innerHTML = makeIcon(open ? "chevronDown" : "chevronRight", 12);
				});
				for (const item of toc) {
					const b = document.createElement("button");
					b.className = "fexp-toc-item l" + item.level;
					b.textContent = item.text;
					b.addEventListener("click", () => {
						const target = document.getElementById(item.id);
						if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
					});
					list.appendChild(b);
				}
				box.appendChild(head);
				box.appendChild(list);
				return box;
			}
			// ============ v1.9.1 预览独立卡片 ============
			// 预览从面板内底部区迁至独立浮动卡片（可拖动 / 四角缩放 /
			// 双击最大化 / Esc 或 × 关闭；单卡片复用）。
			let previewCardEl = null;
			let previewCardChrome = null; // v1.9.16: 缩放 chrome（独立 overlay 层）
			let previewCardDrag = null;    // {startX,startY,left,top}
			let previewCardResize = null;  // {mode,startX,startY,rect}
			let previewCardRect = null;    // {left,top,width,height} 还原用
			let previewCardMax = false;
			let previewCardDraggedAt = 0;  // 拖动结束时间戳（区分双击）
			const CARD_W = 780;
			const CARD_H = 560;
			const CARD_MIN_W = 480;
			const CARD_MIN_H = 320;

			function ensurePreviewCard() {
				if (previewCardEl) return previewCardEl;
				const card = document.createElement("div");
				card.className = "fexp-preview-card";
				card.style.display = "none";
				document.body.appendChild(card);
				previewCardEl = card;
				/* v1.9.16: 缩放 chrome 移到卡片外的独立 overlay 层（ui-beautify 式跨骑
				   把手：边 6px ±3px、角 12×12 外凸 6px）——不再作为卡片子元素，
				   卡片 overflow:hidden 不裁剪把手，把手也不遮挡内容/按钮。 */
				previewCardChrome = makeResizeChrome({
					getRect: () => {
						if (previewCardEl === null || previewCardMax || previewCardEl.style.display === "none") return null;
						const r = previewCardEl.getBoundingClientRect();
						return { left: r.left, top: r.top, width: r.width, height: r.height };
					},
					dirs: ["n", "s", "e", "w", "se", "ne", "sw", "nw"],
					onDown: (mode, ev) => onCardResizeDown(mode, ev),
					onMove: (ev) => onCardResizeMove(ev),
					onUp: () => onCardResizeUp(),
					zIndex: 802
				});
				return card;
			}
			/** 显示卡片（首次定位：视口右侧居中；此后保持当前几何）。 */
			function showPreviewCard() {
				/* v1.9.7: 设置打开时预览卡片不显示（否则浮在设置之上） */
				if (settingsOpen) return;
				const card = ensurePreviewCard();
				if (previewCardMax) {
					card.style.display = "flex";
					if (previewCardChrome !== null) previewCardChrome.setHidden(true);
					return;
				}
				if (!previewCardRect) {
					const left = Math.max(8, window.innerWidth - CARD_W - 24);
					const top = Math.max(8, (window.innerHeight - CARD_H) / 2);
					previewCardRect = { left, top, width: CARD_W, height: CARD_H };
					card.style.left = left + "px";
					card.style.top = top + "px";
					card.style.width = CARD_W + "px";
					card.style.height = CARD_H + "px";
				} else {
					card.style.left = previewCardRect.left + "px";
					card.style.top = previewCardRect.top + "px";
					card.style.width = previewCardRect.width + "px";
					card.style.height = previewCardRect.height + "px";
				}
				card.style.display = "flex";
				if (previewCardChrome !== null) {
					previewCardChrome.setHidden(false);
					previewCardChrome.update();
				}
			}
			function onCardHeadDown(e) {
				if (e.button !== 0 || previewCardMax) return;
				const t = e.target;
				if (t && t.closest && t.closest("button")) return;
				const rect = previewCardEl.getBoundingClientRect();
				previewCardDrag = { startX: e.clientX, startY: e.clientY, left: rect.left, top: rect.top };
				e.preventDefault();
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onCardHeadMove(e) {
				if (!previewCardDrag || !previewCardEl) return;
				const w = previewCardEl.offsetWidth;
				const maxLeft = Math.max(8, window.innerWidth - w - 8);
				const maxTop = Math.max(8, window.innerHeight - 48);
				const left = Math.min(Math.max(previewCardDrag.left + e.clientX - previewCardDrag.startX, 8), maxLeft);
				const top = Math.min(Math.max(previewCardDrag.top + e.clientY - previewCardDrag.startY, 8), maxTop);
				previewCardEl.style.left = left + "px";
				previewCardEl.style.top = top + "px";
				if (previewCardChrome !== null) previewCardChrome.update();
			}
			function onCardHeadUp() {
				if (!previewCardDrag) return;
				previewCardDrag = null;
				previewCardDraggedAt = Date.now();
				if (previewCardEl) {
					const r = previewCardEl.getBoundingClientRect();
					previewCardRect = { left: r.left, top: r.top, width: r.width, height: r.height };
				}
				if (previewCardChrome !== null) previewCardChrome.update();
			}
			function onCardResizeDown(mode, e) {
				if (e.button !== 0 || previewCardMax || !previewCardEl) return;
				const rect = previewCardEl.getBoundingClientRect();
				previewCardResize = { mode, startX: e.clientX, startY: e.clientY, rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height } };
				e.preventDefault();
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onCardResizeMove(e) {
				if (!previewCardResize || !previewCardEl) return;
				const { mode, startX, startY, rect } = previewCardResize;
				const dx = e.clientX - startX;
				const dy = e.clientY - startY;
				let { left, top, width, height } = rect;
				const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
				const maxW = window.innerWidth - 16;
				const maxH = window.innerHeight - 16;
				if (mode === "se") { width = clamp(width + dx, CARD_MIN_W, maxW); height = clamp(height + dy, CARD_MIN_H, maxH); }
				else if (mode === "ne") { width = clamp(width + dx, CARD_MIN_W, left + width - 8); height = clamp(height - dy, CARD_MIN_H, maxH); top = rect.top + (rect.height - height); }
				else if (mode === "sw") { width = clamp(width - dx, CARD_MIN_W, rect.left + width - 8); left = rect.left + (rect.width - width); height = clamp(height + dy, CARD_MIN_H, maxH); }
				else if (mode === "nw") { width = clamp(width - dx, CARD_MIN_W, rect.left + width - 8); left = rect.left + (rect.width - width); height = clamp(height - dy, CARD_MIN_H, maxH); top = rect.top + (rect.height - height); }
				else if (mode === "e") { width = clamp(width + dx, CARD_MIN_W, maxW); }
				else if (mode === "w") { width = clamp(width - dx, CARD_MIN_W, rect.left + width - 8); left = rect.left + (rect.width - width); }
				else if (mode === "s") { height = clamp(height + dy, CARD_MIN_H, maxH); }
				else if (mode === "n") { height = clamp(height - dy, CARD_MIN_H, maxH); top = rect.top + (rect.height - height); }
				previewCardEl.style.left = left + "px";
				previewCardEl.style.top = top + "px";
				previewCardEl.style.width = width + "px";
				previewCardEl.style.height = height + "px";
				if (previewCardChrome !== null) previewCardChrome.update();
			}
			function onCardResizeUp() {
				if (!previewCardResize) return;
				previewCardResize = null;
				if (previewCardEl) {
					const r = previewCardEl.getBoundingClientRect();
					previewCardRect = { left: r.left, top: r.top, width: r.width, height: r.height };
				}
				if (previewCardChrome !== null) previewCardChrome.update();
			}
			/** 双击标题栏最大化 / 还原。 */
			function toggleCardMax() {
				const card = ensurePreviewCard();
				if (previewCardMax) {
					const r = previewCardRect || { left: Math.max(8, window.innerWidth - CARD_W - 24), top: Math.max(8, (window.innerHeight - CARD_H) / 2), width: CARD_W, height: CARD_H };
					card.style.left = r.left + "px";
					card.style.top = r.top + "px";
					card.style.width = r.width + "px";
					card.style.height = r.height + "px";
					card.classList.remove("fexp-maximized");
					previewCardMax = false;
				} else {
					const r = card.getBoundingClientRect();
					previewCardRect = { left: r.left, top: r.top, width: r.width, height: r.height };
					card.style.left = "8px";
					card.style.top = "8px";
					card.style.width = (window.innerWidth - 16) + "px";
					card.style.height = (window.innerHeight - 16) + "px";
					card.classList.add("fexp-maximized");
					previewCardMax = true;
				}
				if (previewCardChrome !== null) {
					previewCardChrome.setHidden(previewCardMax);
					previewCardChrome.update();
				}
			}
			function onCardHeadDbl(e) {
				if (Date.now() - previewCardDraggedAt < 400) return; // 刚拖过，不算双击
				const t = e.target;
				if (t && t.closest && t.closest("button")) return;
				toggleCardMax();
			}
			/** 关闭预览卡片（清预览状态并隐藏）。 */
			function closePreview() {
				closeEditor();
				state.preview = null;
				renderPreview();
				renderTree();
			}
			/** 预览内容构建：head（标题/模式按钮/关闭）+ body（分派视图）。 */
			function buildPreviewContent(p) {
				const head = buildPreviewHead(p);
				// 卡片标题栏拖动 / 双击最大化（按钮区域除外）
				head.addEventListener("pointerdown", onCardHeadDown);
				head.addEventListener("pointermove", onCardHeadMove);
				head.addEventListener("pointerup", onCardHeadUp);
				head.addEventListener("pointercancel", onCardHeadUp);
				head.addEventListener("dblclick", onCardHeadDbl);
				const body = document.createElement("div");
				body.className = "fexp-pbody";
				body.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:column;margin:0;padding:0;";
				if (p.status === "loading") {
					body.appendChild(previewBodyEl("加载中…"));
				} else if (p.status === "error") {
					body.appendChild(previewBodyEl("读取失败: " + p.error, true));
				} else if (p.binary) {
					body.appendChild(previewBodyEl("二进制文件，无法预览" + (p.size !== null && p.size !== undefined ? "（" + formatSize(p.size) + "）" : "")));
				} else if (p.mode === "edit" && !(p.data && p.data.truncated)) {
					startEditing(p);
					body.appendChild(buildEditor());
				} else if (p.kind === "markdown" && p.mode === "render" && !(p.data && p.data.truncated)) {
					body.appendChild(buildMarkdownView(p));
				} else {
					// 截断文件无法完整编辑/渲染 → 只读纯文本行视图（软换行）
					body.appendChild(buildLineView(p, null));
				}
				return { head, body };
			}
			function renderPreview() {
				const p = state.preview;
				// 面板内预览区退役：恒隐藏（v1.9.1 起内容渲染到独立卡片）
				if (previewEl) previewEl.style.display = "none";
				if (!p) {
					if (previewCardEl) {
						// 只隐藏并移除内容区；卡片元素保留（缩放 chrome 在独立层，另行隐藏，
						// 再次打开时头/体重建即可）
						previewCardEl.style.display = "none";
						const h = previewCardEl.querySelector(".fexp-phead");
						if (h) h.remove();
						const b = previewCardEl.querySelector(".fexp-pbody");
						if (b) b.remove();
					}
					/* v1.9.16: 缩放 chrome 已不挂在卡内（独立层），需单独隐藏 */
					if (previewCardChrome !== null) previewCardChrome.setHidden(true);
					return;
				}
				const card = ensurePreviewCard();
				// 只替换 head/body（卡片元素保留；缩放 chrome 在独立层，另行同步）
				const oldHead = card.querySelector(".fexp-phead");
				const oldBody = card.querySelector(".fexp-pbody");
				if (oldHead) oldHead.remove();
				if (oldBody) oldBody.remove();
				const { head, body } = buildPreviewContent(p);
				card.appendChild(head);
				card.appendChild(body);
				showPreviewCard();
			}
			// ============ v1.9.15 实时高亮编辑器（按 VS Code / Monaco 架构重建）============
			// 结构：单一滚动容器（.fexp-editor-scroller）承载全部内容，无镜像层——
			//   - 行号 span + 高亮 span 同一行结构、同一 scrollTop（行号列 sticky）；
			//     文本、行号、光标、选区同处一个坐标系；
			//   - 光标 .fexp-ed-caret / 选区 .fexp-ed-sel / IME 覆盖 .fexp-ed-comp
			//     的像素位置全部由 factory 级【编辑器几何】（editCharW/edNoWFor/
			//     edColToX/edXToCol 等）计算，与渲染共用同一几何函数，从机制上
			//     杜绝"两层各自推算坐标"造成的错位；
			//   - 输入：隐藏 textarea（2×2px、透明、跟随光标定位）为唯一输入源
			//     （Monaco TextAreaInput 同思路），模型即 textarea 值（原生
			//     undo/剪贴板/IME）；input/selectionchange 同步 ed.text 与选区；
			//     IME 合成期间自绘覆盖条并在合成终点更新模型；
			//   - 虚拟化：只渲染可视窗口 ±缓冲行；hljs 行结果按行文本缓存；
			//     spacer 撑出总高度；white-space:pre 不软换行，每行恰好 LINE_H 高，
			//     13px/20px 字体指标与行号/高亮一致。
			const EDITOR_BUFFER = 25; // 虚拟化上下缓冲行数
			const DEV_GEOM_ASSERT = false; // 开发期自检：几何偏差 >0.75px 时 console.warn
			function buildEditor() {
				const p = state.preview;
				const ed = state.editing;
				// markdown 文件编辑视图也做高亮（detectKind 对 .md 返回 language:null）
				const language = p.language || (p.kind === "markdown" ? "markdown" : null);
				const wrap = document.createElement("div");
				wrap.className = "fexp-editor";
				const bar = document.createElement("div");
				bar.className = "fexp-editor-bar";
				const hint = document.createElement("span");
				hint.className = "fexp-dim";
				hint.textContent = "实时高亮 · Ctrl+S 保存 · Esc 退出 · Tab 缩进";
				const saveBtn = iconBtn("check", "保存", "保存（Ctrl+S）", () => saveEdit(), "fexp-btn-primary");
				saveBtn.classList.add("fexp-editbtn");
				saveBtnEl = saveBtn;
				const cancelBtn = iconBtn("close", "取消", "取消编辑（Esc）", () => { closeEditor(); renderPreview(); });
				bar.appendChild(hint);
				bar.appendChild(saveBtn);
				bar.appendChild(cancelBtn);

				const body = document.createElement("div");
				body.className = "fexp-codeview";
				body.style.cssText = "flex:1;min-height:0;position:relative;overflow:hidden;outline:none;";
				// 唯一滚动容器：行号 + 高亮 + 光标 + 选区全在其中（无镜像、无同步）
				const scroller = document.createElement("div");
				scroller.className = "fexp-editor-scroller";
				const rows = document.createElement("div");
				rows.className = "fexp-editor-rows";
				scroller.appendChild(rows);
				body.appendChild(scroller);
				// 光标（内容坐标系内 → 随内容滚动，无需滚动同步）
				const caretEl = document.createElement("div");
				caretEl.className = "fexp-ed-caret";
				// 隐藏输入框：唯一键盘/IME/剪贴板入口（跟随光标定位、透明 2×2px）
				const ta = document.createElement("textarea");
				ta.className = "fexp-code-font";
				ta.style.cssText = "position:absolute;left:-20px;top:-20px;width:2px;height:2px;margin:0;padding:0;border:none;outline:none;resize:none;background:transparent;color:transparent;opacity:0;overflow:hidden;white-space:pre;font-family:ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,'Cascadia Code',monospace;font-size:13px;line-height:20px;tab-size:4;z-index:5;box-sizing:border-box;pointer-events:none;";
				ta.value = ed.text;
				ta.spellcheck = false;
				ta.wrap = "off";
				body.appendChild(ta);

				const chW = editCharW();
				let lineStarts = edLineStarts(ta.value);
				let lineCount = lineStarts.length;
				let noW = edNoWFor(lineCount);
				let composing = false;
				let compAnchor = 0;   // IME 合成起点索引
				let compText = "";    // 合成中的文本（自绘覆盖条）
				let selStart = 0;
				let selEnd = 0;
				let windowRaf = 0;
				let geomChecked = false;
				const lineCache = new Map(); // lineText → hljs html（窗口缓存，防无界增长）
				scroller.style.setProperty("--fexp-noW", noW + "px");

				const lineTextAt = (l) => {
					const v = ta.value;
					const s = lineStarts[l];
					const e = l + 1 < lineStarts.length ? lineStarts[l + 1] - 1 : v.length;
					return e >= s ? v.slice(s, e) : "";
				};
				const colToX = (text, col) => edColToX(text, col, chW);
				/** 文档索引 → 内容坐标（rows 坐标系）：文本起点 = noW + 12，行起 = 8。 */
				const caretXY = (idx) => {
					const { line, col } = edIdxToLineCol(lineStarts, idx);
					const text = lineTextAt(line);
					const cl = Math.min(col, text.length);
					return { x: noW + 12 + colToX(text, cl), y: 8 + line * LINE_H, line, col: cl };
				};
				/** 当前活动光标索引：合成期间 = 合成起点 + 合成文本长（浏览器将合成
				 *  文本插入 selectionStart 处），否则 = 选区终点。 */
				const activeCaretIdx = () => composing
					? Math.min(compAnchor + compText.length, ta.value.length)
					: selEnd;
				const refreshModel = () => {
					ed.text = ta.value;
					lineStarts = edLineStarts(ta.value);
					lineCount = lineStarts.length;
					const w = edNoWFor(lineCount);
					if (w !== noW) {
						noW = w;
						scroller.style.setProperty("--fexp-noW", noW + "px");
					}
				};
				const readSel = () => {
					selStart = ta.selectionStart;
					selEnd = ta.selectionEnd;
					const len = ta.value.length;
					if (selStart > len) selStart = len;
					if (selEnd > len) selEnd = len;
				};
				/** 高亮一行（缓存 key = 行文本；未变行不重跑 hljs）。 */
				const highlightLine = (lineText) => {
					if (!language) return null;
					const cached = lineCache.get(lineText);
					if (cached !== undefined) return cached;
					let html = "";
					try {
						html = hljs.highlight(lineText, { language }).value;
					} catch (err) { /* 降级纯文本 */ }
					lineCache.set(lineText, html);
					if (lineCache.size > 4000) lineCache.clear();
					return html;
				};
				const renderWindow = () => {
					if (lineStarts.length === 0) return;
					const total = lineCount;
					const first = Math.max(0, Math.floor(scroller.scrollTop / LINE_H) - EDITOR_BUFFER);
					const count = Math.min(Math.ceil(scroller.clientHeight / LINE_H) + EDITOR_BUFFER * 2 + 2, total - first);
					const cpos = caretXY(activeCaretIdx());
					const compPos = composing && compText !== "" ? caretXY(compAnchor) : null;
					const selA = Math.min(selStart, selEnd);
					const selB = Math.max(selStart, selEnd);
					const vLen = ta.value.length;
					const frag = document.createDocumentFragment();
					const top = document.createElement("div");
					top.style.height = first * LINE_H + "px";
					frag.appendChild(top);
					for (let k = 0; k < count; k += 1) {
						const l = first + k;
						const lineText = lineTextAt(l);
						const row = document.createElement("div");
						row.className = "fexp-editor-row";
						const no = document.createElement("span");
						no.className = "fexp-editor-lineno";
						no.textContent = String(l + 1);
						const tx = document.createElement("span");
						tx.className = "fexp-cline";
						// 选区底条（行内文本坐标：0 = 行文本起点；先于 token 插入 → 树序在上）
						if (selB > selA) {
							const lineStartIdx = lineStarts[l];
							const lineEndIdx = l + 1 < lineStarts.length ? lineStarts[l + 1] - 1 : vLen;
							const a = Math.max(selA, lineStartIdx);
							const b = Math.min(selB, lineEndIdx);
							if (b > a && b > lineStartIdx) {
								const ca = Math.max(0, a - lineStartIdx);
								const cb = Math.min(lineText.length, b - lineStartIdx);
								const x0 = colToX(lineText, ca);
								const x1 = colToX(lineText, cb);
								const bar = document.createElement("span");
								bar.className = "fexp-ed-sel";
								bar.style.left = (12 + x0) + "px";
								bar.style.width = Math.max(1, x1 - x0) + "px";
								tx.appendChild(bar);
							}
						}
						// 文本 token（走行缓存）
						const tok = document.createElement("span");
						tok.className = "fexp-ed-tok";
						const html = highlightLine(lineText);
						if (html === "" || html === null) tok.textContent = lineText;
						else tok.innerHTML = html;
						tx.appendChild(tok);
						// IME 合成覆盖条：覆盖【合成起点】处（模型已含合成文本，其
						// 高亮被覆盖条遮住；光标仍在合成文本之后）
						if (composing && compText !== "" && compPos && compPos.line === l) {
							const comp = document.createElement("span");
							comp.className = "fexp-ed-comp";
							comp.textContent = compText;
							comp.style.left = (12 + colToX(lineText, compPos.col)) + "px";
							comp.style.width = Math.max(1, colToX(compText, compText.length)) + "px";
							tx.appendChild(comp);
						}
						row.appendChild(no);
						row.appendChild(tx);
						frag.appendChild(row);
					}
					const bottom = document.createElement("div");
					bottom.style.height = Math.max(0, total - first - count) * LINE_H + "px";
					frag.appendChild(bottom);
					rows.textContent = "";
					rows.appendChild(frag);
					// 光标（内容坐标）与隐藏输入框（视口坐标 = 内容坐标 - 滚动偏移）
					caretEl.style.left = cpos.x + "px";
					caretEl.style.top = (cpos.y + 1) + "px";
					rows.appendChild(caretEl);
					ta.style.left = (cpos.x - scroller.scrollLeft - 1) + "px";
					ta.style.top = (cpos.y - scroller.scrollTop) + "px";
					// 开发期自检：几何函数与真实 DOM 是否一致（防回归，默认关闭）
					if (DEV_GEOM_ASSERT && !geomChecked && count > 0) {
						geomChecked = true;
						const cline = rows.querySelector(".fexp-cline");
						const sRect = scroller.getBoundingClientRect();
						const cRect = cline.getBoundingClientRect();
						const pad = parseFloat(getComputedStyle(cline).paddingLeft) || 0;
						const expected = noW + 12 - scroller.scrollLeft;
						const actual = cRect.left - sRect.left + pad;
						if (Math.abs(actual - expected) > 0.75) {
							console.warn("[fexp] editor geometry drift", { expected, actual });
						}
					}
				};
				const scheduleWindow = () => {
					if (windowRaf !== 0) return;
					windowRaf = requestAnimationFrame(() => {
						windowRaf = 0;
						renderWindow();
					});
				};
				/** 滚动容器使光标可见（上/下 2 行、水平 60px 余量）。 */
				const ensureCaretVisible = () => {
					const c = caretXY(activeCaretIdx());
					const padY = 2 * LINE_H;
					const padX = 60;
					if (c.y - scroller.scrollTop < padY) {
						scroller.scrollTop = Math.max(0, c.y - padY);
					} else if (c.y + LINE_H - scroller.scrollTop > scroller.clientHeight - padY) {
						scroller.scrollTop = c.y + LINE_H - scroller.clientHeight + padY;
					}
					if (c.x - scroller.scrollLeft < 24) {
						scroller.scrollLeft = Math.max(0, c.x - 24);
					} else if (c.x - scroller.scrollLeft > scroller.clientWidth - padX) {
						scroller.scrollLeft = c.x - scroller.clientWidth + padX;
					}
				};
				/** 鼠标点 → 文档索引（与渲染共用同一几何函数）。 */
				const pointToIdx = (clientX, clientY) => {
					const rect = scroller.getBoundingClientRect();
					const x = clientX - rect.left + scroller.scrollLeft - noW - 12;
					const y = clientY - rect.top + scroller.scrollTop - 8;
					const line = Math.max(0, Math.min(lineCount - 1, Math.floor(y / LINE_H)));
					const text = lineTextAt(line);
					const col = edXToCol(text, Math.max(0, x), chW);
					return edLineColToIdx(lineStarts, line, col);
				};
				refreshModel();
				renderWindow();
				// --- 输入事件（model = ta.value；原生 undo/剪贴板/IME 全部保留）---
				ta.addEventListener("input", () => {
					refreshModel();
					if (composing) {
						// 合成期间模型已是浏览器现值（含合成中的文本），保持覆盖条
						scheduleWindow();
						return;
					}
					readSel();
					scheduleWindow();
					ensureCaretVisible();
				});
				ta.addEventListener("compositionstart", (ev) => {
					composing = true;
					compAnchor = ta.selectionStart;
					compText = ev.data || "";
					scheduleWindow();
				});
				ta.addEventListener("compositionupdate", (ev) => {
					compText = ev.data || "";
					compAnchor = ta.selectionStart;
					scheduleWindow();
				});
				ta.addEventListener("compositionend", () => {
					composing = false;
					compText = "";
					refreshModel();
					readSel();
					scheduleWindow();
					ensureCaretVisible();
				});
				const onSelChange = () => {
					const s = ta.selectionStart;
					const e = ta.selectionEnd;
					if (s !== selStart || e !== selEnd) {
						readSel();
						scheduleWindow();
						ensureCaretVisible();
					}
				};
				ta.addEventListener("focus", () => {
					wrap.classList.add("fexp-focused");
					document.addEventListener("selectionchange", onSelChange);
				});
				ta.addEventListener("blur", () => {
					wrap.classList.remove("fexp-focused");
					document.removeEventListener("selectionchange", onSelChange);
				});
				ta.addEventListener("keydown", (ev) => {
					if (ev.key === "Tab") {
						ev.preventDefault();
						const s = ta.selectionStart;
						const e = ta.selectionEnd;
						ta.setRangeText("  ", s, e, "end");
						refreshModel();
						readSel();
						scheduleWindow();
						ensureCaretVisible();
						return;
					}
					if (ev.key === "s" && (ev.ctrlKey || ev.metaKey)) {
						ev.preventDefault();
						saveEdit();
						return;
					}
					if (ev.key === "Escape") {
						ev.preventDefault();
						closeEditor();
						renderPreview();
					}
				});
				ta.addEventListener("keyup", () => { onSelChange(); });
				scroller.addEventListener("scroll", () => {
					// 光标在内容坐标系内随内容滚动；仅隐藏输入框需按视口坐标跟随
					scheduleWindow();
				}, { passive: true });
				// --- 鼠标：光标定位 / 拖选 / 双击选词（原生 DOM 选区禁用，选中自绘）---
				let dragAnchor = -1;
				scroller.addEventListener("pointerdown", (ev) => {
					if (ev.button !== 0) return;
					ev.preventDefault();
					ta.focus();
					const idx = pointToIdx(ev.clientX, ev.clientY);
					dragAnchor = idx;
					ta.setSelectionRange(idx, idx);
					onSelChange();
					document.addEventListener("pointermove", onDragMove);
					document.addEventListener("pointerup", onDragUp, { once: true });
				});
				const onDragMove = (ev) => {
					if (dragAnchor < 0) return;
					const idx = pointToIdx(ev.clientX, ev.clientY);
					ta.setSelectionRange(Math.min(dragAnchor, idx), Math.max(dragAnchor, idx));
					onSelChange();
				};
				const onDragUp = () => {
					dragAnchor = -1;
					document.removeEventListener("pointermove", onDragMove);
				};
				scroller.addEventListener("dblclick", (ev) => {
					const idx = pointToIdx(ev.clientX, ev.clientY);
					const { line, col } = edIdxToLineCol(lineStarts, idx);
					const text = lineTextAt(line);
					const isWordCh = (ch) => ch !== undefined && (/[\w$]/.test(ch) || /[\u4e00-\u9fff\u3400-\u4dbf]/.test(ch));
					let a = col;
					let b = col;
					if (isWordCh(text.charAt(a))) {
						while (a > 0 && isWordCh(text.charAt(a - 1))) a -= 1;
						while (b < text.length && isWordCh(text.charAt(b))) b += 1;
						const s = edLineColToIdx(lineStarts, line, a);
						const e = edLineColToIdx(lineStarts, line, b);
						ta.focus();
						ta.setSelectionRange(s, e);
						onSelChange();
					}
				});
				wrap.appendChild(bar);
				wrap.appendChild(body);
				// 卡片在 buildEditor 后立即可见：等一轮布局后再渲染窗口（clientHeight
				// 生效），避免隐藏期间构建导致的窗口高度错误
				requestAnimationFrame(() => { renderWindow(); });
				requestAnimationFrame(() => { try { ta.focus(); } catch (err) {} });
				return wrap;
			}
			let saveBtnEl = null;
			function saveBtnDisabled(disabled) {
				if (saveBtnEl) saveBtnEl.disabled = !!disabled;
			}
			function saveEdit() {
				const p = state.preview;
				const ed = state.editing;
				if (!p || !ed) return;
				saveBtnDisabled(true);
				remote().fsWrite(p.path, ed.text, ed.version).then((res) => {
					// 保存后刷新数据（重新渲染首段，保持当前模式）
					const mode = p.mode;
					state.preview = Object.assign({}, p, {
						size: res && typeof res.size === "number" ? res.size : p.size,
						version: res && res.version ? res.version : p.version,
						status: "loading",
						mode,
						data: null,
						error: null
					});
					closeEditor();
					renderPreview();
					refreshParentOf(p.path);
					showToast("已保存 " + p.name);
					loadPreviewSegment(p.path, 0, false);
				}).catch((err) => {
					saveBtnDisabled(false);
					showToast("保存失败：" + ((err && err.message) || err));
				});
			}
			function closeEditor() {
				if (state.editing) state.editing = null;
				saveBtnEl = null;
			}
			/** 进入编辑模式：从预览数据初始化编辑缓冲（truncated 时不可编辑）。 */
			function startEditing(p) {
				if (state.editing && state.editing.path === p.path) return;
				if (!p.data || typeof p.data.text !== "string") return;
				state.editing = { path: p.path, name: p.name, version: p.version || null, original: p.data.text, text: p.data.text };
			}
			/**
			 * Reload a directory in the tree. `dirPath` is the DIRECTORY to refresh
			 * (not a file inside it). `force` bypasses the in-flight guard so a
			 * mutation that just completed is always reflected immediately.
			 */
			function refreshDir(dirPath, force) {
				if (!dirPath) return;
				if (force) inflight.delete(dirPath);
				if (state.cache.has(dirPath) || force) fetchDir(dirPath);
			}
			/** Refresh the parent directory of a file/dir path. */
			function refreshParentOf(targetPath) {
				const dir = parentDir(targetPath);
				refreshDir(dir, true);
				return dir;
			}
			function openFile(entry) {
				closeEditor();
				state.preview = { path: entry.path, name: entry.name, size: entry.size, status: "loading", error: null, binary: false, mode: "edit", kind: null, language: null, data: null, loadingMore: false };
				renderPreview();
				renderTree();
				loadPreviewSegment(entry.path, 0, false);
			}
			/** 拉取预览段。首段（append=false）走 fsRender 类型判定与模式记忆；
			 *  续段（append=true）追加 data.text 并更新行数/截断状态。
			 *  fsRender 不可用（旧服务端）时回退 fsRead 纯文本。 */
			function loadPreviewSegment(path, offsetChars, append) {
				const p = state.preview;
				if (!p || p.path !== path) return;
				if (append && p.loadingMore) return;
				if (append) p.loadingMore = true;
				remote().fsRender(path, PREVIEW_BYTES, offsetChars).then((res) => {
					if (!state.preview || state.preview.path !== path) return;
					if (res && res.binary) {
						state.preview = Object.assign({}, state.preview, { status: "done", binary: true, data: null, loadingMore: false });
						renderPreview();
						return;
					}
					if (append) {
						const d = state.preview.data || {};
						const prevText = typeof d.text === "string" ? d.text : "";
						const text = prevText + (typeof res.text === "string" ? res.text : "");
						// 续读后内容不再完整对应原高亮行 → 清 lines，渲染自动降级纯文本
						const hadLines = Array.isArray(d.lines);
						state.preview = Object.assign({}, state.preview, {
							loadingMore: false,
							data: Object.assign({}, d, {
								text,
								lineCount: text.split("\n").length,
								truncated: !!res.truncated,
								totalLines: res.totalLines || d.totalLines || null,
								// 下一段起始偏移 = 本次请求偏移 + 本段实际长度
								offsetChars: (typeof res.offsetChars === "number" ? res.offsetChars : 0) + (typeof res.text === "string" ? res.text.length : 0),
								...(hadLines ? { lines: null, html: null, toc: null } : {})
							})
						});
						renderPreview();
						return;
					}
					const kind = res && res.kind ? res.kind : "text";
					// v1.9.9：代码/文本文件打开默认直接进入高亮编辑（无需点"编辑"）；
					// markdown 默认富文本渲染。
					let mode = readPreviewMode(kind) || (kind === "markdown" ? "render" : "edit");
					const data = {
						lines: Array.isArray(res.lines) ? res.lines : null,
						html: typeof res.html === "string" ? res.html : null,
						toc: Array.isArray(res.toc) ? res.toc : null,
						text: typeof res.text === "string" ? res.text : null,
						lineCount: res.lineCount || 0,
						totalLines: res.totalLines || null,
						truncated: !!res.truncated,
						// 下一段起始偏移 = 请求偏移(0) + 本段实际长度
						offsetChars: (typeof res.offsetChars === "number" ? res.offsetChars : 0) + (typeof res.text === "string" ? res.text.length : 0)
					};
					// 截断文件无法完整编辑：编辑按钮禁用，渲染/编辑分支由
					// buildPreviewContent 的 truncated guard 拦截 → 只读纯文本行视图。
					// mode 保持默认（md=render / 其他=edit），无需额外回退。
					state.preview = Object.assign({}, state.preview, {
						status: "done",
						binary: false,
						kind,
						language: res && res.language ? res.language : null,
						mode,
						data,
						error: null,
						loadingMore: false
					});
					renderPreview();
				}).catch((err) => {
					if (!state.preview || state.preview.path !== path) return;
					if (append) {
						state.preview.loadingMore = false;
						renderPreview();
						return;
					}
					// 回退 fsRead（旧服务端无 fsRender）
					remote().fsRead(path).then((res) => {
						if (!state.preview || state.preview.path !== path) return;
						const text = typeof res.text === "string" ? res.text : "";
						state.preview = Object.assign({}, state.preview, {
							status: "done",
							binary: !!res.binary,
							kind: "text",
							language: null,
							mode: "edit",
							data: { lines: null, html: null, toc: null, text, lineCount: text.split("\n").length, truncated: !!res.truncated, totalLines: null, offsetChars: text.length },
							error: null,
							loadingMore: false
						});
						renderPreview();
					}).catch((err2) => {
						if (!state.preview || state.preview.path !== path) return;
						state.preview = Object.assign({}, state.preview, { status: "error", error: String((err2 && err2.message) || err2), loadingMore: false });
						renderPreview();
					});
				});
			}

			function makeToolbarBtn(icon, label, title, onClick) {
				const b = document.createElement("button");
				b.className = "fexp-tbtn";
				const ic = document.createElement("span");
				ic.className = "fexp-tbtn-ic";
				ic.innerHTML = makeIcon(icon, 13);
				const lb = document.createElement("span");
				lb.textContent = label;
				b.appendChild(ic);
				b.appendChild(lb);
				b.title = title;
				b.addEventListener("click", onClick);
				return b;
			}
			function makeDockBtn(label, mode) {
				const b = document.createElement("button");
				b.className = "fexp-dockbtn";
				b.textContent = label;
				b.title = "停靠模式：" + label;
				b.addEventListener("click", () => setDock(mode));
				dockBtnEls.set(mode, b);
				return b;
			}
			/** v1.9.16: 面板缩放由独立 chrome 层转入（cell 内不再画 grip）；
			 *  mode 由 chrome 把手直接传入，状态机与数学保持不变。 */
			function panelResizeDown(mode, e) {
				if (e.button !== 0 || !panelEl) return;
				e.preventDefault();
				e.stopPropagation();
				const rect = panelEl.getBoundingClientRect();
				gripDrag = {
					mode: mode,
					startX: e.clientX,
					startY: e.clientY,
					startLeft: rect.left,
					startTop: rect.top,
					startW: rect.width,
					startH: rect.height
				};
				if (state.dock === "float") panelEl.style.right = "";
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onGripMove(e) {
				if (!gripDrag || !panelEl) return;
				const dx = e.clientX - gripDrag.startX;
				const dy = e.clientY - gripDrag.startY;
				if (state.dock === "right") {
					const nw = Math.min(Math.max(gripDrag.startW - dx, MIN_W), window.innerWidth * 0.7);
					panelEl.style.width = nw + "px";
					applyNarrow(nw);
					if (panelChrome !== null) panelChrome.update();
					return;
				}
				if (state.dock === "middle") {
					const nw = Math.min(Math.max(gripDrag.startW + dx, MIN_W), window.innerWidth * 0.7);
					panelEl.style.width = nw + "px";
					applyNarrow(nw);
					if (panelChrome !== null) panelChrome.update();
					return;
				}
				const mode = gripDrag.mode;
				let left = gripDrag.startLeft;
				let top = gripDrag.startTop;
				let w = gripDrag.startW;
				let h = gripDrag.startH;
				if (mode === "e" || mode === "ne" || mode === "se") {
					w = Math.min(Math.max(gripDrag.startW + dx, MIN_W), window.innerWidth * 0.75);
				} else if (mode === "w" || mode === "nw" || mode === "sw") {
					const nw = Math.min(Math.max(gripDrag.startW - dx, MIN_W), window.innerWidth * 0.75);
					left = gripDrag.startLeft + (gripDrag.startW - nw);
					w = nw;
				}
				if (mode === "s" || mode === "se" || mode === "sw") {
					h = Math.min(Math.max(gripDrag.startH + dy, MIN_H), window.innerHeight * 0.85);
				} else if (mode === "n" || mode === "ne" || mode === "nw") {
					const nh = Math.min(Math.max(gripDrag.startH - dy, MIN_H), window.innerHeight * 0.85);
					top = gripDrag.startTop + (gripDrag.startH - nh);
					h = nh;
				}
				panelEl.style.left = left + "px";
				panelEl.style.top = top + "px";
				panelEl.style.width = w + "px";
				panelEl.style.height = h + "px";
				applyNarrow(w);
				if (panelChrome !== null) panelChrome.update();
			}
			function onGripUp() {
				if (!gripDrag || !panelEl) return;
				const rect = panelEl.getBoundingClientRect();
				if (state.dock === "float") {
					state.pos = { left: rect.left, top: rect.top };
					writeJson(POS_KEY, state.pos);
					writeWidth(FWIDTH_KEY, Math.round(rect.width));
					writeWidth(FHEIGHT_KEY, Math.round(rect.height));
					applyNarrow(rect.width);
				} else {
					writeWidth(DWIDTH_KEY, Math.round(rect.width));
					applyNarrow(rect.width);
				}
				gripDrag = null;
				if (panelChrome !== null) panelChrome.update();
			}
			/** Shared panel builder. `host=true` renders inside ui-beautify's dock
			 * host (fills the container, inherits the card chrome, no own dock
			 * buttons / resize chrome); `host=false` is the classic
			 * self-contained floating panel with its own dock modes. */
			function buildPanelInto(container, host) {
				if (!host) {
					/* v1.7.2: a slot remount rebuilds the standalone panel —
					   v1.9.16 起面板缩放 chrome 位于独立层，重建时先释放旧实例 */
					if (panelChrome !== null) { panelChrome.dispose(); panelChrome = null; }
					dockBtnEls.clear();
				}
				container.textContent = "";
				const panel = document.createElement("div");
				panel.className = "fexp-panel" + (host ? " fexp-hostpanel" : "");
				panel.style.display = host ? "flex" : ((hostMode || !state.open) ? "none" : "flex");
				panelEl = panel;
				const header = document.createElement("div");
				header.className = "fexp-header";
				const hic = document.createElement("span");
				hic.className = "fexp-ic";
				hic.textContent = "📁";
				const title = document.createElement("span");
				title.className = "fexp-header-title";
				headerTitleEl = title;
				const x = document.createElement("button");
				x.className = "fexp-x";
				x.title = "关闭";
				x.appendChild(makeCloseIcon(14));
				x.addEventListener("click", () => {
					if (host && dockApiRef !== undefined) {
						try { dockApiRef.closePanel(PANEL_ID); } catch (err) {}
						return;
					}
					state.open = false;
					applyOpen();
				});
				header.appendChild(hic);
				header.appendChild(title);
				if (!host) {
					header.appendChild(makeDockBtn("右侧", "right"));
					header.appendChild(makeDockBtn("中间", "middle"));
					header.appendChild(makeDockBtn("浮动", "float"));
					header.addEventListener("pointerdown", onHeaderDown);
					header.addEventListener("pointermove", onHeaderMove);
					header.addEventListener("pointerup", onHeaderUp);
					header.addEventListener("pointercancel", onHeaderUp);
				}
				header.appendChild(x);
				const toolbar = document.createElement("div");
				toolbar.className = "fexp-toolbar";
				toolbar.appendChild(makeToolbarBtn("refresh", "刷新", "重新加载目录", () => {
					state.cache = new Map();
					state.expanded = new Set();
					if (state.root !== null) fetchDir(state.root);
				}));
				hiddenBtn = makeToolbarBtn("eye", "隐藏", "显示/隐藏 node_modules、.git 等", () => {
					state.showHidden = !state.showHidden;
					if (hiddenBtn) hiddenBtn.classList.toggle("fexp-on", state.showHidden);
					renderTree();
				});
				toolbar.appendChild(hiddenBtn);
				/* v1.9.2: 帮助按钮固定在工具栏（刷新/隐藏旁），? 键同样可用 */
				toolbar.appendChild(makeToolbarBtn("help", "帮助", "快捷键帮助（? 键，即 Shift+/）", toggleHelp));
				const searchBar = buildSearchBar();
				searchBarEl = searchBar;
				const tree = document.createElement("div");
				tree.className = "fexp-tree";
				treeEl = tree;
				tree.addEventListener("contextmenu", (ev) => {
					if (ev.target !== tree) return; // only blank area, not rows
					if (state.root === null) return;
					ev.preventDefault();
					ev.stopPropagation();
					onContextMenu(ev, state.root, "dir", baseName(state.root));
				});
				bindTreeDropTargets();
				/* v1.9.1：面板内预览区退役（预览移至独立卡片）——preview 元素保留
				   （standaloneRefs 兼容）但恒隐藏 */
				const preview = document.createElement("div");
				preview.className = "fexp-preview";
				preview.style.display = "none";
				previewEl = preview;
				panel.appendChild(header);
				panel.appendChild(toolbar);
				panel.appendChild(searchBar);
				panel.appendChild(tree);
				panel.appendChild(preview);
				if (!host) {
					/* v1.9.16: 缩放 chrome 为独立 overlay 层（ui-beautify 式跨骑把手），
					   不再作为面板子元素；方向/可见性由 syncPanelChrome 按 dock 模式管理 */
					panelChrome = makeResizeChrome({
						getRect: () => (panelEl === null || panelEl.classList.contains("fexp-hostpanel")
							? null
							: (() => { const r = panelEl.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; })()),
						dirs: ["n", "s", "e", "w", "se", "ne", "sw", "nw"],
						onDown: (mode, ev) => panelResizeDown(mode, ev),
						onMove: (ev) => onGripMove(ev),
						onUp: () => onGripUp(),
						zIndex: 502
					});
				}
				container.appendChild(panel);
				themeNow();
				if (!host) {
					applyDock();
				}
				updateHeader();
				renderTree();
				renderPreview();
				ensureRoot();
				ensureWsList();
			}
			/** Classic (standalone) panel: built once into the overlay host element. */
			function buildPanel() {
				if (!hostEl) return;
				buildPanelInto(hostEl, false);
				standaloneRefs = {
					panel: panelEl,
					tree: treeEl,
					preview: previewEl,
					headerTitle: headerTitleEl,
					hiddenBtn: hiddenBtn
				};
			}
			/** Re-point the shared refs at the classic panel after a host panel
			 * unmounts (tab switch / float / close), so renders keep targeting a
			 * live tree. */
			function restoreStandaloneRefs() {
				hostPanelActive = false;
				if (!standaloneRefs) return;
				panelEl = standaloneRefs.panel;
				treeEl = standaloneRefs.tree;
				previewEl = standaloneRefs.preview;
				headerTitleEl = standaloneRefs.headerTitle;
				hiddenBtn = standaloneRefs.hiddenBtn;
			}
			/** ui-beautify dock host calls this with the tab-body container on
			 * every host mount (docked tab active, or floating window). Returns
			 * the disposer restoring the classic refs on unmount. */
			function mountDockHost(el) {
				hostPanelActive = true;
				buildPanelInto(el, true);
				return restoreStandaloneRefs;
			}
			function ensureRoot() {
				if (state.root !== null) {
					fetchDir(state.root);
					return;
				}
				remote().wsRoot().then((res) => {
					const candidate = res && typeof res.root === "string" && res.root !== "" ? res.root : null;
					if (typeof res.platform === "string" && res.platform !== "") state.platform = res.platform;
					if (candidate) {
						switchRoot(candidate);
					} else {
						renderTree();
					}
				}).catch(() => renderTree());
			}
			function probeActiveWorkspacePath() {
				try {
					const list = document.querySelector("[data-slot=\"sidebar.workspaces\"]");
					if (!list) return null;
					const rows = list.querySelectorAll("[role=\"treeitem\"]");
					let wsRow = null;
					let found = false;
					for (const row of rows) {
						if (row.getAttribute("aria-expanded") !== null) {
							wsRow = row;
						} else if (row.getAttribute("aria-selected") === "true") {
							found = true;
							break;
						}
					}
					if (!found || !wsRow) return null;
					const children = wsRow.children;
					for (let i = 0; i < children.length; i++) {
						const text = (children[i].textContent || "").trim();
						if (text === "") continue;
						for (const w of state.workspaces) {
							if (w.title && w.title.trim() === text) return w.path;
						}
						return null;
					}
					return null;
				} catch (err) {
					return null;
				}
			}
			/** Clamp a floating panel's top-left corner into the viewport, honoring its actual width. */
			function clampFloatPos(left, top) {
				const w = panelEl ? panelEl.offsetWidth : 400;
				const maxLeft = Math.max(8, window.innerWidth - w - 8);
				const maxTop = Math.max(8, window.innerHeight - 48);
				return {
					left: Math.min(Math.max(left, 8), maxLeft),
					top: Math.min(Math.max(top, 8), maxTop)
				};
			}
			function onHeaderDown(e) {
				if (state.dock !== "float") return;
				if (e.button !== 0) return;
				const t = e.target;
				if (t && t.closest && t.closest("button")) return;
				e.preventDefault();
				const cur = state.pos || { left: window.innerWidth - 424, top: 96 };
				drag = { startX: e.clientX, startY: e.clientY, originLeft: cur.left, originTop: cur.top };
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onHeaderMove(e) {
				if (!drag) return;
				const pos = clampFloatPos(drag.originLeft + e.clientX - drag.startX, drag.originTop + e.clientY - drag.startY);
				state.pos = pos;
				if (panelEl) {
					panelEl.style.left = pos.left + "px";
					panelEl.style.top = pos.top + "px";
				}
				if (panelChrome !== null) panelChrome.update();
			}
			function onHeaderUp(e) {
				if (!drag) return;
				const pos = clampFloatPos(drag.originLeft + e.clientX - drag.startX, drag.originTop + e.clientY - drag.startY);
				state.pos = pos;
				writeJson(POS_KEY, pos);
				drag = null;
			}
			function applyOpen() {
				for (const el of btnEls.values()) el.classList.toggle("fexp-active", state.open);
				if (!panelEl) return;
				/* v1.9.7: 设置弹窗打开时面板一律隐藏（否则浮在设置之上） */
				if (settingsOpen) {
					panelEl.style.display = "none";
					syncPanelChrome();
					return;
				}
				/* The mounted host panel is always visible while the tab lives; the
				   classic panel is hidden in host mode (the dock host owns the surface). */
				if (hostPanelActive) panelEl.style.display = "flex";
				else panelEl.style.display = (hostMode || !state.open) ? "none" : "flex";
				syncPanelChrome();
			}
			/* --- v1.9.7: 设置弹窗置顶协调 ---
			   设置弹窗（z-index:1000 的 fixed 全屏层）渲染在侧边栏
			   [data-slot="sidebar.settings"] 槽内，被侧边栏/浮动卡的层叠上下文
			   困住（ui-beautify 注释明说 "its stacking context traps the fixed
			   settings modal"）——有效层级≈0，任何 body 级正 z-index 的浮层都会
			   盖住它。所以不能只靠 z-index：设置打开时必须隐藏本插件的全部浮层
			   （预览卡片 / 面板 / 菜单 / 行内输入 / 帮助 / Toast），关闭后恢复。 */
			function detectSettingsOpen() {
				const seat = settingsSeat !== null && document.contains(settingsSeat) ? settingsSeat : null;
				if (seat === null) return false;
				for (const el of seat.children) {
					if (!(el instanceof HTMLElement)) continue;
					try {
						if (window.getComputedStyle(el).position === "fixed") return true;
					} catch (err) { /* keep scanning */ }
				}
				return false;
			}
			function updateSettingsOpen() {
				const open = detectSettingsOpen();
				if (open === settingsOpen) return;
				settingsOpen = open;
				if (open) {
					/* 设置打开：立即关闭/隐藏全部浮层 */
					closeMenu();
					closeInputHost();
					closeHelp();
					hideToast();
					if (previewCardEl) previewCardEl.style.display = "none";
					if (previewCardChrome !== null) previewCardChrome.setHidden(true);
					if (panelEl) panelEl.style.display = "none";
					syncPanelChrome();
				} else {
					/* 设置关闭：按当前状态恢复（编辑中的未保存内容经 state.editing 保留） */
					applyOpen();
					if (state.preview) renderPreview();
				}
			}
			function watchSettingsSeat() {
				const seat = document.querySelector('[data-slot="sidebar.settings"]');
				if (seat === null) return;
				if (seat === settingsSeat) return;
				if (settingsMo !== null) { settingsMo.disconnect(); settingsMo = null; }
				settingsSeat = seat;
				settingsMo = new MutationObserver(() => updateSettingsOpen());
				settingsMo.observe(seat, { childList: true });
				updateSettingsOpen();
			}
			/** Hide/show the classic-panel surface for the current mode. Called on
			 * every dock-state transition. */
			function mountButton(id) {
				return (el) => {
					if (el) btnEls.set(id, el);
					else btnEls.delete(id);
					applyOpen();
				};
			}
			function mountHost(el) {
				hostEl = el;
				if (el) {
					try {
						buildPanel();
					} catch (err) {
						console.error("[dsh-file-explorer] buildPanel failed:", err);
					}
				}
			}
			function toggleOpen() {
				const d = dockApiRef;
				if (hostMode && d !== undefined) {
					const open = typeof d.isOpen === "function" ? !!d.isOpen(PANEL_ID) : (document.querySelector(".fexp-hostpanel") !== null);
					if (open) { try { d.closePanel(PANEL_ID); } catch (err) {} }
					else { try { d.openPanel(PANEL_ID); } catch (err) {} }
					return;
				}
				state.open = !state.open;
				applyOpen();
			}

			/* --- v1.6: dock host integration (ui-beautify) --- */
			/** True while the app frame exists. Since v1.8 ui-beautify's plugin panel
			 * renders in BOTH modes (card dock card / classic right overlay), so the
			 * `data-vsc-layout` check no longer gates host mode — only a missing
			 * frame (engine unable to initialize) keeps the classic panel in charge. */
			function frameExists() {
				try {
					const root = document.querySelector('[data-slot="root"]');
					return root !== null && root.firstElementChild !== null;
				} catch (err) { return false; }
			}
			/** Re-evaluate host mode and keep the open state in sync across the
			 * classic panel and the dock host panel. Cheap when nothing changed
			 * (called from the dock subscription AND the periodic follow loop). */
			function onDockChange() {
				const d = dockApiRef;
				if (d === undefined) return;
				const nextHost = frameExists();
				if (nextHost === hostMode) {
					/* same mode: only sync the button highlight when the HOST panel
					   was opened/closed directly (tab ×, ⧉ float, closeDock…).
					   The standalone panel state is latent while hosted — it must
					   not re-open the classic panel behind the user's back. */
					if (hostMode && typeof d.isOpen === "function") {
						const open = !!d.isOpen(PANEL_ID);
						if (open !== state.open) { state.open = open; applyOpen(); }
					}
					return;
				}
				hostMode = nextHost;
				if (hostMode) {
					/* entering host mode: carry the standalone open state into the
					   host panel (open if it was open, close if it was closed). */
					if (typeof d.isOpen === "function") {
						const open = !!d.isOpen(PANEL_ID);
						if (state.open && !open) { try { d.openPanel(PANEL_ID); } catch (err) {} }
						else if (!state.open && open) { try { d.closePanel(PANEL_ID); } catch (err) {} }
						state.open = !!d.isOpen(PANEL_ID);
					}
				} else {
					/* leaving host mode: host state carries over to the standalone
					   panel; re-point refs in case they live in a now-unmounted
					   host tree. */
					state.open = typeof d.isOpen === "function" ? !!d.isOpen(PANEL_ID) : state.open;
					if (panelEl && panelEl.classList.contains("fexp-hostpanel")) restoreStandaloneRefs();
					if (panelEl) {
						applyDock();
						renderTree();
						renderPreview();
					}
				}
				applyOpen();
			}
			/** Register the panel with ui-beautify's dock host exactly once. */
			function initDockIntegration(d) {
				if (dockDispose !== null || dockUnsub !== null) return;
				try {
					dockDispose = d.registerPanel({
						id: PANEL_ID,
						title: "文件浏览器",
						icon: "📁",
						mount: mountDockHost
					});
				} catch (err) {
					console.error("[dsh-file-explorer] dock panel registration failed:", err);
					dockDispose = null;
					return;
				}
				if (typeof d.subscribe === "function") {
					try { dockUnsub = d.subscribe(onDockChange); } catch (err) { dockUnsub = null; }
				}
				onDockChange();
				bumpEntryListeners();
			}
			/** Lazily pick up the `dock` service (ui-beautify may load after us). */
			function ensureDock() {
				if (dockApiRef !== undefined) return;
				const d = ctx.get("dock");
				if (d === undefined) return;
				dockApiRef = d;
				initDockIntegration(d);
			}

			// --- v1.3: context menu, inline input, clipboard actions ---
			function menuItem(label, icon, onClick, disabled, danger) {
				const item = document.createElement("div");
				item.className = "fexp-menu-item" + (disabled ? " fexp-disabled" : "") + (danger ? " fexp-danger" : "");
				const ic = document.createElement("span");
				ic.className = "fexp-menu-ic";
				ic.innerHTML = makeIcon(icon || "doc", 13);
				const lab = document.createElement("span");
				lab.className = "fexp-menu-label";
				lab.textContent = label;
				item.appendChild(ic);
				item.appendChild(lab);
				if (disabled) return item;
				item.addEventListener("click", () => {
					closeMenu();
					onClick();
				});
				return item;
			}
			function closeMenu() {
				if (menuEl) { menuEl.remove(); menuEl = null; }
			}
			/** The rename/copy/paths group shared by the dir and file menus. */
			function pushCommonMenuItems(items, path, type, name) {
				items.push(menuItem("重命名…", "edit", () => startRenameInput(path, type, name)));
				items.push(menuItem("复制", "copy", () => setClipboard(path, type)));
				items.push(menuItem("复制绝对路径", "external", () => copyText(path)));
				items.push(menuItem("复制相对路径", "external", () => copyText(relativeToRoot(path))));
			}
			function onContextMenu(ev, path, type, name) {
				ev.preventDefault();
				ev.stopPropagation();
				closeMenu();
				closeEditor();
				lastMenuPos = { x: ev.clientX, y: ev.clientY };
				const el = document.createElement("div");
				el.className = "fexp-menu";
				el.style.left = ev.clientX + "px";
				el.style.top = ev.clientY + "px";
				const items = [];
				if (type === "dir") {
					items.push(menuItem("新建文件…", "file", () => startCreateInput(path, "file")));
					items.push(menuItem("新建文件夹…", "folder", () => startCreateInput(path, "dir")));
					items.push(menuSep());
					items.push(menuItem("粘贴", "copy", () => pasteInto(path), state.clipboard === null));
					items.push(menuSep());
					pushCommonMenuItems(items, path, type, name);
					items.push(menuSep());
					items.push(menuItem("删除", "trash", () => deletePath(path, type, name), false, true));
				} else {
					items.push(menuItem("粘贴到此处", "copy", () => pasteInto(parentDir(path) || state.root || path), state.clipboard === null));
					pushCommonMenuItems(items, path, type, name);
					items.push(menuSep());
					items.push(menuItem("删除", "trash", () => deletePath(path, type, name), false, true));
				}
				for (const it of items) if (it) el.appendChild(it);
				document.body.appendChild(el);
				menuEl = el;
				const rect = el.getBoundingClientRect();
				if (rect.right > window.innerWidth - 4) el.style.left = Math.max(4, ev.clientX - rect.width) + "px";
				if (rect.bottom > window.innerHeight - 4) el.style.top = Math.max(4, ev.clientY - rect.height) + "px";
			}
			function setClipboard(path, type) {
				state.clipboard = { path: path, type: type };
				writeClipboard();
				renderTree();
				showToast("已复制" + (type === "dir" ? "文件夹" : "文件") + "：可在目标目录右键粘贴");
			}
			function pasteInto(dirPath) {
				const clip = state.clipboard;
				if (!clip || !clip.path) return;
				const sameDir = state.platform === "win32" ? clip.path.toLowerCase() === dirPath.toLowerCase() : clip.path === dirPath;
				if (sameDir) {
					showToast("不能粘贴到自身所在目录");
					return;
				}
				remote().fsCopy(clip.path, dirPath).then((res) => {
					state.clipboard = null;
					writeClipboard();
					renderTree();
					refreshDir(dirPath, true);
					showToast("已粘贴到 " + dirPath);
				}).catch((err) => {
					showToast("粘贴失败：" + ((err && err.message) || err));
				});
			}
			function deletePath(path, type, name) {
				const confirmed = window.confirm('确定删除"' + name + '"吗？' + (type === "dir" ? "文件夹及其全部内容" : "文件") + "将移入回收站。");
				if (!confirmed) return;
				remote().fsDelete(path).then((res) => {
					if (state.preview && state.preview.path === path) {
						state.preview = null;
						closeEditor();
						renderPreview();
					}
					if (state.clipboard && state.clipboard.path === path) {
						state.clipboard = null;
						writeClipboard();
					}
					const sep = pathSep();
					const comparable = (s) => (state.platform === "win32" ? s.toLowerCase() : s);
					const prefix = comparable(path.replace(/[\\/]+$/, ""));
					for (const key of [...state.expanded]) if (comparable(key) === prefix || comparable(key).startsWith(prefix + sep)) state.expanded.delete(key);
					for (const key of [...state.cache.keys()]) if (comparable(key) === prefix || comparable(key).startsWith(prefix + sep)) state.cache.delete(key);
					renderTree();
					refreshParentOf(path);
					showToast(res && res.recycled ? "已移入回收站：" + name : "已删除：" + name);
				}).catch((err) => {
					showToast("删除失败：" + ((err && err.message) || err));
				});
			}
			function startRenameInput(path, type, name) {
				openInlineInput({
					x: 0, y: 0,
					value: name,
					placeholder: "新名称",
					kind: "rename",
					onCommit: (value) => {
						const v = value.trim();
						if (!v) return;
						const parent = parentDir(path);
						const target = parent ? joinPath(parent, v) : v;
						const same = state.platform === "win32" ? target.toLowerCase() === path.toLowerCase() : target === path;
						if (same) return;
						remote().fsRename(path, target).then(() => {
							renderTree();
							refreshParentOf(path);
							showToast("已重命名");
						}).catch((err) => {
							showToast("重命名失败：" + ((err && err.message) || err));
						});
					}
				});
			}
			function startCreateInput(dirPath, type) {
				const ext = type === "dir" ? "" : ".txt";
				openInlineInput({
					x: 0, y: 0,
					value: type === "dir" ? "" : "新建文件" + ext,
					placeholder: type === "dir" ? "文件夹名称" : "文件名（如 a.txt、b.py）",
					kind: "create:" + type,
					onCommit: (value) => {
						const v = value.trim();
						if (!v) return;
						const target = joinPath(dirPath, v);
						const content = type === "dir" ? "" : templateFor(v);
						remote().fsCreate(target, type, content).then(() => {
							if (type === "dir") state.expanded.add(target);
							renderTree();
							refreshDir(dirPath, true);
							showToast((type === "dir" ? "已创建文件夹 " : "已创建文件 ") + v);
						}).catch((err) => {
							showToast("创建失败：" + ((err && err.message) || err));
						});
					}
				});
			}
			function openInlineInput(opts) {
				const anchor = lastMenuPos;
				closeMenu();
				closeInputHost();
				const host = document.createElement("div");
				host.className = "fexp-input-host";
				const input = document.createElement("input");
				input.className = "fexp-input";
				input.value = opts.value || "";
				input.placeholder = opts.placeholder || "";
				input.spellcheck = false;
				host.appendChild(input);
				document.body.appendChild(host);
				inputHostEl = host;
				host.style.left = Math.max(8, Math.min(anchor ? anchor.x : window.innerWidth / 2 - 80, window.innerWidth - 220)) + "px";
				host.style.top = Math.max(8, Math.min(anchor ? anchor.y + 8 : 120, window.innerHeight - 56)) + "px";
				host.style.width = "200px";
				const commit = () => {
					const v = input.value;
					closeInputHost();
					if (opts.onCommit) opts.onCommit(v);
				};
				const cancel = () => closeInputHost();
				input.addEventListener("keydown", (ev) => {
					if (ev.key === "Enter") { ev.preventDefault(); commit(); }
					else if (ev.key === "Escape") { ev.preventDefault(); cancel(); }
				});
				input.addEventListener("blur", () => {
					/* v1.7.2: only close THIS host — a stale blur timer must not
					   close a newly opened inline input */
					setTimeout(() => { if (inputHostEl === host) closeInputHost(); }, INPUT_BLUR_MS);
				});
				input.addEventListener("contextmenu", (ev) => ev.stopPropagation());
				requestAnimationFrame(() => { try { input.focus(); input.select(); } catch (err) {} });
			}
			function closeInputHost() {
				if (inputHostEl) { inputHostEl.remove(); inputHostEl = null; }
			}
			function closeAllOverlays() {
				closeMenu();
				closeInputHost();
			}

			// --- v1.5: drag & drop move ---
			function isSelfOrDescendant(from, toDir) {
				const sep = pathSep();
				const norm = (s) => (state.platform === "win32" ? s.toLowerCase() : s);
				const f = norm(from.replace(/[\\/]+$/, ""));
				const t = norm(toDir.replace(/[\\/]+$/, ""));
				return t === f || t.startsWith(f + sep);
			}
			function onDragStart(ev, path) {
				dragSrcPath = path;
				closeAllOverlays();
				try {
					ev.dataTransfer.effectAllowed = "move";
					ev.dataTransfer.setData("text/plain", path);
				} catch (err) {}
				if (ev.currentTarget) ev.currentTarget.classList.add("fexp-dragging");
				// Safety net: if the tree re-renders mid-drag (workspace follow,
				// refresh) the source row is removed and its dragend never fires —
				// clear the drag state from the document instead.
				document.addEventListener("dragend", onDocumentDragEnd, true);
			}
			function onDocumentDragEnd() {
				dragSrcPath = null;
				clearDropTarget();
				document.removeEventListener("dragend", onDocumentDragEnd, true);
			}
			function onDragEnd(ev) {
				dragSrcPath = null;
				clearDropTarget();
				if (ev.currentTarget) ev.currentTarget.classList.remove("fexp-dragging");
			}
			function clearDropTarget() {
				if (dropTargetEl) {
					dropTargetEl.classList.remove("fexp-drop-target");
					dropTargetEl = null;
				}
			}
			/**
			 * Drop-target validity for a directory row. A drop is allowed only when
			 * the destination is not the source itself, not a descendant of it, and
			 * not the source's own parent (dropping into the same directory is a
			 * no-op). Invalid targets keep the native "not allowed" cursor and never
			 * highlight — highlight always means "safe to drop".
			 * @param dirPath - candidate destination directory.
			 * @param srcPath - explicit source path (defaults to `dragSrcPath`; pass
			 *   the captured value from onDrop because dragSrcPath is cleared there).
			 */
			function canDropInto(dirPath, srcPath) {
				const src = srcPath === undefined ? dragSrcPath : srcPath;
				if (src === null || !dirPath) return false;
				if (isSelfOrDescendant(src, dirPath)) return false;
				const srcDir = parentDir(src);
				if (srcDir !== null) {
					const same = state.platform === "win32" ? srcDir.toLowerCase() === dirPath.toLowerCase() : srcDir === dirPath;
					if (same) return false;
				}
				return true;
			}
			/** dragover fires continuously while the pointer is over the row, so it
			 * is the single source of truth for the highlight: no flicker from
			 * child-element enter/leave events. */
			function onDragOver(ev, dirPath) {
				if (dragSrcPath === null) return;
				if (!canDropInto(dirPath)) return; // no preventDefault → native forbidden cursor
				ev.preventDefault();
				try { ev.dataTransfer.dropEffect = "move"; } catch (err) {}
				if (dropTargetEl !== ev.currentTarget) {
					clearDropTarget();
					dropTargetEl = ev.currentTarget;
					dropTargetEl.classList.add("fexp-drop-target");
				}
			}
			/** Only clear the highlight when the pointer actually left the row
			 * (relatedTarget outside the row); moving between child spans keeps it. */
			function onDragLeave(ev) {
				if (dropTargetEl !== ev.currentTarget) return;
				const related = ev.relatedTarget;
				if (related && ev.currentTarget.contains(related)) return;
				clearDropTarget();
			}
			function onDrop(ev, dirPath) {
				if (dragSrcPath === null) return;
				ev.preventDefault();
				ev.stopPropagation();
				const src = dragSrcPath;
				clearDropTarget();
				dragSrcPath = null;
				if (!canDropInto(dirPath, src)) return; // native-cursor path already prevented, but guard anyway
				remote().fsMove(src, dirPath).then((res) => {
					if (state.preview && state.preview.path === src) {
						state.preview = null;
						closeEditor();
						renderPreview();
					}
					if (state.clipboard && state.clipboard.path === src) {
						state.clipboard = null;
						writeClipboard();
					}
					renderTree();
					refreshParentOf(src);
					refreshDir(dirPath, true);
					showToast("已移动到 " + dirPath);
				}).catch((err) => {
					showToast("移动失败：" + ((err && err.message) || err));
				});
			}
			/** True when the drag pointer is over blank tree space (not a real row). */
			function overBlankTree(ev) {
				const t = ev.target;
				if (!t || !t.closest) return false;
				return t.closest("[data-path]") === null;
			}
			function bindTreeDropTargets() {
				if (!treeEl) return;
				treeEl.addEventListener("dragover", (ev) => {
					if (dragSrcPath === null || !overBlankTree(ev)) return;
					if (!canDropInto(state.root)) return;
					ev.preventDefault();
					try { ev.dataTransfer.dropEffect = "move"; } catch (err) {}
					if (dropTargetEl !== treeEl) {
						clearDropTarget();
						dropTargetEl = treeEl;
						treeEl.classList.add("fexp-drop-target");
					}
				});
				treeEl.addEventListener("dragleave", (ev) => {
					if (dropTargetEl !== treeEl) return;
					const related = ev.relatedTarget;
					if (related && treeEl.contains(related)) return;
					clearDropTarget();
				});
				treeEl.addEventListener("drop", (ev) => {
					if (dragSrcPath === null || !overBlankTree(ev)) return;
					if (state.root === null) return;
					onDrop(ev, state.root);
				});
			}

			// ================= v1.9.0 帮助浮层 / 主题 =================
			const HELP_ROWS = [
				["Ctrl+F / ⌘F", "搜索 / 过滤文件名"],
				["Esc", "关闭搜索 · 退出编辑 · 关闭预览卡片"],
				["↑ / ↓", "搜索结果中导航"],
				["Enter", "打开选中文件（目录则展开）"],
				["→ / ←", "展开 / 收起目录"],
				["Ctrl+[ / Ctrl+]", "切换渲染 / 编辑视图（仅 Markdown）"],
				["Tab（编辑中）", "插入 2 空格缩进"],
				["Ctrl+S（编辑中）", "保存"],
				["?（Shift+/）", "打开本快捷键帮助（也可点工具栏「帮助」按钮）"],
			];
			let helpEl = null;
			let helpDrag = null;
			function closeHelp() {
				if (helpEl) { helpEl.remove(); helpEl = null; }
				helpDrag = null;
			}
			/** 帮助浮层拖动（标题区域）。pointer capture 保证移出标题栏后
			 *  move/up 仍派发到本元素 —— 否则 up 丢失会让拖动状态残留，
			 *  鼠标未按下时浮层也跟着移动。 */
			function onHelpHeadDown(e) {
				if (e.button !== 0 || !helpEl) return;
				const rect = helpEl.getBoundingClientRect();
				helpDrag = { startX: e.clientX, startY: e.clientY, left: rect.left, top: rect.top };
				e.preventDefault();
				try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
			}
			function onHelpHeadMove(e) {
				if (!helpDrag || !helpEl) return;
				const maxLeft = Math.max(8, window.innerWidth - helpEl.offsetWidth - 8);
				const maxTop = Math.max(8, window.innerHeight - 48);
				helpEl.style.right = "auto"; // 拖动后改用 left 定位，避免与初始 right 冲突
				helpEl.style.left = Math.min(Math.max(helpDrag.left + e.clientX - helpDrag.startX, 8), maxLeft) + "px";
				helpEl.style.top = Math.min(Math.max(helpDrag.top + e.clientY - helpDrag.startY, 8), maxTop) + "px";
			}
			function onHelpHeadUp() {
				helpDrag = null;
			}
			function toggleHelp() {
				/* v1.9.7: 设置打开时不弹帮助浮层（会浮在设置之上） */
				if (settingsOpen) return;
				if (helpEl) { closeHelp(); return; }
				const el = document.createElement("div");
				el.className = "fexp-help";
				const head = document.createElement("div");
				head.className = "fexp-help-head";
				head.textContent = "快捷键";
				head.title = "拖动移动";
				head.addEventListener("pointerdown", onHelpHeadDown);
				head.addEventListener("pointermove", onHelpHeadMove);
				head.addEventListener("pointerup", onHelpHeadUp);
				head.addEventListener("pointercancel", onHelpHeadUp);
				const table = document.createElement("table");
				for (const [keys, desc] of HELP_ROWS) {
					const tr = document.createElement("tr");
					const tdK = document.createElement("td");
					const kbd = document.createElement("span");
					kbd.className = "kbd";
					kbd.textContent = keys;
					tdK.appendChild(kbd);
					const tdD = document.createElement("td");
					tdD.textContent = desc;
					tr.appendChild(tdK);
					tr.appendChild(tdD);
					table.appendChild(tr);
				}
				const close = document.createElement("button");
				close.className = "fexp-btn fexp-help-close";
				close.textContent = "关闭";
				close.addEventListener("click", closeHelp);
				el.appendChild(head);
				el.appendChild(table);
				el.appendChild(close);
				document.body.appendChild(el);
				helpEl = el;
				// 初始位置：视窗右上角（视觉引导更自然）
				el.style.right = "16px";
				el.style.left = "auto";
				el.style.top = "16px";
			}
			/** v1.9.0 视图模式循环切换（Ctrl+[ / Ctrl+]），跳过不可用模式。 */
			function cycleMode(delta) {
				const p = state.preview;
				if (!p || p.status !== "done" || p.binary || !p.kind) return;
				const modes = previewModes(p.kind);
				if (modes.length < 2) return;
				const cur = Math.max(0, modes.indexOf(p.mode));
				let picked = -1;
				for (let i = 1; i <= modes.length; i += 1) {
					const idx = (cur + delta * i + modes.length) % modes.length;
					const m = modes[idx];
					const disabled = (m === "edit" && !!(p.data && p.data.truncated)) ||
						(p.kind === "code" && m === "render" && !(p.data && p.data.lines));
					if (!disabled) { picked = idx; break; }
				}
				if (picked < 0 || picked === cur) return;
				const m = modes[picked];
				state.preview = Object.assign({}, state.preview, { mode: m });
				if (p.kind) writePreviewMode(p.kind, m);
				renderPreview();
			}
			/** v1.9.0 深/浅主题检测（data-theme 属性 + prefers-color-scheme）。 */
			function themeNow() {
				const dark = (document.documentElement.getAttribute("data-theme") === "dark") ||
					(document.documentElement.classList.contains("dark")) ||
					(typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches);
				/* v1.9.1: 预览独立卡片同样参与主题（hljs 配色选择器已覆盖） */
				for (const el of document.querySelectorAll(".fexp-panel, .fexp-preview-card")) {
					el.setAttribute("data-fexp-theme", dark ? "dark" : "light");
				}
			}

			ctx.effect(function globalOverlayHandlers() {
				const onDocClick = (ev) => {
					if (helpEl && !helpEl.contains(ev.target)) { closeHelp(); }
					if (menuEl && !menuEl.contains(ev.target) && (!inputHostEl || !inputHostEl.contains(ev.target))) {
						closeAllOverlays();
					}
				};
				const onDocKey = (ev) => {
					const mod = ev.ctrlKey || ev.metaKey;
					const tag = ev.target && ev.target.tagName;
					if (ev.key === "Escape") {
						if (helpEl) { closeHelp(); ev.preventDefault(); return; }
						if (menuEl || inputHostEl) { closeAllOverlays(); ev.preventDefault(); return; }
						if (state.search.active) { closeSearch(); ev.preventDefault(); return; }
						if (state.editing) { closeEditor(); renderPreview(); ev.preventDefault(); return; }
						if (state.preview) { closePreview(); ev.preventDefault(); return; }
						return;
					}
					if (ev.key === "?" && tag !== "INPUT" && tag !== "TEXTAREA") {
						ev.preventDefault();
						toggleHelp();
						return;
					}
					if (mod && (ev.key === "f" || ev.key === "F")) {
						ev.preventDefault();
						focusSearch();
						return;
					}
					if (mod && ev.key === "]") { ev.preventDefault(); cycleMode(1); return; }
					if (mod && ev.key === "[") { ev.preventDefault(); cycleMode(-1); return; }
				};
				document.addEventListener("click", onDocClick, true);
				document.addEventListener("keydown", onDocKey, true);
				return () => {
					/* v1.7.2: close any open overlay before detaching the global
					   listeners — otherwise a context menu / inline input left open
					   at plugin unload would linger in document.body forever */
					closeAllOverlays();
					closeHelp();
					document.removeEventListener("click", onDocClick, true);
					document.removeEventListener("keydown", onDocKey, true);
				};
			});
			ctx.effect(function themeWatcher() {
				themeNow();
				const mo = new MutationObserver(themeNow);
				mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
				let mq = null;
				const onMq = () => themeNow();
				if (typeof matchMedia === "function") {
					mq = matchMedia("(prefers-color-scheme: dark)");
					if (mq.addEventListener) mq.addEventListener("change", onMq);
				}
				return () => {
					mo.disconnect();
					if (mq && mq.removeEventListener) mq.removeEventListener("change", onMq);
				};
			});

			ctx.effect(function followLoop() {
				const id = window.setInterval(() => {
					/* v1.6: lazily pick up ui-beautify's dock host and re-sync the
					   mode/open state (subscription covers immediate changes; this
					   periodic pass covers load-order and engine-startup races). */
					ensureDock();
					/* v1.9.7: 自愈——settings seat 重挂载时重建 observer（MutationObserver
					   覆盖即时变化，此轮询兜底） */
					watchSettingsSeat();
					if (dockApiRef !== undefined) onDockChange();
					if (state.dock === "middle" && panelEl && !hostPanelActive) {
						const w = sidebarWidth();
						panelEl.style.left = w + "px";
					}
					/* v1.7.1: while ui-beautify is dragging (dock-card handle, plugin
					   panel edge, float windows…), skip workspace follow and tree
					   rebuilds — a mid-drag re-render is what made resizes janky. */
					const dragging = (() => {
						try {
							const root = document.querySelector('[data-slot="root"]');
							return root !== null && root.firstElementChild !== null && root.firstElementChild.hasAttribute("data-vsc-dragging");
						} catch (err) { return false; }
					})();
					if (dragging) return;
					/* v1.7.2: never stack workspace probes — if the previous tick's
					   wsRoot call is still pending (slow RPC), skip this round. */
					if (wsProbeBusy) return;
					wsProbeBusy = true;
					ensureWsList().then(() => {
						const domPath = probeActiveWorkspacePath();
						if (domPath !== null) {
							if (declinedFollowRoot !== null && domPath !== declinedFollowRoot) declinedFollowRoot = null;
							switchRoot(domPath);
							wsProbeBusy = false;
							return;
						}
						remote().wsRoot().then((res) => {
							const candidate = res && typeof res.root === "string" && res.root !== "" ? res.root : null;
							if (typeof res.platform === "string" && res.platform !== "") state.platform = res.platform;
							if (candidate && candidate !== state.root) {
								if (declinedFollowRoot !== null && candidate !== declinedFollowRoot) declinedFollowRoot = null;
								switchRoot(candidate);
							}
						}).catch(() => {}).finally(() => { wsProbeBusy = false; });
					}).catch(() => { wsProbeBusy = false; });
				}, POLL_MS);
				/* v1.5.6: keep a floating panel inside the viewport when the window resizes. */
				const onResize = () => {
					if (state.dock === "float" && panelEl && state.pos && !hostPanelActive) {
						const p = clampFloatPos(state.pos.left, state.pos.top);
						state.pos = p;
						panelEl.style.left = p.left + "px";
						panelEl.style.top = p.top + "px";
					}
					/* v1.9.1: 最大化预览卡片跟随视口 */
					if (previewCardMax && previewCardEl) {
						previewCardEl.style.left = "8px";
						previewCardEl.style.top = "8px";
						previewCardEl.style.width = (window.innerWidth - 16) + "px";
						previewCardEl.style.height = (window.innerHeight - 16) + "px";
					}
					/* v1.9.16: 缩放 chrome 为独立层，窗口尺寸变化后跟随表面矩形 */
					if (previewCardChrome !== null) previewCardChrome.update();
					if (panelChrome !== null) {
						syncPanelChrome();
						panelChrome.update();
					}
				};
				window.addEventListener("resize", onResize);
				return () => {
					window.clearInterval(id);
					window.removeEventListener("resize", onResize);
					if (settingsMo !== null) { settingsMo.disconnect(); settingsMo = null; settingsSeat = null; }
				};
			});

			ctx.effect(function registerSlots() {
				const slotsService = slots;
				/* v1.7: with ui-beautify's dock host present the header button is
				   redundant (the "插件面板" entry takes over) — render null then.
				   Without it the classic button stays, as the standalone fallback. */
				function HeaderEntry() {
					const [, setV] = React.useState(0);
					React.useEffect(() => {
						const fn = () => setV((v) => v + 1);
						entryListeners.add(fn);
						return () => { entryListeners.delete(fn); };
					}, []);
					if (dockApiRef !== undefined) return null;
					return React.createElement("button", {
						ref: mountButton("header"),
						onClick: toggleOpen,
						className: "fexp-toggle fexp-toggle-wide",
						title: "文件浏览器（Ctrl+F 搜索 · ? 帮助）"
					}, React.createElement("span", {
						className: "fexp-pbtn-ic",
						dangerouslySetInnerHTML: { __html: makeIcon("folder", 13) }
					}), " 文件");
				}
				return slotsService.inject("conversation.session.header.utilities", () => slotsService.register(
					{ name: "conversation.session.header.utilities", id: "file-explorer-main", order: 10, label: "文件浏览器" },
					() => React.createElement(HeaderEntry)
				));
			});
			ctx.effect(function registerOverlay() {
				const slotsService = slots;
				return slotsService.inject("shell.overlay", () => slotsService.register(
					{ name: "shell.overlay", id: "file-explorer-panel", order: 0 },
					() => React.createElement("div", { ref: mountHost, className: "fexp-host" })
				));
			});

			/* v1.6: dock host integration — pick up ui-beautify's `dock` service
			   when present (it may mount before or after us; the follow loop also
			   re-checks) and own the panel registration + subscription cleanup. */
			ensureDock();
			/* v1.9.7: 初始设置状态检测（seat 可能在插件加载前就已渲染） */
			watchSettingsSeat();
			ctx.effect(function dockIntegrationCleanup() {
				return () => {
					if (dockUnsub !== null) { try { dockUnsub(); } catch (err) {} dockUnsub = null; }
					if (dockDispose !== null) { try { dockDispose(); } catch (err) {} dockDispose = null; }
					dockApiRef = undefined;
					hostMode = false;
					hostPanelActive = false;
					bumpEntryListeners();
				};
			});
		}

		const inject = ["slots", "remote"];

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
