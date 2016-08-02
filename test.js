'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var matter = require('parser-front-matter');
var loader = require('assemble-loader');
var vfs = require('base-fs');
var templates = require('templates');
var middleware = require('./');
var app;

describe('middleware-rename-file', function() {
  beforeEach(function() {
    app = templates();
    app.use(loader());
    app.use(vfs());
    app.create('page', 'pages');
    app.engine('md', require('engine-base'));
    app.onLoad(/./, function(view, next) {
      matter.parse(view, next);
    });
  });

  describe('main export', function() {
    it('should export a function', function() {
      assert.equal(typeof middleware, 'function');
    });

    it('should expose a `.rename` method', function() {
      assert.equal(typeof middleware, 'function');
    });

    it('should expose a `.renameFile` method', function() {
      assert.equal(typeof middleware, 'function');
    });
  });

  describe('plugin/middleware', function() {
    it('should rename a file based on front matter', function(cb) {
      app.use(middleware);
      app.pages('fixtures/*.md', {cwd: __dirname});

      app.render('dirname.md', function(err, view) {
        if (err) return cb(err);
        assert.equal(view.dirname, path.resolve('foo'));
        cb();
      });
    });

    it('should rename a file based on file.data', function(cb) {
      app.use(middleware);
      var view = {
        content: '...',
        data: {
          rename: {
            dirname: 'whatever',
            stem: 'foo',
            extname: 'baz',
          }
        }
      };

      app.page('basename.md', view, function(err, page) {
        if (err) return cb(err);
        assert.equal(page.dirname, path.resolve('whatever'));
        assert.equal(page.stem, 'foo');
        assert.equal(page.extname, '.baz');
        assert.equal(page.basename, 'foo.baz');
        cb();
      });
    });

    it('should support an empty string for extname', function(cb) {
      app.use(middleware);
      var view = {
        content: '...',
        data: {
          rename: {
            dirname: 'whatever',
            stem: 'foo',
            extname: '',
          }
        }
      };

      app.page('basename.md', view, function(err, page) {
        if (err) return cb(err);
        assert.equal(page.dirname, path.resolve('whatever'));
        assert.equal(page.stem, 'foo');
        assert.equal(page.extname, '');
        assert.equal(page.basename, 'foo');
        cb();
      });
    });
  });

  describe('.renameFile', function() {
    it('should rename a file based on front matter', function(cb) {
      app.onLoad(/\.md$/, middleware.renameFile(app));
      app.pages('fixtures/*.md', {cwd: __dirname});

      app.render('dirname.md', function(err, view) {
        if (err) return cb(err);
        assert.equal(view.dirname, path.resolve('foo'));
        cb();
      });
    });

    it('should rename a file based on file.data', function(cb) {
      app.onLoad(/\.md$/, middleware.renameFile(app));
      var view = {
        content: '...',
        data: {
          rename: {
            dirname: 'whatever',
            stem: 'foo',
            extname: 'baz',
          }
        }
      };

      app.page('basename.md', view, function(err, page) {
        if (err) return cb(err);
        assert.equal(page.dirname, path.resolve('whatever'));
        assert.equal(page.stem, 'foo');
        assert.equal(page.extname, '.baz');
        assert.equal(page.basename, 'foo.baz');
        cb();
      });
    });

    it('should support an empty string for extname', function(cb) {
      app.onLoad(/\.md$/, middleware.renameFile(app));
      var view = {
        content: '...',
        data: {
          rename: {
            dirname: 'whatever',
            stem: 'foo',
            extname: '',
          }
        }
      };

      app.page('basename.md', view, function(err, page) {
        if (err) return cb(err);
        assert.equal(page.dirname, path.resolve('whatever'));
        assert.equal(page.stem, 'foo');
        assert.equal(page.extname, '');
        assert.equal(page.basename, 'foo');
        cb();
      });
    });
  });

  describe('.rename', function() {
    it('should rename file.path', function() {
      var file = app.view('foo.md', {content: '...'});
      assert.equal(file.path, 'foo.md');
      middleware.rename(file, 'path', path.resolve(file.path));
      assert.equal(file.path, path.resolve('foo.md'));
    });

    it('should rename file.basename', function() {
      var file = app.view('foo.md', {content: '...'});
      assert.equal(file.basename, 'foo.md');
      middleware.rename(file, 'basename', 'bar.md');
      assert.equal(file.path, 'bar.md');
    });

    it('should rename file.extname', function() {
      var file = app.view('foo.md', {content: '...'});
      assert.equal(file.extname, '.md');
      middleware.rename(file, 'extname', '.html');
      assert.equal(file.path, 'foo.html');
    });

    it('should rename file.stem', function() {
      var file = app.view('foo.md', {content: '...'});
      assert.equal(file.stem, 'foo');
      middleware.rename(file, 'stem', 'bar');
      assert.equal(file.path, 'bar.md');
    });

    it('should rename file.relative', function() {
      var file = app.view('foo.md', {content: '...'});
      assert.equal(file.relative, 'foo.md');
      middleware.rename(file, 'relative', 'baz/foo.md');
      assert.equal(file.relative, 'baz/foo.md');
    });

    it('should rename file.path', function() {
      var file = app.view('foo.md', {content: '...'});
      assert.equal(file.path, 'foo.md');
      middleware.rename(file, 'path', 'baz/foo.md');
      assert.equal(file.path, path.resolve('baz/foo.md'));
    });
  });
});
