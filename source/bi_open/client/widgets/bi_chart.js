/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, dimple:true console:true */

(function () {

  /**
    Generic implementation of customizable analytic chart.  Responsible for:
     - handling collections
     - saves
     - common components - title, subtitle, parameterWidget
     Note support for multiple collections corresponding to multiple queryTemplates.
     Most charts just use one MDX query and the one collection (collections[0]).  But
     as Pentaho does not yet support multiple queries (or subqueries) we can join
     multiple query results ourselves.
  */
  enyo.kind(
    /** @lends XV.BiChart# */{
    name: "XV.BiChart",
    published: {
      //****************** these published fields should not be overridden *******************
      processedData: [],
      value: null,              // the backing collection for chart generation
      model: null,              // the backing chart model
      removeIconShowing: false, // show "x" icon to remove chart
      order: null,              // order number of the chart
      collections: [],          // set of collection objects for each queryString
      queryStrings: [],         // set of queryTemplates with values substituted
      chartSubTitle: "",        // sub tile constructed from filter values
      where: [],                 // filters from paramterWidget

      //******* these ones can/should be overridden (although some have sensible defaults) *********
      chartTitle: "",           // used by implementor's makeTitle()
      prefixChartTitle: "",     // prefix used by implementor's makeTitle()
      initialChartTitle: "",    // initial title before pickers are chosen
      collection: "",           // class name for collection
      drillDown: [],
      chartOptions: [],
      queryTemplates: [],
      cube: "",
      schema: {},
      chart : function () {
        return nv.models.multiBarChart();
      },
      chartHeight: "",          // chart should implement setHeight(max)
      chartWidth: ""            // chart should implement setWidth(max)

    },
    classes: "selectable-chart",
    events: {
      onChartRemove: "",
      onSearch: "",
      onWorkspace: "",
      onStatusChange: ""
    },
    components: [
      {kind: "onyx.Popup", name: "spinnerPopup",
        style: "margin-top:40px;margin-left:200px;",
        components: [
        {kind: "onyx.Spinner"},
        {name: "spinnerMessage", content: "_loading".loc() + "..."}
      ]
      },

      {name: "chartGroup",
        kind: "XV.Groupbox",
        classes: "chart-title-bar",
        components: [
          {name: "chartHeader",
            kind: "onyx.GroupboxHeader",
            classes: "chart-title-bar",
            style: "display: flex;",
            components: [
              {name: "chartTitles", kind: "FittableRows", components: [
                {name: "chartTitle", style: "float:left;", classes: "chart-title"},
                {name: "chartSubTitle", classes: "chart-sub-title"}
              ]
              },
              {name: "filterIcon",
                 classes: "icon-filter",
                 ontap: "filterTapped"
              },
            ]
          },
            {kind: 'font.IconButton', name: "removeIcon", icon: "remove",
              showing: false, ontap: "chartRemoved", classes: "remove-icon"},
            {name: "scrollableDrawer", kind: "XV.ScrollableGroupbox", components: [
              {name: "filterDrawer", classes: "chart-filterDrawer xv-pullout", kind: "onyx.Drawer", open: false,
                components: [{classes: "xv-header", content: "_chartFilters".loc()}]
              },
            ]},

            {name: "chartWrapper", classes: "chart-bottom", components: [
              {name: "chart"},
            ]}
          ]
        }
        ],
        /**
          Remove this chart from it's parent (if applicable)
          todo: remove log when we figure out browser freeze on
          removing last chart.
        */
        chartRemoved: function (inSender, inEvent) {
          if (XT.session.config.debugging) {
            XT.log('Dashboard: tap chart remove');
          }
          inEvent.model = this.getModel();
          this.doChartRemove(inEvent);
        },
        /**
         * Implementer calls this to fetch each collection. This will drive
         * the collection's synch method.  On success of last collection, processData
         * will drive processDataChanged which calls plot.
        */
        fetchCollection: function () {
          var that = this;
          _.each(this.collections, function (collection) {
            collection.setQueryComplete(false);
          });
          _.each(this.collections, function (collection, i) {
            collection.fetch({
              data : {mdx : this.getQueryStrings()[i]},
              success: function (collection, results) {
                //
                // Collection fetches can complete in any order.  Wait till all are
                // complete and then process data.
                //
                var allComplete = true;
                _.each(that.collections, function (coll) {
                  allComplete = allComplete && coll.getQueryComplete();
                });
                if (allComplete) {
                  // Hide the scrim
                  that.$.spinnerPopup.hide();
                  // Set the values in the pickers, initialize model
                  that.modelChanged();
                  // Set the order of the chart
                  that.orderChanged();
                  // Save the data results
                  that.processData();
                }
              }
            });
          }, this);
        },

        /**
          Create collections, setup icon, title and parameterWidget.
          Implementer is responsible for updating the queryTemplates, fetching the
          collections and creating the chart area.
         */
        create: function () {
          this.inherited(arguments);

          var that = this,
            collection = this.getCollection(),
            Klass = collection ? XT.getObjectByName(collection) : false;

          //
          // Make collection object for each queryTemplate.  Create this object
          // for collections so they are not shared across all charts.
          //
          this.collections = [];
          this.queryStrings = [];
          if (!Klass) {
            return;
          }
          _.each(this.queryTemplates, function () {
            this.collections.push(new Klass());
          }, this);

          // Show/Hide remove icon
          this.$.removeIcon.setShowing(this.removeIconShowing);

          // Set the chart title
          this.$.chartTitle.setContent(this.getInitialChartTitle());

          // Set the parameterWidget for filters with last filter used
          this.$.filterDrawer.createComponent({name: "parms", kind: this.getParameterWidget()});
          //this.$.filterDrawer.$.parms.setLastFilterUuid(this.model.get("uuidFilter"));
        },
        /**
          Set last filter uuid.  Called by implementor create after everything is set up
          for fetch collection as setLasterFilterUuid can drive a fetch.
        */
        setLastFilter: function () {
          this.$.filterDrawer.$.parms.setLastFilterUuid(this.model.get("uuidFilter"));
        },
        /**
          Save the model that has been changed.
        */
        save: function (model) {
          var options = {};
          options.success = function (model, resp, options) {
            // We have a save! Great! Now we can do something
            // else in here if we so desire.
            var m = model;
          };
          model.save(null, options);
        },
        /*
         *   Because we have a drawer in a scrollable we have to change the size
         *   on open and close.
         */
        filterTapped: function () {
          var drawerHeight = this.getMaxHeight() - 40; //adjust for title size +

          this.$.filterDrawer.applyStyle("width", this.getMaxWidth() + "px");
          if (!this.$.filterDrawer.open) {
            this.$.scrollableDrawer.applyStyle("height", drawerHeight + "px");
          }
          else {
            this.$.scrollableDrawer.applyStyle("height", null);
          }
          this.$.filterDrawer.setOpen(!this.$.filterDrawer.open);
        },
        /*
         * Construct where filters based on parameterWidget filter settings.
         * Set End Year and Month based on filter settings.
         * Save the uuid of the current filter chosen.
         * Update the query and fetch.
         */
        parameterDidChange: function (inSender, inEvent) {
          var parameterWidget = this.$.filterDrawer.$.parms,
            lastFilter = parameterWidget.getCurrentFilter() ? parameterWidget.getCurrentFilter().attributes.uuid : null,
            parameters = parameterWidget ? parameterWidget.getParameters() : [],
            dimensionCode = "",
            that = this,
            comma = "";
          this.setWhere([]);

          //  If the event is just to select a filter (and no parameters are received) we ignore as we
          //  will get another event with the parameters
          if (!(lastFilter && (parameters.length === 0))) {
            this.setChartSubTitle("");
            this.getModel().set("uuidFilter", lastFilter);
            this.save(this.getModel());

            // the endyearpicker & endmonthpicker do not get reset to current when the filter is set to default!
            if (parameters.length === 0) {
              this.setYear("current");
              this.setMonth("current");
            }
            _.each(parameters, function (parm) {
                if (parm.attribute === "year") {
                  that.setYear(parm.value);
                }
                if (parm.attribute === "month") {
                  that.setMonth(parm.value.replace("0", ""));  // get rid of leading 0
                }
                dimensionCode = that.schema.getDimensionHier(that.getCube(), parm.attribute);
                if (dimensionCode) {
                  comma = that.chartSubTitle.length > 0 ? ", ": "";
                  that.chartSubTitle += comma + ("_" + parm.attribute).loc() + ":" + parm.value.id;
                  // notice where clauses only support =
                  that.where.push(
                      {attribute: parm.attribute,
                       dimension: dimensionCode,
                       operator: "=",
                       value: parm.value.id});
                }
              });
            this.updateQueries();
            this.fetchCollection();
          }
          return true;
        },
        /*
         * Make end date based on settings of year and month and nextPeriods 
         */
        getEndDate: function () {
          var date = new Date();
          if (this.getYear() !== "current") {
            date.setYear(this.getYear());
            date.setMonth(11);
          }
          if (this.getMonth() !== "current") {
            date.setMonth(Number(this.getMonth()) + Number(this.getNextPeriods()) - 1);
          }
          else {
            date.setMonth(Number(date.getMonth()) + Number(this.getNextPeriods()));
          }
          return date;
        },

        orderChanged: function () {
          this.getModel().set("order", this.getOrder());
        },
        /**
          Set chart component widths and heights using max sizes from dashboard - up to chart implementor.
         */
        setComponentSizes: function (maxHeight, maxWidth) {
        },
        /**
          Set chart plot size using max sizes from dashboard - up to chart implementor.
         */
        setPlotSize: function (maxHeight, maxWidth) {
        },
        /**
          Drill down to list or item - up to implementer.
         */
        drillDown: function (field, key) {
        },
        /**
          Make the chart - up to chart implementer.
         */
        plot: function (type) {
        },
        /**
          Update Queries based on pickers - up to chart implementer.
         */
        updateQueries: function (pickers) {
        },
        /**
          Model changed, set pickers and initialize model - up to chart implementer.
         */
        modelChanged: function () {
        },

        /*
         * Destroy and re-plot the chart area when the data changes - up to chart implementer
         */
        processedDataChanged: function () {
        },
        /**
          After render, replot the charts.
        */
        rendered: function () {
          this.inherited(arguments);
          this.processData();
        },
        /**
          Set model bindings on the chart
        */
        setBindings: function (action) {
          action = action || 'on';
          this.model[action]("statusChange", this.statusChanged, this);
        },
        /**
          Bubble a status changed event to the Dashboard so that it
          can control the spinner and save buttons.
        */
        statusChanged: function (model, status, options) {
          var inEvent = {model: model, status: status};
          this.doStatusChange(inEvent);
        }
      });

}());
