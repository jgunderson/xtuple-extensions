Private xTuple Business Intelligence Extension
==============================================
The private xTuple Business Intelligence Extension provides BI Analysis and views for cubes offered in
bi_enterprise.  It depends on the Open xTuple Business Intelligence Extension available in 
https://github.com/xtuple/xtuple-extenions/bi_open.

To build the extension, first build bi_open and then:

	git clone git@github.com:xtuple/private-extensions.git
	cd private-extensions
	git submodule update --init --recursive
	sudo npm install
	sudo ../xtuple/scripts/build_app.js -e source/bi_open

To use the extension your will need to build and start the BI Server.  See:

https://github.com/xtuple/bi

And don't forget to enable the extension when you connect to the xTuple Web Client.
