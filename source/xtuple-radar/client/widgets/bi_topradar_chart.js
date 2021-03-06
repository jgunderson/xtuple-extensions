/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, nv:true, d3:true, RGraph:true, dimple:true console:true */

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
    name: "XV.BiTopRadarChart",
    kind: "XV.BiToplistChart",
    published: {
      chartTag: "canvas",
    },

    plot: function (type) {
           
      /* rgraph Plot */
      var measures = [],
        labels = [],
        tips = [],
        tooltips = [],
        data = this.getProcessedData(),
        canvasId = this.$.chart.$.svg.hasNode().id;
      if (data.length > 0) {
        _.each(data[0].values, function (value) {
          tips.push(value.Measure);
          measures.push(Number(value.Measure.replace(/\$/g, "").replace(/,/g, "")));
          labels.push(value.Name);
        });
        var radar = new RGraph.Radar(canvasId, measures);
        radar.Set('labels', labels);
        radar.Set('tooltips', tips);
        radar.Set('background.circles.poly', true);
        radar.Set('background.circles.spacing', 30);
        radar.Set('colors', ['rgba(255,0,0,0.25)', 'rgba(255,255,0,0.25)']);
        radar.Set('axes.color', 'transparent');
        radar.Set('highlights', true);
        radar.Set('strokestyle', ['red', 'black']);
        RGraph.Effects.Radar.Grow(radar);
      }
    },

  });

}());
