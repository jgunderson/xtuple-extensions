/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XM:true, XV:true, _:true, L: true, window: true, enyo:true, nv:true, d3:true, RGraph:true console:true */

(function () {

  /**
    Map Chart using Leaflet.  Responsible for:
    -  update of query templates based on pickers
    -  processing multiple query results into Leaflet format
    -  plotting with Leaflet

      ProcessData changes the data from xmla4js format to Leaflet format.

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
    name: "XV.BiMapChart",
    kind: "XV.BiChartTypeMeasure",
    published: {
      dateField: "",
      //endDate: new Date(),
      chartTag: "svg",  //rgraph requires the html5 canvas tag
      labels: [],
      updatedLabels: [],
      nextPeriods: 0, // number of periods to add to end date for forecasts
      toolTips: [],
      plotHeight: 0,
      plotWidth: 0,
      theMap: null,  // need to remember the map as it needs to be destroyed before recreated.
      geoDimension: "[Bill City].[City Name]", // todo move to a button
      dimensionHier: "[Customer.Customer Code].[Customer Code]"
    },

    /**
      Any initialization
    */
    create: function () {
      this.inherited(arguments);
      this.updatedLabels = [];           //we modify labels with data so we make a this object
      this.$.chartWrapper.setClasses("map-bottom");  //set map styles for background
    },

    /**
      Update Queries based on pickers using cube meta data.  Replace cube name, measure
      name, dimension info.  Use current year & month or next periods if nextPeriods set.
     */
    updateQueries: function () {
      var date = this.getEndDate();
      _.each(this.queryTemplates, function (template, i) {
        var measure = this.schema.getMeasureName(template.cube, this.getMeasure()),
          dimensionGeo = this.getGeoDimension(),
          dimensionHier = this.getDimensionHier();
        this.queryStrings[i] = template.jsonToMDX(this.getWhere());
        this.queryStrings[i] = this.queryStrings[i].replace(/\$measure/g, measure);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$dimensionGeo/g, dimensionGeo);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$dimensionHier/g, dimensionHier);
        this.queryStrings[i] = this.queryStrings[i].replace(/\$year/g, date.getFullYear());
        this.queryStrings[i] = this.queryStrings[i].replace(/\$month/g, date.getMonth() + 1);
      }, this
      );
    },
    
    /*
     * Process data from input format to output format.
     */
    processData: function () {
      var formattedData = [],
        collection = this.collections[0],
        values = [],
        entry = {},
        dimensionGeo = this.getGeoDimension(),
        dimensionHier = this.getDimensionHier();
      function getValueForPartKey(partKey, collection) {
        var theValue = null;
        _.each(collection, function (value, key) {
          if (key.indexOf(partKey) > -1) {
            theValue = value;
          }
        });
        return theValue;
      }
      if (collection.models.length > 0) {
        for (var i = 0; i < collection.models.length; i++) {
          entry = { "geoDimension": getValueForPartKey(dimensionGeo, collection.models[i].attributes),
                    "latitude": getValueForPartKey("[Latitude]", collection.models[i].attributes),
                    "longitude": getValueForPartKey("[Longitude]", collection.models[i].attributes),
                    "dimension": getValueForPartKey(dimensionHier, collection.models[i].attributes),
                    "measure": getValueForPartKey("TheSum", collection.models[i].attributes)
                   };
          values.push(entry);
        }
        formattedData.push({ values: values, measures: [ this.getMeasure()]});
      }
      this.$.chartTitle.setContent(this.makeTitle()); // Set the chart title
      this.$.chartSubTitle.setContent(this.getChartSubTitle()); // Set the chart sub title
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
      thisEnyo.drillDown[indexDD].parameters[0].value = startDate;
      thisEnyo.drillDown[indexDD].parameters[1].value = endDate;
      thisEnyo.drillDown[indexDD].parameters[2].value = startDate;
      thisEnyo.drillDown[indexDD].parameters[3].value = endDate;

      // TODO: the parameter widget sometimes has trouble finding our query requests

      listKind = XV.getList(recordType);

      thisEnyo.doSearch({
        list: listKind,
        searchText: "",
        callback: callback,
        parameterItemValues: thisEnyo.drillDown[indexDD].parameters,
        conditions: [],
        query: null
      });
    },

    hover: function (e, shape) {
      var event = e;
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
        that = this,
        shownLayer,
        polygon,
        amounts = [],
        amountsSum,
        tileLayer,
        markerKey = {geoDimension: "", latitude: "", longitude: "",},
        marker,
        markerLabel,
        markerSum,
        measure = this.schema.getMeasureName(this.getCube(), this.getMeasure());

      L.Icon.Default.imagePath = XT.getBaseUrl() + XT.getOrganizationPath() +
        '/xtuple-extensions/source/bi_open/client/lib/leaflet/dist/images';

      function removePolygon() {
        if (shownLayer) {
          shownLayer.setOpacity(1);
          shownLayer = null;
        }
        if (polygon) {
          that.getTheMap().removeLayer(polygon);
          polygon = null;
        }
      }
      
      /*
       * Make a cluster group icon when zoom in or out.  The range between the smallest amount
       * and the sum of amounts is divided into 3 ranges.  Small, medium and large icons are 
       * used for the ranges.
       */
      var markers = new L.MarkerClusterGroup({
          iconCreateFunction: function (cluster) {
            var markers = cluster.getAllChildMarkers(),
              n = 0,
              minAmount = Math.min.apply(Math, amounts),
              thirdRange = (amountsSum - minAmount) / 3,
              sumFormatted = 0;
            for (var i = 0; i < markers.length; i++) {
              n += Number(markers[i].number);
            }
            n = Math.round(n);
            // format measure
            if (measure.indexOf("Amount") !== -1 || measure.indexOf("Average") !== -1) {
              sumFormatted = XV.FormattingMixin.formatMoney(n, that);
            }
            else {
              sumFormatted = XV.FormattingMixin.formatQuantity(n, that);
            }
            if (n <= minAmount + thirdRange) {
              return L.divIcon({ html: '<br>' + sumFormatted,
                //className: 'leaflet-marker-icon map-cluster marker-cluster-small leaflet-zoom-animated leaflet-clickable',
                className: 'map-cluster map-cluster-small',
                iconSize: L.point(40, 40) });
            }
            else if ((n > minAmount + thirdRange) && (n <= minAmount + 2 * thirdRange)) {
              return L.divIcon({ html: '<br>' + sumFormatted,
                //className: 'leaflet-marker-icon map-cluster marker-cluster-medium leaflet-zoom-animated leaflet-clickable',
                className: 'map-cluster map-cluster-medium',
                iconSize: L.point(50, 50) });
            }
            else {
              return L.divIcon({ html: '<br>' + sumFormatted,
                //className: 'leaflet-marker-icon map-cluster marker-cluster-large leaflet-zoom-animated leaflet-clickable',
                className: 'map-cluster map-cluster-large',
                iconSize: L.point(60, 60) });
            }
          },
        });

      if (this.getProcessedData().length > 0) {
        
        /*  
         * Make a new map
         */
        if (this.getTheMap()) {
          this.getTheMap().remove();
        }
        this.setTheMap(new L.Map(chartId), {zoom: 50});
        //tileLayer = new L.TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {minZoom: 1, maxZoom: 18});
        tileLayer = L.tileLayer.provider(this.getChartType());
        tileLayer.options.minZoom = 1;
        tileLayer.options.maxZoom = 18;
        this.getTheMap().setView(new L.LatLng(36, -76), 5);
        this.getTheMap().addLayer(tileLayer);
        
        /*
         * Make a marker and add it to the markerClusterGroup.  Data is aggregated for each unique 
         * markerKey.  This location can have many data items and they are listed in the label.
         */

        _.each(this.getProcessedData()[0].values, function (value) {
          var key = {geoDimension: value.geoDimension, latitude: value.latitude, longitude: value.longitude},
            sumFormatted = 0;
          if (!(_.isEqual(key, markerKey))) {
            markerKey = key;
            if (marker) {
              markerLabel += "<dl/>";
              marker.bindLabel(markerLabel);
              marker.number = markerSum || 0;
              amounts.push(markerSum || 0);
              markers.addLayer(marker);
            }
            // format measure
            if (measure.indexOf("Amount") !== -1 || measure.indexOf("Average") !== -1) {
              sumFormatted = XV.FormattingMixin.formatMoney(Number(value.measure), that);
            }
            else {
              sumFormatted = XV.FormattingMixin.formatQuantity(Number(value.measure), that);
            }
            // make the marker
            marker = L.marker(new L.LatLng(value.latitude, value.longitude));
            markerLabel = "<dl><dt>" + value.geoDimension + "</dt><dd>" + value.dimension + ", " + sumFormatted + "</dd>";
            markerSum = Number(value.measure);
          }
          else {
            markerLabel += "<dd>" + value.dimension + ", " + value.measure + "</dd>";
            markerSum += Number(value.measure);
          }
        });
        
        /*
         * Cslculate the sum of all amounts to use in marker cluster icon generation
         */
        amountsSum = _.reduce(amounts, function (sum, el) {
          return sum + Number(el);
        }, 0);
        
        /*
         * Add markers to map
         */
        this.getTheMap().addLayer(markers);
        
        /*
         * Arrg! The boundary polygons look like they are properly added but they don't show up in the map.
         */
        markers.on('clustermouseover', function (a) {
          removePolygon();
          //a.layer.setOpacity(0.2);
          shownLayer = a.layer;
          polygon = L.polygon(a.layer.getConvexHull(),
          {"properties": {
            "style": {
              "color": "#004070",
              "weight": 4
              //"opacity": 1
            }
          },
          className: null
          });
          that.getTheMap().addLayer(polygon);
        });
        markers.on('clustermouseout', removePolygon);
        this.getTheMap().on('zoomend', removePolygon);
      }
    },

    /**
      Set chart plot size using max sizes from dashboard.
     */
    setPlotSize: function (maxHeight, maxWidth) {
      this.setPlotWidth(Number(maxWidth) - 100);
      this.setPlotHeight(Number(maxHeight) - 196);
    },
    /**
      Create chart plot area.  Destroy if already created.
    */
    createChartComponent: function () {
      /*
       * Maps are actually rendered in the chart and not the svg.  No idea why they
       * won't render in the svg.  We can not create and recreate the chart, we must
       * use map.remove() to destroy the map.  We also have to careful to only render
       * the chart once or the map.destroy() fails.  So we keep the svg to remember
       * we already rendered.
       */

      if (typeof this.$.chart.$.svg === "undefined") {
        this.$.chart.createComponent(
            {name: "svg",
              tag: this.getChartTag(),
              content: " "  //some plot areas must have content - like an html5 canvas
              }
            );
        this.$.chart.render();
      }
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
