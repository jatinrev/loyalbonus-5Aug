var app = angular.module('LoyalBonus')
    .factory('get_business_data_map', function (ajaxCall, $state, get_unique_elements, loading, $q, $rootScope) {
        var heading_data = []
            , restaurantData = []
            , pageIndex = []
            , searchKeyword = ''
            , searchPageIndex = []
            , searchData = []; //data is stored here categorywise

        function getBusinessPaging(businessId, lat, long) {
            loading.start();
            return ajaxCall.get('webapi/BusinessMaster/GetAllBusinessLocations?currlocationlatlong=&pageIndex=' + pageIndex[businessId] + '&pageSize=10&keyword=' + keyword, {})
                .then(function (response) {
                    // console.log(response);
                    if (response.data.Data.length > 0) { //records are present so add pageIndex.
                        pageIndex[businessId] += 1;
                    }
                    for (i in response.data.Data) {
                        restaurantData[businessId].push(response.data.Data[i]);
                    }
                    loading.stop();
                    return restaurantData;
                }, function errorCallback(response) {
                    console.log(response);
                });
        }

        function sort(multi_array) {
            var sorted_array = []
                , temp_multi_array = multi_array
                , go = 1
                , sorting_array_index = 0;
            for (i in multi_array) {
                for (j in temp_multi_array) {
                    if (multi_array[i] == temp_multi_array[j]) {
                        go = 1;
                        sorting_array_index = 0;
                        for (k in sorted_array) {
                            if (sorted_array[k].positions == multi_array[i].positions) {
                                go = 0; // add to existing array.
                                sorting_array_index = k;
                                break;
                            }
                        }
                        if (go == 0) { // if the variable is repeating in the array.
                            sorted_array[sorting_array_index].businessIds.push(multi_array[i].businessId);
                        } else {        // if the variable is not repeating in the array.
                            sorted_array.push({ positions: multi_array[i].positions, businessIds: [multi_array[i].businessId] });
                        }
                    }
                }
            }
            return sorted_array;
        }


        return {
            search: function (keyword) {
                // below is the outdated function
                // loading.start();

                function run(position) {
                    ajaxCall.get('webapi/BusinessMaster/GetAllBusinessLocations?currlocationlatlong=' + position.coords.latitude +','+ position.coords.longitude + '=&pageIndex=1&pageSize=10&keyword=' + keyword, {})
                        .then(function (fetch) {
                            var test = [];
                            for (i in fetch.data.Data) {
                                test.push({ businessId: fetch.data.Data[i].BusinessId, positions: fetch.data.Data[i].Lat + ',' + fetch.data.Data[i].Lng })
                            }
                            return sort(test);
                        });
                }

                return $cordovaGeolocation
                            .getCurrentPosition(posOptions)
                            .then(function (result) {
                                run(result);
                            }, function (error) {
                                var lat_long = {
                                    coords: {
                                        latitude  : '6.524379',
                                        longitude : '3.379206'
                                    }
                                }
                                run(lat_long);
                            });
                    
            },

            getBusinessRecord: getBusinessPaging,
            getSearchKeyword: function () { return searchKeyword; },
            removeSearchKeyword: function () { searchKeyword = ''; },
            sort_multi_array: sort
        };
    })

    .controller('BusinessController', function ($scope, saveData, $state, ajaxCall, $rootScope, active_controller, get_business_data_map, NgMap, $http, $interval, loading, refreshTest,$cordovaGeolocation, get_business_data) {
        active_controller.set('BusinessController');


        var bc                     = this,
        stopCenterStorage          = false, //if false, then store center location and vice-versa.
        businessMapPosition        = '';
        
        bc.positions               = [];
        // bc.center                  = null;
        $scope.datadeal            = [];
        $scope.helperFunction      = {};
        $scope.loadmoreNgShow      = false;
        $scope.gotoCurrentLocation = {};

        saveData.remove('businessMapPosition');

        $scope.Test = function () {
            saveData.remove('businessMapPosition');
            return refreshTest.showrefreshtest($state.current.name, $state.params);
        }

        $scope.state_on = function () {
            //console.log($state.params.id);
            return $state.params.id;
        };

        function testdata(BusinessId) {
            $scope.datadeal = [];
            console.log(BusinessId);
            for (ij in BusinessId) {
                ajaxCall
                    .get('webapi/BusinessMaster/GetBusinessbyIDUserId?BusinessId=' + BusinessId[ij] + '&UserId=', {})
                    .then(function (res) {
                        console.log('res');
                        console.log(res);
                        $scope.datadeal.push(res.data.Data[0]);
                    });
            }
        }

        NgMap
            .getMap()
            .then(function (map) {
                loading.start();
                bc.showCustomMarker = function (event) {
                    // console.log(bc.positions[this.id]);
                    // console.log(event.target); /*.attributes.id.value*/
                    var variable = bc.positions[this.id];
                    // console.log(variable.businessIds);
                    testdata(variable.businessIds);
                    var vm = this;
                    if (this.getAnimation() != null) {
                        this.setAnimation(null);
                    } else {
                        this.setAnimation(google.maps.Animation.BOUNCE);
                    }
                    //console.log(event);
                    //this is for click fujnctionality for marker click
                    /*map.customMarkers.foo.setVisible(true);
                    map.customMarkers.foo.setPosition(this.getPosition());*/
                };

                bc.closeCustomMarker = function (evt) {
                    this.style.display = 'none';
                };

                bc.test = function () {
                    stopCenterStorage = true;  // this is to stop storing center location in the factory.
                    loading.start();
                    $scope.loadmoreNgShow = true;

                    function run(position) {
                        console.log(position);
                        search_keyword = get_business_data.getSearchKeyword();
                        ajaxCall.get('webapi/BusinessMaster/GetAllBusinessLocations?currlocationlatlong' + position.coords.latitude +','+ position.coords.longitude + '=&pageIndex=0&pageSize=10&keyword='+search_keyword, {})
                        .then(function (fetch) {
                            var positions = []
                            , test        = [];

                            for (i in fetch.data.Data) {
                                test.push({ businessId: fetch.data.Data[i].BusinessId, positions: fetch.data.Data[i].Lat + ',' + fetch.data.Data[i].Lng })
                            }
                            var sortedArray = get_business_data_map
                                              .sort_multi_array(test);

                            var businessMapPosition = saveData.get('businessMapPosition');
                            if( typeof(businessMapPosition) == 'undefined' || businessMapPosition == '') {
                                bc.center = position.coords.latitude +','+ position.coords.longitude; // USER LOCATION CENTER.
                                // console.log(sortedArray[0].positions);
                                saveData.remove('businessMapPosition');
                            } else {
                                console.log('center');
                                console.log(businessMapPosition);
                            }
                            // console.log(bc.center);
                            bc.positions      = sortedArray;
                            loading.stop();
                            stopCenterStorage = false; // this is to again start storing center location in the factory.
                        });
                    }
                    posOptions = { timeout: 10000, enableHighAccuracy: false };
                    $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function (result) {
                            run(result);
                        }, function (error) {
                            var lat_long = {
                                coords: {
                                    latitude  : '6.524379',
                                    longitude : '3.379206'
                                }
                            }
                            run(lat_long);
                        });

                }
                bc.test();

                $scope.setCenter = function () {
                    if( stopCenterStorage != true ) { // this will only store location when data is not refreshing.
                        businessMapPosition = map.getCenter().lat()+','+map.getCenter().lng();
                        // console.log(businessMapPosition);
                        saveData.set('businessMapPosition', businessMapPosition);
                    } else {
                        console.log('not saving');
                    }
                }
            });

            $scope.isAndroid = ionic.Platform.isAndroid();

        $scope.helperFunction.reviews = function (number) {
            //console.log(typeof (number));
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
        $scope.goToMap = function (businessDetailId) {
            saveData.set('businessDetailId', businessDetailId);
            $state.go("home.restaurants", { vertical: 1 }, { businessDetailId: businessDetailId });
        }

        /*******Search functionality******/
        bc.search = function (keyword) {
            if (typeof (keyword) != "undefined" && keyword.length > 0) {
                $rootScope.showMe = false;
                get_business_data_map
                    .search(keyword)
                    .then(function (response) {
                        bc.positions = response;
                    });
            } else {
                console.log('keyword empty');
            }
        };

        $scope.testing = function () {
            return saveData.get('businessMapPosition');
        }
    });