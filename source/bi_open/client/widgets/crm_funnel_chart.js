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
    name: "XV.FunnelOpportunitiesChart",
    kind: "XV.BiFunnelChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_trailing12".loc(),
    parameterWidget: "XV.OpportunityChartParameters",
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
        {name: "fromStartDate", operator: ">=", value: new Date()},
        {name: "toStartDate", operator: "<=", value: new Date()},
        {name: "showInactive", operator: "=", value: true}
      ],
     },
      {attr: "number",
       recordType: "XM.OpportunityRelation",
       collection: "XM.OpportunityRelationCollection",
       workspace: "XM.OpportunityRelation",
       parameters: [
        {name: "fromStartDate", operator: ">=", value: new Date()},
        {name: "toStartDate", operator: "<=", value: new Date()},
        {name: "fromAssignDate", operator: ">=", value: new Date()},
        {name: "toAssignDate", operator: "<=", value: new Date()},
        {name: "showInactive", operator: "=", value: true}
      ],
     },
      {attr: "number",
       recordType: "XM.OpportunityRelation",
       collection: "XM.OpportunityRelationCollection",
       workspace: "XM.OpportunityRelation",
       parameters: [
        {name: "fromStartDate", operator: ">=", value: new Date()},
        {name: "toStartDate", operator: "<=", value: new Date()},
        {name: "fromTargetDate", operator: ">=", value: new Date()},
        {name: "toTargetDate", operator: "<=", value: new Date()},
        {name: "showInactive", operator: "=", value: true}
      ],
     },
      {attr: "number",
       recordType: "XM.OpportunityRelation",
       collection: "XM.OpportunityRelationCollection",
       workspace: "XM.OpportunityRelation",
       parameters: [
        {name: "fromStartDate", operator: ">=", value: new Date()},
        {name: "toStartDate", operator: "<=", value: new Date()},
        {name: "fromActualDate", operator: ">=", value: new Date()},
        {name: "toActualDate", operator: "<=", value: new Date()},
        {name: "showInactive", operator: "=", value: true}
      ],
     }
    ],
    labels: [
      "_allOpportunities".loc() + ":          ",
      "_assignedOpportunities".loc() + ": ",
      "_targetedOpportunities".loc() + ":  ",
      "_wonOpportunities".loc() + ":     "
    ],
    toolTips: [],
    measureColors : ['#ff7f0e', '#2ca02c'],
    // Query properties
    cube : "CROpportunity",
    schema: new XM.CRMOppFunnelMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQuerySumPeriods(), {cube: "CROpportunity"}),
      _.extend(new XT.mdxQuerySumPeriods(),
        {cube: "CROpportunity",
          members: [
          {name: "[Measures].[THESUM]",
             value: "SUM(CROSSJOIN({LASTPERIODS(12, [Issue Date.Calendar].[$year].[$month])},{LASTPERIODS(12,[Assigned Date.Calendar].[$year].[$month])}), " +
            " [Measures].[$measure]) "
          },
        ],
        }),
        _.extend(new XT.mdxQuerySumPeriods(),
        {cube: "CROpportunity",
          members: [
          {name: "[Measures].[THESUM]",
             value: "SUM(CROSSJOIN({LASTPERIODS(12, [Issue Date.Calendar].[$year].[$month])},{LASTPERIODS(12,[Target Date.Calendar].[$year].[$month])}), " +
            " [Measures].[$measure]) "
          },
        ],
        }),
        _.extend(new XT.mdxQuerySumPeriods(),
        {cube: "CROpportunity",
          rows: [
            "Hierarchize({[Opportunity.Opportunity by Status by Type].[Won]})"
          ],
        }),
        ],
      });
  
  enyo.kind({
    name: "XV.FunnelOpportunityQuoteBookingChart",
    kind: "XV.BiFunnelChart",
    collection: "XM.AnalyticCollection",
    // Chart properties
    chartTitle: "_opportunityQuoteBookingFunnel".loc(),
    parameterWidget: "XV.TimeChartParameters",
    drillDown: [
    /*
     * Dates are updated in clickDrill function.  They are repeated in some parameters as some
     * queries need four dates (and it doesn't hurt to repeat)
     */
      {attr: "number",
       recordType: "XM.OpportunityRelation",
       collection: "XM.OpportunityRelationCollection",
       workspace: "XM.OpportunityRelation",
       parameters: [
        {name: "fromStartDate", operator: ">=", value: new Date()},
        {name: "toStartDate", operator: "<=", value: new Date()},
        {name: "fromStartDate", operator: ">=", value: new Date()},
        {name: "toStartDate", operator: "<=", value: new Date()},
        {name: "showInactive", operator: "=", value: true}
      ],
     },
      {attr: "number",
       recordType: "XM.OpportunityRelation",
       collection: "XM.OpportunityRelationCollection",
       workspace: "XM.OpportunityRelation",
       parameters: [
        {name: "fromStartDate", operator: ">=", value: new Date()},
        {name: "toStartDate", operator: "<=", value: new Date()},
        {name: "fromActualDate", operator: ">=", value: new Date()},
        {name: "toActualDate", operator: "<=", value: new Date()},
        {name: "showInactive", operator: "=", value: true}
      ],
     },
      {attr: "number",
       recordType: "XM.QuoteRelation",
       collection: "XM.QuoteRelationCollection",
       workspace: "XM.QuoteRelation",
       parameters: [
        {name: "createdFromDate", operator: ">=", value: new Date()},
        {name: "createdToDate", operator: "<=", value: new Date()},
        {name: "createdFromDate", operator: ">=", value: new Date()},
        {name: "createdToDate", operator: "<=", value: new Date()},
        {name: "showClosed", operator: "ANY", value: ["C", "O"]},
        {name: "showExpired", operator: "!=", value: new Date(0, 1, 1)},
      ],
     },
      {attr: "number",
       recordType: "XM.QuoteRelation",
       collection: "XM.QuoteRelationCollection",
       workspace: "XM.QuoteRelation",
       parameters: [
        {name: "createdFromDate", operator: ">=", value: new Date()},
        {name: "createdToDate", operator: "<=", value: new Date()},
        {name: "createdFromDate", operator: ">=", value: new Date()},
        {name: "createdToDate", operator: "<=", value: new Date()},
        //{name: "showClosed", operator: "=", value: ["C"]},
        {name: "showExpired", operator: "!=", value: new Date(0, 1, 1)},
        {name: "status", operator: "=", value: ["C"]},  //converted
      ],
     },
      {attr: "number",
       recordType: "XM.SalesOrderRelation",
       collection: "XM.SalesOrderRelationCollection",
       workspace: "XM.SalesOrderRelation",
       parameters: [
        {name: "createdFromDate", operator: ">=", value: new Date()},
        {name: "createdToDate", operator: "<=", value: new Date()},
        {name: "createdFromDate", operator: ">=", value: new Date()},
        {name: "createdToDate", operator: "<=", value: new Date()},
        {name: "status", operator: "ANY", value: ["C", "O"]}
      ],
     }
    ],
    labels: [
      "_allOpportunities".loc() + ":      ",
      "_wonOpportunities".loc() + ": ",
      "_allQuotes".loc() + ":               ",
      "_convertedQuotes".loc() + ":     ",
      "_allBookings".loc() + ":            "
    ],
    toolTips: [],
    measureColors : ['#ff7f0e', '#2ca02c'],
    // Query properties
    cube : "CROpportunity",
    schema: new XM.CRMFunnelMetadata(),
    queryTemplates: [
      _.extend(new XT.mdxQuerySumPeriods(), {cube: "CROpportunity"}),
      _.extend(new XT.mdxQuerySumPeriods(),
      {cube: "CROpportunity",
        rows: [
          "Hierarchize({[Opportunity.Opportunity by Status by Type].[Won]})"
        ],
      }),
        _.extend(new XT.mdxQuerySumPeriods(),
        {cube: "CRQuote",
          rows: [
            "Hierarchize({[Quote].[All Quotes]})"
          ],
        }),
          _.extend(new XT.mdxQuerySumPeriods(),
          {cube: "CRQuote",
            rows: [
              "Hierarchize({[Quote.Quote by Status].[Converted]})"
            ],
          }),
            _.extend(new XT.mdxQuerySumPeriods(),
            {cube: "SOOrder",
              rows: [
                "Hierarchize({[Order].[All Orders]})"
              ],
            })
            ],
          });

}());
