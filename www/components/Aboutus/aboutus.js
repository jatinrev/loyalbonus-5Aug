angular.module('LoyalBonus')

.controller('AboutusController', function ($scope,$state,refreshTest,$ionicModal,active_controller) {
	
active_controller.set('AboutusController');
	$scope.Test = function () {
        return refreshTest.showrefreshtest($state.current.name, $state.params);
}
     $ionicModal.fromTemplateUrl('components/Aboutus/privacymodal.html',{
        scope:$scope,
        animation:'slide-in-up'
    }).then(function(modal){
        $scope.modal = modal;
    });
    $scope.closeZoomView=function(){
 
        $scope.modal.hide();
    }
    $scope.privacy_up=function(){
        $scope.modal.show();
        
    }
           
});



