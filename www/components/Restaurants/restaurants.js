angular.module('LoyalBonus', '')
    .factory('get_business_data', function (ajaxCall, $state, get_unique_elements, loading, $q) {
        var heading_data  = []
        , restaurantData  = []
        , pageIndex       = []
        , searchKeyword   = ''
        , searchLocation  = ''
        , searchPageIndex = 0
        , searchData      = []
        , removeSearchKeywordChecker; //data is stored here categorywise


        function getBusinessRecord(businessId, lat, long) {
            loading.start();
            return ajaxCall.get('webapi/BusinessMaster/SearchDataByFilters?pageIndex=' + pageIndex[businessId] + '&pageSize=5&CatId=' + businessId + '&SubCatId=&locId=&Keyword=&currlocationlatlong=' + lat + ',' + long, {})
                .then(function (response) {
                    if(response.data.Data == null) {
                        response.data.Data = [];
                    }

                    if (response.data.Data.length > 0) { //records are present so add pageIndex.
                        pageIndex[businessId] += 1;
                        for (i in response.data.Data) {
                            restaurantData[businessId].push(response.data.Data[i]);
                        }
                    }

                    loading.stop();
                    return restaurantData;
                }, function errorCallback(response) {
                    //console.log(response);
                });
        }

        return {
            search: function (keyword, lat, long, catId, location) {
                console.log('location');
                console.log(location);
                loading.start();
                var heading = []
                , data      = {};
               	return ajaxCall.get('webapi/BusinessMaster/SearchDataByFilters?pageIndex=' + searchPageIndex + '&pageSize=5&CatId=0&SubCatId=&locId='+location+'&Keyword=' + keyword + '&currlocationlatlong=' + lat + ',' + long, {})
                    .then(function (response) {
                        searchKeyword = keyword;
                        if(response.data.Data == null) {
                            response.data.Data = [];
                        }
                        if (response.data.Data.length > 0) {
                            searchPageIndex += 1;
                            for (i in response.data.Data) {
                                searchData.push(response.data.Data[i]);
                            }
                        }
                        loading.stop();
                        console.log(searchData);
                        return searchData;
                    });

            },
            getheading: function () {
                if (heading_data.length > 0) {
                    var promise = $q.defer();
                    promise.resolve(heading_data);
                    return promise.promise;
                } else {
                    return ajaxCall.get('webapi/BusinessMaster/GetBusinessCategory', {})
                        .then(function (res) {
                            /* console.log(res);*/
                            var heading_data_temp = [];
                            for (variable in res.data.Data) {
                                //console.log(variable);
                                heading_data_temp.push({
                                    CategoryID   : res.data.Data[variable].CategoryID,
                                    CategoryName : res.data.Data[variable].CategoryName
                                });
                                //console.log(res.data.Data[variable].CategoryName);
                            }

                            //ADDING ANNOMOUS DATA at categrory 0
                            heading_data_temp.push({
                                CategoryID   : 0,
                                CategoryName : 'Anonymous'
                            });

                            heading_data = heading_data_temp;
                            //console.log(restaurantData);

                            /**for restaurant page**/
                            for (i in heading_data) {
                                //console.log(i);
                                restaurantData[heading_data[i].CategoryID]  = [];
                                /**for indexing of each page**/
                                pageIndex[heading_data[i].CategoryID]       = 0;
                            }

                            $state.go("home.restaurants", { vertical: heading_data[0].CategoryID });

                            return heading_data;
                        });
                }
            },
            getBusinessRecord               : getBusinessRecord,
            getSearchKeyword                : function ()       { return searchKeyword; },
            getLocationKeyword              : function ()       { return searchLocation; },
            setKewordSearch                 : function(input)   { searchKeyword = input.value; searchLocation = input.location; },
            removeSearchKeyword             : function ()       {
                removeSearchKeywordChecker = 1;
                searchKeyword              = '';
                searchLocation             = '';
            },
            stop_removeSearchKeywordChecker : function()        { removeSearchKeywordChecker = 0; },
            get_removeSearchKeywordChecker  : function()        { return removeSearchKeywordChecker; }
        };

    })
    .controller('RestaurantController', function ($scope, $rootScope, $state, ajaxCall, $ionicPlatform, $stateParams, $q, $location, $window, get_unique_elements, get_user_location, $cordovaGeolocation, get_business_data,
        active_controller, loading, $ionicPopup, $timeout, refreshTest, saveData, $ionicHistory, $ionicScrollDelegate, watchUser, popUp,showRating, $http) {

        var restaurantData = []
        , previous_length;
        /*
        This function return true if current_length and previous_length matches
         */
        function record_length(current_length) {
            if(current_length == previous_length) {
                return true;
            } else {
                previous_length = current_length;
            }
        }

        active_controller.set('RestaurantController');

        $scope.restaurants          = {};
        $scope.noMoreItemsAvailable = false;

        $scope.open_detail_page = function (id, image) {
            //console.log($scope.open_detail_page);
            $state.go("home.kaseydiner", { 
                id: id,
                image : image 
            });
        };

        $scope.Test = function () {
            return refreshTest.showrefreshtest($state.current.name, $state.params);
        }

        $scope.testing = 'in RestaurantController...';

        $scope.goForward = function () {
            get_business_data
            .getheading()
            .then(function (res) {
                var go = 0;
                for (i in res) {
                    if (go == 1) {
                        $state.go("home.restaurants", { vertical: +res[i].CategoryID });
                        //console.log(+res[i].CategoryID);
                        //console.log(+$state.params.vertical);
                        break;
                    }
                    if (+res[i].CategoryID == +$state.params.vertical) {
                        go = 1;
                    }
                }
            });
        }

        $scope.goBack = function () {
            get_business_data
                .getheading()
                .then(function (res) {
                    var go    = 0
                    , counter = [];
                    for (i in res) {
                        counter.push({ categoryID: +res[i].CategoryID });
                        if (+res[i].CategoryID == +$state.params.vertical) {
                            break;
                        }
                    }
                    //console.log(counter);
                    counter.pop();
                    $state.go("home.restaurants", { vertical: counter.slice(-1).pop().categoryID });

                });
        }

        $scope.isAndroid = ionic.Platform.isAndroid();


        $scope.print_data     = [];
        $scope.data           = {};
        $scope.positions      = {};
        $scope.heading        = [];
        $scope.loadmoreNgShow = false;
        /**/

        $scope.goToMap = function (businessDetailId) {
            saveData.set('businessDetailId', businessDetailId);
            $state.go("home.businessmap", { businessDetailId: businessDetailId });
            $ionicHistory.clearHistory();
        }

        $ionicPlatform.ready(function () {
            loading.start();
            $scope.testing = 'in RestaurantController ionic ready.';
            get_user_location
                .get
                .then(function (positionfulljson) {
                    console.log(positionfulljson);
                    if( typeof(positionfulljson.coords.latitude) != 'undefined' && positionfulljson.coords.latitude != '' ) {
                        var position = {
                            lat:  positionfulljson.coords.latitude,
                            long: positionfulljson.coords.longitude
                        };
                    } else {
                        var position = {
                            lat:  '',
                            long: ''
                        };
                    }

                    $scope.testing = position;

                    get_business_data   //setting heading
                        .getheading()
                        .then(function (res) {
                            if (typeof ($state.params.vertical) == 'undefined' || $state.params.vertical.length == 0) {
                                $state.go("home.restaurants", { vertical: res[0].CategoryID });
                            }
                            /*
                                below is for changing the crousel position when heading is changed.
                             */
                            for (key in res) {
                                if( res[key].CategoryID == $state.params.vertical ) {
                                    $scope.carouselIndex = +key;
                                    break;
                                }
                            }
                            $scope.heading = res;
                            return res;
                        })
                        .then(function () {
                            loading.stop();
                            // this if else is here when user changes navigation of business.
                            var reachLast, 
                            function_start;
                            $scope.listData = function () {
                                if(reachLast == true) {
                                    $scope.$broadcast('scroll.infiniteScrollComplete');
                                    $scope.noMoreItemsAvailable = true;
                                    return false;
                                } else if( function_start ) {
                                    // This thing stop the function when it is already called.
                                    return false;
                                }
                                function_start = true;
                                if (get_business_data.getSearchKeyword() != '' || get_business_data.getLocationKeyword() != '' ) { //&& +$state.params.vertical != 0
                                    // search results
                                    jQuery('ion-content').addClass('search_css');
                                    $scope.hide_category = true;
                                    return get_business_data
                                        .search(get_business_data.getSearchKeyword(), position.lat, position.long, +$state.params.vertical, get_business_data.getLocationKeyword())
                                        .then(function (response) {
                                            restaurantData = response;
                                            if( record_length(response.length) ) {
                                                reachLast = true;
                                            }
                                            function_start = false;
                                            $scope.$broadcast('scroll.infiniteScrollComplete'); // this is for infinite scroll.
                                        });
                                } else {   //if (+$state.params.vertical != 0)
                                    jQuery('ion-content').removeClass('search_css');
                                    $scope.hide_category = false;
                                    return get_business_data               //getting records
                                        .getBusinessRecord(+$state.params.vertical, position.lat, position.long)
                                        .then(function (result) {
                                            restaurantData = result[+$state.params.vertical];
                                            if( record_length(result[+$state.params.vertical].length) ) {
                                                reachLast = true;
                                            }
                                            function_start = false;
                                            $scope.$broadcast('scroll.infiniteScrollComplete'); // this is for infinite scroll.
                                        });
                                }
                            };
                            $scope.listData();
                        });

                    /*******  Bonus popup started functionality******/

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
                    /******* Bonus popup Ended functionality******/

                    /*******  Call To make started functionality******/
                    $scope.dialNumber = function(number) {
                        popUp
                        .confirm('', '<p class="text-align-center margin-bottom-0">Are you sure you want to call?</p>', 'Call Now')
                        .then(function (res) {
                            if(res) {
                                window.open('tel:' + number, '_system');
                            }
                        });
                    }

                    /*******  Call To make ended functionality******/

                    /*******Search functionality******/
                    $scope.restaurants.search = function (keyword) {
                        if (typeof (keyword) != "undefined" && keyword.length > 0) {
                            $rootScope.showMe = false;

                            get_business_data
                                .search(keyword, position.lat, position.long, +$state.params.vertical)
                                .then(function (response) {
                                    restaurantData = response[+$state.params.vertical];
                                });
                        } else {
                            console.log('keyword empty');
                        }

                    };

                });
        });


        $scope.print_data = function () {
            return restaurantData;
        }

        $scope.restaurants.print_image = function (newNumber) {
            
            return showRating.showRatingImages(newNumber);
        }

        $scope.restaurants.print_BonusDiscount = function (input) {
            if (input == null) {
                input = 0;
            }
            return input;
        }

        $scope.tabName = $state.params.vertical;

        $scope.tab_name = function () {
            return $state.params.vertical;
        }

        $scope.$watch(function(){
           return get_business_data.get_removeSearchKeywordChecker();
        }, function(NewValue, OldValue){
            get_business_data.stop_removeSearchKeywordChecker();
            if( NewValue == 1 ) {
                $scope.Test();
            }
        });
        // loading.stop();

        
    });



