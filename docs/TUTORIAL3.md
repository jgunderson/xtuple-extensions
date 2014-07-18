## xTuple Extension Tutorial
### Part III: Bells and whistles

Let's add some bells and whistles to give you a feel for how to implement advanced functionality onto the base you've already written.

### Business Logic: Validation

Late breaking requirement from the prospect! Any flavor under 450 calories must start with the word "Lite". This sort of business logic is best put in the model, so add the following code into the file `/path/to/xtuple-extensions/source/icecream/client/models/ice_cream_flavor.js`:

```javascript
validate: function (attributes) {
  var params = {};
  if (attributes.calories <= 450 && attributes.name.indexOf('LITE ') !== 0) {
    return XT.Error.clone('icecream3001', { params: params });
  }
  // if our custom validation passes, then just test the usual validation
  return XM.Document.prototype.validate.apply(this, arguments);
}
```

The validate function is intended to return undefined if there is no error, and to return an error object if there is an error. What we're doing here is to add a specific check for the business logic. If that passes, we just call the default validation.

See that we're relying on our centralized error registry to understand what `icecream3001` means. Let's register this error by adding the following code to the file `/path/to/xtuple-extensions/source/icecream/client/models/startup.js`:

```javascript
XT.Error.addError({
  code: "icecream3001",
  messageKey: "_mustUseLite"
});
```

**Verify** your validation by trying to save an invalid flavor. You'll want to update your `strings.js` file to desplay a descriptive message [ [HOW?] ](TUTORIAL-FAQ.md#how-do-i-update-the-strings-file).

### Business Logic: Event Binding

We can do better than this, by making the model automatically update the name based on the calorie count. To do this we use event binding, which is one of the most powerful tools we have to drive business logic. We'll use the bindEvents function to listen to changes to the calorie attribute and act accordingly. Add the following code into the file `/path/to/xtuple-extensions/source/icecream/client/models/ice_cream_flavor.js`:

```javascript
bindEvents: function () {
  XM.Document.prototype.bindEvents.apply(this, arguments);
  this.on('change:calories', this.caloriesDidChange);
},
caloriesDidChange: function () {
  var calories = this.get("calories"),
    name = this.get("name");

  if (calories < 450 && name.indexOf('LITE ') !== 0) {
    // add the word lite as applicable
    this.set("name", 'LITE ' + name);
  } else if (calories >= 450 && name.indexOf('LITE ') === 0) {
    // get rid of the word lite if it's not applicable
    this.set("name", name.substring(5));
  }
}
```

**Verify** this by opening up the workspace and playing with the calorie count. As soon as you tab off of the calorie field, the name field should update itself. This is magically accomplished without any modifications to the Enyo layer. This is possible because the view is always watching any changes to the model, and will re-render itself if it sees any changes. 


### Privilege Control

Earlier on we defined the ORM with totally lax privilege enforcement by setting all the privilege attributes to `true`. Let's go back and restrict privileges for creating, reading, updating, and deleting these objects. It would be easy enough to piggyback on a pre-existing set of privileges, such as `MaintainContacts` and `ViewContacts`, but let's be thorough and make a new privilege.

Enter the following code into the file `/path/to/xtuple-extensions/source/icecream/database/source/priv.sql`:

```javascript
select xt.add_priv('MaintainIceCreamFlavors', 'Maintain Ice Cream Flavors', 'IceCream', 'Contact');
```

(Make sure you add this file to the `manifest.js` as well.)

The third parameter here is the name of the extension, and the fourth parameter will be the business object that the privilege should be grouped with in the `UserAccount` profiling screen.

Rebuild the extension and **verify** the change by looking in the public `priv` table for these two new privileges.

```sql
select * from priv where priv_module = 'IceCream';
```

Next, go back to the file `/path/to/xtuple-extensions/source/icecream/database/orm/models/ice_cream_flavor.json` and update the privilege section. Whereas the booleans `true` (and `false`) represent that anyone (or no one) can perform a certain action, any string value is interpreted to mean that only users with that privilege can perform the action.

```javascript
"privileges": {
  "all": {
    "create": "MaintainIceCreamFlavors",
    "read": true,
    "update": "MaintainIceCreamFlavors",
    "delete": "MaintainIceCreamFlavors"
  }
},
```

**Verify** the privilege enforcement by rebuilding, refreshing the browser, and seeing that you can no longer add, edit, or delete an `IceCreamFlavor` (although you can still view them because that privilege is still set to `true`). 

If you go into the `UserAccount` workspace for the `admin` user you'll notice that this privilege is not visible. There are hundreds of privileges and for any given user only a fraction may be relevant. Because some privileges are relevant to multiple extensions there isn't a strict many-to-one relationship between privileges and extensions, so the privileges relevant to any given extension cannot be inferred. Long story short, we have to add the following to our `postbooks.js` file, which declares the `MaintainIceCreamFlavors` as relevant to the `icecream` extension, as well as the fact that this privilege should be grouped with the ones for `Contact`. Add the following code to the file `/path/to/xtuple-extensions/source/icecream/client/postbooks.js`:

```javascript
relevantPrivileges = [
  "MaintainIceCreamFlavors"
];
XT.session.addRelevantPrivileges("icecream", relevantPrivileges);
XT.session.privilegeSegments.Contact.push("MaintainIceCreamFlavors");
```

When you refresh the browser you'll see this privilege in the `UserAccount` workspace. Grant it to yourself, refresh the browser again and you'll be able to add, edit, and delete an `IceCreamFlavor`.

### Tests

We recommend you use automated testing to ensure that your code does what you want, and to make sure that you're not
breaking anything else inadvertantly.

We use mocha for unit and integration testing, and you should test your ice cream flavor model through our general-purpose business object testing tool to make sure that your code does what you expect it to do, and that if anyone changes anything in the app that breaks the behavior you desire, they'll be unable to merge that breaking change into our code base.

To get your testing environment set up, you'll want to refer to [testing documentation](https://github.com/xtuple/xtuple/wiki/Testing-Setup). Make sure that you can run all the tests in the core `xtuple` directory. Once you can do that, then putting the `IceCream` model under test should follow the same process as our other objects. Enter the following code into the file `/path/to/xtuple-extensions/test/icecream/spec/ice_cream_flavor.js` (making those subdirectories as needed):

```javascript
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
```

These tests will now be automatically run by the xTuple test runner.

```bash
cd /path/to/xtuple-extensions
npm run-script test
```

If you want to test this one business object in isolation you can use:

```bash
cd /path/to/xtuple-extensions
./node_modules/.bin/mocha -R spec -g XM.IceCreamFlavor test/lib/test_runner.js
```

We have set up TravisCI to run the entire test suite before any code gets committed into our master source. If you've set up TravisCI on your fork, then you can take advantage of the same tool merely by pushing your committed code to your repository. TravisCI will let you know if you've broken anything.

### Declaring the Version Number

One last thing we should do is to declare the version number for the client. We have already specified the version number in the database `manifest.js` file. We should do the something similar in the client so that users will know how up-to-date their extension code is. Update the file `/path/to/xtuple-extensions/source/icecream/client/core.js` with the following:

```javascript
XT.extensions.icecream = {
  setVersion: function () {
    XT.setVersion("1.8.0", "iceCream");
  }
};
```

**Verify** your work by refreshing the browser, and selecting the `About` item from the gear menu. "Ice Cream 1.4.1" should display alongside your other extensions.

That's it! Hopefully you have a sense of how to work within the xTuple Web/Mobile platform, and you're excited to start developing your own work. Drop us a line to let us know what you think, or if you have anything else you'd like to be better documented, at dev at xtuple dot com.
