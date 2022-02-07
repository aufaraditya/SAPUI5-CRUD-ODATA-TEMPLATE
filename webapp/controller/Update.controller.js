/*global location*/
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/m/MessageToast"
], function(
	BaseController,
	JSONModel,
	History,
	formatter,
	MessageToast
) {
	"use strict";

	return BaseController.extend("aaufar.fioriodatasampleproject.controller.Update", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("update").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("objectView"),
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

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			console.log(sObjectId);
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("EmpVacDataSet", {
					Persno: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.Persno,
				sObjectName = oObject.Persno;

			oViewModel.setProperty("/busy", false);
			// Add the object page to the flp routing history
			console.log('ooeoeoe');
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("objectTitle") + " - " + sObjectName,
				icon: "sap-icon://enter-more",
				intent: "#FioriTrainingApplicationOdata-display&/EmpVacDataSet/" + sObjectId
			});

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		onUpdate: function() {
			let oModel = this.getView().getModel();
			let requiredInputs = this._returnIdListOfRequiredFields();
			let passedValidation = this._validateEventFeedbackForm(requiredInputs);
			if (passedValidation === false) {
				//show an error message, rest of code will not execute.
				return false;
			} else {
				//Maybe show a success message, rest of function will execute.

			}
			let Persno = String(this.getView().byId('Persno').getText());

			let params = {
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

			oModel.update(`/EmpVacDataSet(Persno='${Persno}')`, params, {
				success: jQuery.proxy(function(mResponse) {
					MessageToast.show('Data Berhasil Masuk');
					this.getRouter().navTo('listdata', {});
				}, this),
				error: jQuery.proxy(function(mResponse) {
					let obj = JSON.parse(mResponse['message']);

				}, this)
			});

		},

		_returnIdListOfRequiredFields: function() {
			let requiredInputs;
			return requiredInputs = [
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

		_returnIdListOfEnableDisableFields: function() {
			let requiredInputs;
			return requiredInputs = [
				'searchHelpGolDar',
				'heightInput',
				'weightInput',
				'comboBoxVaksin1',
				'dateVaksin1',
				'searchHelpLokasi1',
				'orgInput1',
				'comboBoxVaksin2',
				'dateVaksin2',
				'searchHelpLokasi2',
				'orgInput2',
				'inputEfekSamping1',
				'inputEfekSamping2',
				'Notes',
				'radioButtonGender',
				'DOB'
			];
		},

		_validateEventFeedbackForm: function(requiredInputs) {
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

		onDelete: function() {
			let oModel = this.getView().getModel();
			let Persno = String(this.getView().byId('Persno').getText());

			let params = {
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

			oModel.remove(`/EmpVacDataSet(Persno='${Persno}')`, {
				success: jQuery.proxy(function(mResponse) {
					MessageToast.show('Data Berhasil Dihapus');
					this.getRouter().navTo('listdata', {});
				}, this),
				error: jQuery.proxy(function(mResponse) {
					let obj = JSON.parse(mResponse['message']);

				}, this)
			});

		},

		onSwitch: function() {
			let requiredInputs = this._returnIdListOfEnableDisableFields();
			let state = this.getView().byId('switch').getState();
			let _self = this;
			requiredInputs.forEach(function(input) {
				let sInput = _self.getView().byId(input);
				if (state === true) {
					sInput.setEnabled(true);
				}else {
					sInput.setEnabled(false);
				}
				
			});
		

		 }

	});

});