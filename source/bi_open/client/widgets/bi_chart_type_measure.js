/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, dimple:true console:true */

(function () {

  /**
    Implementation of BiChart with chart type picker and measure picker.  Uses cube meta data
    to populate measure picker.  Responsible for:
      - enyo components
      - picker management
      - filter management
      - requesting update of query templates based on pickers & filters
      - creating chart area
  */
  enyo.kind(
    /** @lends XV.BiChartTypeMeasure# */{
    name: "XV.BiChartTypeMeasure",
    kind: "XV.BiChart",
    published: {
      chartType: "barChart",
      chartTag: "svg",
      maxHeight: 0,
      maxWidth: 0,
      measures: [],
      // queryParms: 
      measure: "",
      time: "",
      year: "current",
      month: "current",
      // May want to override these in the implementation 
      parameterWidget: "XV.SalesChartParameters",
      initialChartTitle: "_chooseMeasure".loc()
    },
    handlers: {
      onParameterChange: "parameterDidChange",
//      onItemSave: "filterSaved"
    },
    chartControls:
      {kind: "enyo.FittableColumns", components: [
        {content: "_chartType".loc() + ": ", classes: "xv-picker-label", name: "chartTypeLabel"},
        {kind: "onyx.PickerDecorator", name: "chartPickerDecorator", onSelect: "chartSelected",
          components: [
          {kind: "XV.PickerButton", content: "_chooseOne".loc()},
          {name: "chartPicker", kind: "onyx.Picker"}
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
         
        // Populate the chart picker
        _.each(this.getChartOptions(), function (item) {
          item.content = item.content || ("_" + item.name).loc(); // default content
          if (that.getChartOptions().length === 1) {
            // if there's only one option, no need to show the picker
            that.$.chartTypeLabel.setShowing(false);
            that.$.chartPickerDecorator.setShowing(false);
            that.setChartType(item.name);
          }
          that.$.chartPicker.createComponent(item);
        });
        
        // Populate the measure picker
        this.setMeasures(this.schema.getMeasures(this.getCube()));
        _.each(this.getMeasures(), function (item) {
          var pickItem = {name: item, content: ("_" + item).loc()};
          that.$.measurePicker.createComponent(pickItem);
        });

        // Set the measure, chart type from model
        if (model.get("measure")) {
          this.setMeasure(model.get("measure"));
        }
        this.setChartType(model.get("chartType") || "barChart");
  
        //  If the measure is defined, fill in the queryTemplate
        //  and ask the Collection to get data.
        if (this.getMeasure()) {
          this.updateQueries();
          this.fetchCollection();
        }
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
        this.$.chartTitle.setStyle("width:" + (width - 20) + "px;height:28px;");
        this.$.chart.setStyle("width:" + width + "px;height:" + (height - 96) + "px;");
      },
  
      /**
        When the value changes, set the selected value
        in the picker widget and re-process the data.
      */
      chartTypeChanged: function () {
        var that = this,
          selected = _.find(this.$.chartPicker.controls, function (option) {
            return option.name === that.getChartType();
          });
        if (selected) {
          this.$.chartPicker.setSelected(selected);
        }
        this.createChartComponent();
        this.plot(this.getChartType());
      },
      /**
        A new  value was selected in the picker. Set
        the published  attribute and the model.
      */
      chartSelected: function (inSender, inEvent) {
        this.setChartType(inEvent.originator.name);
        this.getModel().set("chartType", inEvent.originator.name);
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
        this.updateQueries();
        this.fetchCollection();
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
        this.plot(this.getChartType());
      },

    });

}());
