angular.module('LoyalBonus')
.factory('change_accout_settings_factory', function(ajaxCall, $rootScope) {
	return {
		change_pass : function(old_pass, new_pass) {
			return ajaxCall.post('webapi/AppLogin/ResetPassword',
			{
				"Password": new_pass,
				"ConfirmPassword": new_pass, 
				"CurrentPassword": old_pass,
				"userid": $rootScope.userDetails.userId
			});
		},
		change_name_email : function(userId, email, user) {
			return ajaxCall.post('webapi/AppLogin/EditUserNameEmail',
			{
				"UserID"  	: userId,
				"Email" 	: email,
				"FullName" 	: user
			});
		}
	};
})

.controller('AccountController', function ($scope, $rootScope, $state, change_accout_settings_factory, active_controller, refreshTest) {
	$scope.tabName = $state.params.id;
	// $state.params.id == 'Account'
	var savePreviosDetails = {
		FullName  : $rootScope.userDetails.FullName,
		Email 	  : $rootScope.userDetails.Email
	};

	$scope.Test = function () {
        return refreshTest.showrefreshtest($state.current.name, $state.params);
    }

 	$scope.custom = true;
    active_controller.set('AccountController');
 	
 	$scope.toggleCustom = function() {
    	$scope.custom = $scope.custom === false ? true: false;
	};

	$scope.accountVar = {
		EmailEnable : true
	};

	$scope.enable_email = function() {
		$scope.accountVar.EmailEnable = $scope.accountVar.EmailEnable == true ? false : true;
	};

	$scope.chnage_pass = {
		old_pass : '',
		new_pass : ''
	};
	

	$scope.form_error = function (form_field_obj) {
		if( form_field_obj.Email.$error.pattern ) {
			return 'Please enter valid email.';
		} else if( typeof(form_field_obj.Email.$viewValue) != 'undefined' && form_field_obj.Email.$viewValue.length < 1 ) {
			return 'Please enter the email.';
		}
	}
	/*$scope.change_email = function(form_field_obj)
	{
		if( typeof($scope.form_error(form_field_obj)) != 'undefined' ) {
		 $scope.response = $scope.form_error(form_field_obj);
		 return 0;
	   }

	   if( $scope.chnage_email.new_email.length > 0 ) {

			//factory to change password
			change_name_email
			.change_email($scope.chnage_email.new_email)
			.then(function (response) {
				console.log(response);
				$scope.response = response.data.StatusMessage;
			});
		}
	}*/

	$scope.change_password = function(form_field_obj) {

		if( typeof($scope.form_error(form_field_obj)) != 'undefined' ) {
			$scope.response = $scope.form_error(form_field_obj);
			return 0;
		}

		//factory is made to change different part of user settings.
		if( savePreviosDetails.FullName != form_field_obj.fullName.$viewValue || savePreviosDetails.Email != form_field_obj.Email.$viewValue ) {
			// call change_accout_settings_factory.change_name_email factory.
			change_accout_settings_factory
			.change_name_email($rootScope.userDetails.userId, form_field_obj.Email.$viewValue, form_field_obj.fullName.$viewValue)
			.then(function(response_email)
			{
				$scope.response_email = response_email.data.StatusMessage;	
			})
			
		}

		if( $scope.chnage_pass.old_pass.length > 0 && $scope.chnage_pass.new_pass.length > 0 && $scope.chnage_pass.confirm_pass.length > 0 ) {
			if( $scope.chnage_pass.new_pass == $scope.chnage_pass.confirm_pass ) {
				//factory to change password
				change_accout_settings_factory
				.change_pass($scope.chnage_pass.old_pass, $scope.chnage_pass.new_pass)
				.then(function (response) {
					//console.log(response);
					$scope.response = response.data.StatusMessage;
				});
			} else {
				$scope.response = 'Password and Confirm password does not match.';
			}
		}
	}
});

