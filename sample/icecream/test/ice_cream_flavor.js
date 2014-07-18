/*jshint trailing:true, white:true, indent:2, strict:true, curly:true,
  immed:true, eqeqeq:true, forin:true, latedef:true, node:true,
  newcap:true, noarg:true, undef:true */
/*global XT:true, XM:true, XV:true, describe:true, it:true, before:true, assert:true */

(function () {
  "use strict";

  var assert = require("chai").assert;

  var spec = {
    recordType: "XM.IceCreamFlavor",
    collectionType: "XM.IceCreamFlavorCollection",
    cacheName: "XM.iceCreamFlavors",
    listKind: "XV.IceCreamFlavorList",
    instanceOf: "XM.Document",
    isLockable: true,
    idAttribute: "name",
    enforceUpperKey: true,
    attributes: ["name", "description", "calories"],
    extensions: ["icecream"],
    createHash: {
      name: "VANILLA" + Math.random(),
      calories: 1200
    },
    updateHash: {
      calories: 1400
    },
    privileges: {
      createUpdateDelete: "MaintainIceCreamFlavors",
      read: true
    }
  };
  var additionalTests = function () {
    describe("Ice cream flavor business logic", function () {
      var model;

      before(function (done) {
        model = new XM.IceCreamFlavor();
        model.once("status:READY_NEW", function () {
          done();
        });
        model.initialize(null, {isNew: true});
      });
      it("should update the description to and from LITE", function () {
        model.set({name: "VANILLA"});
        assert.equal(model.get("name").substring(0, 7), "VANILLA");
        model.set("calories", 200);
        assert.equal(model.get("name").substring(0, 7), "LITE VA");
        model.set("calories", 1200);
        assert.equal(model.get("name").substring(0, 7), "VANILLA");
      });
    });
  };

  exports.spec = spec;
  exports.additionalTests = additionalTests;
}());
