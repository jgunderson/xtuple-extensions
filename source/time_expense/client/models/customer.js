/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XT:true, XM:true, Backbone:true, _:true, console:true */

(function () {
  "use strict";

  XT.extensions.timeExpense.initCustomerModels = function () {

    var _proto = XM.Customer.prototype,
      _bindEvents = _proto.bindEvents,
      _statusDidChange = _proto.statusDidChange,
      _specifiedSetReadOnly = function () {
        var spec = this.get("isSpecifiedRate");
        this.setReadOnly("billingRate", !spec);
        this.setReadOnly("billingCurrency", !spec);
      };

    XM.Customer = XM.Customer.extend({

      bindEvents: function () {
        _bindEvents.apply(this, arguments);
        this.on('change:isSpecifiedRate', this.isSpecifiedRateDidChange);
      },

      isSpecifiedRateDidChange: function () {
        var spec = this.get("isSpecifiedRate");
        if (spec) {
          this.set("billingRate", 0);
          this.set("billingCurrency", XT.baseCurrency());
        } else {
          this.set("billingRate", null);
          this.set("billingCurrency", null);
        }
        _specifiedSetReadOnly.apply(this);
      },

      statusDidChange: function () {
        _statusDidChange.apply(this, arguments);
        var K = XM.Model,
          status = this.getStatus();
        if (status === K.READY_NEW || status === K.READY_CLEAN) {
          _specifiedSetReadOnly.apply(this);
        }
      }

    });

  };

}());
