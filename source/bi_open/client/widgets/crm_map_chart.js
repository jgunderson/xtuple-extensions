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
    name: "XV.Period12OpportunitiesMapChart",
    kind: "XV.BiMapChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_trailing12".loc(),
    geoDimension: "[Contact City].[City Name]",
    dimensionHier: "[CRM Account.CRM Accounts by Code].[CRM Account Code]",
    /*
     * Dates are updated in clickDrill function.  They are repeated in some parameters as some
     * queries need four dates (and it doesn't hurt to repeat)
     */
    drillDown: [
      {attr: "number",
       recordType: "XM.OpportunityRelation",
       collection: "XM.OpportunityRelationCollection",
       workspace: "XM.OpportunityRelation",
       parameters: [
        {name: "fromStartDate", operator: ">=", value: new Date()},
        {name: "toStartDate", operator: "<=", value: new Date()},
        {name: "showInactive", operator: "=", value: true}
      ],
     }
    ],
    chartOptions: [
      { name: "HERE.normalDay" },
      { name: "OpenStreetMap.Mapnik" },
      { name: "OpenMapSurfer.Roads" },
      { name: "MapQuestOpen.OSM" }
    ],
    // Query properties
    cube : "CROpportunity",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryMapPeriods(), {cube: "CROpportunity"}),
    ],
  });
  
  enyo.kind({
    name: "XV.Period12OpportunitiesActiveMapChart",
    kind: "XV.BiMapChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_next3Months".loc(),
    nextPeriods: 4,
    prefixChartTitle: "_active".loc(),
    geoDimension: "[Contact City].[City Name]",
    dimensionHier: "[CRM Account.CRM Accounts by Code].[CRM Account Code]",
    /*
     * Dates are updated in clickDrill function.  They are repeated in some parameters as some
     * queries need four dates (and it doesn't hurt to repeat)
     */
    drillDown: [
      {attr: "number",
       recordType: "XM.OpportunityRelation",
       collection: "XM.OpportunityRelationCollection",
       workspace: "XM.OpportunityRelation",
       parameters: [
        {name: "fromTargetDate", operator: ">=", value: new Date()},
        {name: "toTargetDate", operator: "<=", value: new Date()},
        {name: "showInactive", operator: "=", value: false}
      ],
     }
    ],
    chartOptions: [
      { name: "HERE.normalDay" },
      { name: "OpenStreetMap.Mapnik" },
      { name: "OpenMapSurfer.Roads" },
      { name: "MapQuestOpen.OSM" }
    ],
    // Query properties
    cube : "CROpportunity",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryMapPeriods(), {
        members: [
          {name: "[Measures].[TheSum]",
             value: 'SUM({LASTPERIODS(12, [Target Date.Calendar].[$year].[$month])}, [Measures].[$measure])'
          },
          {name: "[Measures].[Longitude]",
             value: 'iif ([Measures].[TheSum] is empty, null, $dimensionGeo.CurrentMember.Properties("Longitude"))'
          },
          {name: "[Measures].[Latitude]",
             value: 'iif ([Measures].[TheSum] is empty, null, $dimensionGeo.CurrentMember.Properties("Latitude"))'
          },
        ],
        where: [
          {attribute: null,
            dimension: "[Opportunity.Opportunity by Status by Stage].[Opportunity Status]",
            operator: "=",
            value: "Active"}
        ],
        cube: "CROpportunity"
      }),
    ],
  });
  
  enyo.kind({
    name: "XV.Period12QuotesMapChart",
    kind: "XV.BiMapChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_trailing12".loc(),
    /*
     * Dates are updated in clickDrill function.  They are repeated in some parameters as some
     * queries need four dates (and it doesn't hurt to repeat)
     */
    drillDown: [
      {attr: "number",
       recordType: "XM.QuoteRelation",
       collection: "XM.QuoteRelationCollection",
       workspace: "XM.QuoteRelation",
       parameters: [
        {name: "createdFromDate", operator: ">=", value: new Date()},
        {name: "createdToDate", operator: "<=", value: new Date()},
        {name: "showClosed", operator: "ANY", value: ["C", "O"]},
        {name: "showExpired", operator: "!=", value: new Date(0, 1, 1)},
      ],
     }
    ],
    chartOptions: [
      { name: "HERE.normalDay" },
      { name: "OpenStreetMap.Mapnik" },
      { name: "OpenMapSurfer.Roads" },
      { name: "MapQuestOpen.OSM" }
    ],
    // Query properties
    cube : "CRQuote",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryMapPeriods(), {cube: "CRQuote"}),
    ],
  });

  enyo.kind({
    name: "XV.Period12QuotesActiveMapChart",
    kind: "XV.BiMapChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    prefixChartTitle: "_active".loc(),
    chartTitle: "_trailing12".loc(),
    /*
     * Dates are updated in clickDrill function.  They are repeated in some parameters as some
     * queries need four dates (and it doesn't hurt to repeat)
     */
    drillDown: [
      {attr: "number",
       recordType: "XM.QuoteRelation",
       collection: "XM.QuoteRelationCollection",
       workspace: "XM.QuoteRelation",
       parameters: [
        {name: "createdFromDate", operator: ">=", value: new Date()},
        {name: "createdToDate", operator: "<=", value: new Date()},
        {name: "showClosed", operator: "ANY", value: ["C", "O"]},
        {name: "showExpired", operator: "!=", value: new Date(0, 1, 1)},
      ],
     }
    ],
    chartOptions: [
      { name: "HERE.normalDay" },
      { name: "OpenStreetMap.Mapnik" },
      { name: "OpenMapSurfer.Roads" },
      { name: "MapQuestOpen.OSM" }
    ],
    // Query properties
    cube : "CRQuote",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryMapPeriods(), {
        members: [
          {name: "[Measures].[NEKPI]",
             value: "IIf(IsEmpty([Measures].[$measure]), 0.000, [Measures].[$measure])"
          },
          {name: "[Measures].[KPI]",
             value: "IIf((([Measures].[Days Expire Date] = -1) OR [Measures].[Days, Now to Expiration] > 0), [Measures].[NEKPI], 0.00)"
          },
          {name: "[Measures].[TheSum]",
             value: 'SUM({LASTPERIODS(12, [Issue Date.Calendar].[$year].[$month])}, [Measures].[KPI])'
          },
          {name: "[Measures].[Longitude]",
             value: 'iif ([Measures].[TheSum] is empty, null, $dimensionGeo.CurrentMember.Properties("Longitude"))'
          },
          {name: "[Measures].[Latitude]",
             value: 'iif ([Measures].[TheSum] is empty, null, $dimensionGeo.CurrentMember.Properties("Latitude"))'
          },
        ],
        cube: "CRQuote"
      }),
    ],
  });
  
  enyo.kind({
    name: "XV.Period12OpportunitiesStateMapChart",
    kind: "XV.BiMapStateChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_trailing12".loc(),
    geoDimension: "[Contact City].[Region Code]",
    dimensionHier: "[CRM Account.CRM Accounts by Code].[CRM Account Code]",
    /*
     * Dates are updated in clickDrill function.  They are repeated in some parameters as some
     * queries need four dates (and it doesn't hurt to repeat)
     */
    drillDown: [
      {attr: "number",
       recordType: "XM.OpportunityRelation",
       collection: "XM.OpportunityRelationCollection",
       workspace: "XM.OpportunityRelation",
       parameters: [
        {name: "fromStartDate", operator: ">=", value: new Date()},
        {name: "toStartDate", operator: "<=", value: new Date()},
        {name: "showInactive", operator: "=", value: true}
      ],
     }
    ],
    chartOptions: [
      { name: "HERE.normalDay" },
      { name: "OpenStreetMap.Mapnik" },
      { name: "OpenMapSurfer.Roads" },
      { name: "MapQuestOpen.OSM" }
    ],
    // Query properties
    cube : "CROpportunity",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryStateMapPeriods(), {cube: "CROpportunity"}),
    ],
  });

}());
