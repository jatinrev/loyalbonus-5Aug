var globaldata = {
  prefix : 'http://beta2.loyalbonus.com/'
};

angular.module('LoyalBonus', ['ionic', 'ngSanitize', 'ionic-rating-stars', 'tabSlideBox','LoyalBonus.services', 'ngCordova', 'angular-carousel', 'ngOpenFB', 'ngMap','ngAnimate','ngTouch', 'ionic-zoom-view'])

.run(function ($ionicPlatform, ngFB, $rootScope, $cordovaPreferences, update_user_details, $cordovaNetwork, showRating, popUp) {
  /*Temp Data*
    $rootScope.userDetails = {
      userId       : 236,// jatin = 263, karan = 236, dvijesh = 282
      Email        : 'karan.xpress@gmail.com', // 'karan.xpress@gmail.com', 'dvijesh@revinfotech.com',
      FullName     : 'Karan', // 'Karan', dvijesh',
      userLocation : '6.461573,3.479404', //Karan_pass = test123
      CreatedOn    : '2016-05-31T11:24:34.607'
    }
  /*Temp Data*/

    $rootScope.roothelperFunction = {
      print_stars : function (newNumber) {
        return showRating.showRatingImages(newNumber);
      }
      , popUp     : function(msg, status) {
          popUp
          .msgPopUp(msg, status);
      }
    }

    /*document.addEventListener("deviceready", function () {
      TestFairy.begin('74f45751c3c80012a7de77a79b95f81ccf172f5e');
    }, false);*/

  /*
  checking network connection
   */
  document.addEventListener("deviceready", function () {
    if($cordovaNetwork.isOffline()) { // if user is offline
      alert('Please check you internet connection and restart the app.');
    }
  }, false);


  $ionicPlatform.ready(function () {
    /**Start : checking storage**/
    $cordovaPreferences.fetch('userId', 'dict')
    .success(function(value) {
      console.log(value);
      if(typeof(value) != 'undefined' ) {
        update_user_details.get( value );
      }
    })
    .error(function(error) {

    });
    /***End : checking storage***/

    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    ngFB.init({appId: '1151061421612372'});

    $rootScope.isAndroid_global = ionic.Platform.isAndroid();
    console.log($rootScope.isAndroid_global);

  });
})


.run(function ($ionicPlatform, $rootScope, backFunctionality, watchUser, scan_now, $state, refreshTest, $cordovaPreferences, popUp, membership_api) {
  $ionicPlatform.ready(function () {
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  // CUSTOM FUNCTIONS
  $rootScope.userPresent = function () {
    return watchUser.userPresent();
  }
  $rootScope.scanBarcode = function(businessObj) {
    scan_now.scan(businessObj)
    .then(function(res) {
      console.log('barcode result');
      console.log(res);
      if( res == undefined ) {
          refreshTest.showrefreshtest($state.current.name, $state.params);
      } else if(res == 0 ) {
          $cordovaPreferences.remove('userId', 'dict');
          $rootScope.userDeatils = {};
          /*** End : removing from preference ***/
          $state.go("signin");
      } else {
          popUp.msgPopUp('<p class="text-align-center margin-bottom-0">Failed!</p><p class="text-align-center margin-bottom-0">Sorry for inconvinence, we could not update visit. Please scan again.</p>', 0)
      }
    });
  }
  membership_api.check_membership();

})

.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      // $httpProvider.defaults.headers.common['Authorization'] = 'Basic lbonus:c0m3!n';
      $urlRouterProvider.otherwise("home/restaurants/");
      // $urlRouterProvider.otherwise("/signin/");

      $stateProvider
      .state("home", {
        url   : "/home/",
        cache : false,
        views : {
          "" : {
            templateUrl  : "components/home/home.html",
            controller   : "HomeController",
            controllerAs : "hc"
          }
        },
        abstract: true
      })
      .state("signin", {
        url   : "/signin/",
        views : {
          "" : {
            templateUrl  : "components/SignIn/signin.html",
            controller   : "SignInController",
            controllerAs : "sc"
          }
        }
      })
      .state("signup", {
        url   : "/signup/",
        views : {
          "" : {
            templateUrl  : "components/SignUp/signup.html",
            controller   : "SignUpController",
            controllerAs : "suc"
          }
        }
      })
      .state("restpassword", {
        url   : "/restpassword/",
        views : {
          "" : {
            templateUrl  : "components/Resetpassword/rest.html",
            controller   : "RestPasswordController",
            controllerAs : "rpc"
          }
        }

      })
      .state("home.restaurants", {
        url   : "restaurants/:vertical",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/Restaurants/restaurants.html",
            controller   : "RestaurantController",
            controllerAs : "rc"
          }
        }

      })
      .state("home.kaseydiner", {
        url   : "kaseydiner/:id/:image",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/KaseyDiner/KaseyDiner.html",
            controller   : "KaseyDinerController",
            controllerAs : "kdc"
          }
        }
      })
      .state("home.success", {
        url   : "success/",
        views : {
          "body": {
            templateUrl  : "components/Success/success.html",
            controller   : "SuccessController",
            controllerAs : "sc"
          }
        }
      })
      .state("home.review", {
        url   : "review/:businessId/:businessImg/:businessRating",
        views : {
          "body": {
            templateUrl  : "components/Review/review.html",
            controller   : "ReviewController",
            controllerAs : "rc"
          }
        }
      })
      .state("home.milestones", {
        url   : "milestones/",
        views : {
          "body": {
            templateUrl  : "components/Milestones/milestones.html",
            controller   : "MileStoneController",
            controllerAs : "msc"
          }
        }
      })
      .state("home.myorders", {
        url   : "myorders/",
        views : {
          "body": {
            templateUrl  : "components/myOrders/myOrders.html",
            controller   : "myOrdersController",
            controllerAs : "myOr"
          }
        }
      })
      .state("home.orderReciept", {
        url   : "orderReciept/:order_id",
        views : {
          "body": {
            templateUrl  : "components/myOrders/order_reciept.html",
            controller   : "orderRecieptController",
            controllerAs : "orRe"
          }
        }
      })
      .state("home.account", {
        url   : "account/",
        views : {
          "body": {
            templateUrl  : "components/Account/account.html",
            controller   : "AccountController",
            controllerAs : "acc"
          }
        }
      })
      .state("home.membership", {
        url   : "membership/",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/Membership/membership.html",
            controller   : "MemberController",
            controllerAs : "mc"
          }
        }
      })
      .state("home.membership_detail", {
        url   : "membership_detail/:tra_ref/:CreatedDate/:Tra_amt/:tra_type/:PlanType",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/Membership/membership_detail.html",
            controller   : "MemberController_detail",
            controllerAs : "mc_d"
          }
        }
      })
      .state("home.map", {
        url   : "map/",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/Map/map.html",
            controller   : "MapController",
            controllerAs : "mpc"
         }
        }
      })
      .state("home.aboutus", {
        url   : "aboutus/",
        views : {
          "body": {
            templateUrl  : "components/Aboutus/aboutus.html",
            controller   : "AboutusController",
            controllerAs : "ac"
          }
        }
      })
      .state("home.businessmap", {
        url   : "businessmap/",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/Businessmap/businessmap.html",
            controller   : "BusinessController",
            controllerAs : "bc"
          }
        }
      })
      .state("home.invite", {
        url   : "invitefriend/",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/Invitefriend/invitefriend.html",
            controller   : "InviteController",
            controllerAs : "ic"
          }
        }
      })
      .state("home.shoppingcart", {
        url   : "shoppingcart/:businessId",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/Shoppingcart/Shoppingcart.html",
            controller   : "ShoppingCartController",
            controllerAs : "scc"
          }
        }
      })
      .state("home.product", {
        url   : "product/:BusinessId",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/Product/product.html",
            controller   : "ProductController",
            controllerAs : "pc"
          }
        }
      })
      .state("home.productDetail", {
        url   : "productDetail/:BusinessId/:Productid",
        cache : false,
        views : {
          "body": {
            templateUrl  : "components/Product/productDetail.html",
            controller   : "CartController",
            controllerAs : "cc"
          }
        }
      });
    }
]);
// .run(function ($http) {
//   $http.defaults.headers.common['Authorization'] = 'Basic lbonus:c0m3!n';
// });


