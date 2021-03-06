/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XV:true, XM:true, enyo:true, console:true */

XT.extensions['xtuple-radar'].initPostbooks = function () {

  var chartActions = [
      {name: "opportunityTopRadar", label: "_opportunityTopRadar".loc(), item: "XV.Period12OpportunityTopRadarChart", privileges: ["ViewAllOpportunities"]},
    ];
  
  // Add chart actions to global XT.chartActions that we set up in core.js
  XT.chartActions.push.apply(XT.chartActions, chartActions);

};