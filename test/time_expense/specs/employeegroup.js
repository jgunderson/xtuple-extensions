/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XV:true, XT:true, _:true, console:true, XM:true, Backbone:true, require:true, assert:true,
setTimeout:true, before:true, clearTimeout:true, exports:true, it:true, describe:true, beforeEach:true */

(function () {
  "use strict";

  /**
  Employee Groups are used for categorizing groups of related Employees
    @class
    @alias EmployeeGroup
    @property {String} Name
    @property {String} Description
  */
  var spec = {
    recordType: "XM.EmployeeGroup",
    collectionType: "XM.EmployeeGroupCollection",
    cacheName: null,
    listKind: "XV.EmployeeGroupList",
    instanceOf: "XM.Document",
    /**
      @member -
      @memberof EmployeeGroup
      @description Employee Groups are lockable.
    */
    isLockable: true,
    /**
      @member -
      @memberof EmployeeGroup
      @description The ID attribute is "name", which will be automatically uppercased.
    */
    idAttribute: "name",
    enforceUpperKey: true,
    attributes: ["id", "name", "description", "employees"],
    /**
      @member -
      @memberof EmployeeGroup
      @description Used in the Time and expense module
    */
    extensions: ["project"],
    /**
      @member -
      @memberof EmployeeGroup
      @description Employee Groups can be read by users with "ViewEmployeeGroups" privilege and can be created, updated,
        or deleted by users with the "MaintainEmployeeGroups" privilege.
    */
    /*privileges: { //22834
      createUpdateDelete: "MaintainEmployeeGroups",
      read: "ViewEmployeeGroups"
    },*/
    createHash: {
      name: "TestEmployeeGroup" + Math.random(),
      description: "Test Employee Group"
    },
    updatableField: "description"
  };
  var additionalTests = function () {
  it.skip("Employees can be attached/detached to a new Employee Group", function () {
  });
  it.skip("Employees can be attached/detached to an existing Employee Group", function () {
  });
  it.skip("Employee Groups with Employees attached to them cannot be deleted", function () {
  });
  };
  exports.spec = spec;
  exports.additionalTests = additionalTests;
}());

