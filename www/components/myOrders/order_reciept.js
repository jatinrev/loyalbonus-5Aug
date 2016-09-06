angular.module('LoyalBonus')

.controller('orderRecieptController', function ($scope, $state, ajaxCall, active_controller,$rootScope, refreshTest,popUp,$ionicModal) {

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


    $ionicModal.fromTemplateUrl('components/myOrders/my-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
    }).then(function(modal){
        $scope.modal = modal;
    });
    $scope.closeZoomView=function(){
        console.log("cvhfghj");
        $scope.modal.hide();
    }
    $scope.track_package=function(){
        console.log("hjhf");
        ajaxCall
        .get('webapi/UserCartAPI/GetTrackingDetails', {
            /*orderId : "11707D46-8448-4F92-9835-990D641E92AB",*/
           /* orderId :"e5f5ab80-1197-4025-a0d9-7d9dcb3af40b",*/
            UserId :$rootScope.userDetails.userId,
            orderId :$state.params.order_id
            /*userId:"428"*/
        })
        .then(function(res){
            $scope.modal_data = res.data.Data
            console.log($scope.modal_data)
            $scope.modal.show();
             /*$scope.modal.hide();*/
           /* popUp
            .msgPopUp("fdh");*/
            console.log(res);
        });        
    }
});
