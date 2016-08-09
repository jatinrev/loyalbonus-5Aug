angular.module('LoyalBonus.services', [])
	.factory('ajaxCall', function ($http) {
		return {
			post: function (url, data) {
				return $http({
					method: 'POST',
					url: globaldata.prefix + url,
					headers: {
						'Content-Type': 'application/json; charset=utf-8'
					},
					data: data
				});
			},
			get : function (url, data) {
				return $http.get(globaldata.prefix + url, {
					params: data
				});
			},
			put : function (url, data) {
				return $http({
					method  : 'PUT',
					url     : globaldata.prefix + url,
					headers : {
					  	'Content-Type': 'application/json; charset=utf-8'
					},
					data    : data
				});
			}
		}
	})
	.factory('update_user_details', function ($rootScope, ajaxCall, $state, $cordovaPreferences, membership_api) {
		// update userDetails array which is global.
		//console.log('in userdetail factory')
		$rootScope.userDetails = {};
		$rootScope.userDetails.Email = '';
		$rootScope.userDetails.FullName = '';
		/**Temp Data**
		$rootScope.userDetails = {
			userId: 263,
			Email: 'jatinverma@gmail.com',
			FullName: 'Jatin',
			userLocation: '6.461573,3.479404'
		}
		/**Temp Data**/
		return {
			get: function (userID) {
				if (typeof (userID) != 'undefined' && userID != '') {
					return ajaxCall.get('webapi/user/GetUserByID',
						{
							"userID": userID
						})
						.then(function (response) {
							if (response.data.StatusMessage == 'Success') {
								$rootScope.userDetails.userId    = userID;
								$rootScope.userDetails.Email     = response.data.Data.Email;
								$rootScope.userDetails.FullName  = response.data.Data.FullName;
								$rootScope.userDetails.IsDeleted = response.data.Data.IsDeleted;
								$rootScope.userDetails.CreatedOn = response.data.Data.CreatedOn;
								$cordovaPreferences.store('userId', userID, 'dict');
								membership_api.check_membership();
							} else {
								$rootScope.userDetails = {};
								$state.go("signin");
							}
						});
				} else {
					return;
				}
			}
		};
	})
	/*.factory('giveRating', function ($scope) {
		function ratingImages(number) {
			//console.log(typeof(number));
			var str = '';
			for (var i = 1; i <= number; i++) {
				str += '<img class="filledStart" src="img/filledStar.png"/>';
			}
			var emptyStars = 5 - +number;
			for (var j = 1; j <= emptyStars; j++) {
				str += '<img class="emptyStart" src="img/emptyStart.png"/>';
			}
			return str;
		}

		return {
			ratingImages: ratingImages
		}
	})*/
	.service('get_unique_elements', function () {
		this.get_unique_arr = function (arr) {
			var uniqueNames = [];
			for (i = 0; i < arr.length; i++) {
				if (uniqueNames.indexOf(arr[i]) === -1) {
					uniqueNames.push(arr[i]);
				}
			}
			/*for(i = 0; i< uniqueNames.length; i++){
				uniqueNames[i];
			}*/
			return uniqueNames;
		};
	})
	.factory('get_user_location', function ($cordovaGeolocation, $rootScope, loading, ajaxCall, $http, $cordovaNetwork, $q) {
		/**
		 * url : http://stackoverflow.com/questions/21306088/getting-geolocation-from-ip-address
		 */
		function getIpGeoLocation() {
			var promise = $q.defer();
			// Lagos Nigeria
            promise.resolve({
				coords: {
					latitude  : '6.524379',
					longitude : '3.379206'
				}
			});
            return promise.promise;

			/*var output = $http.get("http://ipv4.myexternalip.com/json", {
				params: {}
			})
				.then(function (result) {
					// console.log(result.data.ip);
					// return result;
					return $http.get("http://ipinfo.io/" + result.data.ip, {
						params: {}
					})
						.then(function (location) {
							// console.log(location.data.loc);
							var lat_long = location.data.loc.split(',');
							return {
								coords: {
									latitude: lat_long[0],
									longitude: lat_long[1]
								}
							}
						});
				}); 

			return output;*/
		}

		function getLocation() {
			var posOptions = { maximumAge: 30000, timeout: 30000, enableHighAccuracy: false };
			var output = $cordovaGeolocation
						 .getCurrentPosition(posOptions)
						 .then(function (result) {
						 	/*console.log('from gps');
						 	console.log(result);*/
						 	return result;
						 }, function (error) {
						 	return getIpGeoLocation();
						 });
			return output;
		}
		return {
			get: getLocation()
		};

	})
	.filter('spaceless', function () {
		console.log('in filter spaceless');
		return function (input) {
			return input.replace(' ', '').replace(' ', '');
		};
	})
	.factory('active_controller', function () {
		var activeController;

		function set(name) {
			activeController = name;
			console.log(activeController);
		}
		function get() {
			return activeController;
		}

		return {
			set: set,
			get: get
		};
	})
	.factory('saveData', function () {
		var saveHere = {};

		function set(key, value) {
			saveHere[key] = value;
			return value;
		}

		function get(key) {
			return saveHere[key];
		}

		function remove(key) {
			saveHere[key] = '';
		}

		function remove_everything() {
			saveHere = {};
		}

		return {
			set: set,
			get: get,
			remove: remove,
			remove_everything : remove_everything
		};
	})
	.factory('loading', function ($ionicLoading) {
		return {
			start: function () {
				$ionicLoading.show({
					content: 'Loading',
					animation: 'fade-in',
					showBackdrop: true,
					maxWidth: 200,
					showDelay: 0
				});
			},
			stop: function () {
				$ionicLoading.hide();
			}
		};
	})
	.factory('backFunctionality', function ($rootScope, $state, saveData, loading) {
		var previous_page = []
			, array_key = ''
			, setDontSave = 0  // this variable is set because when user clicks on go back, and when he reaches back the fromState is again added to the array which remains in the history.
			, saveOnRefresh = 0;
		$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
			loading.start();
			if (typeof (fromState.name) != 'undefined' && typeof (toState.name) != 'undefined' && (fromState.name == toState.name || Object.is(fromParams, toParams))) {
				// nothing is done here because state is same or params are also same.
				/**
					If you dont want to add state in the back functionality add a condition here in this if.
				 */
			} else if (setDontSave == 1 && saveOnRefresh == 0) {
				console.log(fromState);
				console.log('setDontSave');
				setDontSave = 0;
			} else if (typeof (fromState.name) != 'undefined' && fromState.name != '') {
				previous_page.push({
					fromState: fromState.name,
					fromParams: fromParams
				});
				saveOnRefresh = 0; // in case saveOnRefresh is set to (1)
			}
			/*
			console.log('back functionality start');
			console.log(fromParams);
			console.log(fromState);
			console.log(toParams);
			console.log(toState);
			console.log(previous_page);
			console.log('back functionality stop');*/
			loading.stop();
			/*******Jali kaama lai(extra)******/
			saveData.remove('kaseyDinnerBusinessName');
		});

		return {
			one_step_back: function () {
				setDontSave = 1;
				var back = previous_page.slice(-1)[0];
				previous_page.pop();
				$state.go(back.fromState, back.fromParams);
			},
			setDontSave: function () {
				// setDontSave       = 1;
			},
			set_saveOnRefresh: function () {
				// saveOnRefresh     = 1;
			},
			setNewDontSave: function () {
				setDontSave = 1;
			}
		};
	})
	.factory('validation', function () {

		/**
		 *	returns true when email is valid
		 */
		function email(emailAddposOptionss) {
			if (emailAddress != '') {
				var emailPattern = /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4},*[\W]*)+$/;
				if (!emailPattern.test(emailAddress)) {
					return false;
				} else {
					return true;
				}
			}
		}

		return {
			email: email
		};
	})
	.factory('facebookFactory', function (ngFB, ajaxCall, loading) {
		function facebookLogin() {
			/*
			ngFB init is done in app.js, where user could input app id for authentication.
			 */
			return ngFB
				.login({ scope: 'email,read_stream,publish_actions' })
				.then(function (response) {
					console.log(response);
					if (response.status === 'connected') {
						return response.authResponse.accessToken;
					} else {
						alert('Facebook login failed');
					}
					return 0;
				})
				.then(function (response) {
					if (response == 0) {
						return 0;
					} else {
						loading.start();
						return ngFB
							.api({
								path: '/me',
								params: { fields: 'id,name,email' }
							})
							.then(function (fbResponse) {
								return ajaxCall
									.post('webapi/AppLogin/RegisterWithFB',
									{
										userName: fbResponse.name,
										accessToken: response,     //access token from login
										email: fbResponse.email
									}
									)
									.then(function (res) {
										loading.stop();
										return res;
									});
							},
							function (error) {
								loading.stop();
								return 0;
							}
							);
					}
				});
		}

		function facebookSharing() {
			/*
			ngFB init is done in app.js, where user could input app id for authentication.
			 */
			return ngFB
				.login({ scope: 'email,read_stream,publish_actions' })
				.then(function (response) {
					console.log(response);
					if (response.status === 'connected') {
						return response.authResponse.accessToken;
					} else {
						alert('Facebook login failed');
					}
					return 0;
				})
				.then(function (response) {
					if (response == 0) {
						return 0;
					} else {
						loading.start();
						return ngFB
							.api({
								path: '/me',
								params: { fields: 'id,name,email' }
							})
							.then(function (fbResponse) {
								return ajaxCall
									.post('webapi/AppLogin/RegisterWithFB',
									{
										userName: fbResponse.name,
										accessToken: response,     //access token from login
										email: fbResponse.email
									}
									)
									.then(function (res) {
										loading.stop();
										return res;
									});
							},
							function (error) {
								loading.stop();
								return 0;
							}
							);
					}
				});
		}

		return {
			facebookLogin: facebookLogin,
			facebookSharing: facebookSharing
		};
	})
	.factory('showRating', function () {//
		function showRatingImages(number) {

			//console.log('number'+number);
			var numberRound = Math.ceil(number);
			var no = number;
			var str = '';
			for (var i = 1; i <= parseInt(numberRound); i++) {
				//console.log(i);
				if (parseFloat(i) <= parseFloat(no)) {
					//console.log("i ="+parseFloat(i)+ "  number = "+parseFloat(no)+ "final ="+parseInt(numberRound));
					str += '<img class="filledStart" src="img/stars/filledStar.png"/>';
					//console.log(str);
				} else {
					//console.log('else');
					var string = no.toString();
					//console.log(string);
					var val = string.split('.');
					//console.log(val);
					var final = '0.' + val[1];
					//console.log(final+no+i);
					//console.log('half'+ final + str + no +"  i ="+ i);

					str += '<img src="img/stars/' + final + '.png"/>';
					//console.log('22 da:' + i);
				}

			}
			var emptyStars = 5 - +number;
			for (var j = 1; j <= emptyStars; j++) {
				str += '<img class="emptyStart" src="img/stars/emptyStart.png"/>';
			}
			//console.log("string");
		//console.log(str);
			return str;
		}

		function showRatingJson(number) {
			var starsArr = [];
			//var starsArr;
			for (var i = 1; i < 6; i++) {
				if (i > 0 && i <= number) {
					starsArr.push({
						class: 'filledStart',
						src: 'img/stars/filledStar.png'
					});
				} else {
					starsArr.push({
						class: 'emptyStart',
						src: 'img/stars/emptyStart.png'
					});
				}
			}
			//console.log(starsArr);
			return starsArr;
		}

		return {
			showRatingImages: showRatingImages,
			showRatingJson: showRatingJson
		};


	})
	.factory('refreshTest', function ($state, backFunctionality) {
		function showrefreshtest($statename, $stateparam) {
			console.log('refreshing');
			backFunctionality.setDontSave();
			$state.go($statename, $stateparam, { reload: true });
			return '';
		}
		return {
			showrefreshtest: showrefreshtest
		}
	})
	.factory('watchUser', function ($rootScope) {
		var userPresent = 0;
		$rootScope.$watch('userDetails', function () {
			if (typeof ($rootScope.userDetails) == 'undefined') {
				userPresent = 0;
			} else {
				if (typeof ($rootScope.userDetails.userId) == 'undefined') {
					userPresent = 0;
				} else {
					userPresent = 1;
				}
			}
			console.log('in watchUser');
		}, true);

		return {
			userPresent: function () { return userPresent; }
		};
	})
	.factory('popUp', function ($ionicPopup) {
		function confirm(title, content, okText) {
			var options = {};
			if (title != null && title != '') {
				options.title = title;
			}
			if (content != null && content != '') {
				options.template = content;
			}
			if (okText != null && okText != '') {
				options.okText   = okText;
			}
			return $ionicPopup.confirm(options);
		}

		/*
			status = {
				1 : ok,
				2 : normal,
				null or 0 : cancel
			}
		*/
		function msgPopUp(msg, status) {
            if(status == 1) {
                var image = '<img src="img/chk.png"> ';
            } else if(status == 2) {
            	var image = '';
            } else {
                var image = '<img src="img/cancel.png">';
            }
            // An elaborate, custom popup
            return $ionicPopup
            .show({
                title: image,
                subTitle: msg,
                buttons: [
                    { text: 'Ok', type: 'button-positive' }
                ]
            });
		}



		return {
			confirm  : confirm,
			msgPopUp : msgPopUp
		};
	})
	.factory('payment', function ($http, $q, $rootScope, ajaxCall) {
		function get_paystack_response(transactionRef) {
			return $http({
	            method  : 'GET',
	            url     : 'https://api.paystack.co/transaction/verify/' + transactionRef,
	            headers : {
	            	'Authorization': 'Bearer sk_test_967b105665b7a27a9796e576bdb3a088944b8cff'
	            }
            });
		}

		//----- post Charging returning customers
		/**
		 * curl https://api.paystack.co/transaction/charge_authorization \
		 * -H "Authorization: Bearer SECRET_KEY" \
		 * -H "Content-Type: application/json" \
		 * -d '{"authorization_code": "AUTH_72btv547", "email": "customer@email.com", "amount": 500000}' \
		 * -X POST
		 */
		function chargingReturningCustomers(authCode, amt) {
			return ajaxCall
			.get('webapi/UserCartAPI/GetDecryptAuthCode', {
				AuthCode : authCode
			})
			.then(function(res) {
				return $http({
		            method  : 'POST',
		            url     : 'https://api.paystack.co/transaction/charge_authorization',
		            headers : {
		            	'Authorization': 'Bearer sk_test_967b105665b7a27a9796e576bdb3a088944b8cff',
		            	'Content-Type' : 'application/json'
		            },
		            data: { 
						"authorization_code" : res.data.Data,
						"email"              : $rootScope.userDetails.Email,
						"amount"             : amt,
						"reference"          : get_paystack_reference_no_promise()
		            }
	            });
			});
		}

		function get_paystack_reference() {
			//guid
            var referenceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            var promise = $q.defer();
            promise.resolve(referenceId);
            return promise.promise;
		}

		function get_paystack_reference_no_promise() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
		}
	
		return {
			get_paystack_response             : get_paystack_response,
			chargingReturningCustomers        : chargingReturningCustomers,
			get_paystack_reference            : get_paystack_reference,
			get_paystack_reference_no_promise : get_paystack_reference_no_promise
		};
	})
	.factory('scan_now', function ($cordovaBarcodeScanner, loading, businessVisit, $rootScope, watchUser, popUp, $q) {
		function scan(businessObj) {
			console.log(businessObj);

			if(watchUser.userPresent() == 1) {
				return $cordovaBarcodeScanner
		            .scan()
		            .then(function (imageData) {
		                console.log("Barcode Format -> " + imageData.format);
		                return imageData.text;
		                console.log("Cancelled -> " + imageData.cancelled);
		            }, function (error) {
		                console.log("An error happened -> " + error);
		            })
		            .then(function (qrCode) {
		                loading.start();
		                return businessVisit.give_visit($rootScope.userDetails.userId, qrCode, businessObj.BusinessID)
			                .then(function (response) {
			                    loading.stop();
			                    if( +businessObj.TotalVisits == +businessObj.BonusDiscountToCust-1 ) {
			                    	return popUp.msgPopUp('<p class="text-align-center margin-bottom-0">Success!</p><p class="text-align-center margin-bottom-0">Congratulations for reaching your Bonus: '+businessObj.BonusDiscount+'</p>', 1);
			                    } else if (response.data.Data == "QrCode submitted") {
			                        return popUp.msgPopUp('<p class="text-align-center margin-bottom-0">Success!</p><p class="text-align-center margin-bottom-0">Thank you for visiting us.</p>', 1);
			                    } else if(response.data.StatusMessage == "Failed") {
			                        // $scope.showAlertscanner(response.data.Data, 0);
			                        return 1;
			                    }
			                },function(error) {
			                    $scope.showAlertscanner('Your Scan Cant be completed');
			                });
		            });
	        } else {
	        	var promise = $q.defer();
                promise.resolve(0);
	        	console.log('User not present.');
                return promise.promise;
	        }
		}
	
		return {
			scan : scan
		};
	})
	.factory('membership_api', function ($rootScope, ajaxCall) {
		/*
		 * webapi/UserMemberShipApi/MembershipExpireByUserId?userId=236
		 * If "MembershipExire" == true, then membership expired.
		 */ 
		function check_membership() {
			if(+$rootScope.userDetails.userId > 0) {
				return ajaxCall
				.get('webapi/UserMemberShipApi/MembershipExpireByUserId', {
					userId : $rootScope.userDetails.userId
				})
				.then(function(res) {
					$rootScope.membership_data = res.data.Data;
					// console.log($rootScope.membership_data);
				});
			}
		}
	
		return {
			check_membership : check_membership
		};
	});


















