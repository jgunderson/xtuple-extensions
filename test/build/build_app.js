/*jshint trailing:true, white:true, indent:2, strict:true, curly:true,
  immed:true, eqeqeq:true, forin:true, latedef:true,
  newcap:true, noarg:true, undef:true */
/*global XT:true, describe:true, it:true, require:true, __dirname:true, after:true */

var buildAll = require('../../../xtuple/scripts/lib/build_all'),
  _ = require('underscore'),
  assert = require('chai').assert,
  path = require('path');

(function () {
  "use strict";
  describe('The database build tool', function () {
    this.timeout(100 * 60 * 1000);

    var loginData = require(path.join(__dirname, "../lib/login_data.js")).data,
      databaseName = loginData.org,
      extensions = ["time_expense"],
      datasource = require('../../../xtuple/node-datasource/lib/ext/datasource').dataSource,
      config = require(path.join(__dirname, "../../../xtuple/node-datasource/config.js")),
      creds = config.databaseServer;

    creds.host = creds.hostname; // adapt our lingo to node-postgres lingo

    it('should build without error on a brand-new database', function (done) {
      buildAll.build({
        database: databaseName,
        initialize: true,
        populateData: true,
        source: path.join(__dirname, "../../../xtuple/foundation-database/postbooks_demo_data.sql")
      }, function (err, res) {
        assert.isNull(err);
        done();
      });
    });

    _.each(extensions, function (extension) {
      it('should build the ' + extension + ' extension', function (done) {
        buildAll.build({
          database: databaseName,
          extension: path.join(__dirname, "../../source", extension)
        }, function (err, res) {
          assert.isNull(err);
          done();
        });
      });
    });

    it('should grant all extensions to the user', function (done) {
      var sql = "insert into xt.usrext (usrext_usr_username, usrext_ext_id) " +
        "select $1, ext_id " +
        "from xt.ext " +
        "left join xt.usrext on ext_id = usrext_ext_id and usrext_usr_username = $1 " +
        "where usrext_id is null;";

      creds.database = databaseName;
      creds.parameters = [loginData.username];
      datasource.query(sql, creds, function (err, res) {
        assert.isNull(err);
        done();
      });
    });

    it('should grant all privileges to the user', function (done) {
      var sql = "insert into usrpriv (usrpriv_username, usrpriv_priv_id) " +
        "select $1, priv_id " +
        "from priv " +
        "left join usrpriv on priv_id = usrpriv_priv_id and usrpriv_username = $1 " +
        "where usrpriv_id is null";

      creds.database = databaseName;
      creds.parameters = [loginData.username];
      datasource.query(sql, creds, function (err, res) {
        assert.isNull(err);
        done();
      });
    });
  });
}());


