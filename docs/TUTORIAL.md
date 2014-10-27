## xTuple Extension Tutorial
### Part I: Adding a new business object

## Overview

Suppose you are working with a prospect who is excited to use xTuple, but is balking at one critical missing feature. The prospect needs to be able to profile each contact's favorite ice cream flavor. The list of possible ice cream flavors must be fully customizable and include the calorie count. Furthermore, users must be able to filter contacts by ice cream flavor. This data is going to be the lynchpin of an upcoming multichannel promotional campaign that the prospect is about to wage, and they cannot live without it. 

Using characteristics is not an option, because they do not want to have to hit the `New` button, and, as we'll see, their requirements are going to end using some fairly sophisticated business logic, which is beyond the scope of simple characteristics.

Getting this to work will touch all of the layers of the xTuple stack. On the server side, we'll have to make a new table and related ORMs. On the client side we'll have to make the model for ice cream flavors, the views and the views to profile them. We'll also have to insert this feature into the pre-existing contact view. 

This tutorial will walk you through setting up this customization in four parts. In **Part I** we'll start at the bottom and work our way up to create the `IceCreamFlavor` business object. We'll do the same in **Part II**, and revisiting each layer of the stack will feel like seeing an old friend! In **Part III** we'll add some bells and whistles to give you a taste of some of the more advanced functionality that's available. Lastly, in **Part IV** you'll see how to deploy your own custom code onto a production database.

If you have not already cloned the [core xtuple repository](http://github.com/xtuple/xtuple) and set up your development environment, do so now by following [our setup instructions](https://github.com/xtuple/xtuple-vagrant/blob/master/README.md). You will furthermore want to fork and clone this [xtuple-extensions](http://github.com/xtuple/xtuple-extensions) repository. 
[ [HOW?] ](TUTORIAL-FAQ.md#how-to-fork-and-clone-xtuple-extensions)

As you work through the tutorial you will be putting of your code in the `/path/to/xtuple-extensions/source/xtuple-ice-cream` directory. You can find a full version of the final product in a [sample directory](http://github.com/xtuple/xtuple-extensions/tree/master/sample/xtuple-ice-cream). Because it is not in the source directory it is inactive, but it might be useful for reference as you complete the tutorial. By the end of the tutorial your directory structure should look like
* source
    * xtuple-ice-cream
        * client
            * en
            * models
            * views
            * widgets
        * database
            * orm
                * ext
                * models
            * source
        * test

Do *not* make all of these directories just yet. In particular, the build tool will get confused and upset
if you have a `client` directory with nothing in it. Just make each directory as we go and you'll be fine.

## Part I: Adding the `IceCreamFlavor` business object

### Tables

We write our database code in plv8, which allows us to use pure javascript even when constructing tables. You won't see any SQL in this tutorial! Don't worry: it's postgres behind the scenes. We'll be putting four files in the `/path/to/xtuple-extensions/source/xtuple-ice-cream/database/source` directory. (You'll have to `mkdir` as necessary here and elsewhere.)
* `create_ic_schema.sql` (to create the schema) [ [WHY?] ](TUTORIAL-FAQ.md#why-create-a-new-schema)
* `icflav.sql` (to define the table)
* `manifest.js` (as a single point of entry to call the other two and any other files we make)

Let's start by creating the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/database/source/create_ic_schema.sql`. 
Enter the following code into your favorite text editor:
[ [WHICH?] ](https://github.com/xtuple/xtuple/wiki/Setting-up-an-Ubuntu-Virtual-Machine#sublime-with-jshint-installed)

``` javascript
select xt.create_schema('ic');
```

Next, we'll define a table named `ic.icflav`, by entering the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/database/source/icflav.sql`:

```javascript
select xt.create_table('icflav', 'ic');

select xt.add_column('icflav','icflav_id', 'serial', 'primary key', 'ic');
select xt.add_column('icflav','icflav_name', 'text', '', 'ic');
select xt.add_column('icflav','icflav_description', 'text', '', 'ic');
select xt.add_column('icflav','icflav_calories', 'integer', '', 'ic');

comment on table ic.icflav is 'Ice cream flavors';
```

This will create a table with four columns using our own table and column creation functions 
[ [WHY?] ](TUTORIAL-FAQ.md#why-not-use-native-postgres-functions-to-create-tables):
* `icflav_id` (the primary key)
* `icflav_name` (the natural key)
* `icflav_description`
* `icflav_calories`

You can run files like these directly against your database using psql.

```bash
$ cd /path/to/xtuple-extensions/source/xtuple-ice-cream/database/source
$ psql -U admin -d dev -f create_ic_schema.sql
$ psql -U admin -d dev -f icflav.sql
```

**Verify** your work so far by finding the `icflav` table in the `ic` schema of your development database using pgadmin3 or psql.

```bash
$ psql -U admin -d dev -c "select * from ic.icflav;"
```

We can put these files together in our `manifest.js` file, which as a convention will be run by the xTuple build process when the database needs to be updated. Another function of the `manifest.js` is to ensure that files get installed in the correct order. In this case so far it doesn't matter because our two scripts are independent. Enter the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/database/source/manifest.js`:

```javascript
{
  "name": "xtuple-ice-cream",
  "version": "0.1.3",
  "comment": "Ice Cream extension",
  "loadOrder": 999,
  "dependencies": ["crm"],
  "databaseScripts": [
    "create_ic_schema.sql",
    "icflav.sql"
  ]
}
```

From now on, you can just update the database by running the core build tool. All of these files are idempotent, so you don't have to worry about anything being installed in duplicate. Once you run the extension once, it will get registered into the database, so a general `build_app` will always automatically update it.

```bash
$ cd /path/to/xtuple
$ ./scripts/build_app.js -d dev -e ../xtuple-extensions/source/xtuple-ice-cream
```

**Verify** this step by seeing this extension as a new row in the `xt.ext` table, using pgadmin3 or psql.

```bash
$ psql -U admin -d dev -c "select * from xt.ext;"
```

Now is also a good time to associate this extension with the admin. Any extension can be turned off and on for any user, but by default they're turned off. Load up the webapp and navigate to `Setup`->`User Accounts`->`admin`. You'll see that admin has some extensions already turned on. Click the `xtuple-ice-cream` checkbox as well, and save the workspace.

Note: If the client prompts, "you do not have sufficient permissions to ...", check user privileges to make sure the extention is allowed. If the error persists, logout of the client and log back in to finish extention installation.

### ORMs

The xTuple ORMs are a JSON mapping between the SQL tables and the object-oriented world above the database. In this part of the tutorial we need to make an ORM for the IceCreamFlavor business object. 
[ [WHERE?] ](TUTORIAL-FAQ.md#where-should-i-put-orm-definitions)

Enter the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/database/orm/models/ice_cream_flavor.json`:

```javascript
[
  {
    "context": "xtuple-ice-cream",
    "nameSpace": "XM",
    "type": "IceCreamFlavor",
    "table": "ic.icflav",
    "idSequenceName": "ic.icflav_icflav_id_seq",
    "lockable": true,
    "comment": "Ice Cream Flavor Map",
    "privileges": {
      "all": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true
      }
    },
    "properties": [
      {
        "name": "id",
        "attr": {
          "type": "Number",
          "column": "icflav_id",
          "isPrimaryKey": true
        }
      },
      {
        "name": "name",
        "attr": {
          "type": "String",
          "column": "icflav_name",
          "isNaturalKey": true
        }
      },
      {
        "name": "description",
        "attr": {
          "type": "String",
          "column": "icflav_description"
        }
      },
      {
        "name": "calories",
        "attr": {
          "type": "Number",
          "column": "icflav_calories"
        }
      }
    ],
    "isSystem": true
  }
]
```

A lot of the ORM is self-explanatory; you just have to follow the conventions in place. The ORM creates a business object XM.IceCreamFlavor, mapped to the `ic.icflav` table. The four columns from the table are given names that will be used by the application. (Above this layer, nobody needs to worry about column names like `icflav_calories`.)

You'll notice that the privileges are all true. Anyone can do any action to this object. This is the default behavior, and we could have left this out of the map altogether. However, soon enough we'll be putting real privileges behind this business object, so it's useful to see it in action.

The name of the `idSequence` follows the postgres convention and was created automatically when you set the `icflav_id` field to be of type serial.

Currently, all ORMs in the application are `isSystem:true`.

The same core build tool that ran the files referenced in `manifest.js` will also find and run any orms in the ORM directory.

```bash
$ cd /path/to/xtuple
$ ./scripts/build_app.js -d dev -e ../xtuple-extensions/source/xtuple-ice-cream
```

**Verify** your work by finding a new view called ice_cream_flavor in the `xm` schema of your database. 

```bash
$ psql -U admin -d dev -c "select * from xm.ice_cream_flavor;"
```

Now we're ready to move on to the client! There is no need to make any modifications to the `node-datasource`.

### Client scaffolding

Now we'll start building out the client. First, you'll want to make a directory called `/path/to/xtuple-extensions/source/xtuple-ice-cream/client`, which will have four files, `core.js`, `package.js` and `postbooks.js`, as well as four directories, `en`, `models`, `views`, and `widgets`. 

We'll start with `core.js`, in which we create an object to store our extension. Enter the following into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/client/core.js`:
[ [WHAT ELSE?] ](TUTORIAL-FAQ.md#what-is-wrapping-the-sample-client-code)

```javascript
XT.extensions.icecream = {};
```

### Models

xTuple's mobile/web framework uses a model layer based on backbone.js and backbone-relational, and at its simplest the model layer requires very little code. Enter the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/client/models/ice_cream_flavor.js`:

```javascript
XT.extensions.icecream.initModels = function () {
  XM.IceCreamFlavor = XM.Document.extend({
    recordType: "XM.IceCreamFlavor",
    documentKey: "name", // the natural key
    idAttribute: "name" // the natural key
  });

  XM.IceCreamFlavorCollection = XM.Collection.extend({
    model: XM.IceCreamFlavor
  });
};
```

That's all there is to it. As we'll see later on, though, these model files are a very convenient place to put in business logic, so we'll be coming back to these. All the same, this is all you need to get the application to work. All of the details of the model (columns, relations, privileges, etc.) are loaded reflectively off the server during app startup and are injected into the model. That's one of the things that's going on when you're watching the loading bar when you sign in.

[ [WHAT IS XM.Document?] ](TUTORIAL-FAQ.md#what-are-the-differences-between-the-base-model-classes)

### Lists

Now we start writing the Enyo views, so get your browser ready. Enter the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/client/views/list.js`: 

```javascript
XT.extensions.icecream.initList = function () {
  enyo.kind({
    name: "XV.IceCreamFlavorList",
    kind: "XV.List",
    label: "_iceCreamFlavors".loc(),
    collection: "XM.IceCreamFlavorCollection",
    query: {orderBy: [
      {attribute: 'name'}
    ]},
    components: [
      {kind: "XV.ListItem", components: [
        {kind: "FittableColumns", components: [
          {kind: "XV.ListColumn", classes: "short",
            components: [
            {kind: "XV.ListAttr", attr: "name", isKey: true},
            {kind: "XV.ListAttr", attr: "description"}
          ]},
          {kind: "XV.ListColumn", classes: "last", fit: true, components: [
            {kind: "XV.ListAttr", attr: "calories"}
          ]}
        ]}
      ]}
    ]
  });
};
```

The architecture of our application as a whole is that there is a central core of functionality which is itself unaware of the existence of the various extensions that can float around it. The core of the application is really quite small; almost all of the models and views are part of extensions. The way we get this to work is that the core exposes methods to let extensions inject panels into it. Enter the following code into the `/path/to/xtuple-extensions/source/xtuple-ice-cream/client/postbooks.js` file:

```javascript
XT.extensions.icecream.initPostbooks = function () {
  var panels, relevantPrivileges;

  panels = [
    {name: "iceCreamFlavorList", kind: "XV.IceCreamFlavorList"}
  ];
  XT.app.$.postbooks.appendPanels("setup", panels);
};
```

This will inject the `IceCreamFlavor` list into the `Setup` module of our app. It is all the code we need to start seeing our changes in the client, so before we write any more, let's try to verify our work so far, which will require us to package the client.

### Packaging the client

We **do** first need to add the glue that will tell the browser which files need to be loaded and in what order, which is the enyo `package.js` files. You can read about the purpose of these files these files in the [Enyo tutorial](https://github.com/enyojs/enyo/wiki/Tutorial#you-got-to-keep-it-separated). 

Enter the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/client/package.js`:

```javascript
enyo.depends(
  "core.js",
  "models",
  // "widgets", // TODO: we'll get to this lower down in the tutorial
  "views",
  "postbooks.js"
);
```

Then enter the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/client/models/package.js`:

```javascript
enyo.depends(
  "ice_cream_flavor.js"
);
```

And lastly enter the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/client/views/package.js`:

```javascript
enyo.depends(
  "list.js"//,
  // "workspace.js" // you'll be uncommenting this later on as well
);
```

Take a second to see how these files, between them, cover all the client-side js files we've written so far. From here on out you'll be expected to add these package files yourself without much prompting from the tutorial.

### Building the client

The same core build tool that built the database-side code will also build the client-side code.

```bash
$ cd /path/to/xtuple
$ ./scripts/build_app.js -d dev -e ../xtuple-extensions/source/xtuple-ice-cream
```

That's it! Load up your browser, sign in to the app, and you should see an empty list of _iceCreamFlavors in the setup area. If you don't see it, it's likely that you haven't associated this extension with the admin user as described above.

### Translations

You'll probably notice that the name of the menu option reads `_iceCreamFlavors` instead of "Ice Cream Flavors". Don't assume that the only users consuming your extension will be native English speakers! People eat ice cream all over the world. The xTuple mobile platform uses a simple but powerful way to globalize your code.

As a rule of thumb, don't write any English words or phrases into parts of the application that are visible to the client, such as labels. Instead, use the convention `"_key".loc()`, such as you see in the `XV.IceCreamFlavorList` kind that you've written. The `loc()` function will localize this key per the user's preferences.

You should add the English translation of the key, and our global team of linguists will take care of translating it into other supported languages.

Enter the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/client/en/strings.js`.

```javascript
(function () {
  "use strict";

  var lang = XT.stringsFor("en_US", {
    "_iceCreamFlavors": "Ice Cream Flavors"
  });

  if (typeof exports !== 'undefined') {
    exports.language = lang;
  }
}());
```

**Verify** your work by rebuilding the extension:

```bash
$ cd /path/to/xtuple
$ ./scripts/build_app.js -d dev -e ../xtuple-extensions/source/xtuple-ice-cream
```

and refreshing the app. Now the label of the list should be nicely formatted, like the other menu items.

### Workspaces

Of course, our lists aren't going to do much good if you can't drill down into a workspace to view more detail or edit an item. Let's build the workspace now. Enter the following code into the file `/path/to/xtuple-extensions/source/xtuple-ice-cream/client/views/workspace.js`:

```
XT.extensions.icecream.initWorkspace = function () {
  enyo.kind({
    name: "XV.IceCreamFlavorWorkspace",
    kind: "XV.Workspace",
    title: "_iceCreamFlavor".loc(),
    model: "XM.IceCreamFlavor",
    components: [
      {kind: "Panels", arrangerKind: "CarouselArranger",
        fit: true, components: [
        {kind: "XV.Groupbox", name: "mainPanel", components: [
          {kind: "onyx.GroupboxHeader", content: "_overview".loc()},
          {kind: "XV.ScrollableGroupbox", name: "mainGroup", classes: "in-panel", components: [
            {kind: "XV.InputWidget", attr: "name"},
            {kind: "XV.InputWidget", attr: "description"},
            {kind: "XV.NumberWidget", attr: "calories"}
          ]}
        ]}
      ]}
    ]
  });

  XV.registerModelWorkspace("XM.IceCreamFlavor", "XV.IceCreamFlavorWorkspace");
};
```

A few things to note. The `attr` fields need to be the model attribute names. The `XV.registerModelWorkspace` tells the application that this is the workspace that should be drilled down to when a user clicks into an item on the list, or clicks the add button.

By now you're hopefully getting the hang of the `package.js` system, so update these files as appropriate. 

**Verify** your work by rebuilding the extension:

```bash
$ cd /path/to/xtuple
$ ./scripts/build_app.js -d dev -e ../xtuple-extensions/source/xtuple-ice-cream
```

and refreshing the app, going to the empty list, and clicking the add button in the toolbar. This workspace should load. Add some data, and save. The item should show up in the list. The data should be in the `ic.icflav` table. You should be able to go back into the workspace and edit the data. You'll notice some more untranslated fields, so put these into `strings.js` [ [HOW?] ](TUTORIAL-FAQ.md#how-do-i-update-the-strings-file) and rebuild.

Congratulations! You've made a new business object in the xTuple application. In [Part II](TUTORIAL2.md) we're going to start putting it to use.
