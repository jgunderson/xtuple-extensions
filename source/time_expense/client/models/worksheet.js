/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XT:true, XM:true, _:true */

(function () {
  "use strict";

  XT.extensions.timeExpense.initTimeExpenseModels = function () {

   /** @class

     Mixin for worksheet models.
   */
    XM.WorksheetMixin = {

      getWorksheetStatusString: function () {
        var value = this.get("worksheetStatus"),
          K = XM.Worksheet;
        switch (value)
        {
        case K.OPEN:
          value = "_open".loc();
          break;
        case K.APPROVED:
          value = "_approved".loc();
          break;
        case K.CLOSED:
          value = "_closed".loc();
          break;
        default:
          value = "_error".loc();
        }
        return value;
      }
    };

    /**
      @class

      @extends XM.Model
    */
    XM.Worksheet = XM.Document.extend(
      /** @scope XM.Worksheet.prototype */ {

      recordType: "XM.Worksheet",

      numberPolicy: XM.Document.AUTO_NUMBER,

      defaults: function () {
        return {
          worksheetStatus: XM.Worksheet.OPEN,
          owner: XM.currentUser,
          site: XT.defaultSite(),
          currency: XT.baseCurrency(),
          totalHours: 0,
          totalExpenses: 0
        };
      },

      bindEvents: function () {
        XM.Document.prototype.bindEvents.apply(this, arguments);
        this.on("change:employee", this.employeeDidChange);
        this.get("time").on("relational:remove", this.renumberLines, this);
        this.get("expenses").on("relational:remove", this.renumberLines, this);
      },

      readOnlyAttributes: [
        "time",
        "expenses",
        "number",
        "totalHours",
        "totalExpenses"
      ],

      /**
        Calculate total expenses in base currency and set on `totalExpenses`
        attribute.

        returns {Object} Receiver
      */
      calculateExpenses: function () {
        var expenses = this.get("expenses").models,
          add = XT.math.add,
          scale = XT.MONEY_SCALE,
          that = this,
          total = 0,
          ary = [],
          i;

        // Keep track of requests, we'll ignore stale ones
        this._counter = _.isNumber(this._counter) ? this._counter + 1 : 0;
        i = this._counter;

        if (expenses.length) {
          _.each(expenses, function (expense) {
            // Currency conversion is asynchronous
            var quantity = expense.get("quantity") || 0,
              unitCost = expense.get("unitCost") || 0,
              currency = expense.get("billingCurrency"),
              workDate = expense.get("workDate"),
              options = {};
            options.success = function (baseUnitCost) {
              // If request is stale, forget about the whole thing
              if (i < that._counter) { return; }
              ary.push(quantity * baseUnitCost);
              
              // When all expenses accounted for, add 'em up
              if (ary.length === expenses.length) {
                total = add(ary, scale);
                that.set("totalExpenses", total);
              }
            };
            currency.toBase(unitCost, workDate, options);
          });
        }
        return this;
      },

      /**
        Calculate total hours and set on `totalHours` attribute.

        returns {Object} Receiver
      */
      calculateHours: function () {
        var time = this.get("time").models,
          add = XT.math.add,
          scale = XT.QTY_SCALE,
          hours = 0,
          ary = [];
        if (time.length) {
          _.each(time, function (t) {
            ary.push(t.get("hours") || 0);
          });
          hours = add(ary, scale);
        }
        this.set("totalHours", hours);
        return this;
      },

      employeeDidChange: function () {
        var employee = this.get("employee"),
          site = employee ? employee.get("site") : false;
        if (site) { this.set("site", site); }
        this.setReadOnly("time", _.isEmpty(employee));
        this.setReadOnly("expenses", _.isEmpty(employee));
      },

      fetchNumber: function () {
        var that = this,
          options = {};
        options.success = function (resp) {
          that._number = resp.toString();
          that.set("number", that._number);
        };
        this.dispatch("XM.Worksheet", "fetchNumber", null, options);
        return this;
      },

      renumberLines: function () {
        var time = this.get("time"),
          expenses = this.get("expenses"),
          renumber = function (models) {
            var lineNumber = 1;
            _.each(models, function (model) {
              if (!model.isDestroyed()) {
                model.set("lineNumber", lineNumber);
                lineNumber++;
              }
            });
          };

        // We've got a relational binding that could
        // bring us here that, unfortunately, doesn't
        // honor the `silence` option. So check manually.
        if (!this.isReady()) { return; }

        time.sort();
        expenses.sort();
        
        // Renumber time and expenses
        renumber(this.get("time").models);
        renumber(this.get("expenses").models);
      },

      statusDidChange: function () {
        XM.Document.prototype.statusDidChange.apply(this, arguments);
        var isNotOpen = this.get("worksheetStatus") !== XM.Worksheet.OPEN,
          status = this.getStatus(),
          id = XM.currentUser.id.toUpperCase(),
          that = this,
          K = XM.Model,
          collection,
          options = {};
        this.setReadOnly(isNotOpen);
        if (status === K.READY_NEW) {
          // See if this user is an employee, and if so set as default
          collection = new XM.EmployeeRelationCollection();
          options.query = {parameters: [{attribute: "code", value: id}]};
          options.success = function () {
            if (collection.length && !that.get("employee")) {
              that.set("employee", collection.at(0));
            }
          };
          collection.fetch(options);
        } else if (status === K.READY_CLEAN) {
          this.setReadOnly("time", false);
          this.setReadOnly("expenses", false);
        }
      }

    });

    XM.Worksheet = XM.Worksheet.extend(XM.WorksheetMixin);

    _.extend(XM.Worksheet, {

      // ..........................................................
      // CONSTANTS
      //

      /**
        Open status for worksheet.

        @static
        @constant
        @type String
        @default O
      */
      OPEN: "O",

      /**
        Approved status for worksheet.

        @static
        @constant
        @type String
        @default A
      */
      APPROVED: "A",

      /**
        Closed status for worksheet.
        @static
        @constant
        @type String
        @default C
      */
      CLOSED: "C"

    });


    /**
      @class
      Abstract model.

      @extends XM.Model
    */
    XM.WorksheetDetail = XM.Model.extend(
      /** @scope XM.WorksheetDetail.prototype */ {

      readOnlyAttributes: [
        "billable",
        "billingTotal",
        "lineNumber"
      ],

      isTime: false,

      billableDidChange: function () {
        var billable = this.get("billable");
        this.setReadOnly("billingRate", !billable);
      },

      bindEvents: function () {
        XM.Model.prototype.bindEvents.apply(this, arguments);
        var events = "change:billable change:customer change:project " +
          "change:item change:task";
        this.on(events, this.billableDidChange);
        this.on("change:worksheet", this.worksheetDidChange);
        this.on("change:" + this.valueKey, this.detailDidChange);
        this.on("change:" + this.ratioKey, this.detailDidChange);
        this.on("change:item", this.itemDidChange);
        this.on("change:customer", this.customerDidChange);
        this.on("change:task", this.taskDidChange);
        this.on("statusChange", this.statusDidChange);
      },

      customerDidChange: function () {
        var hasCustomer = !_.isEmpty(this.get("customer"));
        if (!hasCustomer) {
          this.set(this.ratioKey, 0);
          this.set("billable", false);
          this.unset("purchaseOrderNumber");
        }
        this.setReadOnly("billable", !hasCustomer);
      },

      destroy: function () {
        var isNotNew = !this.isNew();
        XM.Model.prototype.destroy.apply(this, arguments);

        // If it was new the relation will be removed which kicks
        // over renumber from worksheet bindings. If not new the relation
        // has to stick around until we save so trigger renumber from here.
        if (isNotNew) {
          this.worksheetDidChange();
        }
      },

      detailDidChange: function () {
        var value = this.get(this.valueKey) || 0,
          ratio = this.get(this.ratioKey) || 0,
          parent = this.getParent();
        // Update totals
        this.set("billingTotal", value * ratio);
        parent[this.totalsMethod]();
      },

      initialize: function () {
        XM.Model.prototype.initialize.apply(this, arguments);
        this.statusDidChange();
      },

      itemDidChange: function () {
        var unit = this.getValue("item.inventoryUnit");
        this.set("unit", unit);
      },

      statusDidChange: function () {
        var K = XM.Model,
          status = this.getStatus(),
          hasNoCustomer,
          worksheet,
          worksheetStatus;
        if (status === K.READY_CLEAN) {
          worksheet = this.getParent();
          worksheetStatus = worksheet.get("worksheetStatus");
          if (worksheetStatus === XM.Worksheet.OPEN) {
            this.setReadOnly(false);
            hasNoCustomer = _.isEmpty(this.get("customer"));
            this.setReadOnly("billable", hasNoCustomer);
          } else {
            this.setReadOnly(true);
          }
        }
        if (this.isReady()) {
          this.setReadOnly("billingRate", !this.get("billable"));
        }
      },

      taskDidChange: function () {
        var task = this.get("task"),
          project,
          item,
          customer;
        if (task) {
          item = task.get("item");
          if (item) { this.set("item", item); }
          project = task.get("project");
          customer = task.get("customer") || project.get("customer");
          if (customer) { this.set("customer", customer); }
        }
      },

      worksheetDidChange: function () {
        var worksheet = this.get("worksheet");
        if (worksheet) { worksheet.renumberLines(); }
      }

    });

    /**
      @class

      @extends XM.WorksheetDetail
    */
    XM.WorksheetTime = XM.WorksheetDetail.extend(
      /** @scope XM.WorksheetTime.prototype */ {

      recordType: "XM.WorksheetTime",

      readOnlyAttributes: [
        "billable",
        "billingTotal",
        "lineNumber",
        "hourlyTotal"
      ],

      defaults: function () {
        return {
          billable: false,
          billingRate: 0,
          billingTotal: 0,
          billingCurrency: XT.baseCurrency(),
          purchaseOrderNumber: ""
        };
      },

      isTime: true,

      lineNumberKey: "time",

      valueKey: "hours",

      ratioKey: "billingRate",

      totalsMethod: "calculateHours",
      
      billableDidChange: function () {
        var billable = this.get("billable"),
          worksheet = this.getParent(),
          task =  this.get("task"),
          project = task ? task.get("project") : undefined,
          employee = worksheet ? worksheet.get("employee") : undefined,
          customer = this.get("customer"),
          item = this.get("item"),
          that = this,
          options = {isJSON: true},
          params,
          i;
        this.setReadOnly("billingRate", !billable);
        if (!XT.session.privileges.get("CanViewRates")) { return; }

        // Keep track of requests, we'll ignore stale ones
        this._counter = _.isNumber(this._counter) ? this._counter + 1 : 0;
        i = this._counter;

        if (billable) {
          params = {
            isTime: this.isTime,
            taskId: task ? task.id : undefined,
            projectId: project ? project.id : undefined,
            employeeId: employee ? employee.id : undefined,
            customerId: customer ? customer.id : undefined,
            itemId: item ? item.id : undefined
          };

          options.success = function (resp) {
            var data = {};
            if (i < that._counter) { return; }
            that.off("change:" + that.ratioKey, that.detailDidChange);
            data[that.ratioKey] = resp.rate;
            data.billingCurrency = resp.currency || XT.baseCurrency();
            that.set(data);
            that.on("change:" + that.ratioKey, that.detailDidChange);
            that.detailDidChange();
          };
          this.dispatch("XM.Worksheet", "getBillingRate", params, options);
        } else {
          this.off("change:" + this.ratioKey, this.detailDidChange);
          this.set(this.ratioKey, 0);
          this.on("change:" + this.ratioKey, this.detailDidChange);
          this.detailDidChange();
        }
      },

      bindEvents: function () {
        XM.WorksheetDetail.prototype.bindEvents.apply(this, arguments);
        this.on("change:hours", this.costDidChange);
        this.on("change:hourlyRate", this.costDidChange);
      },

      costDidChange: function () {
        var hours = this.get("hours") || 0,
          hourlyRate = this.get("hourlyRate") || 0;
        this.set("hourlyTotal", hours * hourlyRate);
      },

      worksheetDidChange: function () {
        XM.WorksheetDetail.prototype.worksheetDidChange.apply(this, arguments);
        var that = this,
          hasPriv = XT.session.privileges.get("MaintainEmpCostAll"),
          options = {},
          worksheet = this.get("worksheet"),
          employee = worksheet ? worksheet.get("employee") : null;
        if (employee && hasPriv &&
            this.getStatus() === XM.Model.READY_NEW) {
          //Fetch employee hourly rate asynchronously
          options.success = function (rate) {
            var hourlyRate = that.get("hourlyRate");
            if (hourlyRate === undefined) {
              that.off("change:hourlyRate", that.costDidChange);
              that.set("hourlyRate", rate);
              that.on("change:hourlyRate", that.costDidChange);
              that.costDidChange();
            }
          };
          this.dispatch("XM.Worksheet", "getHourlyRate", [employee.id], options);
        }
      }

    });

    /**
      @class

      @extends XM.WorksheetDetail
    */
    XM.WorksheetExpense = XM.WorksheetDetail.extend(
      /** @scope XM.WorksheetExpense.prototype */ {

      recordType: "XM.WorksheetExpense",

      defaults: function () {
        return {
          billable: false,
          prepaid: false,
          unitCost: 0,
          billingTotal: 0,
          billingCurrency: XT.baseCurrency(),
          purchaseOrderNumber: ""
        };
      },

      lineNumberKey: "expenses",

      valueKey: "quantity",

      ratioKey: "unitCost",

      totalsMethod: "calculateExpenses"

    });

    /**
     @class

     @extends XM.Model
    */
    XM.WorksheetAccount = XM.Model.extend({
     /** @scope XM.WorksheetAccount.prototype */

      recordType: "XM.WorksheetAccount",

      isDocumentAssignment: true

    });

    /**
     @class

     @extends XM.Model
    */
    XM.WorksheetContact = XM.Model.extend({
     /** @scope XM.WorksheetContact.prototype */

      recordType: "XM.WorksheetContact",

      isDocumentAssignment: true

    });

    /**
     @class

     @extends XM.Model
    */
    XM.WorksheetIncident = XM.Model.extend({
     /** @scope XM.WorksheetIncident.prototype */

      recordType: "XM.WorksheetIncident",

      isDocumentAssignment: true

    });

    /**
     @class

     @extends XM.Model
    */
    XM.WorksheetItem = XM.Model.extend({
     /** @scope XM.WorksheetItem.prototype */

      recordType: "XM.WorksheetItem",

      isDocumentAssignment: true

    });

    /**
     @class

     @extends XM.Model
    */
    XM.WorksheetFile = XM.Model.extend({
     /** @scope XM.WorksheetFile.prototype */

      recordType: "XM.WorksheetFile",

      isDocumentAssignment: true

    });

    /**
     @class

     @extends XM.Model
    */
    XM.WorksheetUrl = XM.Model.extend({
     /** @scope XM.WorksheetUrl.prototype */

      recordType: "XM.WorksheetUrl",

      isDocumentAssignment: true

    });

    /**
     @class

     @extends XM.Model
    */
    XM.WorksheetProject = XM.Model.extend({
     /** @scope XM.WorksheetProject.prototype */

      recordType: "XM.WorksheetProject",

      isDocumentAssignment: true

    });

    /**
      @class

      @extends XM.Info
    */
    XM.WorksheetListItem = XM.Info.extend(
      /** @scope XM.WorksheetListItem.prototype */ {

      recordType: "XM.WorksheetListItem",

      editableModel: "XM.Worksheet",

      canApprove: function (callback) {
        return _canDo.call(this, true, XM.Worksheet.OPEN, callback);
      },

      canClose: function (callback) {
        return _canDo.call(this, true, XM.Worksheet.APPROVED, callback);
      },

      canInvoice: function (callback) {
        var qualifed = this.get("invoiced") === false;
        return _canDo.call(this, qualifed, XM.Worksheet.APPROVED, callback);
      },

      canPost: function (callback) {
        var qualifed = this.getValue("employee.isContractor") ||
                   this.get("posted") ? false : true;
        return _canDo.call(this, qualifed, XM.Worksheet.APPROVED, callback);
      },

      canUnapprove: function (callback) {
        var qualifed = this.get("postedValue") || this.get("posted") ||
                   this.get("invoicedValue") || this.get("invoiced") ||
                   this.get("voucheredValue") || this.get("vouchered") ?
                   false : true;
        return _canDo.call(this, qualifed, XM.Worksheet.APPROVED, callback);
      },

      canVoucher: function (callback) {
        var qualifed = this.get("toVoucher") > 0;
        return _canDo.call(this, qualifed, XM.Worksheet.APPROVED, callback);
      },

      couldDestroy: function (callback) {
        return _canDo.call(this, true, XM.Worksheet.OPEN, callback);
      },

      doApprove: function (callback) {
        return _doDispatch.call(this, "approve", callback);
      },

      doClose: function (callback) {
        return _doDispatch.call(this, "close", callback);
      },

      doInvoice: function (callback) {
        return _doDispatch.call(this, "invoice", callback);
      },

      doPost: function (callback) {
        var params = ["_postWorksheetFor".loc(), "_toProject".loc()];
        return _doDispatch.call(this, "post", callback, params);
      },

      doUnapprove: function (callback) {
        return _doDispatch.call(this, "unapprove", callback);
      },

      doVoucher: function (callback) {
        return _doDispatch.call(this, "voucher", callback);
      }

    });

    XM.WorksheetListItem = XM.WorksheetListItem.extend(XM.WorksheetMixin);

    /** @private */
    var _canDo = function (qualified, reqStatus, callback) {
      var status = this.get("worksheetStatus"),
        ret = qualified && status === reqStatus;
      if (callback) {
        callback(ret);
      }
      return ret;
    };

    /** @private */
    var _doDispatch = function (method, callback, params) {
      var that = this,
        options = {};
      params = params || [];
      params.unshift(this.id);
      options.success = function (resp) {
        var fetchOpts = {};
        fetchOpts.success = function () {
          if (callback) { callback(resp); }
        };
        if (resp) {
          that.fetch(fetchOpts);
        }
      };
      options.error = function (resp) {
        if (callback) { callback(resp); }
      };
      this.dispatch("XM.Worksheet", method, params, options);
      return this;
    };

    // ..........................................................
    // COLLECTIONS
    //

    /**
      @class

      @extends XM.Collection
    */
    XM.WorksheetListItemCollection = XM.Collection.extend({
      /** @scope XM.WorksheetListItemCollection.prototype */

      model: XM.WorksheetListItem

    });

  };

}());
