angular.module('LoyalBonus')
.controller('HomeController', function ($scope, $ionicSideMenuDelegate, $ionicHistory, $state, $rootScope, active_controller, $ionicHistory,backFunctionality, get_business_data,$ionicViewService, saveData, watchUser
  , get_business_data_map,refreshTest, $cordovaPreferences, popUp, $ionicPopup ) {

  $scope.testing = function () {
    cordova.plugins.Keyboard.close();
  }

  $scope.home_var = {
    // userPresent => return 1 when user is present.
    userPresent : function () {
      return watchUser.userPresent();
    },
    go_to_cart  : function () {
      $state.go( "home.shoppingcart", {businessId : saveData.get('business_id_for_shoppingcart')} );
    },
    business_cart_size : function() {
      var business_cart_size = saveData.get('business_cart_size');
      if( typeof(business_cart_size) == 'undefined' ) {
        return 0;
      } else {
        return saveData.get('business_cart_size');
      }
    },
    popUp : function (msg, status) {
      popUp
      .msgPopUp(msg, status);
    },
    loyalbonus_show : function() {
      if($scope.home_var.userPresent() == 1) {
        if( $rootScope.membership_data != undefined && ($rootScope.membership_data.IsCancelledMembership == true || $rootScope.membership_data.MembershipExire == true)) {
          return false;
        }
        return true;
      }
    }
  };

  $scope.toggleLeft = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.toggleRight = function () {
    $ionicSideMenuDelegate.toggleRight();
  };

  

    $scope.goBackHandler = function() {
        backFunctionality.one_step_back();
        // $state.go(previousState, previousStateParams);
    };

    $rootScope.goSearchHandler = function() {
        // jQuery('.right_25').css('right', '25px');
        // $rootScope.showMe = !$rootScope.showMe;
        // new
        var myPopup = $ionicPopup.show({
            template : '<input type="text" placeholder="Keyword" class="margin-bottom-10 padding-right-5 padding-left-5" ng-model="home_var.homesearch.value"><input placeholder="location" class="padding-right-5 padding-left-5" ng-hide="home_var.magnifyOrBack() == \'BusinessController\'" type="text" ng-model="home_var.homesearch.location">',
            title    : 'Search',
            // subTitle : '',
            scope    : $scope,
            buttons  : [
                { text: 'Cancel' },
                {
                    text: '<b>Search</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.home_var.homesearch.value && !$scope.home_var.homesearch.location) {
                            //don't allow the user to close unless he enters wifi password
                            e.preventDefault();
                            // $scope.home_var.homesearch.setValue();
                        } else {
                            return {
                                value    : $scope.home_var.homesearch.value,
                                location : $scope.home_var.homesearch.location
                            };
                        }
                    }
                }
            ]
        });
        myPopup.then(function(res) {
            var output = {};
            console.log(res);
            if(res == undefined) {
                return ;
            }
            if(res.value == undefined) {
                output.value = '';
            } else {
                output.value = res.value;
            }
            if(res.location == undefined) {
                output.location = '';
            } else {
                output.location = res.location;
            }
            $scope.home_var.homesearch.setValue(output);
        }, function(err) {
            console.log(err);
        });
    }

  $rootScope.gotextHandler = function() {
    $rootScope.showMe = !$rootScope.showMe; //this is for search textbox.
    //$rootScope.doRefresh();
  }

 

  $scope.signOut = function() {
  	$rootScope.userDeatils = {};
    window.localStorage.removeItem('userId');
    /**Start : removing from preference**/
    /**
     * Saving is done in services.js in factory 'update_user_details'
     * some things are done in app.js
     * and in the current file only removing is done.
     */
    $cordovaPreferences.remove('userId', 'dict');
    $rootScope.userDeatils = {};
    saveData.remove_everything(); // to remove everything from saved data.
    /***End : removing from preference***/
    $state.go("signin");
  };

  $scope.signin = function() {
    // console.log('helllooooo');
    $rootScope.userDeatils = {};
    window.localStorage.removeItem('userId');
    $state.go("signin");
  };

  $scope.home_var.magnifyOrBack = function () {
    return active_controller.get();
  };


  /*****Start : Home Heading Setting*****/
  $scope.home_var.homeheading = {};
  $scope.home_var.homeheading.text = function () {
    // remember to string length here
    if( get_business_data.getSearchKeyword() != '' || get_business_data.getLocationKeyword() != '' ) {
      if( get_business_data.getLocationKeyword() == '' ) {
        return get_business_data.getSearchKeyword();
      } else if( get_business_data.getSearchKeyword() == '' ) {
        return get_business_data.getLocationKeyword();
      } else {
        return get_business_data.getSearchKeyword()+' '+get_business_data.getLocationKeyword();        
      }
    }
    return '';
  };
  $scope.home_var.homeheading.Visibility = function () {
    if( ($scope.home_var.magnifyOrBack()=='RestaurantController' || $scope.home_var.magnifyOrBack()=='BusinessController') && (get_business_data.getSearchKeyword()!='' || get_business_data.getLocationKeyword()!='') ) {
      return true;
    } else {
      return false;

    }
  }
  $scope.home_var.homeheading.deleteSearch = function () {
    get_business_data.removeSearchKeyword();
  }

  $scope.ShowHide = true;
  $scope.home_var.homesearch = {};
  $scope.home_var.homesearch.setValue = function(input){
    get_business_data.setKewordSearch(input);
    // $rootScope.showMe = false;
    refreshTest.showrefreshtest($state.current.name, $state.params);
  };


  $scope.home_var.kaseyDinnerHeading = {
    text : function () {
      var KaseyDinnerBusinessName = saveData.get('kaseyDinnerBusinessName');
      if( typeof(KaseyDinnerBusinessName) != 'undefined' && KaseyDinnerBusinessName != '' ) {
        return KaseyDinnerBusinessName; // data is present
      }
      return '';
    }
  }

  $scope.home_var.businessMap = {
    text : function() {
      var businessMap = get_business_data_map.getSearchKeyword();
      //console.log(businessMap);
      if( typeof(businessMap) != 'undefined' && businessMap != '' ) {
        return businessMap; // data is present
      }
      return '';
    }
  }

  $rootScope.showPopup = function (msg) {
    $scope.data = {}

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
        /* template:'<i class="icon-gift"></i>',*/
        title: '<img src="img/bonus.png"> Bonus',

        subTitle: msg,
        scope: $scope,
        buttons: [
            { text: 'Cancel', type: 'button-positive' }

        ]
    });
    myPopup.then(function (res) {
        console.log('Tapped!', res);
    });
    $timeout(function () {
        myPopup.close(); //close the popup after 3 seconds for some reason
    }, 3000);
  };
  /******End : Home Heading Setting*******/


  var isIOS = ionic.Platform.isIOS();
  

  $scope.redirect_urls = {
    my_membership : function() {
      console.log('my_membership');
      $scope.output = 'my_membership';
      $state.go("home.membership");
      // $state.go("home.membership");
    },
    account_settings : function() {
      console.log('account_settings');
      $scope.output = 'accout_settings';
      $state.go("home.account");
    },
    invite_friend : function() {
      console.log('invite_friend');
      $scope.output = 'invite_friend';
      $state.go("home.invite");
    },
    home : function() {
      console.log('home');
      $scope.output = 'home';
      $state.go('home.restaurants', { vertical: "1"});
    },
    aboutus : function() {
      console.log('aboutus');
      $scope.output = 'aboutus';
      $state.go("home.aboutus");
    },
    map : function() {
      console.log('Map View');
      $scope.output = 'map_view';
      $state.go("home.businessmap");
    },
    myloyalbonus : function () {
      $state.go("home.milestones");
    },
    myorders : function () {
      console.log('myorderz');
      $state.go("home.myorders");
    }
  };

});
