/*jshint indent:2, curly:true, eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true,
white:true*/
/*global XV:true, XT:true, _:true, console:true, XM:true, Backbone:true, require:true, assert:true,
setTimeout:true, before:true, clearTimeout:true, exports:true, it:true, describe:true, beforeEach:true */

(function () {
  "use strict";

  /**
  Employees are people who work for your company.
  An Employee may or may not be an xTuple ERP system user
    @class
    @alias Employee
  */
  var spec = {
    skipSmoke: true,
    skipCrud: true,
    recordType: "XM.Employee",
    collectionType: null,
    cacheName: null,
    listKind: "XV.EmployeeList",
    instanceOf: "XM.Document",
    /**
      @member -
      @memberof Employee
      @description Employees are lockable.
    */
    isLockable: true,
    /**
      @member -
      @memberof Employee
      @description The ID attribute is "code", which will be automatically uppercased.
    */
    idAttribute: "code",
    enforceUpperKey: true,
    attributes: ["id", "code", "number", "name", "isActive", "contact", "startDate", "site",
    "owner", "manager", "department", "shift", "wageType", "wage", "wageCurrency",
    "wagePeriod", "billingRate", "billingPeriod", "notes", "comments", "characteristics",
    "groups", "isContractor"],
    /**
      @member -
      @memberof Employee
      @description Used in the Project module
    */
    extensions: ["project"],
    relevantPrivilegeModule: "setup",
    /**
      @member -
      @memberof Employee
      @description Employees can be read by users with "ViewEmployees" privilege and can be
      created, updated, or deleted by users with the "MaintainEmployees" privilege.
    */
    privileges: {
      createUpdateDelete: "MaintainEmployees",
      read: "ViewEmployees"
    }
  };
  var additionalTests = function () {
    /**
      @member -
      @memberof Employee
      @description Employee screen contains a Comment panel to add comments to Employee record
    */
    it.skip("Employee screen contains a Comment panel to add comments to Employee record",
    function () {
    });
    /**
      @member -
      @memberof Employee
      @description Employees could be attached/detached to Groups from the Employee screen
    */
    it.skip("Employees could be attached/detached to Groups from the Employee screen",
    function () {
    });
    /**
      @member -
      @memberof Employee
      @description Employees with history and employees attached to groups cannot be deleted
    */
    it.skip("Employees with history and employees attached to groups cannot be deleted",
    function () {
    });
  };
  exports.spec = spec;
  exports.additionalTests = additionalTests;
}());

