angular.module('LoyalBonus')

.controller('SignUpController', function ($scope, $rootScope, $state, ajaxCall, update_user_details, loading, facebookFactory, refreshTest) {
	var vm         = this;
	$scope.signUp  = {};
	$scope.tabName = $state.params.id;
	$state.params.id == 'Signup'
		$scope.datasignup = [{
			name: 'Steak House',
		}];

	$scope.Test = function () {
        return refreshTest.showrefreshtest($state.current.name, $state.params);
    }

    $rootScope.userDetails = {};

	$scope.signUp.signUp_button_visibility = true;
	
	$scope.signUp.submit = function() {
		loading.start();
		// $scope.signUp.response = 'hello';
		$scope.signUp.signUp_button_visibility = false;
		ajaxCall.post('webapi/AppLogin/Register',
		{
			"Email": $scope.frmsignup.email.$modelValue,
			"FullName": $scope.frmsignup.firstname.$modelValue+' '+$scope.frmsignup.lastname.$modelValue,
			"Password": $scope.frmsignup.password.$modelValue,
			"ConfirmPassword": $scope.frmsignup.password.$modelValue,
			"CurrentPassword": $scope.frmsignup.password.$modelValue,
			"UserType": 1 
		}).then(function(response){
			loading.stop();
			if(response.data.StatusMessage == null) {
				//success
				// window.localStorage['userId'] = response.data.Data.UserID;
				// update_user_details.get( response.data.Data.UserID );
				console.log(response);
				$scope.signUp.response = 'User created, please check you email and verify account.';
				$scope.signUp.responseVisibility       = true;
				// $state.go("home.restaurants");
			} else {
				$scope.signUp.signUp_button_visibility = true;
				$scope.signUp.responseVisibility       = true;
				$scope.signUp.response = response.data.StatusMessage;
			}
	    }, function errorCallback(response) {
	    	loading.stop();
			$scope.signUp.signUp_button_visibility = true; // comment this
			$scope.signUp.response = response;
		});
	};


	$scope.fbLogin = function () {

	    facebookFactory
	    .facebookLogin()
	    .then(function (res) {
	    	if(res == 0) {
				$scope.signIn.response_visibility = true;
				$scope.signIn.response            = 'Facebook login successfull';
	    		//show error
	    	} else {
	    		console.log(res);
	    		window.localStorage['userId'] = res.data.Data.UserID;
				update_user_details.get( res.data.Data.UserID );
				$state.go("home.restaurants");
	    	}
	    });
	};
});


