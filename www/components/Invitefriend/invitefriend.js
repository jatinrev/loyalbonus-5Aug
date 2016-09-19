angular.module('LoyalBonus')

    .factory('Friendinvite', function (ajaxCall, loading, $rootScope) {

        function invite(EmailAddresses, EmailContent, userId) {
            console.log($rootScope.userDetails.userId);
            loading.start();
            return ajaxCall
                .post('webapi/Invitation/SendInvitation',
                {
                    EmailAddresses: EmailAddresses,
                    EmailContent: EmailContent,
                    userid: $rootScope.userDetails.userId
                }).then(function (result) {
                    console.log(result);
                    loading.stop();
                    return 1;
                });
        }

        function GetFBInviteLink() {
            return ajaxCall
            .get('webapi/AppLogin/GetFBInviteLink?userID='+$rootScope.userDetails.userId);
        }

        return {
            invite          : invite,
            GetFBInviteLink : GetFBInviteLink
        };
    })
    .controller('InviteController', function ($scope, $state, showRating, $timeout, reviewFactory, showRating, $rootScope, backFunctionality, refreshTest, active_controller, Friendinvite, popUp, $cordovaSocialSharing, loading) {
        active_controller.set('InviteController');
        $scope.datadeal = {};

        $scope.Test = function () {
            return refreshTest.showrefreshtest($state.current.name, $state.params);
        }

        var userIdInTestFunction = function () {
            if (watchUser.userPresent() == 1) {
                return $rootScope.userDetails.userId;
            }
            return '';
        }
        // Start : date calculation for showing discount offer.
        var createdondate = new Date($rootScope.userDetails.CreatedOn)
        , todayDate       = new Date();
        createdondate.setMonth(createdondate.getMonth() + 1); //adding month to date
        if(todayDate.getTime() >= createdondate.getTime()) { //if today date is greater then dont show discount offers.
            $scope.Show_discount_offer = false;
        } else {
            $scope.Show_discount_offer = true;
        }
        //   End : date calculation for showing discount offer.
        $scope.invitelist = function () {
            console.log($scope.datadeal.emailaddresses);
            if( $scope.datadeal.emailaddresses == undefined || $scope.datadeal.emailaddresses == '' ) {
                popUp
                .msgPopUp('Please enter email address.');
            } else {
                $scope.show_hide_invite_submit = true;  
                Friendinvite
                .invite($scope.datadeal.emailaddresses, $scope.datadeal.emailcontent)
                .then(function (result) {
                    console.log(result);
                    $scope.show_hide_invite_submit = false;
                    popUp
                    .msgPopUp('The mail has been sent.', 1);
                }, function (error) {
                    console.log(error);
                    popUp
                    .msgPopUp(error.data.Message);
                    loading.stop();
                });
            }
        }
       
        $scope.inviteFacebook = function() {
            popUp
            .confirm(null, 'Are you sure you want to share this via Facebook?')
            .then(function (res) {
                // GETTING URL TO SEND TO FACEBOOK.
                Friendinvite
                .GetFBInviteLink()
                .then(function (facebookUrl) {
                    // CONDITION TO CHECK deviceready.
                    document.addEventListener("deviceready", function () {
                        if(res == true) {
                            loading.start();
                            $cordovaSocialSharing
                            .shareViaFacebook('Hey check this out ', globaldata.prefix+'assets/img/logo-w-o-text.png', facebookUrl.data.Data)
                            .then(function (res) {
                                loading.stop();
                            }, function (error) {
                                popUp
                                    .msgPopUp('Please install Facebook app.');
                                loading.stop();
                            });
                        }
                    }, function () {
                        alert('please wait device is not ready.');
                    });
                });
            });
        }

    });


