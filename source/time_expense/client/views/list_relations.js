/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true*/
/*global XT:true, XV:true, enyo:true, Globalize:true */

(function () {

  XT.extensions.timeExpense.initListRelations = function () {

    // ..........................................................
    // WORKSHEET
    //

    enyo.kind({
      name: "XV.WorksheetTimeListRelations",
      kind: "XV.ListRelations",
      orderBy: [
        {attribute: 'lineNumber' }
      ],
      parentKey: "worksheet",
      components: [
        {kind: "XV.ListItem", components: [
          {kind: "FittableColumns", components: [
            {kind: "XV.ListColumn", classes: "first", components: [
              {kind: "FittableColumns", components: [
                {kind: "XV.ListAttr", attr: "lineNumber", classes: "bold"},
                {kind: "XV.ListAttr", formatter: "formatProjectTask"},
                {kind: "XV.ListAttr", attr: "workDate", fit: true,
                  classes: "right"}
              ]},
              {kind: "FittableColumns", components: [
                {kind: "XV.ListAttr", attr: "item.number",
                  style: "text-indent: 18px;"},
                {kind: "XV.ListAttr", attr: "hours",
                  classes: "right", formatter: "formatHours"}
              ]}
            ]}
          ]}
        ]}
      ],
      formatHours: function (value, view, model) {
        view.addRemoveClass("error", value < 0);
        return Globalize.format(value, "n" + 2) + " " + "_hrs".loc();
      },
      formatProjectTask: function (value, view, model) {
        var projectNumber = model.getValue('task.project.number'),
          taskNumber = model.getValue('task.number');
        return projectNumber + ' - ' + taskNumber;
      }
    });

    enyo.kind({
      name: "XV.WorksheetExpenseListRelations",
      kind: "XV.WorksheetTimeListRelations",
      orderBy: [
        {attribute: 'lineNumber' }
      ],
      parentKey: "worksheet",
      components: [
        {kind: "XV.ListItem", components: [
          {kind: "FittableColumns", components: [
            {kind: "XV.ListColumn", classes: "first", components: [
              {kind: "FittableColumns", components: [
                {kind: "XV.ListAttr", attr: "lineNumber", classes: "bold"},
                {kind: "XV.ListAttr", formatter: "formatProjectTask"},
                {kind: "XV.ListAttr", attr: "workDate", fit: true,
                  classes: "right"}
              ]},
              {kind: "FittableColumns", components: [
                {kind: "XV.ListAttr", attr: "item.number",
                  style: "text-indent: 18px;"},
                {kind: "XV.ListAttr", attr: "total",
                  classes: "right", formatter: "formatMoney"}
              ]}
            ]}
          ]}
        ]}
      ],
      formatMoney: function (value, view, model) {
        view.addRemoveClass("error", value < 0);
        return Globalize.format(value, "n" + 2);
      }
    });

  };

}());
