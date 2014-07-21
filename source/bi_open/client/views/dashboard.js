/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, console:true */

(function () {

  /*
    Generic Grid Arranger with size set for small charts 
  */
  enyo.kind({
    name: "ChartsArrangerSm",
    kind: "GridArranger",
    // These values determine how big of an area is allocated
    // for this panel. If this is smaller than the size of the
    // item, then the next panel will overlap.  Hard coded as
    // there is no way to get the arrangerKind object to change
    // its properties.
    colHeight: 340,
    colWidth: 520
  });
  /*
    Generic Grid Arranger with size set for large charts 
  */
  enyo.kind({
    name: "ChartsArrangerLg",
    kind: "GridArranger",
    colHeight: 680,
    colWidth: 1040
  });

  /**
    Generic Panels showing several charts on a dashboard.  Sub kinds must set
    theArranger to set arrangerKind.
  */
  enyo.kind(
    /** @lends XV.ChartsPanelsSm# */{
      name: "XV.ChartsPanelsSm",
      kind: "Panels",
      arrangerKind: null,
      fit: true,
      wrap: true,
      classes: "charts-panels",
      panelCount: 0,
      handlers: {
        onChartRemove: "removeChart"
      },
      /**
        Clear out all of the panels from Panels widget
      */
      clearCharts: function () {
        this.destroyClientControls();
        this.panelCount = 0;
      },
      /**
        Here we're just making a little pit stop to grab
        the panel that started this event (not the remove icon).
        We add the panel to the event and keep going to the dashboard.
      */
      removeChart: function (inSender, inEvent) {
        inEvent.panel = inSender;
      },
    });

  /**
    Generic dashboard with menu for choosing charts to display
    in the arranger. Dashboard has the ability to save the selected
    charts and the filtering/group options.
  */
  enyo.kind(
    /** @lends XV.Listboard */{
    name: "XV.BiDashboard",
    kind: "XV.Listboard",
    canAddNew: true,
    fit: true,
    handlers: {
      onChartRemove: "removeChart",
      onStatusChange: "statusChanged"
    },
    published: {
      value: null, // collection of charts
      filterDescription: null, // just here to make navigator happy,
      actions: null,
      exportActions: null,
      navigatorActions: null,
      newActions: [],
      allowFilter: false,

      // these are expected to be overridden by child dashboard
      query: null, // parameter filter query
      collection: null, // collection model
      extension: null, // extension name
      label: "_dashboard".loc(),  // dashboard label
      theArranger: null, // the arrangerKind
      chartActions: [], // charts for new action
      maxColHeight: 340, // max chart height
      maxColWidth: 520,  // max chart width
    },
    classes: "dashboard",
    components: [
      {name: "panels", kind: "XV.ChartsPanels", onTransitionFinish: "transitionFinished"}
    ],
    
    /**
      Add a chart kind to the Panels
    */
    addChart: function (value) {
      var p = this.$.panels,
        kind = value.get("chartname"),
        i = p.panelCount++,
        // make a component object with the model value for the chart
        component = {kind: kind, model: value, order: i, removeIconShowing: true},
        newChart = p.createComponent(component);
      newChart.setComponentSizes(this.getMaxColHeight(), this.getMaxColWidth());
      newChart.setPlotSize(this.getMaxColHeight(), this.getMaxColWidth());
      //newChart.render();
      p.reflow();
      p.render();
    },
    /**
      Creates a new model for the chart and adds it to list.
    */
    newRecord: function (kind) {
      var Klass = this.getValue().model,
      K = XM.Model,
      model = new Klass(null, {isNew: true});

      model.set("chartname", kind);
      model.set("extension", this.getExtension());

      this.getValue().add(model);
      // Setting the status to READY_NEW because adding it
      // to the collection sets it to READY_CLEAN
      model.setStatus(K.READY_NEW);
      // Let's go ahead and save the new model so
      // we can dirty it up later
      
      this.save(model);
      this.addChart(model);
    },
    /**
      Set the value of the kind to the collection specified
      in the child kind.
     */
    collectionChanged: function () {
      var collection = this.getCollection(),
        Klass = collection ? XT.getObjectByName(collection) : false;

      if (Klass) {
        this.setValue(new Klass());
      } else {
        this.setValue(null);
      }
    },
    create: function () {
      var that = this;
      this.inherited(arguments);
      this.collectionChanged();
      
      // Set the arrangerKind (determines max size of chart areas)
      this.$.panels.setArrangerKind(this.getTheArranger());

      // set the default filters
      var parameters = this.getQuery();
      this.setQuery({
        parameters: [{
          attribute: "username",
          operator: "=",
          value: XT.session.details.username
        },
        {
          attribute: "extension",
          operator: "=",
          value: this.getExtension()
        }],
        orderBy: [
          {attribute: 'order'}
        ]
      });

      if (parameters) {
        this.getQuery().parameters = parameters.parameters.concat(parameters);
      }
      
      // Set up new actions. Implementer must define
      this.setupNewActions();
      
    },
    /**
     Get the list of applicable charts from the database
      and load the panels with charts.
     */
    fetch: function (options) {
      var that = this,
        query = this.getQuery();
      options = options ? _.clone(options) : {};

      options.success = function (collection, results) {
        // remove all of the existing panels and then reload
        var p = that.$.panels;
        p.clearCharts();

        //for each model in the collection,
        //add a new chart to the panels
        _.each(collection.models, function (model) {
          that.addChart(model);
        });
      };
      options.query = query || {};
      this.getValue().fetch(options);
    },
    /**
      This grabs the model and the panel for the
      chart from the event and destroys both of them.
      todo: remove the logs after we figure out what causes
      browser to freeze after the last chart is deleted
    */
    removeChart: function (inSender, inEvent) {
      var model = inEvent.model,
        panel = inEvent.panel, p = this.$.panels;

      if (XT.session.config.debugging) {
        XT.log('Dashboard: panel.destroy');
      }
      
      if (panel) {
        panel.destroy();
      }

      if (XT.session.config.debugging) {
        XT.log('Dashboard: remove(model)');
      }
      this.getValue().remove(model);
      
      
      if (XT.session.config.debugging) {
        XT.log('Dashboard: model.destroy');
      }
      model.destroy();

      --p.panelCount;
      inEvent = {originator: this.$.panels, toIndex: 0,
          fromIndex: 0};
      this.transitionFinished(this, inEvent);
      
      if (XT.session.config.debugging) {
        XT.log('Dashboard: reflow/render after destroy');
      }
      this.reflow();
      this.render();
    },
    /**
      Save the model that has been changed.
    */
    save: function (model) {
      var options = {};
      options.success = function (model, resp, options) {
        // We have a save! Great! Now we can do something
        // else in here if we so desire.
      };
      model.save(null, options);
    },
    /**
      Based on the status of the models in the dashboard,
      set the save button enabled/disabled.
    */
    statusChanged: function (inSender, inEvent) {
      var K = XM.Model, canSave = false,
        model = inEvent.model, status = model.getStatus();

      if (model.canUpdate && (status === K.READY_NEW || model.isDirty())) {
        // since we can save, go ahead and do it!
        this.save(model);
      }
    },
    /**
      Handles the onTransitionFinsh event from the Panels
      that is fired when they are dragged.
    */
    transitionFinished: function (inSender, inEvent) {
      // the event has a to and from value that is based on
      // the index of the "active" panel at the zero position.

      var p = inEvent.originator, panels = p.getPanels(),
        to = inEvent.toIndex, from = inEvent.fromIndex,
        shift = to - from; // a positive shift means a shift right

      for (var i = 0; i < panels.length; i++) {
        var panel = panels[i],
          newIndex = i + shift === p.panelCount ? 0 : i + shift;
        panel.setOrder(newIndex);
      }
    }
  });
  
  /**
    Dashboard of charts displayed in small arranger.
  */
  enyo.kind(
    /** @lends XV.BIDashboard */{
    name: "XV.BiDashboardCharts",
    kind: "XV.BiDashboard",
    published: {
      label: "_dashboard".loc(),
      theArranger: "ChartsArrangerSm",
      maxColHeight: 340,
      maxColWidth: 520,
      newActions: [],
    },
    setupNewActions: function () {
      // Set up new actions based on global chartActions that are defined when extensions load.  
      // Only add if privilege is correct.
      var actionOK = true,
        that = this;
      this.newActions = [];
      _.each(XT.chartActions, function (action) {
        actionOK = true;
        _.each(action.privileges, function (privilege) {
          actionOK = XT.session.privileges.attributes[privilege] === true ? actionOK : false;
        });
        if (actionOK) {
          that.newActions.push(action);
        }
      });
    }
  });
  
  /**
    Dashboard of maps displayed in large arranger.
  */
  enyo.kind(
    /** @lends XV.BIDashboard */{
    name: "XV.BiDashboardMaps",
    kind: "XV.BiDashboard",
    published: {
      label: "_maps".loc(),
      theArranger: "ChartsArrangerLg",
      maxColHeight: 680,
      maxColWidth: 1040,
      newActions: [],
      /*
       *   chartActions will become newActions if they have the specified privileges
       */
      chartActions: [
        /*
         * Opportunity charts
         */
        {name: "bookingsMapTrailing", label: "_bookingsMapTrailing".loc(), item: "XV.Period12BookingsMapChart", privileges: ["ViewSalesOrders"]},
      ],
    },
    setupNewActions: function () {
      // Set up new actions based on global mapActions that are defined when extensions load.  
      // Only add if privilege is correct.
      var actionOK = true,
        that = this;
      this.newActions = [];
      _.each(XT.mapActions, function (action) {
        actionOK = true;
        _.each(action.privileges, function (privilege) {
          actionOK = XT.session.privileges.attributes[privilege] === true ? actionOK : false;
        });
        if (actionOK) {
          that.newActions.push(action);
        }
      });
    }
  });


}());
