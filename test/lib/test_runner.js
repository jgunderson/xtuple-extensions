/*jshint trailing:true, white:true, indent:2, strict:true, curly:true,
  immed:true, eqeqeq:true, forin:true, latedef:true,
  newcap:true, noarg:true, undef:true */
/*global XT:true, XM:true, XV:true, exports:true, describe:true, it:true,
require:true, __dirname:true, console:true */

(function () {
  "use strict";

  var fs = require('fs'),
    _ = require("underscore"),
    path = require('path'),
    extDirs = _.filter(fs.readdirSync(path.join(__dirname, "..")), function (filename) {
      return fs.statSync(path.join(__dirname, "..", filename)).isDirectory() &&
        !_.contains(["lib", "build"], filename);
    }),
    specFiles = _.flatten(_.map(extDirs, function (dir) {
      var specDir = path.join(__dirname, "..", dir, "specs"),
        files = _.filter(fs.readdirSync(specDir), function (filename) {
          // filter out .swp files, etc.
          return path.extname(filename) === '.js';
        }),
        filePaths = _.map(files, function (filename) {
          return path.join(__dirname, "..", dir, "specs", filename);
        });

      return filePaths;
    })),
    specs = _.map(specFiles, function (specFile) {
      var fileContents = require(specFile);
      fileContents.spec.loginDataPath = path.join(__dirname, "login_data.js");
      return fileContents;
    }),
    runSpec = require("../../../xtuple/test/lib/runner_engine").runSpec;

  _.each(specs, runSpec);

}());

