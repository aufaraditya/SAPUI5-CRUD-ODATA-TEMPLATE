/*global location history */
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"

], function(BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast) {
	"use strict";

	return BaseController.extend("aaufar.fioriodatasampleproject.controller.ListData", {

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
				oTable = this.byId("tableData");

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

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			var oTable = this.byId("tableData");
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
			var oTable = this.byId("tableData"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
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
			let oFilter = new Filter("Persno", FilterOperator.Contains, sValue);
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
				}, this),
				error: jQuery.proxy(function(mResponse) {
					let obj = JSON.parse(mResponse['message']);
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



		onAdd: function() {
			this.getRouter().navTo('create', {});
		},

		onDeleteOne: function(param) {
			let oSelectedItem = param.getSource().getParent();
			let oModel = this.getView().getModel();
			let Persno = oSelectedItem.getBindingContext().getProperty('Persno');
			oModel.remove(`/EmpVacDataSet(Persno='${Persno}')`, {
				success: jQuery.proxy(function(mResponse) {
					MessageToast.show('Data Berhasil Dihapus');

				}, this),
				error: jQuery.proxy(function(mResponse) {
					let obj = JSON.parse(mResponse['message']);

				}, this)
			});

		},

		onMassDelete: function() {
			let tableData = this.getView().byId('tableData').getSelectedItems();
			let oModel = this.getView().getModel();
			// let persnoList = tableData.map(data=>data.getBindingContext().getProperty('Persno')); //Must add ES6 Validator to true for this version

			//The alternative version of mapping above without the ES6 version ----------------------------------------
			oModel.setDeferredGroups(["group1"]);
			tableData.forEach(myFunction);

			function myFunction(item, index) {
				let Persno = item.getBindingContext().getProperty('Persno');
				oModel.remove(`/EmpVacDataSet(Persno='${Persno}')`, {
					success: jQuery.proxy(function(mResponse) {
						MessageToast.show('Data Berhasil Dihapus');

					}, this),
					error: jQuery.proxy(function(mResponse) {
						let obj = JSON.parse(mResponse['message']);

					}, this),
					groupId: "group1"
				});
				oModel.submitChanges({
					groupId: "group1"
				});
			}

			//----------------------------------------------------------------------------------------------------

		}

	});
});