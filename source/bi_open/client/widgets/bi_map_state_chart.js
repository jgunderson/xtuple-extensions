/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, L: true, window: true, enyo:true, nv:true, d3:true, RGraph:true console:true */

(function () {

  /**
    Map Chart of states using Leaflet.  XV.BiMapStateChart extends XV.BiMapChart and is 
    responsible for state plotting using a geojson of state plots.  The usstates.js 
    currently has only US states but can be extended to other countries as it uses the
    country-region naming standard.

      Input format:
      [
        {"[Bill City].[Country Name].[MEMBER_CAPTION]":"AUSTRIA",
         "[Bill City].[Region Code].[MEMBER_CAPTION]":"AT-AUSTRIA",
         "[Bill City].[City Name].[MEMBER_CAPTION]":"Vienna",
         "[Customer.Customer Code].[Customer Code].[MEMBER_CAPTION]":"VCOL",
         "[Measures].[Latitude]":"42.12",
         "[Measures].[Longitude]":"16.22",
         "[Measures].[TheSum]":"824647.1"},
      ]
      Output format:
      [
        {
          "values": [
          {
            "dimension": "VCOL",
            "geoDimension": "Vienna",
            "latitude": "42.12",
            "longitude": "16.22",
            "measure": "824647.1"
          },
         ]
        }
      ]
    */

  enyo.kind(
    /** @lends XV.BiMapChart # */{
    name: "XV.BiMapStateChart",
    kind: "XV.BiMapChart",
    published: {
      geoDimension: "[Bill City].[Region Code]", // todo move to a button
      dimensionHier: "[Customer.Customer Code].[Customer Code]"
    },

/*
 *  See file:///Z:/xtuple-fork/private-extensions/lib/leaflet-markercluster/example/marker-clustering.html
 *  Errors if used with leaflet-8dev.js.
 *  Stalls on this.getTheMap().addLayer(markers) using leaflet7.js
 *
 * */
    plot: function (type) {

      var divId = this.$.chart.$.svg.hasNode().id,
        chartId = this.$.chart.hasNode().id,
        currentGeoDimension,
        regionSum,
        regionSumMax = 0,
        dimList,
        geojson,
        that = this,
        tileLayer,
        measureMeta = this.schema.getMeasureName(this.getCube(), this.getMeasure()),
        geoData = new XM.geoData(),
        regions = JSON.parse(JSON.stringify(geoData.getRegions())); // deep copy regions
      
      function format(measureMeta, measure) {
        if (measureMeta.indexOf("Amount") !== -1 || measureMeta.indexOf("Average") !== -1) {
          return XV.FormattingMixin.formatMoney(measure, that);
        }
        else {
          return XV.FormattingMixin.formatQuantity(measure, that);
        }
      }
      
      function getColor(measure, measureMax) {
        return measure > 0.84 * measureMax ? '#800026' :
               measure > 0.72 * measureMax  ? '#BD0026' :
               measure > 0.60 * measureMax  ? '#E31A1C' :
               measure > 0.48 * measureMax  ? '#FC4E2A' :
               measure > 0.36 * measureMax   ? '#FD8D3C' :
               measure > 0.24 * measureMax  ? '#FEB24C' :
               measure > 0.12 * measureMax   ? '#FED976' :
                          '#FFEDA0';
      }
  
      function style(feature) {
        return {
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7,
          //fillColor: getColor(feature.properties.measure, 2)
         fillColor: getColor(feature.properties.density, 100)
        };
      }

      if (this.getProcessedData().length > 0) {
        /*
         * Fill in aggregates of measures and lists of customers in the copy of regions.
         */
        _.each(this.getProcessedData()[0].values, function (value) {

          //--------- If there is a new geo Dimension ---------------------------
          if (value.geoDimension !== currentGeoDimension) {
            // If there is a dimension list and we find the geo Dimension feature 
            // in regions, then update the feature properties.
            if (dimList) {
              var feature = _.find(regions.features, function (feature) {
                if (feature.properties.name === value.geoDimension) {
                  return feature;
                }
              });
              if (feature) {
                dimList += "<dl/>";  // finish the list
                feature.properties.list = dimList;
                feature.properties.measure = format(measureMeta, regionSum);
              }
            }
            
            // Start a new dimension list
            dimList = "<dl><dd>" + value.dimension + ", " + format(measureMeta, value.measure) + "</dd>";
            // Start a new regionSum
            regionSum = value.measure;
            regionSumMax = regionSum > regionSumMax ? regionSum : regionSumMax;
              
          }
          //--------- Else update info for current geo Dimension ---------------------------
          else {
            dimList += "<dd>" + value.dimension + ", " + format(measureMeta, value.measure) + "</dd>";
            regionSum += value.measure;
            regionSumMax = regionSum > regionSumMax ? regionSum : regionSumMax;
          }
        });
        /*  
         * Make a new map
         */
        L.Icon.Default.imagePath = XT.getBaseUrl() + XT.getOrganizationPath() +
          '/xtuple-extensions/source/bi_open/client/lib/leaflet/dist/images';
        if (this.getTheMap()) {
          this.getTheMap().remove();
        }
        this.setTheMap(new L.Map(chartId), {zoom: 50});
        //tileLayer = L.tileLayer.provider(this.getChartType());
        //tileLayer.options.minZoom = 1;
        //tileLayer.options.maxZoom = 18;
        this.getTheMap().setView([37.8, -96], 4);
        //this.getTheMap().addLayer(tileLayer);
        
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'examples.map-20v6611k'
    }).addTo(this.getTheMap());
        
        
        
        
        //geojson = L.geoJson(geoData.getRegions(), {style: style}).addTo(this.getTheMap());
        geojson = L.geoJson(geoData.getStatesData(), {style: style}).addTo(this.getTheMap());
        
      }
    }

  });

}());
