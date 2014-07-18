/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XT:true, XM:true, Backbone:true, */

(function () {
  "use strict";

  /**
    @class
    @extends Backbone.Model
  */
  XM.Analytic = Backbone.Model.extend({

    url: '/queryOlap'
  });

  // ..........................................................
  // COLLECTIONS
  //

  /**
    @class
    @extends Backbone.Collection
  */
  XM.AnalyticCollection = Backbone.Collection.extend({

    model: XM.Analytic,
    url: '/queryOlap',
    queryComplete: true,
    
    sync : function (method, model, options) {
      var results;

      function success(result) {
        results = result;
        if (options.success) {
          options.success(result);
        }
      }

      function error(result) {
        results = result;
        if (options.error) {
          options.error(result);
        }
      }

      switch (method) {
      case 'read':
        var that = this;
        this.setQueryComplete(false);
        XT.DataSource.callRoute(
          "queryOlap?mdx=" + options.data.mdx,
          {},
          {success: function (result) {
              that.setQueryComplete(true);
              results = result;
              if (options.success) {
                options.success(model, result, options);
              }
            },
           error: function (result) {
              that.setQueryComplete(true);
              results = result;
              if (options.error) {
                options.error(model, result, options);
              }
            }
           }
          );
        return;
        
      default:
        if (options.error) {
          options.error("only read method is implemented");
        }
        return;
      }
    },
    
    getQueryComplete: function () {
      return this.queryComplete;
    },
    
    setQueryComplete: function (value) {
      this.queryComplete = value;
    }
    
  });
}());
