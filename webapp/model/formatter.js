sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		setDateFormat: function(param) {
			let properFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: 'yyyyMMdd'
			});
			let properDate = properFormat.format(param);
			return properDate;
		},

		gendertoIndex: function(param) {
			if (param !== '' && param !== null) {
				let param_uppercase = param.toUpperCase();
				if (param_uppercase === 'MALE' || param_uppercase === 'PRIA') {
					return 0;
				} else {
					return 1;
				}
			}
		},
		
		reformatAge: function(param){
			let newformat = Number(param);
			return newformat;
		},
		
				
		reformatHeight: function(param){
			let newformat = Number(param);
			return newformat;
		},
		
				
		reformatWeight: function(param){
			let newformat = Number(param);
			return newformat;
		}

	};

});