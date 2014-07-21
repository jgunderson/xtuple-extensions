/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XV:true, XM:true, enyo:true, console:true */

XT.extensions.bi_open.initPostbooks = function () {

  var panelsCrmDash = [
      {name: "crmBiDashboard", kind: "XV.CrmBiDashboard"},
    ],
    dashboardModule = {
      name: "welcomeDashboard",
      hasSubmenu: false,
      label: "_dashboard".loc(),
      panels: [
        {name: "welcomeDashboard", kind: "XV.WelcomeDashboard"}
      ]
    },
    /*
     *   chartActions will become newActions if they have the specified privileges
     */
    chartActions = [
      /*
       * Opportunity charts
       */
      {name: "opportunitiesTrailing", label: "_opportunitiesTrailing".loc(), item: "XV.Period12OpportunitiesTimeSeriesChart", privileges: ["ViewAllOpportunities"]},
      {name: "opportunitiesBookingsTrailing", label: "_opportunitiesBookingsTrailing".loc(), item: "XV.Period12OpportunitiesBookingsTimeSeriesChart", privileges: ["ViewAllOpportunities", "ViewSalesOrders"]},
      {name: "opportunitiesActiveNext", label: "_opportunitiesActiveNext".loc(), item: "XV.Next12OpportunitiesActiveTimeSeriesChart", privileges: ["ViewAllOpportunities"]},
      {name: "opportunityForecastTrailing", label: "_opportunityForecastTrailing".loc(), item: "XV.Period12OpportunityForecastTimeSeriesChart", privileges: ["ViewAllOpportunities"]},
      {name: "opportunitytl", label: "_toplistTrailingOpportunity".loc(), item: "XV.Period12OpportunityToplistChart", privileges: ["ViewAllOpportunities"]},
      {name: "opportunitytal", label: "_toplistTrailingOpportunityActive".loc(), item: "XV.Period12OpportunityActiveToplistChart", privileges: ["ViewAllOpportunities"]},
      /*
       * Quote charts
       */
      {name: "quoteTrailing", label: "_quotesTrailing".loc(), item: "XV.Period12QuotesTimeSeriesChart", privileges: ["ViewQuotes"]},
      {name: "quoteActiveTrailing", label: "_quotesActiveTrailing".loc(), item: "XV.Period12QuotesActiveTimeSeriesChart", privileges: ["ViewQuotes"]},
      {name: "quotetl", label: "_toplistTrailingQuote".loc(), item: "XV.Period12QuoteToplistChart", privileges: ["ViewQuotes"]},
      {name: "quoteActivetl", label: "_toplistTrailingQuoteActive".loc(), item: "XV.Period12QuoteActiveToplistChart", privileges: ["ViewQuotes"]},
      /*
       * Sales Pipeline charts
       */
      {name: "opportunityFunnel", label: "_opportunitiesFunnel".loc(), item: "XV.FunnelOpportunitiesChart", privileges: ["ViewAllOpportunities"]},
      {name: "salesVelocity", label: "_salesVelocity".loc(), item: "XV.Period12SumSalesVelocityChart", privileges: ["ViewAllOpportunities"]},
    ];

  XT.app.$.postbooks.appendPanels("crm", panelsCrmDash, true);
  XT.app.$.postbooks.insertModule(dashboardModule, 0);
  // Add chart actions to global XT.chartActions that we set up in core.js
  XT.chartActions.push.apply(XT.chartActions, chartActions);
  
};