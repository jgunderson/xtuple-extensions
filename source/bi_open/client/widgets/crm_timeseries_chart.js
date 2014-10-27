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
    name: "XV.Period12OpportunitiesTimeSeriesChart",
    kind: "XV.BiTimeSeriesChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_trailing12".loc(),
    parameterWidget: "XV.OpportunityChartParameters",
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
      { name: "barChart" },
      { name: "bubbleChart" },
      { name: "lineChart" },
      { name: "areaChart" }
    ],
    measureColors : ['#ff7f0e', '#2ca02c'],
    plotDimension1 : "[Issue Date.Calendar Months].[Year].[MEMBER_CAPTION]",
    plotDimension2 : "[Issue Date.Calendar Months].[Month].[MEMBER_CAPTION]",
    chart : function (type) {
        switch (type) {
        case "barChart":
          return dimple.plot.bar;
        case "bubbleChart":
          return dimple.plot.bubble;
        case "lineChart":
          return dimple.plot.line;
        case "areaChart":
          return dimple.plot.area;
        }
      },
    // Query properties
    cube : "CROpportunity",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryTimeSeries(), {cube: "CROpportunity"})
    ],
  });
  
  enyo.kind({
    name: "XV.Period12OpportunitiesBookingsTimeSeriesChart",
    kind: "XV.BiTimeSeriesChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_trailing12".loc(),
    parameterWidget: "XV.TimeChartParameters",
    chartOptions: [
      { name: "barChart" },
      { name: "bubbleChart" },
      { name: "lineChart" },
      { name: "areaChart" }
    ],
    measureColors : ['#ff7f0e', '#2ca02c'],
    plotDimension1 : "[Issue Date.Calendar Months].[Year].[MEMBER_CAPTION]",
    plotDimension2 : "[Issue Date.Calendar Months].[Month].[MEMBER_CAPTION]",
    chart : function (type) {
        switch (type) {
        case "barChart":
          return dimple.plot.bar;
        case "bubbleChart":
          return dimple.plot.bubble;
        case "lineChart":
          return dimple.plot.line;
        case "areaChart":
          return dimple.plot.area;
        }
      },
    // Query properties
    cube : "CROpportunityAndOrder",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryTimeSeries(), {cube: "CROpportunityAndOrder"})
    ],
  });
  
  enyo.kind({
    name: "XV.Next12OpportunitiesActiveTimeSeriesChart",
    kind: "XV.BiTimeSeriesChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_next3Months".loc(),
    prefixChartTitle: "_active".loc(),
    nextPeriods: 4,
    parameterWidget: "XV.OpportunityChartParameters",
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
      { name: "barChart" },
      { name: "bubbleChart" },
      { name: "lineChart" },
      { name: "areaChart" }
    ],
    measureColors : ['#ff7f0e', '#2ca02c'],
    plotDimension1 : "[Target Date.Calendar Months].[Year].[MEMBER_CAPTION]",
    plotDimension2 : "[Target Date.Calendar Months].[Month].[MEMBER_CAPTION]",
    chart : function (type) {
        switch (type) {
        case "barChart":
          return dimple.plot.bar;
        case "bubbleChart":
          return dimple.plot.bubble;
        case "lineChart":
          return dimple.plot.line;
        case "areaChart":
          return dimple.plot.area;
        }
      },
    // Query properties
    cube : "CROpportunity",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryTimeSeries(),
        {cube: "CROpportunity",
         members: [
          {name: "[Measures].[KPI]",
             value: "IIf(IsEmpty([Measures].[$measure]), 0.000, [Measures].[$measure])"
          },
          {name: "Measures.[prevKPI]",
             value: "([Measures].[$measure] , ParallelPeriod([Target Date.Calendar Months].[$year]))"
          },
          {name: "[Measures].[prevYearKPI]",
             value: "iif (Measures.[prevKPI] = 0 or Measures.[prevKPI] = NULL or IsEmpty(Measures.[prevKPI]), 0.000, Measures.[prevKPI])"
          },
        ],
        rows: [
          "LastPeriods(12, [Target Date.Calendar Months].[$year].[$month])"
        ],
         where: [
          {attribute: null,
            dimension: "[Opportunity.Opportunity by Status by Stage].[Opportunity Status]",
            operator: "=",
            value: "Active"}
        ]
       })
      ],
    });
  
  enyo.kind({
    name: "XV.Period12QuotesTimeSeriesChart",
    kind: "XV.BiTimeSeriesChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_trailing12".loc(),
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
      { name: "barChart" },
      { name: "bubbleChart" },
      { name: "lineChart" },
      { name: "areaChart" }
    ],
    measureColors : ['#ff7f0e', '#2ca02c'],
    plotDimension1 : "[Issue Date.Calendar Months].[Year].[MEMBER_CAPTION]",
    plotDimension2 : "[Issue Date.Calendar Months].[Month].[MEMBER_CAPTION]",
    chart : function (type) {
        switch (type) {
        case "barChart":
          return dimple.plot.bar;
        case "bubbleChart":
          return dimple.plot.bubble;
        case "lineChart":
          return dimple.plot.line;
        case "areaChart":
          return dimple.plot.area;
        }
      },
    // Query properties
    cube : "CRQuote",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryTimeSeries(), {cube: "CRQuote"})
    ],
  });
  
  enyo.kind({
    name: "XV.Period12QuotesActiveTimeSeriesChart",
    kind: "XV.BiTimeSeriesChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_trailing12".loc(),
    prefixChartTitle: "_active".loc(),
    drillDown: [
      {attr: "number",
       recordType: "XM.QuoteRelation",
       collection: "XM.QuoteRelationCollection",
       workspace: "XM.QuoteRelation",
       parameters: [
        {name: "createdFromDate", operator: ">=", value: new Date()},
        {name: "createdToDate", operator: "<=", value: new Date()}
      ],
     }
    ],
    chartOptions: [
      { name: "barChart" },
      { name: "bubbleChart" },
      { name: "lineChart" },
      { name: "areaChart" }
    ],
    measureColors : ['#ff7f0e', '#2ca02c'],
    plotDimension1 : "[Issue Date.Calendar Months].[Year].[MEMBER_CAPTION]",
    plotDimension2 : "[Issue Date.Calendar Months].[Month].[MEMBER_CAPTION]",
    chart : function (type) {
        switch (type) {
        case "barChart":
          return dimple.plot.bar;
        case "bubbleChart":
          return dimple.plot.bubble;
        case "lineChart":
          return dimple.plot.line;
        case "areaChart":
          return dimple.plot.area;
        }
      },
    // Query properties
    cube : "CRQuote",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryTimeSeries(),
        {members: [
          {name: "[Measures].[NEKPI]",
             value: "IIf(IsEmpty([Measures].[$measure]), 0.000, [Measures].[$measure])"
          },
          {name: "[Measures].[KPI]",
             value: "IIf((([Measures].[Days Expire Date] = -1) OR [Measures].[Days, Now to Expiration] > 0), [Measures].[NEKPI], 0.00)"
          },
          {name: "Measures.[prevKPI]",
             value: "([Measures].[$measure] , ParallelPeriod([Issue Date.Calendar Months].[$year]))"
          },
          {name: "[Measures].[prevYearKPI]",
             value: "iif(Measures.[prevKPI] = 0 or Measures.[prevKPI] = NULL or IsEmpty(Measures.[prevKPI]), 0.000, Measures.[prevKPI])"
          },
        ],
        cube: "CRQuote",
      }),
      ],
    });
  
  enyo.kind({
    name: "XV.Period12OpportunityForecastTimeSeriesChart",
    kind: "XV.BiTimeSeriesChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_trailing12".loc(),
    nextPeriods: 0,
    parameterWidget: "XV.OpportunityChartParameters",
    chartOptions: [
      { name: "barChart" },
      { name: "bubbleChart" },
      { name: "lineChart" },
      { name: "areaChart" }
    ],
    measureColors : ['#ff7f0e', '#2ca02c'],
    plotDimension1 : "[Fiscal Period.Fiscal Period CL].[Fiscal Year].[MEMBER_CAPTION]",
    plotDimension2 : "[Fiscal Period.Fiscal Period CL].[Fiscal Period].[MEMBER_CAPTION]",
    chart : function (type) {
        switch (type) {
        case "barChart":
          return dimple.plot.bar;
        case "bubbleChart":
          return dimple.plot.bubble;
        case "lineChart":
          return dimple.plot.line;
        case "areaChart":
          return dimple.plot.area;
        }
      },
    // Query properties
    cube : "CROpportunityForecast",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQueryTimeSeries(),
        {members: [
          {name: "[Measures].[KPI]",
             value: "IIf(IsEmpty([Measures].[$measure]), 0.000, [Measures].[$measure])"
          },
          {name: "Measures.[prevKPI]",
             value: "([Measures].[$measure] , ParallelPeriod([Fiscal Period.Fiscal Period CL].[$year]))"
          },
          {name: "[Measures].[prevYearKPI]",
             value: "iif(Measures.[prevKPI] = 0 or Measures.[prevKPI] = NULL or IsEmpty(Measures.[prevKPI]), 0.000, Measures.[prevKPI])"
          },
        ],
        rows: [
          "LastPeriods(12, [Fiscal Period.Fiscal Period CL].[$year].[$month])"
        ],
        cube: "CROpportunityForecast",
        })
      ],
    });
  
  enyo.kind({
    name: "XV.Period12SumSalesVelocityChart",
    kind: "XV.BiCompareTimeSumChart",
    collection: "XM.AnalyticCollection",
    chartTitle: "_salesVelocity".loc(),
    nextPeriods: 0,
    measures: [ "Start to Assigned", "Start to Target", "Start to Actual"],
    parameterWidget: "XV.OpportunityChartParameters",
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
    measureColors : ['#ff7f0e', '#2ca02c'],
    chart : function (type) {
        switch (type) {
        case "barChart":
          return dimple.plot.bar;
        case "bubbleChart":
          return dimple.plot.bubble;
        case "lineChart":
          return dimple.plot.line;
        case "areaChart":
          return dimple.plot.area;
        }
      },
    // Query properties
    cube : "CROpportunity",
    schema: new XM.CRMMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQuery(),
        {members: [
          {name: "[Measures].[m-1]",
             value: "SUM({LASTPERIODS(12, [Issue Date.Calendar].[$year].[$month])}, [Measures].[Days, Start to Assigned])"
          },
          {name: "Measures.[measure-1]",
             value: "iif(Measures.[m-1] = 0 or Measures.[m-1] = NULL or IsEmpty(Measures.[m-1]), 0.000, Measures.[m-1] / 12 )"
          },
          {name: "[Measures].[m-p-1]",
             value: "SUM({LASTPERIODS(12, ParallelPeriod([Issue Date.Calendar].[YEAR], 1, [Issue Date.Calendar].[$year].[$month]))}, " +
            "  [Measures].[Days, Start to Assigned])"
          },
          {name: "[Measures].[measure-prev-1]",
             value: "iif(Measures.[m-p-1] = 0 or Measures.[m-p-1] = NULL or IsEmpty(Measures.[m-p-1]), 0.000, Measures.[m-p-1] / 12 )"
          },
          {name: "[Measures].[m-2]",
             value: "SUM({LASTPERIODS(12, [Issue Date.Calendar].[$year].[$month])}, [Measures].[Days, Start to Target])"
          },
          {name: "Measures.[measure-2]",
             value: "iif(Measures.[m-2] = 0 or Measures.[m-2] = NULL or IsEmpty(Measures.[m-2]), 0.000, Measures.[m-2] / 12 )"
          },
          {name: "[Measures].[m-p-2]",
             value: "SUM({LASTPERIODS(12, ParallelPeriod([Issue Date.Calendar].[YEAR], 1, [Issue Date.Calendar].[$year].[$month]))}, " +
            "  [Measures].[Days, Start to Target]) "
          },
          {name: "[Measures].[measure-prev-2]",
             value: "iif(Measures.[m-p-2] = 0 or Measures.[m-p-2] = NULL or IsEmpty(Measures.[m-p-2]), 0.000, Measures.[m-p-2] / 12 )"
          },
          {name: "[Measures].[m-3]",
             value: "SUM({LASTPERIODS(12, [Issue Date.Calendar].[$year].[$month])}, [Measures].[Days, Start to Actual])"
          },
          {name: "Measures.[measure-3]",
             value: "iif(Measures.[m-3] = 0 or Measures.[m-3] = NULL or IsEmpty(Measures.[m-3]), 0.000, Measures.[m-3] / 12 )"
          },
          {name: "[Measures].[m-p-3]",
             value: "SUM({LASTPERIODS(12, ParallelPeriod([Issue Date.Calendar].[YEAR], 1, [Issue Date.Calendar].[$year].[$month]))}, " +
            "  [Measures].[Days, Start to Actual]) "
          },
          {name: "[Measures].[measure-prev-3]",
             value: "iif(Measures.[m-p-3] = 0 or Measures.[m-p-3] = NULL or IsEmpty(Measures.[m-p-3]), 0.000, Measures.[m-p-3] / 12 )"
          },
        ],
        columns: [
          "[Measures].[measure-1], [Measures].[measure-prev-1]",
          "[Measures].[measure-2], [Measures].[measure-prev-2]",
          "[Measures].[measure-3], [Measures].[measure-prev-3]"
        ],
        rows: [
          "Hierarchize({[Opportunity].[All Opportunities]})"
        ],
        cube: "CROpportunity",
        where: []
        })
      ],
    });

}());
