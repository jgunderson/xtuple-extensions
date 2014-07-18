/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, dimple:true console:true */

(function () {

  /**
    Compare multiple measures using sum of trailing 12 periods and previous
    12 periods.  Responsible for:
    -  update of query templates based on ending period.
    -  processing time series data to dimple format
    -  plotting with dimple
  */

  enyo.kind(
    /** @lends XV.TimeSeriesChart # */{
    name: "XV.BiCompareTimeSumChart",
    kind: "XV.BiChartNoPicker",
    published: {
      dateField: "",
      chartTag: "svg",
      plotHeight: 0,
      nextPeriods: 0, // number of periods to add to end date for forecasts
      plotWidth: 0
    },

    /**
      Process the data from xmla4js format to dimplejs format

      Input format:
      [
        {
          "[Measures].[measure-1]": "202500",
          "[Measures].[measure-prev-1]": "102500",
          "[Measures].[measure-2]": "2025",
          "[Measures].[measure-prev-2]": "1025",
        }
      ]
      Output format:
      [
        {
          "values": [
          {
            "Measure Name": "Start to Assigned",
            "Measure": "202500",
            "Period End": "2014"
          },
          {
            "Measure Name": "Start to Assigned, Previous Year",
            "Measure": "102500",
            "Period End": "2013"
          },
         ]
        }
      ]

    */

    /**
      Any initialization
    */
    create: function () {
      this.inherited(arguments);
    },

    /**
      Update Queries cube name using cube meta data. Use current year & month
      or next periods if nextPeriods set.
     */
    updateQueries: function (pickers) {
      var date = this.getEndDate();
      date.setMonth(date.getMonth() + this.getNextPeriods());
      _.each(this.queryTemplates, function (template, i) {
        this.queryStrings[i] = template.jsonToMDX(this.getWhere());
        this.queryStrings[i] = this.queryStrings[i].replace("$cube", template.cube);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$year/g, date.getFullYear());
        this.queryStrings[i] = this.queryStrings[i].replace(/\$month/g, date.getMonth() + 1);
      }, this
      );
    },
    
    processData: function () {
      var formattedData = [],
        collection = this.collections[0],
        date = this.getEndDate();
      //date.setMonth(date.getMonth() + this.getNextPeriods());
      if (collection.models.length > 0) {

        // Construct the values using the
        // *  concatenation of dimensions for the Period
        // *  measure value as Measure
        // *  measure name as MeasureYear
        var values = [],
          entry = {};
        for (var i = 0; i < this.measures.length; i++) {
          var teststr = "[Measures].[measure-" + (i + 1) + "]";
          entry = { "Measure Name" : this.measures[i],
                        "Measure" : collection.models[0].attributes["[Measures].[measure-" + (i + 1) + "]"],
                        "Period End" : date.getFullYear() + "-" + (date.getMonth() + 1)};
          values.push(entry);
          entry = { "Measure Name" : this.measures[i] + ", Previous Year",
                        "Measure" : collection.models[0].attributes["[Measures].[measure-prev-" + (i + 1) + "]"],
                        "Period End" : (Number(date.getFullYear()) - 1) + "-" + (date.getMonth() + 1)};
          values.push(entry);
        }
        this.$.chartTitle.setContent(this.makeTitle()); // Set the chart title
        this.$.chartSubTitle.setContent(this.getChartSubTitle()); // Set the chart sub title
        formattedData.push({values: values});
      }
      //
      //  This will drive processDataChanged which will call plot
      //
      this.setProcessedData(formattedData);
    },
    
    /**
      If the user clicks on a bar or circle list with the appropriate filter. 
      When the user clicks on an list item we drill down further into item.
     */
    clickDrill: function (field, figure) {
      var that = this,
        itemCollectionName = this.drillDown[0].collection,
        ItemCollectionClass = itemCollectionName ? XT.getObjectByName(itemCollectionName) : false,
        itemCollection = new ItemCollectionClass(),
        recordType = itemCollection.model.prototype.recordType,
        listKind = XV.getList(recordType),
        year = Number(figure.key.substr(0, 4)),
        monthStr = figure.key.substr(5, 2),
        month = Number(monthStr.replace("_", "")) - 1,
        startDate = new Date(),
        endDate = new Date(),
        params = [],
        callback = function (value) {
          //   unless explicitly specified, we assume that we want to drill down
          //   into the same model that is fuelling the report
          var drillDownRecordType = that.drillDown[0].recordType ||
              that.getValue().model.prototype.recordType,
            drillDownAttribute = that.drillDown[0].attr ||
              XT.getObjectByName(drillDownRecordType).prototype.idAttribute,
            id = value.get(drillDownAttribute);

          if (id) {
            that.doWorkspace({workspace: XV.getWorkspace(drillDownRecordType), id: id});
          }
          // TODO: do anything if id is not present?
        };
      // 
      // Set end date to EOM and start date to 1st of - 11 months
      //
      endDate.setFullYear(year, month + 1, 0);
      startDate.setFullYear(year, month - 11, 1);
      this.drillDown[0].parameters[0].value = startDate;
      this.drillDown[0].parameters[1].value = endDate;

      // TODO: the parameter widget sometimes has trouble finding our query requests

      listKind = XV.getList(recordType);
      
      this.doSearch({
        list: listKind,
        searchText: "",
        callback: callback,
        parameterItemValues: this.drillDown[0].parameters,
        conditions: [],
        query: null
      });
    },

    plot: function (type) {
      var navigatorChildren = XT.app.$.postbooks.$.navigator.$.contentPanels.children,
        activePanel = navigatorChildren[navigatorChildren.length - 1],
        thisPanel = this.parent.parent,
        that = this;

      /* Dimple Plot
       */
      if (this.getProcessedData().length > 0) {
        //
        // Make dimple chart in svg area
        //
        var divId = this.$.chart.$.svg.hasNode().id,
          // width and height in newSvg are max sizes
          svg = dimple.newSvg("#" + divId, this.getPlotWidth() + 100, this.getPlotHeight() + 100),
          myChart = new dimple.chart(svg, this.getProcessedData()[0].values);
        myChart.setBounds(180, 20, this.getPlotWidth() - 120, this.getPlotHeight());
        //
        // Define chart axis
        //
        var y = myChart.addCategoryAxis("y", "Measure Name"),
          x = myChart.addMeasureAxis("x", "Measure");
        y.addOrderRule("Measure Name");
        //
        // Create dimple series with legend based on type
        //
        var chartFunc = this.getChart(),
          chart = chartFunc("barChart"),
          series = myChart.addSeries("Period End", chart),
          legend = myChart.addLegend(65, 10, 400, 20, "center", series);
        //
        // draw chart
        //
        myChart.draw();
        //
        // after chart is drawn, use d3 to change axis and legend text and colors
        //
        x.shapes.selectAll("text").attr("fill", "#000000");
        x.titleShape.text("Days");
        x.titleShape.attr("fill", "#000000");
        y.shapes.selectAll("text").attr("fill", "#000000");
        y.titleShape.text("Measure");
        y.titleShape.attr("fill", "#000000");
        legend.shapes.selectAll("text").attr("fill", "#000000");
        //series.shapes.selectAll("rect").on("click", function (bar, index) {
        //  var newbar = bar;
        //});
        d3.select("#" + divId).selectAll("rect").on("click", function (bar, index) {
          that.clickDrill(undefined, bar);
        });
        d3.select("#" + divId).selectAll("circle").on("click", function (circle, index) {
          that.clickDrill(undefined, circle);
        });
      }
    },
    /**
      Set chart plot size using max sizes from dashboard.
     */
    setPlotSize: function (maxHeight, maxWidth) {
      this.setPlotWidth(Number(maxWidth) - 100);
      this.setPlotHeight(Number(maxHeight) - 146);
    },
    /**
      Create chart plot area.  Destroy if already created.
    */
    createChartComponent: function () {
      if (typeof this.$.chart.$.svg !== "undefined") {
        this.$.chart.$.svg.destroy();
      }
      this.$.chart.createComponent(
          {name: "svg",
            tag: this.getChartTag(),
            content: " ",
            attributes: {width: 500, height: 250}
            }
          );
      this.$.chart.render();
    },
    /**
      Make title
     */
    makeTitle: function () {
      var date = this.getEndDate(),
        title = "";
      date.setMonth(date.getMonth() + this.getNextPeriods());
      title = this.getChartTitle() + "_ending".loc() + date.getFullYear() + "-" + (date.getMonth() + 1);
      return title;
    },

  });

}());
