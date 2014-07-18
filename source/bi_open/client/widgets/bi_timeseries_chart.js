/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, dimple:true console:true */

(function () {

  /**
    Trailing 12 periods time series chart using Dimple.js.  Responsible for:
    -  update of query templates based on measure picker and ending period.
    -  processing time series data to dimple format
    -  plotting with dimple

      ProcessData changes the data from xmla4js format to dimplejs format
      
      Input format:
      [
        {
          "[Delivery Date.Calendar Months].[Year].[MEMBER_CAPTION]": "2012",
          "[Delivery Date.Calendar Months].[Month].[MEMBER_CAPTION]": "12",
          "[Measures].[KPI]": "0",
          "[Measures].[prevYearKPI]": "202500"
        }
      ]
      Output format:
      [
        {
          "values": [
          {
            "Period": "2012-12",
            "Measure": "0",
            "Measure Name": "Amount, Shipment"
          },
          {
            "Period": "2012-12",
            "Measure": "202500",
            "Measure Name": "Previous Year"
          }
         ]
        }
      ]
  */
  
  enyo.kind(
    /** @lends XV.TimeSeriesChart # */{
    name: "XV.BiTimeSeriesChart",
    kind: "XV.BiChartTypeMeasure",
    published: {
      dateField: "",
      chartTag: "svg",
      plotHeight: 0,
      plotWidth: 0,
      nextPeriods: 0, // number of periods to add to end date for forecasts
      plotDimension1 : "",
      plotDimension2 : "",
    },
    
    /**
      Any initialization 
    */
    create: function () {
      this.inherited(arguments);
    },
    
    /**
      Update Queries based on pickers using cube meta data.  Replace cube name, measure
      name and end date.
     */
    updateQueries: function () {
      var date = this.getEndDate();
      _.each(this.queryTemplates, function (template, i) {
        var measure = this.schema.getMeasureName(template.cube, this.getMeasure());
        this.queryStrings[i] = template.jsonToMDX(this.getWhere());
        this.queryStrings[i] = this.queryStrings[i].replace("$cube", template.cube);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$measure/g, measure);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$year/g, date.getFullYear());
        this.queryStrings[i] = this.queryStrings[i].replace(/\$month/g, date.getMonth() + 1);
      }, this
      );
    },

    processData: function () {
      var formattedData = [];
      var collection = this.collections[0];
      
      if (collection.models.length > 0) {
      
        // Construct the values using the 
        // *  concatenation of dimensions for the Period
        // *  measure value as Measure
        // *  measure name as MeasureYear
        // Set chart title
        var values = [];
        for (var i = 0; i < collection.models.length; i++) {
          var entry = { "Period" : collection.models[i].attributes[this.getPlotDimension1()] +
                          '-' +
                          collection.models[i].attributes[this.getPlotDimension2()],
                          "Measure" : collection.models[i].attributes["[Measures].[KPI]"],
                          "Measure Name" : ("_" +  this.getMeasure()).loc()};
          values.push(entry);
          entry = { "Period" : collection.models[i].attributes[this.getPlotDimension1()] +
                          '-' +
                          collection.models[i].attributes[this.getPlotDimension2()],
                          "Measure" : collection.models[i].attributes["[Measures].[prevYearKPI]"],
                          "Measure Name" : "_previousYear".loc()};
          values.push(entry);
        }
        formattedData.push({ values: values, measures: [ this.getMeasure(), "Previous Year"]});
      }
      this.$.chartTitle.setContent(this.makeTitle()); // Set the chart title
      this.$.chartSubTitle.setContent(this.getChartSubTitle()); // Set the chart sub title
      this.setProcessedData(formattedData); // This will drive processDataChanged which will call plot
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
        year = Number(figure.cx.substr(0, 4)),
        month = Number(figure.cx.substr(5)) - 1,
        measure = figure.key,
        startDate = new Date(),
        endDate = new Date(),
        params = [],
        
        callback = function (value) {
          var id = value.get(that.drillDown[0].attr);
          if (id) {
            that.doWorkspace({workspace: XV.getWorkspace(that.drillDown[0].workspace), id: id});
          }
          // TODO: do anything if id is not present?
        };

      //
      // Set up date parms for search using the 1st to EOM in year selected or in previous year.
      //
      if (measure.indexOf("Previous Year") !== -1) {
        year--;
      }
      startDate.setFullYear(year, month, 1);
      endDate.setFullYear(year, month + 1, 0);
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
      var that = this;
      
      /* 
       * Dimple Plot
       */
      if (this.getProcessedData().length > 0) {
        //
        // Make dimple chart in svg area
        //
        var divId = this.$.chart.$.svg.hasNode().id,
          // width and height in newSvg are max sizes.
          svg = dimple.newSvg("#" + divId, this.getPlotWidth() + 100, this.getPlotHeight() + 100),
          myChart = new dimple.chart(svg, this.getProcessedData()[0].values);
        myChart.setBounds(60, 30, this.getPlotWidth(), this.getPlotHeight());
        //
        // Define chart axis
        //
        var x = myChart.addCategoryAxis("x", ["Period", "Measure Name"]),
          y = myChart.addMeasureAxis("y", "Measure");
        //
        // Create dimple series based on type
        //
        var chartFunc = this.getChart(),
          chart = chartFunc(type),
          series = myChart.addSeries("Measure Name", chart),
          legend = myChart.addLegend(65, 10, 400, 20, "center", series);
        //
        // draw chart
        //
        myChart.draw();
        //
        // after chart is drawn, use d3 to change axis text colors
        //
        x.shapes.selectAll("text").attr("fill", "#000000");
        //x.titleShape.text("Days");
        x.titleShape.attr("fill", "#000000");
        y.shapes.selectAll("text").attr("fill", "#000000");
        //y.titleShape.text("Measure");
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
      this.setPlotHeight(Number(maxHeight) - 196);
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
            content: " "                //some plot areas must have content - like an html5 canvas
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
      title = this.getPrefixChartTitle() +
        ("_" + this.getMeasure()).loc() + ", " +
        this.getChartTitle() + " " + "_ending".loc() + " " +
        date.getFullYear() + "-" + (date.getMonth() + 1);
      return title;
    },
    
  });

}());
