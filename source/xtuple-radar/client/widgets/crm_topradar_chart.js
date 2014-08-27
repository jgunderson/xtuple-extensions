/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, dimple:true, console:true */

/*
 *  Implementation of charts.  Responsible for:
 *  -  defining collection class
 *  -  providing values for pickers
 *  -  query templates
 *  -  info for processing query results
 */

(function () {

    enyo.kind({
      name: "XV.Period12OpportunityTopRadarChart",
      kind: "XV.BiTopRadarChart",
      collection: "XM.AnalyticCollection",
      // Chart properties
      chartTitle: "_toplistTrailing12".loc(),
      parameterWidget: "XV.OpportunityChartParameters",
      drillDown: [
        {
          dimension: "account",
          attr: "number",
          recordType: "XM.AccountRelation",
          collection: "XM.AccountRelationCollection",
          workspace: "XM.AccountRelation",
          parameters: [
            {name: "number", operator: "MATCHES", value: ""},
          ]
        },
        {
          dimension: "user",
          attr: "number",
          recordType: "XM.UserAccountRelation",
          collection: "XM.UserAccountRelationCollection",
          workspace: "XM.UserAccountRelation",
          parameters: [
            {name: "number", operator: "MATCHES", value: ""},
          ]
        },
        {
          dimension: "opportunity",
          attr: "number",
          recordType: "XM.OpportunityRelation",
          collection: "XM.OpportunityRelationCollection",
          workspace: "XM.OpportunityRelation",
          parameters: [
            {name: "number", operator: "MATCHES", value: ""},
            {name: "showInactive", operator: "=", value: true}
          ]
        }
      ],
      // Query properties
      cube : "CROpportunity",
      schema: new XM.CRMMetadata(),
      queryTemplates: [
        _.extend(new XT.mdxQueryTopList(), {cube: "CROpportunity"})
      ],
    });

  }());
