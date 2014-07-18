/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XT:true, XM:true, Backbone:true, _:true, */

(function () {
  "use strict";
  
  /*
   * olapMetaData is not really a Backbone Collection yet but could become one.
   * Could move some of the metadata to a route using xmla4js.  Currently we just 
   * make use of the extend method from Backbone.
   */
  
  XM.olapMetadata = Backbone.Collection.extend({
    schema: [],
    /*
     * Get measures for this cube.
     */
    getMeasures: function (cube) {
      var measures = [],
        cubeSchema = {};
      _.each(this.schema, function (item) {
        if (item.name === cube) {
          cubeSchema = item;
        }
      });
      _.each(cubeSchema.measures, function (item) {
        measures.push(item.title);
      });
      return measures;
    },
    /*
     *  Get measure name for measure title in a cube.
     */
    getMeasureName: function (cube, title) {
      var cubeSchema = {},
        measure = "";
      _.each(this.schema, function (item) {
        if (item.name === cube) {
          cubeSchema = item;
        }
      });
      _.each(cubeSchema.measures, function (item) {
        if (item.title === title) {
          measure = item.name;
        }
      });
      return measure;
    },
    /*
     * Get dimensions for this cube.
     */
    getDimensions: function (cube) {
      var dimensions = [],
        cubeSchema = {};
      _.each(this.schema, function (item) {
        if (item.name === cube) {
          cubeSchema = item;
        }
      });
      _.each(cubeSchema.dimensions, function (item) {
        dimensions.push(item.title);
      });
      return dimensions;
    },
    /*
     *  Get dimension name property for dimension title in a cube.
     */
    getDimensionNameProp: function (cube, title) {
      var cubeSchema = {},
        dimension = "";
      _.each(this.schema, function (item) {
        if (item.name === cube) {
          cubeSchema = item;
        }
      });
      _.each(cubeSchema.dimensions, function (item) {
        if (item.title === title) {
          dimension = item.nameProperty;
        }
      });
      return dimension;
    },
    /*
     *  Get dimension code hierarchy for dimension title in a cube.
     */
    getDimensionHier: function (cube, title) {
      var cubeSchema = {},
        dimHier = "";
      _.each(this.schema, function (item) {
        if (item.name === cube) {
          cubeSchema = item;
        }
      });
      _.each(cubeSchema.dimensions, function (item) {
        if (item.title === title) {
          dimHier = item.codeHier;
        }
      });
      return dimHier;
    },
    /*
     *  Get time dimension for this cube.
     */
    getDimensionTime: function (cube) {
      var cubeSchema = {};
      _.each(this.schema, function (item) {
        if (item.name === cube) {
          cubeSchema = item;
        }
      });
      return cubeSchema.timeDimension.name;
    }
  });
  
  XM.CRMMetadata = XM.olapMetadata.extend({
    schema: [
        {name: "CROpportunity",  //Opportunity
          measures: [{title: "amountOpportunity", name: "Amount, Opportunity Gross"},
                     {title: "countOpportunities", name: "Count, Opportunities"},
                     {title: "percentProbabilityOpportunity", name: "Percent, Probability Opportunity"},
                     {title: "amountOpportunityWeighted", name: "Amount, Opportunity Weighted"},
                     {title: "averageOpportunity", name: "Average, Opportunity Gross"},
                     {title: "averageOpportunityWeighted", name: "Average, Opportunity Weighted"},
                     {title: "daysStartToAssigned", name: "Days, Start to Assigned"},
                     {title: "daysStartToTarget", name: "Days, Start to Target"},
                     {title: "daysStartToActual", name: "Days, Start to Actual"}],
          dimensions: [{title: "account", name: "CRM Account", nameProperty: "CRM Account Name", codeHier: "[CRM Account.Account Reps by Code]"},
                     {title: "user", name: "User", nameProperty: "User Name", codeHier: "[User.Users by Code]"},
                     {title: "opportunity", name: "Opportunity", nameProperty: "Opportunity Name", codeHier: "[Opportunity]"}],
          timeDimension: {name: "Issue Date.Calendar"}
        },
        {name: "CRQuote", //Quote
          measures: [{title: "amountQuote", name: "Amount, Quote Gross"},
                     {title: "countQuotes", name: "Count, Quotes"},
                     {title: "amountQuoteDiscount", name: "Amount, Quote Discount"},
                     {title: "averageQuote", name: "Average, Quote Gross"}],
          dimensions: [{title: "salesRep", name: "Account Rep", nameProperty: "Account Rep Name", codeHier: "[Account Rep.Account Reps by Code]"},
                     {title: "customer", name: "Customer", nameProperty: "Customer Name", codeHier: "[Customer.Customer Code]"},
                     {title: "item", name: "Product", nameProperty: "Product Name", codeHier: "[Product.Product Code]"},
                     {title: "quote", name: "Quote", nameProperty: "Quote Name", codeHier: "[Quote]"},
                     {title: "productCategory", name: "Product.Products by Category by Code", nameProperty: "Category Name", codeHier: "[Product.Products by Category by Code]"},
                     {title: "classCode", name: "Product.Products by Class by Code", nameProperty: "Class Name", codeHier: "[Product.Products by Class by Code]"},
                     {title: "itemType", name: "Product.Products by Type by Code", nameProperty: "Type Name", codeHier: "[Product.Products by Type by Code]"},
                     {title: "shipRegion", name: "Ship City", nameProperty: "Region Name", codeHier: "[Ship City.Ship Region]"},
                     {title: "billRegion", name: "Bill City", nameProperty: "Region Name", codeHier: "[Bill City.Bill Region]"}],
          timeDimension: {name: "Issue Date.Calendar"}
        },
        {name: "CROpportunityAndOrder",
          measures: [{title: "ratioConversion", name: "Ratio, Conversion"},
                     {title: "ratioConversionWeighted", name: "Ratio, Conversion Weighted"}],
          dimensions: [],
          timeDimension: {name: "Issue Date.Calendar"}
        },
        {name: "CROpportunityForecast",  //OpportunityForecast
          measures: [{title: "amountOpportunityForecast", name: "Amount, Opportunity Forecast"},
                     {title: "amountOpportunityForecastWeighted", name: "Amount, Forecast Weighted"},
                     {title: "percentOpportunityForecastProbability", name: "Percent, Forecast Probability"},
                     {title: "countForecastOpportunities", name: "Count, Opportunities"}],
          dimensions: [],
          timeDimension: {name: "Period.Fiscal Period CL"}
        },
      ],
    });
  
  XM.CRMOppFunnelMetadata = XM.olapMetadata.extend({
    schema: [
        {name: "CROpportunity",  //Opportunity
          measures: [{title: "amountOpportunity", name: "Amount, Opportunity Gross"},
                     {title: "countOpportunities", name: "Count, Opportunities"},
                     {title: "amountOpportunityWeighted", name: "Amount, Opportunity Weighted"},
                     {title: "averageOpportunity", name: "Average, Opportunity Gross"},
                     {title: "averageOpportunityWeighted", name: "Average, Opportunity Weighted"}],
          dimensions: [{title: "account", name: "CRM Account", nameProperty: "CRM Account Name", codeHier: "[CRM Account.Account Reps by Code]"},
                     {title: "user", name: "User", nameProperty: "User Name", codeHier: "[User.Users by Code]"},
                     {title: "opportunity", name: "Opportunity", nameProperty: "Opportunity Name", codeHier: "[Opportunity]"}],
        },
      ],
    });
  
  XM.CRMFunnelMetadata = XM.olapMetadata.extend({
    schema: [
        {name: "SOOrder", //Booking
          measures: [{title: "amount", name: "Amount, Order Gross"},
                     {title: "count", name: "Count, Orders"},
                     {title: "average", name: "Average, Order Gross"}],
          dimensions: [{title: "salesRep", name: "Account Rep", nameProperty: "Account Rep Name", codeHier: "[Account Rep.Account Reps by Code]"},
                     {title: "customer", name: "Customer", nameProperty: "Customer Name", codeHier: "[Customer.Customer Code]"},
                     {title: "item", name: "Product", nameProperty: "Product Name", codeHier: "[Product.Product Code]"},
                     {title: "booking", name: "Order", nameProperty: "Order Name", codeHier: "[Order]"},
                     {title: "productCategory", name: "Product.Products by Category by Code", nameProperty: "Category Name", codeHier: "[Product.Products by Category by Code]"},
                     {title: "classCode", name: "Product.Products by Class by Code", nameProperty: "Class Name", codeHier: "[Product.Products by Class by Code]"},
                     {title: "itemType", name: "Product.Products by Type by Code", nameProperty: "Type Name", codeHier: "[Product.Products by Type by Code]"},
                     {title: "shipRegion", name: "Ship City", nameProperty: "Ship Region", codeHier: "[Ship City.Ship Region]"},
                     {title: "billRegion", name: "Bill City", nameProperty: "Ship Region", codeHier: "[Bill City.Bill Region]"}],
        },
        {name: "CROpportunity",  //Opportunity
          measures: [{title: "amount", name: "Amount, Opportunity Gross"},
                     {title: "count", name: "Count, Opportunities"},
                     {title: "average", name: "Average, Opportunity Gross"}],
          dimensions: [{title: "account", name: "CRM Account", nameProperty: "CRM Account Name", codeHier: "[CRM Account.Account Reps by Code]"},
                     {title: "user", name: "User", nameProperty: "User Name", codeHier: "[User.Users by Code]"},
                     {title: "opportunity", name: "Opportunity", nameProperty: "Opportunity Name", codeHier: "[Opportunity]"}],
        },
        {name: "CRQuote", //Quote
          measures: [{title: "amount", name: "Amount, Quote Gross"},
                     {title: "count", name: "Count, Quotes"},
                     {title: "average", name: "Average, Quote Gross"}],
          dimensions: [{title: "salesRep", name: "Account Rep", nameProperty: "Account Rep Name", codeHier: "[Account Rep.Account Reps by Code]"},
                     {title: "customer", name: "Customer", nameProperty: "Customer Name", codeHier: "[Customer.Customer Code]"},
                     {title: "item", name: "Product", nameProperty: "Product Name", codeHier: "[Product.Product Code]"},
                     {title: "quote", name: "Quote", nameProperty: "Quote Name", codeHier: "[Quote]"},
                     {title: "productCategory", name: "Product.Products by Category by Code", nameProperty: "Category Name", codeHier: "[Product.Products by Category by Code]"},
                     {title: "classCode", name: "Product.Products by Class by Code", nameProperty: "Class Name", codeHier: "[Product.Products by Class by Code]"},
                     {title: "itemType", name: "Product.Products by Type by Code", nameProperty: "Type Name", codeHier: "[Product.Products by Type by Code]"},
                     {title: "shipRegion", name: "Ship City", nameProperty: "Ship Region", codeHier: "[Ship City.Ship Region]"},
                     {title: "billRegion", name: "Bill City", nameProperty: "Ship Region", codeHier: "[Bill City.Bill Region]"}],
        },

      ],
    });
  
}());
