/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, dimple:true console:true */

(function () {

  /**
    Implementation of BiChart with chart dimension picker and measure picker.  Uses cube meta data
    to populate pickers.  Responsible for:
      - enyo components
      - picker management
      - filter management
      - requesting update of query templates based on pickers and filters
      - creating chart area
  */
  enyo.kind(
    /** @lends XV.BiChartTypeMeasure# */{
    name: "XV.BiChartDimMeasure",
    kind: "XV.BiChart",
    published: {
      chartTag: "svg",
      dimensions: [],
      maxHeight: 0,
      maxWidth: 0,
      measures: [],
      // queryParms:
      dimension: "",
      measure: "",
      time: "",
      where: [],
      year: "current",
      month: "current",
      // May want to override these in the implementation 
      parameterWidget: "XV.SalesChartParameters",
      initialChartTitle: "_chooseDimensionMeasure".loc()
    },
    handlers: {
      onParameterChange: "parameterDidChange"
    },
    chartControls:
      {kind: "enyo.FittableColumns", components: [
        {content: "_dimension".loc() + ": ", classes: "xv-picker-label", name: "dimLabel"},
        {kind: "onyx.PickerDecorator", name: "chartPickerDecorator", onSelect: "dimSelected",
        components: [
          {kind: "XV.PickerButton", content: "_chooseOne".loc()},
          {name: "dimPicker", kind: "onyx.Picker"}
        ]},
        {content: "_measure".loc() + ": ", classes: "xv-picker-label"},
        {kind: "onyx.PickerDecorator", onSelect: "measureSelected",
          components: [
          {kind: "XV.PickerButton", content: "_chooseOne".loc()},
          {name: "measurePicker", kind: "onyx.Picker"}
        ]}
      ]},
    /**
      Populate the pickers and kickoff fetch of collections.
    */
      create: function () {
        var that = this,
          model = this.getModel();
        this.inherited(arguments);
        
        // Add controls to components.  owner:this makes this the owner instead of
        // chartWrapper so the onSelect is handled by this.
        this.$.chartWrapper.createComponent({owner: this}, this.chartControls);

        // Populate the dimension picker
        this.setDimensions(this.schema.getDimensions(this.getCube()));
        _.each(this.getDimensions(), function (item) {
          var pickItem = {name: item, content: ("_" + item).loc()};
          that.$.dimPicker.createComponent(pickItem);
        });
    
        // Populate the measure picker
        this.setMeasures(this.schema.getMeasures(this.getCube()));
        _.each(this.getMeasures(), function (item) {
          var pickItem = {name: item, content: ("_" + item).loc()};
          that.$.measurePicker.createComponent(pickItem);
        });
        
        // Set measure and dimension from model
        if (model.get("measure")) {
          this.setMeasure(model.get("measure"));
        }
        if (model.get("dimension")) {
          this.setDimension(model.get("dimension"));
        }
        
        // If the measure and dimension are defined, fill in the queryTemplate
        // and ask the Collection to get data.
        if (this.getMeasure() && this.getDimension()) {
          this.updateQueries();
          this.fetchCollection();
        }
      },
      /* 
       * Override parameterDidChange:  As the user can choose a dimension, we can not filter on the 
       * same dimension so we remove such filters from the where array.    
       */
      parameterDidChange: function (inSender, inEvent) {
        var that = this,
          dimFilter = "",
          dimPicked = that.schema.getDimensionHier(that.getCube(), that.getDimension());
        this.inherited(arguments);
        _.each(this.where, function (filter, index) {
          dimFilter = filter.substring(0, dimPicked.length);
          if (dimFilter === dimPicked) {
            that.where.splice(index, 1);
          }
        });
        return true;
      },
      /**
        Set chart component widths and heights using max sizes from dashboard - up to chart implementor.
       */
      setComponentSizes: function (maxHeight, maxWidth) {
        var height = Number(maxHeight) - 20,
          width = Number(maxWidth) - 20;
        this.setMaxHeight(maxHeight);  // for filterTapped to use later
        this.setMaxWidth(maxWidth);    // for filterTapped to use later
        this.$.chartGroup.setStyle("width:" + width + "px;");
        this.$.chartHeader.setStyle("width:" + width + "px;");
        this.$.chartTitles.setStyle("width:" + (width - 20) + "px;");
        this.setStyle("width:" + width + "px;height:" + height + "px;");               // class selectable-chart
        this.$.chartWrapper.setStyle("width:" + width + "px;height:" + (height - 32) + "px;");
        this.$.chartTitle.setStyle("width:" + width + "px;height:28px;");
        this.$.chart.setStyle("width:" + width + "px;height:" + (height - 96) + "px;");
      },

      /**
        When the dimension value changes, set the selected value
        in the picker widget, fetch the data and re-process the data.
      */
      dimensionChanged: function () {
        var that = this,
          selected = _.find(this.$.dimPicker.controls, function (option) {
            return option.name === that.getDimension();
          });
        this.$.dimPicker.setSelected(selected);
        if (this.getMeasure() && this.getDimension()) {
          this.updateQueries();
          this.fetchCollection();
        }
      },
      /**
        A new dimension was selected in the picker. Set
        the published dimension attribute.
      */
      dimSelected: function (inSender, inEvent) {
        this.setDimension(inEvent.originator.name);
        this.getModel().set("dimension", inEvent.originator.name);
        this.save(this.getModel());
      },
      /**
        When the measure value changes, set the selected value
        in the picker widget, fetch the data and re-process the data.
      */
      measureChanged: function () {
        var that = this,
          selected = _.find(this.$.measurePicker.controls, function (option) {
            return option.name === that.getMeasure();
          });
        this.$.measurePicker.setSelected(selected);
        if (this.getMeasure() && this.getDimension()) {
          this.updateQueries();
          this.fetchCollection();
        }
      },
      /**
        A new measure was selected in the picker. Set
        the published measure attribute.
      */
      measureSelected: function (inSender, inEvent) {
        this.setMeasure(inEvent.originator.name);
        this.getModel().set("measure", inEvent.originator.name);
        this.save(this.getModel());
      },
      /*
       * Destroy and re-plot the chart area when the data changes.
       */
      processedDataChanged: function () {
        this.createChartComponent();
        this.plot("");
      },
    });
}());
