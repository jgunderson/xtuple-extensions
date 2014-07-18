/*jshint bitwise:true, indent:2, curly:true, eqeqeq:true, immed:true,
latedef:true, newcap:true, noarg:true, regexp:true, undef:true,
trailing:true, white:true, strict: false*/
/*global XT:true, XM:true, XV:true, _:true, window: true, enyo:true, Globalize:true*/

(function () {

  /**
    An abstract list to be used for email profiles
  */
  enyo.kind({
    name: "XV.Toplist",
    kind: "List",
    count: 3,
    rowsPerPage: 7,
    published: {
      data: []
    },
    onSetupItem: "setupItem",
    components: [
     {kind: "XV.ListItem", name: "theitems", classes: "xv-list-item",  components: [
        {kind: "FittableColumns", components: [
          {kind: "XV.ListColumn", classes: "short", components: [
            {kind: "XV.ListAttr", name: "code", ontap: "clickDrill", classes: "hyperlink bold" },
          ]},
          {kind: "XV.ListColumn", classes: "long", components: [
            {kind: "XV.ListAttr", name: "name"},
          ]},
          {kind: "XV.ListColumn", classes: "medium", components: [
            {kind: "XV.ListAttr", name: "measure", classes: "right"}
          ]},
        ]}
      ]}
    ]
  });
}());