angular.module('LoyalBonus')

  .controller('MemberController_detail', function ($scope, $state, active_controller, $ionicModal,refreshTest,$sce, $rootScope, ajaxCall, popUp, $q, loading, payment, membership_api) {
    $scope.tabName = $state.params;
    //$state.params.id == 'Membership'

    

    $scope.Test = function () {
        return refreshTest.showrefreshtest($state.current.name, $state.params);
    }

    active_controller.set('MemberController_detail');


  });


