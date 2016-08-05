var gtBank_custom = (function () {
	var loginCallback;

	function output(callback) {
		loginCallback = callback;
	}

	function oauth_helper(url) {
		console.log(url);
		loginCallback({ url : url });
	}

	return {
		oauth_helper : oauth_helper,
		output       : output
	}

}());