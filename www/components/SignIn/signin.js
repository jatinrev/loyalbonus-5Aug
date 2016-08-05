angular.module('LoyalBonus')

.controller('SignInController', function ($scope, $rootScope, $state, $http, update_user_details, loading, ngFB, facebookFactory, refreshTest) {
	var vm                 = this;
	vm.login               = login;
	$scope.signIn          = {};

	$scope.tabName = $state.params.id;
	$state.params.id == 'Signin'
	$scope.datasignin = [{
	}];
	$scope.signIn.signIn_button_visibility = true;

	$rootScope.$watch('userDetails', function() {
		// console.log('in watch userDetails.');
		/*if( typeof($rootScope.userDetails.userId) != 'undefined' && !isNaN($rootScope.userDetails.userId) ) {
			$state.go("home.restaurants");
		} else {
			$state.go("signin");
		}*/
	}, true);

	$rootScope.userDetails = {};

	// console.log( window.localStorage['userId'] );

	$scope.Test = function () {
        return refreshTest.showrefreshtest($state.current.name, $state.params);
    }

    $scope.redirect_urls = {
	    home : function() {
	      //console.log('home');
	      $scope.output = 'home';
	      $state.go('home.restaurants', { vertical: "1"});
	    }
	}

	function login() {
		loading.start();
		$scope.signIn.response 				   = 'in login';
		$scope.signIn.signIn_button_visibility = false;
		$scope.signIn.response_visibility      = true; // comment this

		$http({
			method: 'POST',
			url: 'http://beta2.loyalbonus.com/webapi/AppLogin/Login',
			headers: { 'Content-Type': 'application/json' },
			data: JSON.stringify({ Email : $scope.signIn.username, Password : $scope.signIn.password })
			}).then(function(response) {
				//console.log(response);
			loading.stop();
			if( response.data.StatusCode == 0 ) {
				//console.log(response.data);
				//success
				window.localStorage['userId'] = response.data.Data.UserID;
				//$scope.signIn.response        = response.data.Message;
				update_user_details.get( response.data.Data.UserID );
				$state.go("home.restaurants");
			} else {
				$scope.signIn.signIn_button_visibility = true;
				if( response.data.StatusCode == 4 ) {
					$scope.signIn.signIn_button_visibility = true;
					$scope.signIn.response_visibility      = true;
					$scope.signIn.response = response.data.Message;
				}
			}
		}, function errorCallback(response) {
			loading.stop();
			// $scope.signIn.response_visibility      = true; // comment this
			$scope.signIn.response = response;
		});



		/*$http('POST', 'http://beta2.loyalbonus.com/webapi/AppLogin/Login', { Email : $scope.signIn.username, Password : $scope.signIn.password }, function(status, response){

		}, function(status, response){
			// error
		});*/
	}


	$scope.fbLogin = function () {
	    facebookFactory
	    .facebookLogin()
	    .then(function (res) {
	    	if(res == 0) {
				$scope.signIn.response_visibility = true;
				$scope.signIn.response            = 'Facebook login successfull';
	    		//show error
	    	} else {
	    		window.localStorage['userId'] = res.data.Data.UserID;
				update_user_details.get( res.data.Data.UserID );
				$state.go("home.restaurants");
	    	}
	    });
	};



});



