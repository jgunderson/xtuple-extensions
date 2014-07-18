/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true, XT:true, _:true, describe:true, it:true, before:true */

/*
 * olapdata tests the olapdata route running generic queries for the sum over all years checking
 * that some data is returned.  It runs as a separate script (sudo npm run-script test-bi_open)
 * as the current directory must be set to node-datasource so it find config.js and the
 * the rest-keys folder.  Also, the initial query can take a while build a cube in memory so the
 * timeout is set to 5000.  The BI Server must be running.  And the datasource must be running as
 * the BI server uses the REST API.
 * 
 */

require("../../../../xtuple/node-datasource/xt");
var options = require("../../../../xtuple/node-datasource/lib/options");

// build X with the options needed by olapcatalog
X.setup(options);

var assert = require("chai").assert,
  olapRoute = require("../../../source/bi_open/node-datasource/routes/olapdata"),
  login = require("../../lib/login_data");

require("../../../source/bi_open/node-datasource/olapcatalog/olapcatalog");
require("../../../source/bi_open/node-datasource/olapcatalog/olapsource");

(function () {
  "use strict";

  describe('The olapdata route', function () {
    
    it('should execute query to opportunities cube returning data', function (done) {
      // Mock the request object
      var req = {
          query: {
            mdx: "SELECT NON EMPTY {[Measures].[Amount, Opportunity Gross]} ON COLUMNS," +
              " NON EMPTY {Hierarchize({[Issue Date.Calendar].[All Years]})} ON ROWS" +
              " FROM [CROpportunity]"
          },
          headers: {host: ""},
          session: {passport: {user: {organization: login.data.org, username: login.data.username}}}
        },
        // Mock the response object
        res = {
          responseText: {},
          writeHead: function () {},
          write: function (result) {
            this.responseText = JSON.parse(result);
          },
          end: function () {
            assert.isNotNull(this.responseText.data[0]["[Measures].[Amount, Opportunity Gross]"]);
            done();
          }
        },
        addressTokens = [];
      addressTokens = login.data.webaddress.split("//");
      req.headers.host = addressTokens[1] || "localhost:8842";
      olapRoute.queryOlapCatalog(req, res);
    });
    
    it('should execute query to opportunities & bookings cube returning data', function (done) {
      // Mock the request object
      var req = {
          query: {
            mdx: "SELECT NON EMPTY {[Measures].[Amount, Opportunity Gross]} ON COLUMNS," +
              " NON EMPTY {Hierarchize({[Issue Date.Calendar].[All Years]})} ON ROWS" +
              " FROM [CROpportunityAndOrder]"
          },
          headers: {host: ""},
          session: {passport: {user: {organization: login.data.org, username: login.data.username}}}
        },
        // Mock the response object
        res = {
          responseText: {},
          writeHead: function () {},
          write: function (result) {
            this.responseText = JSON.parse(result);
          },
          end: function () {
            assert.isNotNull(this.responseText.data[0]["[Measures].[Amount, Order Gross]"]);
            done();
          }
        },
        addressTokens = [];
      addressTokens = login.data.webaddress.split("//");
      req.headers.host = addressTokens[1] || "localhost:8842";
      olapRoute.queryOlapCatalog(req, res);
    });
    
    it('should execute query to opportunities forecast cube returning data', function (done) {
      // Mock the request object
      var req = {
          query: {
            mdx: "SELECT NON EMPTY {[Measures].[Amount, Opportunity Forecast]} ON COLUMNS," +
              " NON EMPTY {Hierarchize({[Fiscal Period.Fiscal Period CL].[All Years]})} ON ROWS" +
              " FROM [CROpportunityForecast]"
          },
          headers: {host: ""},
          session: {passport: {user: {organization: login.data.org, username: login.data.username}}}
        },
        // Mock the response object
        res = {
          responseText: {},
          writeHead: function () {},
          write: function (result) {
            this.responseText = JSON.parse(result);
          },
          end: function () {
            assert.isNotNull(this.responseText.data[0]["[Measures].[Amount, Opportunity Forecast]"]);
            done();
          }
        },
        addressTokens = [];
      addressTokens = login.data.webaddress.split("//");
      req.headers.host = addressTokens[1] || "localhost:8842";
      olapRoute.queryOlapCatalog(req, res);
    });
    
    it('should execute query to quotes cube returning data', function (done) {
      // Mock the request object
      var req = {
          query: {
            mdx: "SELECT NON EMPTY {[Measures].[Amount, Quote Gross]} ON COLUMNS," +
              " NON EMPTY {Hierarchize({[Issue Date.Calendar].[All Years]})} ON ROWS" +
              " FROM [CRQuote]"
          },
          headers: {host: ""},
          session: {passport: {user: {organization: login.data.org, username: login.data.username}}}
        },
        // Mock the response object
        res = {
          responseText: {},
          writeHead: function () {},
          write: function (result) {
            this.responseText = JSON.parse(result);
          },
          end: function () {
            assert.isNotNull(this.responseText.data[0]["[Measures].[Amount, Quote Gross]"]);
            done();
          }
        },
        addressTokens = [];
      addressTokens = login.data.webaddress.split("//");
      req.headers.host = addressTokens[1] || "localhost:8842";
      olapRoute.queryOlapCatalog(req, res);
    });
     
  });
}());

