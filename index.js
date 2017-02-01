'use strict';

var path = require('path');
var extend = require('extend-shallow');
var isObject = require('isobject');

module.exports = function(fn) {
  return function(file, next) {
    if (file.isRenamed || !filter(file, fn)) {
      next(null, file);
      return;
    }

    file.isRenamed = true;
    file.rename = function(key, val) {
      return rename(file, key, val);
    };

    var data = extend({}, file.data);
    if (data.rename === false) {
      next(null, file);
      return;
    }

    if (isObject(data.rename)) {
      for (var key in data.rename) {
        rename(file, key, data.rename[key]);
      }
    }

    next(null, file);
  };
};

function rename(file, key, val) {
  switch (key) {
    case 'dir':
    case 'dirname':
      file.dirname = path.resolve(file.base, val);
      break;
    case 'relative':
      file.path = path.resolve(file.base, path.resolve(val));
      break;
    case 'basename':
      file.basename = val;
      break;
    case 'name':
    case 'stem':
      file.stem = val;
      break;
    case 'ext':
    case 'extname':
      if (val && val.charAt(0) !== '.') {
        val = '.' + val;
      }
      file.extname = val;
      break;
    case 'path':
    default: {
      file.path = path.resolve(file.base, val);
      break;
    }
  }
}

/**
 * Expose rename function
 */

module.exports.rename = rename;

/**
 * Filter files
 */

function filter(file, fn) {
  if (typeof fn === 'function') {
    return fn(file);
  }
  return true;
}
