var FEAT = (function (nil) {
  'use strict';

  var is_own = function (o, key) { return Object.prototype.hasOwnProperty.call(o, key); };
  var freeze_object = Object.freeze || function (o) { return o; };
  var toss = function () { return Math.random() < 0.5; };

  var map_node = function (key, val, lo, hi) {
    var count = map_count(lo) + map_count(hi) + (key !== nil ? 1 : 0);
    return freeze_object([key, val, lo, hi, count]);
  };

  var map_key = function (node) { return node[0]; };
  var map_val = function (node) { return node[1]; };
  var map_lo = function (node) { return node[2]; };
  var map_hi = function (node) { return node[3]; };
  var map_count = function (node) { return node === nil ? 0 : node[4]; };
  var map_with_lo_hi = function (node, lo, hi) { return map_node(map_key(node), map_val(node), lo, hi); };
  var map_with_lo = function (node, lo) { return map_with_lo_hi(node, lo, map_hi(node)); };
  var map_with_hi = function (node, hi) { return map_with_lo_hi(node, map_lo(node), hi); };

  var map_has = function (node, key) {
    if (node === nil)
      return false;
    if (key === map_key(node))
      return true;
    return key < map_key(node) ? map_has(map_lo(node), key) : map_has(map_hi(node), key);
  };

  var map_get = function (node, key, fail) {
    if (node === nil)
      return fail;
    if (key === map_key(node))
      return map_val(node);
    return key < map_key(node) ? map_get(map_lo(node), key, fail) : map_get(map_hi(node), key, fail);
  };

  var map_put = function (node, key, val) {
    if (node === nil)
      return map_node(key, val);
    if (key === map_key(node) && val === map_val(node))
      return node;
    var lo = map_lo(node), hi = map_hi(node);
    if (key === map_key(node))
      return map_node(key, val, lo, hi);
    var sub;
    if (key < map_key(node)) {
      sub = map_put(lo, key, val);
      return sub === lo ? node : map_with_lo(node, sub);
    }
    sub = map_put(hi, key, val);
    return sub === hi ? node : map_with_hi(node, sub);
  };

  var map_rm = function (node, key) {
    if (node === nil)
      return nil;
    var lo = map_lo(node), hi = map_hi(node);
    if (key === map_key(node))
      return !lo || !hi ? lo || hi : (toss() ? map_rm_lo(node, key) : map_rm_hi(node, key));
    var sub;
    if (key < map_key(node)) {
      sub = map_rm(lo, key);
      return sub === lo ? node : map_with_lo(node, sub);
    }
    sub = map_rm(hi, key);
    return sub === hi ? node : map_with_hi(node, sub);
  };

  var map_rm_lo = function (node, key) {
    for (var lo = map_lo(node); map_hi(lo) !== nil; lo = map_hi(lo)) ;
    return map_with_lo_hi(lo, map_rm(map_lo(node), map_key(lo)), map_hi(node));
  };

  var map_rm_hi = function (node, key) {
    for (var hi = map_hi(node); map_lo(hi) !== nil; hi = map_lo(hi)) ;
    return map_with_lo_hi(hi, map_lo(node), map_rm(map_hi(node), map_key(hi)));
  };

  var map_print = function (node) {
    if (node === nil)
      return '-';
    return '(' + map_print(map_lo(node)) + ' ' + map_key(node) + ' ' + map_print(map_hi(node)) + ')';
  };

  var Map = function (node) {
    if (!is_map(this))
      return new Map(node);
    this.count = function () { return map_count(node); };
    this.contains = function (key) { return map_has(node, key); };
    this.get = function (key, fail) { return map_get(node, key, fail); };
    this.assoc = function (key, val) { return create_map_if_new(this, node, map_put(node, key, val)); };
    this.dissoc = function (key) { return create_map_if_new(this, node, map_rm(node, key)); };
    this.toString = function () { return map_print(node); };
    freeze_object(this);
  };

  var is_map = function (x) { return x instanceof Map; };

  var create_map_if_new = function (map, node, new_node) {
    return node === new_node ? map : Map(new_node);
  };

  var create_map = function (obj) {
    var key, map = Map();
    for (key in obj)
      if (is_own(obj, key))
        map = map.assoc(key, obj[key]);
    return map;
  };

  var create_vec = function (arr) {
    return arr;
  };

  return freeze_object({
    map: create_map,
    vector: create_vec
  });
}());
