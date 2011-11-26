var COFY = (function (nil) {
  'use strict';

  function objectHasOwnProperty(o, key) {
    return Object.prototype.hasOwnProperty.call(o, key);
  }

  function syntaxError(message) {
    throw { name: 'SyntaxError', message: message || 'An error' };
  }

  function runtimeError(message) {
    throw { name: 'RuntimeError', message: message || 'An error' };
  }

  var createObjectFromPrototype = Object.create || function (o) {
    function F() {}
    F.prototype = o || Object.prototype;
    return new F();
  };
  var sealObject = Object.seal || function (o) {};
  var freezeObject = Object.freeze || function (o) {};
  var freezeObjectProperty = Object.defineProperty  && Object.freeze && function (obj, key) {
    Object.defineProperty(obj, key, {
      writable: false,
      enumerable: true,
      configurable: false
    });
  } || function () {};
  var defineFrozenProperty = Object.defineProperty && Object.freeze && function (obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      writable: false,
      enumerable: true,
      configurable: false
    });
  } || function (obj, key, value) {
    if (objectHasOwnProperty(obj, key))
      runtimeError('Redefining ' + name);
    obj[key] = value;
  };

  var symbols = {}, multipart = RegExp('^[^/]+(/[^/]+)+$');

  function Symbol(name) {
    var names;
    if (!isSymbol(this))
      return new Symbol(name);
    if (objectHasOwnProperty(symbols, name))
      return symbols[name];
    if (multipart.test(name)) {
      names = name.split('/');
      this.parts = Array(names.length);
      for (var i = 0; i < names.length; i++)
        this.parts[i] = isNaN(names[i]) ? names[i] : +names[i];
      freezeObject(this.parts);
    }
    this.name = name;
    freezeObject(this);
    symbols[name] = this;
  }

  function Cons(head, tail) {
    if (!isCons(this))
      return new Cons(head, tail);
    this.head = head;
    this.tail = tail;
    freezeObject(this);
  }

  function Var(value) {
    if (!isVar(this))
      return new Var(value);
    this.value = value;
    sealObject(this);
  }

  function Syntax(compile) {
    if (!isSyntax(this))
      return new Syntax(compile);
    this.compile = compile;
    freezeObject(this);
  }

  function isString(x) { return typeof x === 'string'; }
  function isFunction(x) { return typeof x === 'function'; }
  function isSymbol(x) { return x instanceof Symbol; }
  function isCons(x) { return x instanceof Cons; }
  function isVar(x) { return x instanceof Var; }
  function isSyntax(x) { return x instanceof Syntax; }

  var parse = (function () {
    var token_actions, escape_chars, tokens, index;

    function read_expr() {
      var token = read_token();
      if (objectHasOwnProperty(token_actions, token))
        return token_actions[token]();
      if (token.charAt(0) === '"')
        return get_string(token);
      return isNaN(token) ? Symbol(token) : +token;
    }

    function read_seq() {
      if (index >= tokens.length)
        return null;
      var expr = read_expr();
      return Cons(expr, read_seq());
    }

    function read_list() {
      if (follows(')'))
        return null;
      var expr = read_expr();
      if (follows(':') && match(':'))
        return Cons(expr, read_expr());
      return Cons(expr, read_list());
    }

    function follows(token) {
      return index < tokens.length && tokens[index] === token;
    }

    function match(token) {
      if (read_token() !== token)
        syntaxError('Expected "' + token + '"');
      return true;
    }

    function read_token() {
      if (index >= tokens.length)
        syntaxError('Expected more');
      return tokens[index++];
    }

    function get_string(s) {
      s = s.replace(/^"|"$/g, '').replace(/\\([\\"'])/g, '$1');
      for (var key in escape_chars)
        if (objectHasOwnProperty(escape_chars, key))
          s = s.replace(key, escape_chars[key]);
      return s;
    }

    function tokenize(s) {
      return s.match(/'|\(|\)|[^\s'()"]+|"([^\\]|\\.)*?"|"/g);
    }

    escape_chars = { '\\n': '\n', '\\r': '\r', '\\t': '\t' };
    token_actions = {
      '"': function () { syntaxError('Unclosed string'); },
      ')': function () { syntaxError('Unexpected ")"'); },
      "'": function () {
        return Cons(Symbol('quote'), Cons(read_expr(), null));
      },
      '(': function () {
        var expr = read_list();
        match(')');
        return expr;
      }
    };
    return function (s) {
      tokens = tokenize(s);
      index = 0;
      var expr = read_seq();
      if (index < tokens.length)
        syntaxError('Trailing characters');
      return expr;
    };
  }());

  var print = (function () {

    function print(s_expr) {
      if (isString(s_expr))
        return encode_string(s_expr);
      if (isSymbol(s_expr))
        return s_expr.name;
      if (s_expr === null || isCons(s_expr))
        return print_list(s_expr);
      return '' + s_expr;
    }

    function print_list(list) {
      var strings = [], rest;
      for (rest = list; isCons(rest); rest = rest.tail)
        strings.push(print(rest.head));
      var tail = rest === null ? '' : ' : ' + print(rest);
      return '(' + strings.join(' ') + tail + ')';
    }

    function encode_string(s) {
      s = s.replace(/([\\"])/g, '\\$1');
      for (var key in escape_chars)
        if (objectHasOwnProperty(escape_chars, key))
          s = s.replace(key, escape_chars[key]);
      return '"' + s + '"';
    }

    var escape_chars = { '\n': '\\n', '\r': '\\r', '\t': '\\t' };

    return print;
  }());

  var create_global_env = (function () {

    function list_to_array(list) {
      var values = [];
      for (var rest = list; isCons(rest); rest = rest.tail)
        values.push(rest.head);
      return values;
    }

    function swap(variable, value) {
      var v = variable.value;
      variable.value = value;
      return v;
    }

    function equal(a, b) {
      return a === b || isCons(a) && isCons(b) &&
        equal(a.head, b.head) && equal(a.tail, b.tail);
    }

    function sum() {
      var sum = 0;
      for (var i = 0; i < arguments.length; i++)
        sum += arguments[i];
      return sum;
    }

    function product() {
      var product = 1;
      for (var i = 0; i < arguments.length && product !== 0; i++)
        product *= arguments[i];
      return product;
    }

    function check_array_pairs(array, test_adjacent) {
      for (var i = 1; i < array.length; i++)
        if (!test_adjacent(array[i - 1], array[i]))
          return false;
      return true;
    }

    var lower_than = function (a, b) { return a < b; };
    var greater_than = function (a, b) { return a > b; };
    var lower_than_or_equal = function (a, b) { return a <= b; };
    var greater_than_or_equal = function (a, b) { return a >= b; };
    var primitive_form_names = [ 'quote', 'fn', 'if', 'def', 'do' ];
    var math_names = [
      'abs', 'min', 'max', 'random', 'round', 'floor', 'ceil', 'sqrt', 'pow', 'exp', 'log',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'PI', 'E'
    ];
    var builtins = {
      'nil': nil,
      'nil?': function (x) { return x === nil; },
      'true': true,
      'false': false,
      'string?': isString,
      'fn?': isFunction,
      'symbol?': isSymbol,
      'cons': function (a, b) { return Cons(a, b); },
      'cons?': isCons,
      'first': function (x) { return x.head; },
      'rest': function (x) { return x.tail; },
      'var': Var,
      'var?': isVar,
      'deref': function (x) { return x.value; },
      'swap!': swap,
      'apply': function (f, args) { return f.apply({}, list_to_array(args)); },
      '.apply': function (o, f, args) { return o[f].apply(o, list_to_array(args)); },
      '.call': function (o, f) { return o[f].apply(o, Array.prototype.slice.call(arguments, 2)); },
      '+': function () { return sum.apply(null, arguments); },
      '-': function (a, b) { return arguments.length === 1 ? -a : a - b; },
      '*': function (a, b) { return product.apply(null, arguments); },
      '/': function (a, b) { return a / b; },
      'remainder': function (a, b) { return a % b; },
      '<': function () { return check_array_pairs(arguments, lower_than); },
      '>': function () { return check_array_pairs(arguments, greater_than); },
      '<=': function () { return check_array_pairs(arguments, lower_than_or_equal); },
      '>=': function () { return check_array_pairs(arguments, greater_than_or_equal); },
      '=': function (a, b) { return equal(a, b); },
      'identical?': function (a, b) { return a === b; },
      '.': function (o, field) { return isSymbol(field) ? o[field.name] : o[field]; },
      'set!': function (o, field, value) { o[isSymbol(field) ? field.name : field] = value; },
      'array': list_to_array
    };
    for (var i = 0; i < primitive_form_names.length; i++)
      builtins[primitive_form_names[i]] = nil;
    for (var i = 0; i < math_names.length; i++)
      builtins[math_names[i]] = Math[math_names[i]];
    freezeObject(builtins);

    return function (external) {
      var env = {};
      for (var key in builtins)
        if (objectHasOwnProperty(builtins, key))
          defineFrozenProperty(env, key, builtins[key]);
      if (external)
        for (var key in external)
          if (objectHasOwnProperty(external, key))
            defineFrozenProperty(env, key, external[key]);
      return env;
    };
  }());

  var compile = (function () {
    var syntax_bindings = {
      'quote': Syntax(function (s_expr) { return s_expr.head; }),
      'fn': Syntax(compile_fn),
      'if': Syntax(compile_if),
      'def': Syntax(compile_def),
      'do': Syntax(compile_do)
    };

    function evaluate(expr, env) {
      return isFunction(expr) ? expr(env) : expr;
    }

    function compile(s_expr) {
      if (isSymbol(s_expr))
        return compile_symbol(s_expr);
      if (!isCons(s_expr))
        return s_expr;
      return has_syntax_defined(s_expr.head) ? compile_syntax(s_expr) : compile_call(s_expr);
    }

    function compile_symbol(symbol) {
      return function (env) {
        if (symbol.parts)
          return compile_symbol_parts(symbol, env);
        if (!(symbol.name in env))
          runtimeError('Symbol "' + print(symbol) + '" not defined');
        return env[symbol.name];
      };
    }

    function compile_symbol_parts(symbol, obj) {
      var i, parts = symbol.parts, context;
      for (i = 0; i < parts.length; i++) {
        if (!(parts[i] in obj))
          runtimeError('Part "' + parts[i] + '" in "' + print(symbol) + '" not defined');
        context = obj;
        obj = obj[parts[i]];
      }
      return isFunction(obj) ? function () {
        return obj.apply(context, arguments);
      } : obj;
    }

    function has_syntax_defined(s_expr) {
      return isSymbol(s_expr) && isSyntax(syntax_bindings[s_expr.name]);
    }

    function compile_syntax(s_expr) {
      return syntax_bindings[s_expr.head.name].compile(s_expr.tail);
    }

    function compile_call(s_expr) {
      var expr = map(compile, s_expr), o = {};
      return function (env) {
        var fn = evaluate(expr.head, env), values = [];
        if (!isFunction(fn))
          runtimeError('Not a function: ' + print(s_expr.head));
        for (var rest = expr.tail; isCons(rest); rest = rest.tail)
          values.push(evaluate(rest.head, env));
        return fn.apply(o, values);
      };
    }

    function compile_fn(s_expr) {
      var names = s_expr.head, body = compile_do(s_expr.tail);
      return function (env) {
        return function () {
          return evaluate(body, bind_args(names, arguments, env));
        };
      };
    }

    function compile_if(s_expr) {
      var cond = compile(s_expr.head),
          t = compile(s_expr.tail.head),
          f = compile(s_expr.tail.tail.head);
      return function (env) {
        return evaluate(evaluate(cond, env) ? t : f, env);
      };
    }

    function compile_def(s_expr) {
      if (isCons(s_expr.head))
        return compile_def_fn(s_expr);
      var pairs = get_def_pairs(s_expr);
      return function (env) {
        for (var rest = pairs; isCons(rest); rest = rest.tail)
          define_binding(rest.head.head, rest.head.tail, env);
      };
    }

    function compile_def_fn(s_expr) {
      var fn = compile_fn(Cons(s_expr.head.tail, s_expr.tail));
      return function (env) {
        define_binding(s_expr.head.head.name, fn, env);
      };
    }

    function compile_do(s_expr) {
      var seq = map(compile, s_expr);
      return function (env) {
        for (var rest = seq; isCons(rest); rest = rest.tail)
          var res = evaluate(rest.head, env);
        return res;
      };
    }

    function bind_args(names, values, parent_env) {
      var env = createObjectFromPrototype(parent_env), i = 0;
      for (var rest = names; isCons(rest); rest = rest.tail)
        defineFrozenProperty(env, rest.head.name, i < values.length ? values[i++] : nil);
      if (rest)
        defineFrozenProperty(env, rest.name, array_tail_to_list(values, i));
      return env;
    }

    function array_tail_to_list(values, from) {
      var rest = null;
      for (var i = values.length - 1; i >= from; i--)
        rest = Cons(values[i], rest);
      return rest;
    }

    function define_binding(name, expr, env) {
      defineFrozenProperty(env, name, evaluate(expr, env));
    }

    function get_def_pairs(s_expr) {
      if (!s_expr)
        return null;
      var pair = Cons(s_expr.head.name, compile(s_expr.tail.head));
      return Cons(pair, get_def_pairs(s_expr.tail.tail));
    }

    function map(f, list) {
      return !list ? list : Cons(f(list.head), map(f, list.tail));
    }

    return function (s_expr) {
      var expr = compile_do(s_expr);
      return function (env) {
        return evaluate(expr, env || create_global_env());
      };
    };
  }());

  return {
    read: parse,
    print: print,
    compile: compile,
    eval: function (s_expr) { return compile(s_expr)(); },
    read_eval: function (s) { return compile(parse(s))(); },
    read_eval_print: function (s) { return print(compile(parse(s))()); },
    create: function (bindings) {
      var env = create_global_env(bindings);
      return {
        eval: function (s_expr) { return compile(s_expr)(env); },
        read_eval: function (s) { return compile(parse(s))(env); },
        read_eval_print: function (s) { return print(compile(parse(s))(env)); },
      }
    }
  };
}());
