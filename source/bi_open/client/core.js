/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XV:true, XM:true, enyo:true, _:true, console:true */

(function () {
  "use strict";

  XT.extensions.bi_open = {};

  _.extend(XT, {
    /*
     * All BI extensions add their collection of charts to this list.  So all charts are
     * available to all dashboards.
     */
    chartActions: [],
    /*
     * MDX Query Class
     * All BI extensions add their collection of maps to this list.  So all maps are
     * available to all mapboards.
     */
    mapActions: [],
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
        query += comma + filter.dimension + ".[" + filter.value + "]";
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
           value: "iif (Measures.[prevKPI] = 0 or Measures.[prevKPI] = NULL or IsEmpty(Measures.[prevKPI]), 0.000, Measures.[prevKPI])"
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
  /*
   *   Top list query.
   *
   *   Note we are given a dimension's level, but we want the children, so we
   *   go back up to the hierarchy and then get the children.
   *   
   *   Todo:  Mondrian has trouble ordering with count measures, like "Days, Start to Actual".
   *   So we sort in processData as the list is small.  Try this out in later releases of Mondrian:
   *   "ORDER({filter(TopCount($dimensionHier.Hierarchy.Children, 50, [Measures].[THESUM]),[Measures].[THESUM]>0) }, [Measures].[THESUM], DESC)
   */
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
        "{filter(TopCount($dimensionHier.Hierarchy.Children, 50, [Measures].[THESUM]),[Measures].[THESUM]>0)}"
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
  /*
   * Map Query.
   *
   * Note that cross joins of large dimensions like dimensionGeo are performance problems.  Check that all
   * cross join options in mondrian.properties are set.  Make sure heap space is sufficient in start_bi.sh
   * A cross joins of members performs well, but a cross join of children does not (mondrian bug?).
   * "CrossJoin($dimensionHier.Children, $dimensionGeo.Members)" - bad
   * "CrossJoin($dimensionHier.Members, $dimensionGeo.Members)" - good
   * All queries should be written as using members.
   */
  XT.mdxQueryMapPeriods.prototype = _.extend(Object.create(XT.mdxQuery.prototype), {
      members: [
        {name: "[Measures].[TheSum]",
           value: 'SUM({LASTPERIODS(12, [Issue Date.Calendar].[$year].[$month])}, [Measures].[Amount, Order Gross])'
        },
        {name: "[Measures].[Longitude]",
           value: 'iif ([Measures].[TheSum] is empty, null, $dimensionGeo.CurrentMember.Properties("Longitude"))'
        },
        {name: "[Measures].[Latitude]",
           value: 'iif ([Measures].[TheSum] is empty, null, $dimensionGeo.CurrentMember.Properties("Latitude"))'
        },
      ],
      columns: [
        "[Measures].[Latitude]", "[Measures].[Longitude]", "[Measures].[TheSum]",
      ],
      rows: [
        "CrossJoin($dimensionHier.Members, $dimensionGeo.Members)"
      ],
      cube: "",
      where: []
    });

}());
