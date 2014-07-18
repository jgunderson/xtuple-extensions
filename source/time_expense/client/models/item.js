/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XT:true, XM:true, Backbone:true, _:true, console:true */

(function () {
  "use strict";

  XT.extensions.timeExpense.initItemModels = function () {

    var _proto = XM.Item.prototype,
      _bindEvents = _proto.bindEvents,
      _statusDidChange = _proto.statusDidChange,
      _itemTypeDidChange = function () {
        var itemType = this.get("itemType"),
          readOnly = false;
        if (itemType !== XM.Item.REFERENCE) {
          readOnly = true;
          this.set("projectExpenseMethod", null);
        }
        this.setReadOnly("projectExpenseMethod", readOnly);
        this.methodDidChange();
      };

    XM.Item.EXPENSE_BY_CATEGORY = "E";
    XM.Item.EXPENSE_BY_ACCOUNT = "A";

    XM.Item = XM.Item.extend({
      bindEvents: function () {
        _bindEvents.apply(this, arguments);
        this.on("change:projectExpenseMethod", this.methodDidChange);
        this.on("change:itemType", _itemTypeDidChange, this);
      },

      methodDidChange: function () {
        var K = XM.Item,
          method = this.get("projectExpenseMethod"),
          editCategory = false,
          editAccount = false,
          unset = ["projectExpenseCategory", "projectExpenseLedgerAccount"];
        if (method === K.EXPENSE_BY_CATEGORY) {
          editCategory = true;
          unset.shift();
        } else if (method === K.EXPENSE_BY_ACCOUNT) {
          editAccount = true;
          unset.pop();
        }
        this.setReadOnly("projectExpenseCategory", !editCategory);
        this.setReadOnly("projectExpenseLedgerAccount", !editAccount);
        while (unset.length) { this.unset(unset.pop()); }
      },

      statusDidChange: function () {
        _statusDidChange.apply(this, arguments);
        var K = XM.Model,
          status = this.getStatus();
        if (status === K.READY_NEW || status === K.READY_CLEAN) {
          _itemTypeDidChange.apply(this);
        }
      }

    });

    // Static Model
    var i,
      K = XM.Item,
      itemExpenseOptionJson = [
        { id: K.EXPENSE_BY_CATEGORY, name: "_byCategory".loc() },
        { id: K.EXPENSE_BY_ACCOUNT, name: "_byAccount".loc() }
      ];
    XM.ItemExpenseOption = Backbone.Model.extend({
    });
    XM.ItemExpenseOptionCollection = Backbone.Collection.extend({
      model: XM.ItemExpenseOption
    });
    XM.itemExpenseOptions = new XM.ItemExpenseOptionCollection();
    for (i = 0; i < itemExpenseOptionJson.length; i++) {
      var itemExpenseOption = new XM.ItemExpenseOption(itemExpenseOptionJson[i]);
      XM.itemExpenseOptions.add(itemExpenseOption);
    }

  };

}());
