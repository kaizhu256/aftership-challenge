(function() {
	/* changing library to perform asynchronously for better performance */
	var trackAsync = require('./trackAsync.js');
	function Courier() {
		this.usps = function(tracking_number, onEventError) {
			// do your job here
			// asynchronously fetch tracking_result from usps and pass to callback
			trackAsync.trackUsps(tracking_number, function (error, tracking_result) {
				/* error handling */
				if (error) {
					onEventError(error);
					return;
				}
				onEventError(null, tracking_result);
			});
		};

		this.hkpost = function(tracking_number, onEventError) {
			// do your job here
			// asynchronously fetch tracking_result from hkpost and pass to callback
			trackAsync.trackHkpost(tracking_number, function (error, tracking_result) {
				/* error handling */
				if (error) {
					onEventError(error);
					return;
				}
				onEventError(null, tracking_result);
			});
		};

		this.dpduk = function(tracking_number, onEventError) {
			// do your job here
			// asynchronously fetch tracking result from dpduk and pass to callback
			trackAsync.trackDpduk(tracking_number, function (error, tracking_result) {
				/* error handling */
				if (error) {
					onEventError(error);
					return;
				}
				onEventError(null, tracking_result);
			});
		};
	}

	module.exports = new Courier();
}());

