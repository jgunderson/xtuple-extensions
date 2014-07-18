/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XV:true, XM:true, enyo:true, _:true, console:true */

(function () {
  "use strict";

  XT.extensions.bi_open = {
    setVersion: function () {
      XT.setVersion("4.5.0", "bi_open");
    }
  };

  _.extend(XT, {
    /*
     * All BI extensions add their collection of charts to this list.  So all charts are
     * available to all dashboards.
     */
    chartActions: [],
    /*
     * MDX Query Class
     */   
    /*
     * MDX Query Class
     */
    mdxQuery: function () {
    },
    /*
     * Time Series Query 
     */
    mdxQueryTimeSeries: function () {
    },
    /*
     * Top List Query 
     */
    mdxQueryTopList: function () {
    },
    /*
     * Sum Periods Query 
     */
    mdxQuerySumPeriods: function () {
    },
    /*
     * Map Periods Query 
     */
    mdxQueryMapPeriods: function () {
    }
  
  });
  
  XT.mdxQuery.prototype = Object.create({
    /*
     *   Generate MDX query string based on queryTemplate.  members are optional.
     *   rows, columns, cube and where filters are required.  Additional filters can
     *   be added using the filters argument.
     */
    jsonToMDX: function (filters) {
      var that = this,
      query = "",
      comma = "",
      filterSet = filters ? filters : [];

      // WITH MEMBERS clause
      filterSet = this.where ? filters.concat(this.where) : filterSet;
      _.each(this.members, function (member, index) {
        query = index === 0 ? "WITH " : query;
        query += " MEMBER " + member.name + " AS " + member.value;
      });

      // SELECT clause
      query += " SELECT NON EMPTY {";
      _.each(this.columns, function (column, index) {
        comma = index > 0 ? ", " : "";
        query += comma + column;
      });
      query += "} ON COLUMNS, NON EMPTY {";
      _.each(this.rows, function (row, index) {
        comma = index > 0 ? ", " : "";
        query += comma + row;
      });
      query += "} ON ROWS";

      // FROM clause
      query += " FROM " + this.cube;

      // WHERE clause
      _.each(filterSet, function (filter, index) {
        query = index === 0 ? query + " WHERE (" : query;
        comma = index > 0 ? ", " : "";
        query += comma + filter;
      });
      if (query.indexOf(" WHERE (") !== -1) {
        query += ")";
      }
      
      return query;
    }
  });
  
  XT.mdxQueryTimeSeries.prototype = _.extend(Object.create(XT.mdxQuery.prototype), {
      members: [
        {name: "[Measures].[KPI]",
           value: "IIf(IsEmpty([Measures].[$measure]), 0.000, [Measures].[$measure])"
        },
        {name: "Measures.[prevKPI]",
           value: "([Measures].[$measure] , ParallelPeriod([Issue Date.Calendar Months].[$year]))"
        },
        {name: "[Measures].[prevYearKPI]",
           value: "iif(Measures.[prevKPI] = 0 or Measures.[prevKPI] = NULL or IsEmpty(Measures.[prevKPI]), 0.000, Measures.[prevKPI])"
        },
      ],
      columns: [
        "[Measures].[KPI]",
        "[Measures].[prevYearKPI]"
      ],
      rows: [
        "LastPeriods(12, [Issue Date.Calendar Months].[$year].[$month])"
      ],
      cube: "",
      where: []
    });
  
  
  XT.mdxQueryTopList.prototype = _.extend(Object.create(XT.mdxQuery.prototype), {
      members: [
        {name: "[Measures].[NAME]",
           value: '$dimensionHier.CurrentMember.Properties("$dimensionNameProp")'
        },
        {name: "[Measures].[THESUM]",
           value: "SUM({LASTPERIODS(12, [$dimensionTime].[$year].[$month])},  [Measures].[$measure])"
        },
      ],
      columns: [
        "[Measures].[THESUM]",
        "[Measures].[NAME]"
      ],
      rows: [
        "ORDER({filter(TopCount($dimensionHier.Children, 50, [Measures].[THESUM]),[Measures].[THESUM]>0) }, [Measures].[THESUM], DESC)"
      ],
      cube: "",
      where: []
    });
  
  XT.mdxQuerySumPeriods.prototype = _.extend(Object.create(XT.mdxQuery.prototype), {
      members: [
        {name: "[Measures].[THESUM]",
           value: "SUM({LASTPERIODS(12, [Issue Date.Calendar].[$year].[$month])}, [Measures].[$measure])"
        },
      ],
      columns: [
        "[Measures].[THESUM]",
      ],
      rows: [
        "Hierarchize({[Opportunity].[All Opportunities]})"
      ],
      cube: "",
      where: []
    });
  
  XT.mdxQueryMapPeriods.prototype = _.extend(Object.create(XT.mdxQuery.prototype), {
      members: [
        {name: "[Measures].[Longitude]",
           value: 'iif ([Measures].[$measure] is empty, null, $dimensionGeo.CurrentMember.Properties("Longitude"))'
        },
        {name: "[Measures].[Latitude]",
           value: 'iif ([Measures].[$measure] is empty, null, $dimensionGeo.CurrentMember.Properties("Latitude"))'
        },
        {name: "[Measures].[TheSum]",
           value: 'SUM({LASTPERIODS(12, [Issue Date.Calendar].[$year].[$month])}, [Measures].[Amount, Order Gross])'
        },
      ],
      columns: [
        "[Measures].[Latitude]", "[Measures].[Longitude]", "[Measures].[TheSum]",
      ],
      rows: [
        "CrossJoin($dimensionHier.Children, $dimensionGeo.Members)"
      ],
      cube: "",
      where: []
    });

}());
