/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, RGraph:true console:true */

(function () {

  /**
    Funnel Chart using RGraph.  Responsible for:
    -  update of query templates based on pickers
    -  processing multiple query results into RGraph format
    -  plotting with RGraph

      ProcessData changes the data from xmla4js format to rgraph format.  If all the 
      collections have models with no data, we assume queries haven't run and 
      processedData does not change.  But if some have data we fill in "no data" with 
      0's.  For 0, we use .1 as RGraph does not deal well with 0's.
      
      Input format:
      [
        {
          "[Measures].[THESUM]": "256",
        }
      ]
      Output format:
      [256]
    */
  
  enyo.kind(
    /** @lends XV.TimeSeriesChart # */{
    name: "XV.BiFunnelChart",
    kind: "XV.BiChartMeasure",
    published: {
      dateField: "",
      //endDate: new Date(),
      chartTag: "canvas",  //rgraph requires the html5 canvas tag
      labels: [],
      updatedLabels: [],
      nextPeriods: 0, // number of periods to add to end date for forecasts
      toolTips: [],
      plotHeight: 0,
      plotWidth: 0
    },
    
    /**
      Any initialization 
    */
    create: function () {
      this.inherited(arguments);
      this.updatedLabels = [];           //we modify labels with data so we make a this object
    },
    
    /**
      Update Queries based on pickers using cube meta data.  Replace cube name, measure
      name.  Use current year & month or next periods if nextPeriods set.
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
      var formattedData = [],
        colls = this.collections,
        anyData = false,
        // Get the actual measure so we can format the number in the label
        // based on Amount, Count, etc.  Use first cubeMeta as all measures
        // must have the same types in each
        measure = this.schema.getMeasureName(this.getCube(), this.getMeasure());
      
      this.updatedLabels = this.labels.slice();
      
      _.each(this.collections, function (collection, i) {
        formattedData[i] = 0.1;
        this.updatedLabels[i] = this.labels[i] + "0";
        if (collection.models.length > 0) {
          var theSum = Number(collection.models[0].attributes["[Measures].[THESUM]"]),
            sumFormatted = "";
          if (measure.indexOf("Amount") !== -1 || measure.indexOf("Average") !== -1) {
            sumFormatted = XV.FormattingMixin.formatMoney(theSum, this);
          }
          else {
            sumFormatted = XV.FormattingMixin.formatQuantity(theSum, this);
          }
          anyData = true;
          // This is kind of a hack as the funnel chart does not display an image if the
          // value is zero.  When we want to show a zero we used a small number and put 0 
          // in the label. 
          formattedData[i] = (theSum ? Number(theSum) : 0.1);
          this.updatedLabels[i] = this.labels[i] + (theSum ? sumFormatted : "0");
          this.toolTips[i] = "_measureName".loc() + ": " + ("_" + this.getMeasure()).loc() +
            "<br>" + "periodEnding".loc() + ": " + this.getEndDate().getFullYear() + "-" + (this.getEndDate().getMonth() + 1) +
            "<br>" + "measure".loc() + ": " + (theSum ? sumFormatted : "0");
        }
      }, this);
      // If there is no data at all the funnel looks better with null data.  If
      // there is data we repeat the first entry.  This is because drill down goes
      // to label at the bottom of each shape.  
      if (!anyData) {
        formattedData = [];
      }
      else {
        this.$.chartTitle.setContent(this.makeTitle()); // Set the chart title
        this.$.chartSubTitle.setContent(this.getChartSubTitle()); // Set the chart sub title
        var entry = formattedData[0];
        formattedData.unshift(entry);
        this.updatedLabels.unshift("");
      }
      this.setProcessedData(formattedData); // This will drive processDataChanged which will call plot
    },
    
    clickDrill: function (event, figure) {
      var thisEnyo = figure[0].properties["chart.caller"], // We save the object reference in "caller property
        that = thisEnyo,
        indexDD = figure.index,
        itemCollectionName = thisEnyo.drillDown[indexDD].collection,
        ItemCollectionClass = itemCollectionName ? XT.getObjectByName(itemCollectionName) : false,
        itemCollection = new ItemCollectionClass(),
        recordType = itemCollection.model.prototype.recordType,
        listKind = XV.getList(recordType),
        year = thisEnyo.getEndDate().getFullYear(),
        month = thisEnyo.getEndDate().getMonth(),
        drillDown = thisEnyo.drillDown,
        startDate = new Date(),
        endDate = new Date(),
        params = [],
        callback = function (value) {
          var id = value.get(that.drillDown[indexDD].attr);
          if (id) {
            that.doWorkspace({workspace: XV.getWorkspace(that.drillDown[indexDD].workspace), id: id});
          }
          // TODO: do anything if id is not present?
        };

      startDate.setFullYear(year, month - 11, 1);
      endDate.setFullYear(year, month + 1, 0);
      drillDown[indexDD].parameters[0].value = startDate;
      drillDown[indexDD].parameters[1].value = endDate;
      drillDown[indexDD].parameters[2].value = startDate;
      drillDown[indexDD].parameters[3].value = endDate;
      //
      // Add where clause filters to parameter values
      //
      _.each(thisEnyo.where, function (filter) {
        var parmItem = {name: filter.attribute, operator: filter.operator, value: filter.value};
        drillDown[indexDD].parameters.push(parmItem);
      });

      // TODO: the parameter widget sometimes has trouble finding our query requests

      listKind = XV.getList(recordType);
      
      thisEnyo.doSearch({
        list: listKind,
        searchText: "",
        callback: callback,
        parameterItemValues: drillDown[indexDD].parameters,
        conditions: [],
        query: null
      });
    },
    
    hover: function (e, shape) {
      var event = e;
    },

    plot: function (type) {
           
      /* rgraph Plot */
      if (this.getProcessedData().length > 0) {
        var canvasId = this.$.chart.$.svg.hasNode().id,
          funnel = new RGraph.Funnel(canvasId, this.getProcessedData());
        
        funnel.Set('labels', this.getUpdatedLabels());
        funnel.Set('gutter.left', 350);
        funnel.Set('labels.sticks', true);
        funnel.Set('strokestyle', 'rgba(0,0,0,0)');
        funnel.Set('text.boxed', false);
        funnel.Set('text.color', "black");
        funnel.Set('labels.x', 30);
        funnel.Set('shadow', true);
        funnel.Set('shadow.offsetx', 0);
        funnel.Set('shadow.offsety', 0);
        funnel.Set('shadow.blur', 15);
        funnel.Set('shadow.color', 'gray');
        funnel.Set('tooltips', this.getToolTips());
        funnel.Set('tooltips.coords.page', true);
        funnel.Set('tooltips.effect', 'fade');
        funnel.Set('tooltips.event', 'onmousemove');
        funnel.Set('events.click', this.clickDrill);
        funnel.Set('caller', this);  // we add caller property so clickDrill can get this
        funnel.Draw();
      }
    },
    /**
      Set chart plot size using max sizes from dashboard.
     */
    setPlotSize: function (maxHeight, maxWidth) {
      this.setPlotWidth(Number(maxWidth) - 40);
      this.setPlotHeight(Number(maxHeight) - 80);
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
            attributes: {width: this.getPlotWidth(), height: this.getPlotHeight()}
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
