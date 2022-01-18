/*global location history */
sap.ui.define([
	"AAUFARNameSpace/ZFORM_ODATA_AUFAR/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"AAUFARNameSpace/ZFORM_ODATA_AUFAR/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageToast) {
	"use strict";

	return BaseController.extend("AAUFARNameSpace.ZFORM_ODATA_AUFAR.controller.Create", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			// iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			// oTable.attachEventOnce("updateFinished", function() {
			// 	// Restore original busy indicator delay for worklist's table
			// 	oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			// });
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#FioriTrainingApplicationOdata-display"
			}, true);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		// onSearch: function(oEvent) {
		// 	if (oEvent.getParameters().refreshButtonPressed) {
		// 		// Search field's 'refresh' button has been pressed.
		// 		// This is visible if you select any master list item.
		// 		// In this case no new search is triggered, we only
		// 		// refresh the list binding.
		// 		this.onRefresh();
		// 	} else {
		// 		var aTableSearchState = [];
		// 		var sQuery = oEvent.getParameter("query");

		// 		if (sQuery && sQuery.length > 0) {
		// 			aTableSearchState = [new Filter("Persno", FilterOperator.Contains, sQuery)];
		// 		}
		// 		this._applySearch(aTableSearchState);
		// 	}

		// },

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("update", {
				objectId: oItem.getBindingContext().getProperty("Persno")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},

		onAfterRendering: function() {
			// let datePicker = this.getView().byId("DOB");
			// datePicker.setMaxDate(new Date());
			// // let Location1 = this.getView().byId('searchHelpLokasi1');

			// let oDelegate = {
			// 	onAfterRendering: function() {
			// 		// Act when the afterRendering event is fired on the element
			// 		datePicker.$().find('INPUT').attr('disabled', true);
			// 	}
			// };

			// let oDelegateLocation1 = {
			// 	onAfterRendering: function() {
			// 		// Act when the afterRendering event is fired on the element
			// 		Location1.$().find('INPUT').attr('disabled', true).css('size', '4');
			// 	}
			// };

			// datePicker.addEventDelegate(oDelegate);
			// Location1.addEventDelegate(oDelegateLocation1);
		},

		onSearchHelpLokasi1: function() {
			let dialogSearchHelp1 = this._getDialogSearchHelp1();
			dialogSearchHelp1._getCancelButton().setType("Reject");
			dialogSearchHelp1.open();
		},

		onSearchHelpGolDar: function() {
			let dialogSearchHelpGolDar = this._getDialogSearchHelpGolDar();
			dialogSearchHelpGolDar._getCancelButton().setType("Reject");
			dialogSearchHelpGolDar.open();
		},

		onSearchHelpLokasi2: function() {
			let dialogSearchHelp2 = this._getDialogSearchHelp2();
			dialogSearchHelp2._getCancelButton().setType("Reject");
			dialogSearchHelp2.open();
		},

		_getDialogSearchHelpGolDar: function() {
			if (this.dialogSearchHelpGolDar) {
				return this.dialogSearchHelpGolDar;
			} else {
				this.dialogSearchHelpGolDar = sap.ui.xmlfragment("AAUFARNameSpace.ZFORM_ODATA_AUFAR.fragment.bloodType", this);
				this.getView().addDependent(this.dialogSearchHelpGolDar);

				return this.dialogSearchHelpGolDar;
			}
		},

		_getDialogSearchHelp1: function() {
			if (this.dialogSearchHelp1) {
				return this.dialogSearchHelp1;
			} else {
				this.dialogSearchHelp1 = sap.ui.xmlfragment("AAUFARNameSpace.ZFORM_ODATA_AUFAR.fragment.location1", this);
				this.getView().addDependent(this.dialogSearchHelp1);

				return this.dialogSearchHelp1;
			}
		},

		_getDialogSearchHelp2: function() {
			if (this.dialogSearchHelp2) {
				return this.dialogSearchHelp2;
			} else {
				this.dialogSearchHelp2 = sap.ui.xmlfragment("AAUFARNameSpace.ZFORM_ODATA_AUFAR.fragment.location2", this);
				this.getView().addDependent(this.dialogSearchHelp2);

				return this.dialogSearchHelp2;
			}
		},

		onClickConfirmSHLokasi1: function(param) {
			let selectionItem = param.getParameter("selectedItem");
			this.getView().byId("searchHelpLokasi1").setValue(selectionItem.getTitle());
			this.getView().byId("searchHelpLokasi1").setDescription(selectionItem.getDescription());
		},

		onClickConfirmSHLokasi2: function(param) {
			let selectionItem = param.getParameter("selectedItem");
			this.getView().byId("searchHelpLokasi2").setValue(selectionItem.getTitle());
			this.getView().byId("searchHelpLokasi2").setDescription(selectionItem.getDescription());
		},

		onClickConfirmSHGolDar: function(param) {
			let selectionItem = param.getParameter("selectedItem");
			this.getView().byId("searchHelpGolDar").setValue(selectionItem.getTitle());
		},

		onSearch: function(oEvent) {
			let sValue = oEvent.getParameter("value");
			let oFilter = new Filter("LocationText", FilterOperator.Contains, sValue);
			let oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);

		},

		onSearchGolDar: function(oEvent) {
			let sValue = oEvent.getParameter("value");
			let oFilter = new Filter("BloodType", FilterOperator.Contains, sValue);
			let oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);

		},

		onChangeDOB: function() {
			let dateDOB = this.getView().byId("DOB").getDateValue();
			let yearNow = new Date().getFullYear();
			let yearDOB = new Date(dateDOB).getFullYear();
			let age = yearNow - yearDOB;
			this.getView().byId('ageInput').setValue(age);
		},

		onSubmit: function() {
			// let heightInput = this.getView().byId('heightInput');
			// let weightInput = this.getView().byId('weightInput');
			// if (!isNaN(heightInput.getValue())) {
			// 	heightInput.setValueState("Error");
			// }
			// if (!isNaN(weightInput.getValue())) {
			// 	weightInput.setValueState("Error");
			// }
			let oModel = this.getView().getModel();
			let requiredInputs = this.returnIdListOfRequiredFields();
			let passedValidation = this.validateEventFeedbackForm(requiredInputs);
			if (passedValidation === false) {
				//show an error message, rest of code will not execute.
				return false;
			} else {
				//Maybe show a success message, rest of function will execute.

			}

			let params = {
				"Persno": this.getView().byId('persnoInput').getValue(),
				"Gender": this.getView().byId('radioButtonGender').getSelectedButton().getText(),
				"BloodType": this.getView().byId('searchHelpGolDar').getValue(),
				"Height": this.getView().byId('heightInput').getValue(),
				"Weight": this.getView().byId('weightInput').getValue(),
				"Age": this.getView().byId('ageInput').getValue(),
				"Vac1Type": this.getView().byId('comboBoxVaksin1').getSelectedKey(),
				"Vac1Date": this.formatter.setDateFormat(this.getView().byId('dateVaksin1').getDateValue()),
				"LocationCode1": this.getView().byId('searchHelpLokasi1').getValue(),
				"Vac1Org": this.getView().byId('orgInput1').getValue(),
				"Vac1SideEffect": this.getView().byId('inputEfekSamping1').getValue(),
				"Vac2Type": this.getView().byId('comboBoxVaksin2').getSelectedKey(),
				"Vac2Date": this.formatter.setDateFormat(this.getView().byId('dateVaksin2').getDateValue()),
				"LocationCode2": this.getView().byId('searchHelpLokasi2').getValue(),
				"Vac2Org": this.getView().byId('orgInput2').getValue(),
				"Vac2SideEffect": this.getView().byId('inputEfekSamping2').getValue(),
				"Note": this.getView().byId('Notes').getValue()
			};

			oModel.create('/EmpVacDataSet', params, {
				success: jQuery.proxy(function(mResponse) {
					MessageToast.show('Data Berhasil Masuk');
					this.getRouter().navTo('listdata', {});
				}, this),
				error: jQuery.proxy(function(mResponse) {
					let obj = JSON.parse(mResponse['message']);
					console.log(obj);
				}, this)
			});

		},

		returnIdListOfRequiredFields: function() {
			let requiredInputs;
			return requiredInputs = [
				'persnoInput',
				'searchHelpGolDar',
				'heightInput',
				'weightInput',
				'ageInput',
				'comboBoxVaksin1',
				'dateVaksin1',
				'searchHelpLokasi1',
				'orgInput1',
				'comboBoxVaksin2',
				'dateVaksin2',
				'searchHelpLokasi2',
				'orgInput2'
			];
		},

		validateEventFeedbackForm: function(requiredInputs) {
			let _self = this;
			let valid = true;
			requiredInputs.forEach(function(input) {
				let sInput = _self.getView().byId(input);
				if (sInput.getValue() == "" || sInput.getValue() == undefined) {
					valid = false;
					sInput.setValueState("Error");
				} else {
					sInput.setValueState("None");
				}
			});
			return valid;
		},

		isNumberFieldValid: function(testNumber) {
			let noSpaces = testNumber.replace(/ +/, ''); //Remove leading spaces
			let isNum = /^\d+$/.test(noSpaces); // test for numbers only and return true or false
			return isNum;
		},

		// heightCheck: function() {
		// 	let input = this.getView().byId('heightInput');
		// 	if (!this.isNumberFieldValid(input.getValue())) {
		// 		input.setValueState("Error");
		// 	}
		// },

		// weightCheck: function() {
		// 	this.getView().byId('weightInput').getValue();

		// }

	});
});