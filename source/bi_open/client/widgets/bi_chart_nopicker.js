/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, dimple:true console:true */

(function () {

  /**
    Implementation of BiChart Responsible for:
      - enyo components
      - filter management
      - requesting update of query templates based on pickers
      - creating chart area    
  */
  enyo.kind(
    /** @lends XV.BiChartMeasure# */{
    name: "XV.BiChartNoPicker",
    kind: "XV.BiChart",
    published: {
      chartType: "barChart",
      chartTag: "svg",
      maxHeight: 0,
      maxWidth: 0,
      measures: [],
      // queryParms:
      time: "",
      where: [],
      year: "current",
      month: "current",
      // May want to override these in the implementation 
      parameterWidget: "XV.SalesChartParameters"
    },
    handlers: {
      onParameterChange: "parameterDidChange"
    },
    
    /**
      Kickoff fetch of collections.
    */
    create: function () {
      var that = this,
        model = this.getModel();
      this.inherited(arguments);
                     
      //  Fill in the queryTemplate and ask the Collection to get data.
      this.updateQueries();
      this.fetchCollection();
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
      this.setStyle("width:" + width + "px;height:" + height + "px;");               // class selectable-chart
      this.$.chartWrapper.setStyle("width:" + width + "px;height:" + (height - 32) + "px;");
      this.$.chartTitle.setStyle("width:" + width + "px;height:28px;");
      this.$.chart.setStyle("width:" + width + "px;height:" + (height - 16) + "px;");
    },
    /**
     * Destroy and re-plot the chart area when the data changes.
     */
    processedDataChanged: function () {
      this.createChartComponent();
      this.plot(this.getChartType());
    },
    
  });
  
}());
