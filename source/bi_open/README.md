Open xTuple Business Intelligence Extension
==============================================
The open xTuple Business Intelligence Extension provides olap data routes and views for cubes offered in
https://github.com/xtuple/bi.  

To build the extension:

	git clone git@github.com:xtuple/xtuple-extensions.git
	cd xtuple-extensions
	git submodule update --init --recursive
	sudo npm install
	sudo ../xtuple/scripts/build_app.js -e source/bi

To use the extension your will need to build and start the BI Server.  See:

https://github.com/xtuple/bi

And don't forget to enable the extension when you connect to the xTuple Web Client.