angular.module('LoyalBonus')

.controller('orderRecieptController', function ($scope, $state, ajaxCall, active_controller,$rootScope, refreshTest) {

	active_controller.set('orderRecieptController');
	$scope.Test = function () {
        return refreshTest.showrefreshtest($state.current.name, $state.params);
    }

    $scope.order_reciept = {
        print_label : function (order_id) {
            // domainName/webapi/BusinessStoreAPI/DownloadPrintLabel?orderId=f5be2956-f3d6-4b3a-8c2e-aebfaec714e7&userId=309
            ajaxCall
            .get('webapi/BusinessStoreAPI/DownloadPrintLabel', {
                orderId : order_id,
                userId  : $rootScope.userDetails.userId
            })
            .then(function(res) {
                console.log(res);
            });
        }
    };

    // OrderInvoice(Get): Parameters – [orderId, userId]
	/*
        domainName/webapi/BusinessStoreAPI/OrderDetails?orderId=f5be2956-f3d6-4b3a-8c2e-aebfaec714e7&userId=309
        type :  GET
        parameters :  orderId and userId
        Response :  response's data order details   
         */
    ajaxCall
    .get('webapi/BusinessStoreAPI/OrderDetails', {
		userId  : $rootScope.userDetails.userId,
		orderId : $state.params.order_id
    })
    .then(function(res) {
        $scope.order_reciept.datadeal = res.data.Data;
    	console.log(res);
    });



});