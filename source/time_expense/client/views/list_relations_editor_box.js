/*jshint bitwise:false, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XV:true, XM:true, _:true, Backbone:true, enyo:true, XT:true */

(function () {

  XT.extensions.timeExpense.initListRelationsEditorBox = function () {

    // ..........................................................
    // PROJECT TASK
    //

    var taskExtensions = [
      {kind: "onyx.GroupboxHeader", container: "mainGroup", content: "_billing".loc()},
      {kind: "XV.ItemWidget", container: "mainGroup", attr: "item",
        query: {parameters: [
        {attribute: "projectExpenseMethod", operator: "ANY",
          value: [XM.Item.EXPENSE_BY_CATEGORY, XM.Item.EXPENSE_BY_ACCOUNT] },
        {attribute: "isActive", value: true}
      ]}},
      {kind: "XV.CustomerWidget", container: "mainGroup", attr: "customer"},
      {kind: "XV.ToggleButtonWidget", container: "mainGroup",
        attr: "isSpecifiedRate"},
      {kind: "XV.MoneyWidget", container: "mainGroup", attr:
       {localValue: "billingRate", currency: "billingCurrency"},
       label: "_rate".loc() }
    ];

    XV.appendExtension("XV.ProjectTaskEditor", taskExtensions);

    // ..........................................................
    // WORKSHEET
    //

    enyo.kind({
      name: "XV.WorksheetTimeEditor",
      kind: "XV.RelationsEditor",
      components: [
        {kind: "XV.ScrollableGroupbox", name: "mainGroup", fit: true,
          classes: "in-panel", components: [
          {kind: "XV.InputWidget", attr: "lineNumber"},
          {kind: "XV.DateWidget", attr: "workDate"},
          {kind: "XV.HoursWidget", attr: "hours"},
          {kind: "onyx.GroupboxHeader", content: "_detail".loc()},
          {kind: "XV.TaskWidget", attr: "task"},
          {kind: "XV.ItemWidget", attr: "item",
            query: {parameters: [
            {attribute: "projectExpenseMethod", operator: "ANY",
              value: [XM.Item.EXPENSE_BY_CATEGORY, XM.Item.EXPENSE_BY_ACCOUNT] },
            {attribute: "isActive", value: true}
          ]}},
          {kind: "onyx.GroupboxHeader", content: "_billing".loc()},
          {kind: "XV.CheckboxWidget", attr: "billable"},
          {kind: "XV.CustomerWidget", attr: "customer"},
          {kind: "XV.InputWidget", attr: "purchaseOrderNumber",
            label: "_custPo".loc()},
          {kind: "XV.MoneyWidget",
            attr: {localValue: "billingRate", currency: "billingCurrency"},
            label: "_rate".loc() },
          {kind: "XV.MoneyWidget",
            attr: {localValue: "billingTotal", currency: "billingCurrency"},
            label: "_total".loc(), currencyDisabled: true },
          {kind: "onyx.GroupboxHeader", content: "_cost".loc(), name: "costHeader"},
          {kind: "XV.MoneyWidget",
            attr: {localValue: "hourlyRate", currency: "hourlyCurrency"},
            label: "_hourly".loc(), currencyDisabled: true },
          {kind: "XV.MoneyWidget",
            attr: {localValue: "hourlyTotal", currency: "hourlyCurrency"},
            label: "_total".loc(), currencyDisabled: true },
          {kind: "onyx.GroupboxHeader", content: "_notes".loc()},
          {kind: "XV.TextArea", attr: "notes", fit: true}
        ]}
      ],
      create: function () {
        this.inherited(arguments);
        // Don't show cost header if user doesn't have cost permissions
        this.$.costHeader.setShowing(XT.session.privileges.attributes.MaintainEmpCostAll);
      }
    });

    enyo.kind({
      name: "XV.WorksheetTimeBox",
      kind: "XV.ListRelationsEditorBox",
      title: "_time".loc(),
      editor: "XV.WorksheetTimeEditor",
      parentKey: "worksheet",
      listRelations: "XV.WorksheetTimeListRelations",
      /**
        Copies current task into next entry if applicable.
      */
      newItem: function () {
        var widget = this.$.editor.$.taskWidget,
          task = widget.getValue();
        this.inherited(arguments);
        if (task) { widget.setValue(task); }
      }
    });

    enyo.kind({
      name: "XV.WorksheetExpenseEditor",
      kind: "XV.RelationsEditor",
      components: [
        {kind: "XV.ScrollableGroupbox", name: "mainGroup", fit: true,
          classes: "in-panel", components: [
          {kind: "XV.InputWidget", attr: "lineNumber"},
          {kind: "XV.DateWidget", attr: "workDate"},
          {kind: "XV.QuantityWidget", attr: "quantity"},
          {kind: "XV.MoneyWidget",
            attr: {localValue: "unitCost", currency: "billingCurrency"},
            label: "_unitCost".loc() },
          {kind: "XV.MoneyWidget",
            attr: {localValue: "billingTotal", currency: "billingCurrency"},
            label: "_total".loc(), currencyDisabled: true },
          {kind: "XV.CheckboxWidget", attr: "prepaid"},
          {kind: "onyx.GroupboxHeader", content: "_detail".loc()},
          {kind: "XV.TaskWidget", attr: "task"},
          {kind: "XV.ItemWidget", attr: "item",
            query: {parameters: [
            {attribute: "projectExpenseMethod", operator: "ANY",
              value: [XM.Item.EXPENSE_BY_CATEGORY, XM.Item.EXPENSE_BY_ACCOUNT] },
            {attribute: "isActive", value: true}
          ]}},
          {kind: "onyx.GroupboxHeader", content: "_billing".loc()},
          {kind: "XV.CheckboxWidget", attr: "billable"},
          {kind: "XV.CustomerWidget", attr: "customer"},
          {kind: "XV.InputWidget", attr: "purchaseOrderNumber",
            label: "_custPo".loc()},
          {kind: "onyx.GroupboxHeader", content: "_notes".loc()},
          {kind: "XV.TextArea", attr: "notes", fit: true}
        ]}
      ]
    });

    enyo.kind({
      name: "XV.WorksheetExpenseBox",
      kind: "XV.ListRelationsEditorBox",
      title: "_expenses".loc(),
      editor: "XV.WorksheetExpenseEditor",
      parentKey: "worksheet",
      listRelations: "XV.WorksheetExpenseListRelations",
      /**
        Copies current task into next entry if applicable.
      */
      newItem: function () {
        var widget = this.$.editor.$.taskWidget,
          task = widget.getValue();
        this.inherited(arguments);
        if (task) { widget.setValue(task); }
      }
    });

  };

}());
