/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, dimple:true console:true */

(function () {

  /**
    Implementation of BiChart with chart measure picker.  Responsible for:
      - enyo components
      - picker management
      - filter management
      - requesting update of query templates based on pickers and filters
      - creating chart area
  */
  enyo.kind(
    /** @lends XV.BiChartMeasure# */{
    name: "XV.BiChartMeasure",
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
      where: [],
      year: "current",
      month: "current",
      // May want to override these in the implementation 
      parameterWidget: "XV.SalesChartParameters",
      initialChartTitle: "_chooseMeasure".loc()
    },
    handlers: {
      onParameterChange: "parameterDidChange"
    },
    chartControls:
      {kind: "enyo.FittableColumns", components: [
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
  
        // Populate the Measure picker from cubeMetaOverride or cubeMeta
        this.setMeasures(this.schema.getMeasures(this.getCube()));
        _.each(this.getMeasures(), function (item) {
          var pickItem = {name: item, content: ("_" + item).loc()};
          that.$.measurePicker.createComponent(pickItem);
        });
        
        // Set the measure and chart type from model    
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
        this.setStyle("width:" + width + "px;height:" + height + "px;");  // class selectable-chart
        this.$.chartWrapper.setStyle("width:" + width + "px;height:" + (height - 32) + "px;");
        this.$.chartTitle.setStyle("width:" + width + "px;height:28px;");
        this.$.chart.setStyle("width:" + width + "px;height:" + (height - 96) + "px;");
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
