## xTuple Extension Tutorial
### Part IV: Production deployment

Writing a bit of code on your own laptop is one thing, but it won't do you much good if you can't deploy it into production. Unlike previous iterations of xTuple field dev, you can't feasibly use a tool like `pgadmin`, or even the classic xTuple `installer`, to get all of this code onto a production database. You might be tempted to `ssh` into the production server and recreate all of this work there, but that's not a good idea either, as doing so will make clean upgrades impossible.

The appropriate way to deploy your code into production is to go by way of npm. The process is quite easy, actually, and has the added benefit of properly memorializing your source code for maximum reliability and reusability.

### A bit about npm

You can think about npm as providing two services. It is a datacenter in California, with mirrors around the world, that hosts packages of code. It is also the software that provides nodejs-based project and dependency management. We rely on it heavily in every part of our app, and so using it for custom extension control was a natural fit.

### It's breathtakingly simple

We at xTuple have already published `xtuple-ice-cream` to npm, so starting in xTuple version 4.6, all you have to do to install `xtuple-ice-cream` into your app is the following:

- Boot up a new database without any of the work you've done so far, to mimic the production database
- From the app home, click `Setup` -> `Configure` -> `Database`
- You'll need the `Install Extensions` privilege, which you'll have automatically as an admin user in the `ADMIN` role
- On the `Install Extension` panel, type `xtuple-ice-cream` and click the checkbox
- When you get the success message, restart the browser and you'll see that the ice cream business objects are there
- Best yet, when you upgrade your server, this extension will get reinstalled on the appropriate version automatically

### How do I publish my own npm package?

Each npm package is defined by its `package.json` file. Look at code in the file `/path/to/xtuple-extensions/sample/xtuple-ice-cream/package.json`:
```js
{
  "author": "xTuple <dev@xtuple.com>",
  "name": "xtuple-ice-cream",
  "description": "xTuple ice cream extension",
  "version": "0.1.3",
  "dependencies": {
  },
  "peerDependencies": {
    "xtuple": "^4.7.0"
  },
  "repository": {
    "type": "git",
    "url": "http://github.com/xtuple/xtuple-extensions"
  },
  "engines": {
    "node": "0.10.x"
  }
}
```

Of course, you're not allowed to publish over our `xtuple-ice-cream` package, so if you copy this code into the file
`/path/to/xtuple-extensions/source/xtuple-ice-cream/package.json` and try to publish, npm will not let you. Npm is a 
global registry, so if you want to practice publishing, choose another value for the `name` field in `package.json`.

Publishing to npm is a process that's well-documented, and we do it the same way everyone else does. In short:

```bash
cd /path/to/xtuple-extensions/source/xtuple-ice-cream
npm publish ./
```

At this point, npm will probably tell you to create an account and execute a few CLI commands, which you should do.
Once you've published, your module will be immediately available on npmjs.org, and you'll immediately be able to 
install it from the database configuration screen.

Note as well that the production use of npm for xTuple extension deployment also saves you from the requirement
that all your work be done in your fork of the `xtuple-extensions` repository. All npm cares about is that the code
is in a directory with a `package.json` file, so if you want to have a different Github (or not-Github) repository
for each custom extension, you can do that too. See the [xtuple-morpheus](https://github.com/shackbarth/xtuple-morpheus) 
extension as an example of this kind of deployment strategy, and as an example for how to use the xTuple
extension system to deploy third-party HTML and javascript libraries into the xTuple app.

### Version control

Connecting the appropriate mainline version with the various versions of your extension as you update them
is something that npm excels at, without the need for a human-readable dependency matrix to sweat over. This is
done using `peerDependencies`.

Let's say that some future version of the app (v4.30.0) forces or entices you to make a change to your extension.
You'll need to

- Write the new code
- Bump the extension version appropriately in `package.json` (say, to `0.2.0`)
- Change the `xtuple` `peerDependency` version from `"^4.7.0"` to `"^4.30.0"`
- `npm publish`

Now there will be two usable versions of your extension, and npm will prefer to install the latest version for 
which the `peerDependencies` match legally to the version of the main app. So if one user is on version `4.29.1`
and installs your extension, npm will recognize your `0.1.2` as being off-limits, and will install `0.1.1`.
But if at the same time another user is up to date at `4.30.0`, then npm will know to install your version 
`0.1.2`.

It's furthermore possible to add *other* extensions into `peerDependencies`, with their own version
requirements. However, so long as we keep our core extensions moving forward in lockstep with our core (a
habit we don't intend to keep forever), this probably won't be necessary.

### Deploying private/proprietary custom extensions

We're still working on that! We'll have a private solution, based around private github repos, available soon.

### Wrapping up

That's it! Hopefully you have a sense of how to work within the xTuple Web/Mobile platform, and you're excited to start developing your own work. Drop us a line to let us know what you think, or if you have anything else you'd like to be better documented, at dev at xtuple dot com.
