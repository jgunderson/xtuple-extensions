/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XT:true, XM:true*/

(function () {
  "use strict";

  XT.extensions.timeExpense.initProjectModels = function () {
  
    // ..........................................................
    // PROJECT
    //
    
    var _proto = XM.Project.prototype,
      _bindEvents = _proto.bindEvents,
      _statusDidChange = _proto.statusDidChange,
      _used = XM.Project.used,
      _specifiedSetReadOnly = function () {
        var spec = this.get("isSpecifiedRate");
        this.setReadOnly("billingRate", !spec);
        this.setReadOnly("billingCurrency", !spec);
      };

    XM.Project = XM.Project.extend({

      bindEvents: function () {
        _bindEvents.apply(this, arguments);
        this.on("change:isSpecifiedRate", this.isSpecifiedRateDidChange);
      },

      isSpecifiedRateDidChange: function () {
        var spec = this.get("isSpecifiedRate");
        if (spec) {
          this.set("billingRate", 0);
          this.set("billingCurrency", XT.baseCurrency());
        } else {
          this.set("billingRate", null);
          this.set("billingCurrency", null);
        }
        _specifiedSetReadOnly.apply(this);
      },
      
      statusDidChange: function () {
        _statusDidChange.apply(this, arguments);
        var K = XM.Model,
          status = this.getStatus();
        if (status === K.READY_NEW || status === K.READY_CLEAN) {
          _specifiedSetReadOnly.apply(this);
        }
      }

    });

    /**
      Check to see if any worksheets use project since that isn't
      captured by usual algorithm. If not, run the normal check.
    */
    XM.Project.used = function (id, options) {
      var that = this,
        dispOptions = {
        success: function (resp) {
          if (resp) {
            options.success(resp);
          } else {
            _used.call(that, id, options);
          }
        }
      };
      XM.ModelMixin.dispatch("XM.Project", "worksheetUsed",
      [id], dispOptions);
    };
    
    // ..........................................................
    // PROJECT TASK
    //
    
    // Unfortunately classes below can't share much with above because the private functions are different
    var _ptProto = XM.ProjectTask.prototype,
      _ptBindEvents = _ptProto.bindEvents,
      _ptStatusDidChange = _ptProto.statusDidChange;
    
    XM.ProjectTask = XM.ProjectTask.extend({

      bindEvents: function () {
        _ptBindEvents.apply(this, arguments);
        this.on("change:isSpecifiedRate", this.isSpecifiedRateDidChange);
      },

      formatNumber: function () {
        var number = this.get("number"),
          name = this.get("name");
        return name ? number + " - " + name : number;
      },

      isSpecifiedRateDidChange: function () {
        var spec = this.get("isSpecifiedRate");
        if (spec) {
          this.set("billingRate", 0);
          this.set("billingCurrency", XT.baseCurrency());
        } else {
          this.set("billingRate", null);
          this.set("billingCurrency", null);
        }
        _specifiedSetReadOnly.apply(this);
      },

      statusDidChange: function () {
        _ptStatusDidChange.apply(this, arguments);
        var K = XM.Model,
          status = this.getStatus();
        if (status === K.READY_NEW || status === K.READY_CLEAN) {
          _specifiedSetReadOnly.apply(this);
        }
      }

    });

    XM.ProjectTaskRelation = XM.ProjectTaskRelation.extend({

      formatNumber: function () {
        var number = this.get("number"),
          name = this.get("name");
        return name ? number + " - " + name : number;
      }

    });


    /**
      @class

      @extends XM.ProjectRelation
    */
    XM.WorksheetProjectRelation = XM.ProjectRelation.extend({
      /** @scope XM.WorksheetProjectRelation.prototype */

      recordType: "XM.WorksheetProjectRelation",

      editableModel: "XM.Project"

    });

    // ..........................................................
    // COLLECTIONS
    //

    /**
      @class

      @extends XM.Collection
    */
    XM.WorksheetProjectRelationCollection = XM.Collection.extend({
      /** @scope XM.WorksheetProjectRelationCollection.prototype */

      model: XM.WorksheetProjectRelation

    });

  };

}());
