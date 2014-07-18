/*jshint bitwise:false, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XV:true, XM:true, _:true, Backbone:true, enyo:true, XT:true */

(function () {

  XT.extensions.timeExpense.initDocumentBox = function () {
    enyo.kind({
      name: "XV.WorksheetDocumentsBox",
      kind: "XV.DocumentsBox",
      parentKey: "worksheet"
    });
  };

}());
