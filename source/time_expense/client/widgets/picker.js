/*jshint node:true, indent:2, curly:true, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, trailing:true, white:true */
/*global XT:true, XM:true, enyo:true, _:true */

(function () {

  // ..........................................................
  // ITEM EXPENSE OPTIONS
  //

  enyo.kind({
    name: "XV.ItemExpenseOptionsPicker",
    kind: "XV.PickerWidget",
    collection: "XM.itemExpenseOptions",
    noneText: "_notUsed".loc()
  });

}());
