/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, dimple:true console:true */

(function () {

  /**
    Trailing 12 periods top list chart using Enyo List.  Responsible for:
    -  update of query templates based on measure picker, dimension picker and ending period.
    -  processing time series data to list format
    -  plotting (rendering) with Enyo
    /**
      Process the data from xmla4js format to list

      Input format:
      [
        {
          "[Account Rep.Account Reps by Code].[Account Rep Code].[MEMBER_CAPTION]": "2000",
          "[Measures].[THESUM]": "1.5",
          "[Measures].[NAME]": "Adam Smith, 2000"
        },
      ]
      Output format:
      [
        {
          "values": [
          {
            "Code": "2000",
            "Measure": "1.5",
            "Name": "Adam Smith, 2000"
          },
         ]
        }
      ]

    */

  enyo.kind(
    /** @lends XV.TimeSeriesChart # */{
    name: "XV.BiToplistChart",
    kind: "XV.BiChartDimMeasure",
    published: {
      dateField: "",
      chartTag: "toplist",
      plotHeight: 0,
      plotWidth: 0,
      nextPeriods: 0, // number of periods to add to end date for forecasts
      plotDimension1 : "",
      plotDimension2 : "",
    },

    /*
     * Set up items in top list on render and handle onTap
     */
    handlers: {
      onSetupItem: "setupItem",
      ontap: "clickDrill"
    },

    /**
      Any initialization
    */
    create: function () {
      this.inherited(arguments);
    },

    /**
      Update Queries based on pickers using cube meta data.  Replace cube name, measure
      name, dimension info.  Use current year & month or next periods if nextPeriods set.
     */
    updateQueries: function () {
      // pickers[1] will be dimension
      var date = this.getEndDate();
      _.each(this.queryTemplates, function (template, i) {
        var measure = this.schema.getMeasureName(template.cube, this.getMeasure()),
          dimensionTime = this.schema.getDimensionTime(template.cube),
          dimensionHier = this.schema.getDimensionHier(template.cube, this.getDimension()),
          dimensionNameProp = this.schema.getDimensionNameProp(template.cube, this.getDimension());
        this.queryStrings[i] = template.jsonToMDX(this.getWhere());
        this.queryStrings[i] = this.queryStrings[i].replace("$cube", template.cube);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$measure/g, measure);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$dimensionTime/g, dimensionTime);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$dimensionHier/g, dimensionHier);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$dimensionNameProp/g, dimensionNameProp);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$year/g, date.getFullYear());
        this.queryStrings[i] = this.queryStrings[i].replace(/\$month/g, date.getMonth() + 1);
      }, this
      );
    },

    processData: function () {
      var formattedData = [],
        collection = this.collections[0],
        that = this;

      if (collection.models.length > 0) {
        var values = [],
          measure = this.schema.getMeasureName(this.getCube(), this.getMeasure()),
          code = "",
          theSum = 0,
          sumFormatted = "",
          correctCode = function (value, key) {
            if (key.indexOf("[MEMBER_CAPTION]") !== -1) {
              code = value;
            }
          };

        for (var i = 0; i < collection.models.length; i++) {

          _.map(collection.models[i].attributes, correctCode);

          theSum = Number(collection.models[i].attributes["[Measures].[THESUM]"]);
          if (measure.indexOf("Amount") !== -1  || measure.indexOf("Average") !== -1) {
            sumFormatted = XV.FormattingMixin.formatMoney(theSum, this);
          }
          else {
            sumFormatted = XV.FormattingMixin.formatQuantity(theSum, this);
          }

          var entry = { "Code": code,
                        "Name": collection.models[i].attributes["[Measures].[NAME]"],
                        "Measure": sumFormatted};
          values.push(entry);
        }
        formattedData.push({ values: values});
      }
      this.$.chartTitle.setContent(this.makeTitle()); // Set the chart title
      this.$.chartSubTitle.setContent(this.getChartSubTitle()); // Set the chart sub title
      //
      //  See comments in core about the need to sort here
      //
      if (formattedData.length !== 0) {
        var sortedFormattedData = _.sortBy(formattedData[0].values, 'Measure');
        sortedFormattedData.reverse();
        formattedData[0].values = sortedFormattedData;
      }
      this.setProcessedData(formattedData); // This will drive processDataChanged which will call plot
    },

    /**
      If the user clicks on a bar or circle list with the appropriate filter.
      When the user clicks on an list item we drill down further into item.
     */
    clickDrill: function (iSender, iEvent) {
      var that = this,
        // This seems to give code for the list item selected - no idea why
        selected = null,
        itemCollectionName = null,
        ItemCollectionClass = null,
        itemCollection = null,
        recordType = null,
        listKind = null,
        params = [],
        drilldown = null,
        callback = function (value) {
          var id = value.get(drilldown.attr);
          if (id) {
            that.doWorkspace({workspace: XV.getWorkspace(drilldown.workspace), id: id});
          }
        };

      /*
       *  We only handle events from ListAttr.  Others are bubbled up to parent
       *  as we don't return true.
       */
      if (iEvent.originator.kind === "XV.ListAttr") {

        _.each(this.drillDown, function (item) {
          drilldown = item.dimension === that.getDimension() ? item : drilldown;
        });

        /*
         * We only handle drill downs if a drilldown entry is defined for this dimension
         * in the implementor.
         */
        if (drilldown) {
          // This seems to give code for the list item selected - no idea why
          selected = this.$.chart.$.svg.$.toplist.$.code.content;
          params = drilldown.parameters;
          params[0].value = selected;
          listKind = XV.getList(drilldown.recordType);

          this.doSearch({
            list: listKind,
            searchText: "",
            callback: callback,
            //parameterItemValues: this.drillDown[0].parameters,
            parameterItemValues: params,
            conditions: [],
            query: null
          });
        }
      }
    },

    plot: function (type) {
      var list = this.$.chart.$.svg.createComponent(
            {name: "toplist",
              kind: "XV.Toplist"
            }
        ),
        count = 0;
      if (this.getProcessedData().length !== 0) {
        count =  this.getProcessedData()[0].values.length > 7 ? 7 : this.getProcessedData()[0].values.length;
      }
      list.setCount(count);
      list.render();
    },

    setupItem: function (inSender, inEvent) {
      this.$.chart.$.svg.$.toplist.$.code.setContent(this.getProcessedData()[0].values[inEvent.index].Code);
      this.$.chart.$.svg.$.toplist.$.name.setContent(this.getProcessedData()[0].values[inEvent.index].Name);
      this.$.chart.$.svg.$.toplist.$.measure.setContent(this.getProcessedData()[0].values[inEvent.index].Measure);
    },

    itemTap: function (inSender, inEvent) {
      var row = inEvent.index;
      var selected = this.$.chart.$.svg.$.toplist.getSelection().getSelected();
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
