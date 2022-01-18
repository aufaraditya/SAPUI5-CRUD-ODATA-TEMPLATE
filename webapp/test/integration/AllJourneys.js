/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/pages/Worklist",
	"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/pages/Object",
	"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/pages/NotFound",
	"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/pages/Browser",
	"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "AAUFARNameSpace.ZFORM_ODATA_AUFAR.view."
	});

	sap.ui.require([
		"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/WorklistJourney",
		"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/ObjectJourney",
		"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/NavigationJourney",
		"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/NotFoundJourney",
		"AAUFARNameSpace/ZFORM_ODATA_AUFAR/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});