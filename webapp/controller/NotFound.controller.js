sap.ui.define([
		"AAUFARNameSpace/ZFORM_ODATA_AUFAR/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("AAUFARNameSpace.ZFORM_ODATA_AUFAR.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);