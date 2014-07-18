/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XT:true, XM:true, Backbone:true, _:true, console:true */

(function () {
  "use strict";

  /**
    @class

    @extends XM.Model
  */
  XM.UserBiChart = XM.Model.extend({
    /** @scope XM.UserBiChart.prototype */

    recordType: 'XM.UserBiChart',

    defaults: function () {
      return {
        username: XM.currentUser.get("username"),
        filter: "all"
      };
    }

  });

  /**
    @class

    @extends XM.Collection
  */
  XM.UserBiChartCollection = XM.Collection.extend({
    /** @scope XM.UserBiChartCollection.prototype */

    model: XM.UserBiChart,

    orderAttribute: {
      orderBy: [{
        attribute: "order"
      }]
    }

  });

}());
