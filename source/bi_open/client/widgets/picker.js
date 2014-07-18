/*jshint node:true, indent:2, curly:true, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, trailing:true, white:true, strict:false */
/*global XT:true, XM:true, enyo:true, _:true */

(function () {

  // ..........................................................
  // END YEAR

  enyo.kind({
    name: "XV.EndYearPicker",
    kind: "XV.PickerWidget",
    showNone: false,
    collection: "XM.endYears",
    valueAttribute: "id",
    defaultValue: "_current".loc(),
    noneTextChanged: function () {
      this.setNoneText("_current".loc());
      this.inherited(arguments);
    },
    //create: function () {
    //  this.inherited(arguments);
    //  this.setNoneText("_current".loc());
    //}
  });
  
  // ..........................................................
  // END MONTH

  enyo.kind({
    name: "XV.EndMonthPicker",
    kind: "XV.PickerWidget",
    showNone: false,
    collection: "XM.endMonths",
    valueAttribute: "id",
    defaultValue: "_current".loc(),
    noneTextChanged: function () {
      this.setNoneText("_current".loc());
      this.inherited(arguments);
    },
  });
  
}());
