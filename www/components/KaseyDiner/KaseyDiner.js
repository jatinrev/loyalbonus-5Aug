angular.module('LoyalBonus')

    .factory('businessVisit', function (ajaxCall, loading, $rootScope) {
        /**
         *  businessUid is qrCode
         */
        function give_visit(userId, businessUid, businessId) {
            return ajaxCall
                .post('webapi/BusinessMaster/CreateBusinessQR', {
                    BusinessId: businessId,
                    BusinessUID: businessUid,
                    UserId: userId
                });
        }
        function giveLove(businessId, userId, isLove) {
            loading.start();
            return ajaxCall
            .post('webapi/BusinessMaster/BusinessGiveHeart',
            {
                UserId     : userId,
                BusinessId : businessId,
                IsLoved    : isLove
            }).then(function (result) {
                loading.stop();
                return result.data.Data;
            });
        }

        function businessDetail(businessId, userId) {
            loading.start();
            // if userId is not present
            if( typeof(userId) == 'undefined' || +userId == 0 ) {
                // http://beta2.loyalbonus.com/webapi/BusinessMaster/GetBusinessDetils?BusinessID=80
                // webapi/BusinessMaster/GetBusinessbyID?BusinessId=  (old .net)
                // http://beta2.loyalbonus.com/webapi/BusinessMaster/GetBusinessbyIDUserId?BusinessId=2&UserId=
                return ajaxCall
                    .get('webapi/BusinessMaster/GetBusinessbyIDUserId?BusinessId=' + businessId + '&UserId=0', {})
                    .then(function(res) {
                        loading.stop();
                        // console.log(res);
                        // res.data.Data[0];
                        /*return {
                            data : {
                                Data : [
                                    res.data.Data
                                ]
                            }
                        }*/
                        return res;
                    }, function(error) {
                        loading.stop();
                        return error;
                    });
            }
            return ajaxCall
                .get('webapi/BusinessMaster/GetBusinessbyIDUserId?BusinessId=' + businessId + '&UserId=' + userId, {})
                .then(function(res) {
                    loading.stop();
                    return res;
                }, function(error) {
                    loading.stop();
                    return error;
                });
        }

        return {
            give_visit            : give_visit,
            giveLove              : giveLove,
            businessDetail        : businessDetail
        };
    })
    .controller('KaseyDinerController', function ($scope, $state, ajaxCall, $cordovaBarcodeScanner,
        active_controller, $ionicPlatform, businessVisit, $ionicHistory, showRating, saveData, $ionicPopup, $timeout, $rootScope, watchUser, refreshTest,get_business_data, loading, productFactory, $ionicModal, get_user_location, popUp, $http ) {

        $rootScope.showMe = false;
        get_business_data.removeSearchKeyword();
        var kasey_data = {};  // FOR ANONYMOUS DATA.

        kasey_data.string = 'Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea Delicious tea';
        console.log(kasey_data.string.length);


        $scope.state_on = function () {
            return $state.params.id;
        };

        $scope.Test = function () {
            return refreshTest.showrefreshtest($state.current.name, $state.params);
        }

        $scope.Lovedpage = {};
        var lovecount = 0;

        $scope.Lovedpage.loadKaro = function (isLoveStatus) {
            businessVisit
            .giveLove($scope.state_on(), $rootScope.userDetails.userId, isLoveStatus)
            .then(function (result) {
                if (result.StatusMessage != "Success") {
                    // console.log($scope.datadeal.lovecount);
                    return $scope.Test();

                }
            });
        }

        $scope.isAndroid = ionic.Platform.isAndroid();
        // isIOS = ionic.Platform.isIOS();
        // console.log(isAndroid);


        $scope.showPopup = function (msg) {
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

        $scope.showPopupMy = function (msg) {
            if(msg == 0) {
                msg = '0';
            }
            console.log(msg);
            $scope.data = {}

            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                /* template:'<i class="icon-gift"></i>',*/
                title: '<img src="img/bonus.png"> My Bonus',

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


        $scope.showAlert = function () {
            var alertPopup = $ionicPopup.alert({

                title: 'Scanned Complete'
            });
            alertPopup.then(function (res) {
                console.log('Thank you for not eating my delicious ice cream cone');
            });
        };
        $scope.showAlertscanner = function (msg,status) {
            $scope.data = {};
            if(status == 1) {
                var image = '<img src="img/chk.png"> ';
            } else {
                var image = '<img src="img/cancel.png">';
            }
            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                title: image,
                subTitle: msg,
                scope: $scope,
                buttons: [
                    { text: 'Ok', type: 'button-positive' }
                ]
            });
            myPopup.then(function (res) {
                console.log('Tapped!', res);
            });
            $timeout(function () {
                myPopup.close(); //close the popup after 3 seconds for some reason
            }, 3000);
        };

        $scope.showPopupFor = function (msg) {
            $scope.data = {}
            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                /* template:'<i class="icon-gift"></i>',*/
                title: '<img src="img/bonus.png"> You have receive this bonus '+( +msg == 0 ? '0' : msg )+' time(s).',
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

        $scope.toggleItem = function (item) {
            if ($scope.isItemShown(item)) {
                $scope.shownItem = null;
            } else {
                $scope.shownItem = item;
            }
        };
        $scope.isItemShown = function (item) {
            return $scope.shownItem === item;
        };

        $scope.goToMap = function (businessDetailId) {
            saveData.set('businessDetailId', businessDetailId);
            $state.go("home.map", { businessDetailId: businessDetailId });
        }

        function mydummyJson(input) {

            var output = [];
            //console.log(input);
            for (var i = 0; i < input; i++) {
                output.push(i)
                //console.log(output.push(i));
            }
            return output;
        }
        $scope.myloyalbonus = {};


        $scope.myloyalbonus.printTick    = function ( uservisits, BonusDiscountToCust ) {
            if( +uservisits == +BonusDiscountToCust ) {
                return mydummyJson(+uservisits - 1);
            }
            return mydummyJson(+uservisits);
        }

        $scope.myloyalbonus.printNonTick = function ( uservisits, BonusDiscountToCust ) {
            var answerNontick =  +BonusDiscountToCust - +uservisits ;
            if( answerNontick - 1 <= 0 ) {
                return mydummyJson(0);
            } else {
                return mydummyJson(answerNontick - 1);
            }
        }

        $scope.myloyalbonus.printGift    = function ( uservisits, BonusDiscountToCust ) {
            if (+BonusDiscountToCust == uservisits) {
                return mydummyJson(0);
            } else {
                return mydummyJson(1);
            }
        }
        $scope.myloyalbonus.printGiftDiscount = function( uservisits, BonusDiscountToCust ) {
            if( +uservisits == +BonusDiscountToCust ) {
                return mydummyJson(1);
            }
        }



        active_controller.set('KaseyDinerController');

        $scope.datadeal       = {};

        $scope.newScope       = {}; // helper variable

        $scope.helperFunction = {};

        // $scope.checkGlobal = function () {
        //console.log($rootScope.userDetails.userId);
        // }

        // http://beta2.loyalbonus.com/webapi/BusinessMaster/GetBusinessbyIDUserId?BusinessId=2&UserId=12
        function test() {
            var userIdInTestFunction = function () {
                if( watchUser.userPresent() == 1 ) {
                    return $rootScope.userDetails.userId;
                }
                return '';
            }
            businessVisit
                .businessDetail($state.params.id, $rootScope.userDetails.userId)
                .then(function (res) {
                    console.log(res);
                    $scope.datadeal = res.data.Data[0];
                    loading.start();
                    // http://beta2.loyalbonus.com/webapi/BusinessMaster/GetHeartbybusinessidUserid?BusinessId=214&UserId=448
                    
                    // return $scope.datadeal; // this is temp
                    return ajaxCall
                    .get('webapi/BusinessMaster/GetHeartbybusinessidUserid', {
                        BusinessId : $state.params.id,
                        UserId : 0//( $rootScope.userDetails.userId == undefined ? '' : $rootScope.userDetails.userId )
                    })
                    .then(function(res) {
                        loading.stop();
                        saveData.set('kaseyDinnerBusinessName', $scope.datadeal.Name);
                        $scope.datadeal.lovecount = res.data.Data[0].lovecount;
                        return $scope.datadeal;
                    });                   // this is original


                }).then(function (res) {
                    var centerDefined = 0;
                    $scope.newScope.positions = [];
                    $scope.newScope.address = [];
                    for (i in res.businesslocationsList) {
                        //console.log(res.businesslocationsList);
                        if (centerDefined == 0) {
                            $scope.newScope.center = res.businesslocationsList[i].Lat + ',' + res.businesslocationsList[i].Lng;
                            centerDefined = 1;
                        }
                        $scope.newScope.positions.push(res.businesslocationsList[i].Lat + ',' + res.businesslocationsList[i].Lng);
                        /**Start : for address printing**/
                        $scope.newScope.address.push(res.businesslocationsList[i].Address1 + ',' +res.businesslocationsList[i].Address2);
                        console.log(res.businesslocationsList[i].Lat + ',' + res.businesslocationsList[i].Lng);
                        console.log("hh");
                       $scope.destination= res.businesslocationsList[i].Lat + ',' + res.businesslocationsList[i].Lng;
                        /***End : for address printing***/
                    }
                    loading.stop();
                     //console.log(res);

                });
        }
        test();



        $scope.helperFunction.reviews = function (number) {
            return showRating.showRatingImages(number);
        }

        $scope.helperFunction.write_review = function (businessId, businessImage, BusinessStars) {
            // BusinessStars can be null also(when user have not given any rating)
            $state.go("home.review", { businessId: businessId, businessImg: businessImage, businessRating: BusinessStars });
        };

        $scope.helperFunction.go_to_login = function() {
            $state.go("signin");
        };

        /**** End : rating service ****/

        /*$scope.Lovedpage.enableLoved = function () {
            businessVisit
            .giveLove($state.params.id, $rootScope.userDetails.userId, true)
            .then(function (res) {
                console.log(res);
                if(res.data.StatusMessage == 'Success') {


                }
            });
        };*/

        kasey_data.product_pageIndex = 0;
        $scope.myloyalbonus.datadealProd = [];
        $scope.invitelistnewBusinessproduct = function () {
            productFactory
                .printProduct($scope.state_on(), kasey_data.product_pageIndex)
                .then(function (resultNew) {
                    if( resultNew.length < 1 ) {
                       $scope.myloyalbonus.noMoreProductAvailable = true;
                    } else {
                        kasey_data.product_pageIndex++;                 // INCREASE PAGE INDEX.
                        for (key in resultNew) {
                            $scope.myloyalbonus.datadealProd.push(resultNew[key]);
                        }
                        console.log($scope.myloyalbonus.datadealProd);
                    }
                    console.log('product listing', $scope.myloyalbonus.datadealProd);
                    $scope.$broadcast('scroll.infiniteScrollComplete'); // STOP PAGING LOADING
                });
        }
        $scope.invitelistnewBusinessproduct();


        //map  by pushker


        function getDistanceFromLatLonInKm(lat,lon,lat1,lon1) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat1-lat);  // deg2rad below
            var dLon = deg2rad(lon1-lon);
            var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat)) * Math.cos(deg2rad(lat1)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in km
              
            console.log("d value :" + d);
            console.log("hhh");
        }
        function deg2rad(Value) {
        /** Converts numeric degrees to radians */
            return Value * Math.PI / 180;
        }
        $scope.closeZoomView=function(){
            $scope.modal.hide();
        }



        $scope.map_show=function() {
            /*jatin start*/
            var geoString = '';
            if($rootScope.isAndroid_global) {
                geoString = "google.navigation:q="+$scope.destination;
            } else {
                geoString = "http://maps.apple.com/?daddr="+$scope.destination;
            }
            window.open(geoString, '_system');


            return ; // below is done by pushker
            get_user_location
            .get
            .then(function (position) {
                console.log('position', position);
                $scope.origin=position.coords.latitude +',' +position.coords.longitude;
                console.log($scope.origin);
                console.log($scope.destination);
                var demo = $scope.destination.split(",");
                console.log(demo);
                var lat=position.coords.latitude ;
                var lon=position.coords.longitude;
                var lat1=demo[0];
                var lon1=demo[1];


                /***jatin start***/
                $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+$scope.origin+'&sensor=true', {
                    params: {}
                })
                .then(function(res) {
                    var array_length = res.data.results.length-1;
                    var country = res.data.results[array_length].formatted_address
                    
                    if (country=="Nigeria") {
                        $ionicModal.fromTemplateUrl('components/KaseyDiner/my-map.html',{
                            scope:$scope,
                            animation:'slide-in-up'
                        }).then(function(modal){
                            console.log("sdggs");
                            $scope.modal = modal;
                            $scope.modal.show();
                        });
                    } else {
                        popUp
                        .msgPopUp("Sorry unable to find");
                        console.log("no user is there");
                    }
                });
                /***jatin stop****/

                // getDistanceFromLatLonInKm(lat,lon,lat1,lon1);
                /*if (navigator.geolocation) {
                    console.log('Geolocation is supported!');
                } else {
                    console.log('Geolocation is not supported for this Browser/OS version yet.');
                }*/     
            });
        }


    });


