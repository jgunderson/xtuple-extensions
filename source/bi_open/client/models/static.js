/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XM:true, Backbone:true, _:true */

(function () {
  "use strict";

  // These are hard coded collections that may be turned into tables at a later date
  var i,
    date = new Date();

  // Month for End Period
  XM.EndMonthModel = Backbone.Model.extend({
  });
  XM.EndMonthCollection = Backbone.Collection.extend({
    model: XM.EndMonthModel
  });
  XM.endMonths = new XM.EndMonthCollection();
  XM.endMonths.add(new XM.EndMonthModel({id: "current", name: "Current"}));
  for (i = 12; i >= 1; i--) {
    var monthFormat = i < 10 ? "0" + i : "" + i;
    var month = new XM.EndMonthModel({id: monthFormat, name: monthFormat});
    XM.endMonths.add(month);
  }

  // Year (for End Period
  date.setYear(Number(date.getFullYear()) + 1);
  XM.EndYearModel = Backbone.Model.extend({
  });
  XM.EndYearCollection = Backbone.Collection.extend({
    model: XM.EndYearModel
  });
  XM.endYears = new XM.EndYearCollection();
  XM.endYears.add(new XM.EndYearModel({id: "current", name: "Current"}));
  for (i = Number(date.getFullYear()); i >= 2000; i--) {
    var yearFormat = "" + i;
    var year = new XM.EndYearModel({id: yearFormat, name: yearFormat});
    XM.endYears.add(year);
  }

}());
