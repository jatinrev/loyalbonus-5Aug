angular.module('LoyalBonus')

.controller('myOrdersController', function ($scope, $state, ajaxCall, active_controller,$rootScope, refreshTest, $ionicPlatform, loading) {

    // http://beta2.loyalbonus.com/webapi/MyAccountAPI/GetMyOrderByUserId?userId=236
    $ionicPlatform.ready(function () {
        active_controller.set('myOrdersController');
        $scope.Test = function () {
            return refreshTest.showrefreshtest($state.current.name, $state.params);
        }

        $scope.call_ajax = function() {
            loading.start();
            ajaxCall
            .get('webapi/MyAccountAPI/GetMyOrderByUserId?userId='+$rootScope.userDetails.userId,{})
            .then(function(res) {
                loading.stop();
            	$scope.datadeal = res.data.Data;
            	console.log(res);
            }, function(error) {
                loading.stop();
                console.log(error);
            });
        }
        $scope.call_ajax();

        // OrderInvoice(Get): Parameters – [orderId, userId]
        $scope.view_receipt = function(orderId) {
            $state.go("home.orderReciept", {order_id : orderId});
        }
    });

});