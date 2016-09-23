angular.module('LoyalBonus')

  .controller('MemberController', function ($scope, $state, active_controller, $ionicModal,refreshTest,$sce, $rootScope, ajaxCall, popUp, $q, loading, payment, membership_api) {
    $scope.tabName = $state.params.id;
    //$state.params.id == 'Membership'

    var data_ctr = {};

    function get_payment_amount(MembershipTypeID) {
        for(i in $scope.datadeal.UpdatePaymentMethod.MembershipTypes) {
            if( $scope.datadeal.UpdatePaymentMethod.MembershipTypes[i].MembershipTypeID == MembershipTypeID ) {
                console.log($scope.datadeal.UpdatePaymentMethod);
                return $scope.datadeal.UpdatePaymentMethod.MembershipTypes[i];
            }
        }
    }

    $scope.datadeal = {};
    var check_radio_button_selected = 0;
    $scope.membership = {
        /*
          Method - Get : GetMembershipTypeByUserId
          [Parameters : userId]
          url : webapi/MyAccountAPI/GetMembershipTypeByUserId?userId=123
          new : http://beta2.loyalbonus.com/webapi/MyAccountAPI/GetMembershipTypeBy_UserId?userId=428
        */
        GetMembershipTypeByUserId : function () {
            return ajaxCall
            .get('webapi/MyAccountAPI/GetMembershipTypeBy_UserId?userId='+$rootScope.userDetails.userId, {})
            .then(function(res) {
                console.log("gggggggfgg");
                $scope.datadeal.UpdatePaymentMethod = res.data.Data;
                console.log($scope.datadeal.UpdatePaymentMethod);
                return { res : res };
            });
        },

        /*
          Method - Post : SavePayStackResponseInPaymentHistory 
          [Parameters : membershipTypeId, PaystackAuthCode, transactionReferenceNo, userId, PaystackCardType, PaystackCCLastFour, PaystackChannel, PaystackMessage, promoFreeMonth]
        */
        SavePayStackResponseInPaymentHistory : function (formData) {
            loading.start();
            // getting selected data response.
            data_ctr.selectedMembershipObj = get_payment_amount($scope.datadeal.membershipTypeId_selected);
            if($scope.membership.getPromoApplied()) {
                var membershipFee = $scope.datadeal.UpdatePaymentMethod.AfterDiscountAmount;
            } else {
                var membershipFee = data_ctr.selectedMembershipObj.MemberShipFee;
            }
            $scope.membership
            .get_paystack_reference()
            .then(function(referenceId) {
                var handler = PaystackPop.setup({
                    key      : 'pk_test_9a83db45e3af2848c334742b3ffceadc45442a4f',
                    email    : $rootScope.userDetails.Email,
                    amount   : +membershipFee*100, // amount in kodo
                    ref      : referenceId,
                    callback : function(response) {
                        console.log(response);
                        // response = Object {trxref: "1466954710"}
                        loading.start();
                        $scope.membership
                        .get_payment_data_from_paystack(response.trxref)
                        .then(function(callBackdata) {
                            console.log(callBackdata)
                            var paystack_authorization_code = callBackdata.data.authorization.authorization_code,
                            paystack_bank                   = callBackdata.data.authorization.bank,
                            paystack_card_type              = callBackdata.data.authorization.card_type,
                            paystack_channel                = callBackdata.data.authorization.channel,
                            paystack_last4                  = callBackdata.data.authorization.last4,
                            paystack_message                = callBackdata.message,
                            sava_paystack_data              = {
                                membershipTypeId       : $scope.datadeal.membershipTypeId_selected,
                                PaystackAuthCode       : paystack_authorization_code,
                                transactionReferenceNo : referenceId,
                                userId                 : $rootScope.userDetails.userId,
                                PaystackCardType       : paystack_card_type,
                                PaystackCCLastFour     : paystack_last4,
                                PaystackChannel        : paystack_channel,
                                PaystackMessage        : paystack_message,
                                promoFreeMonth         : ''
                            };
                            /*
                            Save_PayStackResponse_In_PaymentHistory
                            var PaymentHistoryModel = {
                                "membershipTypeId": "2"
                                , "PaystackAuthCode": "AUTH_0n65a4q2", "transactionReferenceNo": "8592a7a4-8ad0-480d-ac1c-9dce00354747",
                                "userId": "428", "PaystackCardType": "visa", "PaystackCCLastFour": "1381",
                                "PaystackChannel": "card", "PaystackMessage": "Verification completed", "promoFreeMonth": ""
                            }
                             */
                            console.log(sava_paystack_data);
                            ajaxCall
                            .post('webapi/MyAccountAPI/Save_PayStackResponse_In_PaymentHistory', sava_paystack_data)
                            .then(function (res) {
                                if( res.data.Data == true ) {
                                    popUp
                                    .msgPopUp('Paystack verification successful.', 1)
                                    .then(function() {
                                        membership_api.check_membership()
                                        .then(function() {
                                            // $scope.toggleGroup(2);
                                            $scope.Test();
                                        });
                                    });
                                } else {
                                    popUp
                                    .msgPopUp('Paystack verification unsuccessful.');
                                }
                                loading.stop();
                                return res.data.Data;
                            });
                        });
                        // alert('success. transaction ref is ' + response.trxref);
                    },
                    onClose  : function(){
                        console.log('window closed');
                        loading.stop();
                    }
                });
                handler.openIframe();
            });
        },
        ApplyPromoCode1 :function(formData){
            for(i in $scope.datadeal.UpdatePaymentMethod.MembershipTypeID==membershipTypeId){
                var discount=$scope.datadeal.UpdatePaymentMethod.MembershipType.userpromos;
                console.log(discount);
            }

        },

        /*
          Method - Post : ApplyPromoCode 
          [Parameters : userId, promoCode, amount, membershipTypeId]
        */
       ApplyPromoCode : function (formData) {
            if( $scope.datadeal.membershipTypeId_selected == undefined ) {
                $scope.datadeal.error = 'Please select the membership type.';
            } else {
                $scope.datadeal.error = undefined;
                return ajaxCall
                .get('webapi/MyAccountAPI/ApplyPromoCode', {
                    userId           : $rootScope.userDetails.userId,
                    promoCode        : formData.promoCode.$modelValue, // promo code
                    amount           : get_payment_amount($scope.datadeal.membershipTypeId_selected).MemberShipFee,
                    membershipTypeId : get_payment_amount($scope.datadeal.membershipTypeId_selected).MembershipTypeID
                })
                .then(function (res) { 
                    if(true) {
                        popUp.msgPopUp(res.data.StatusMessage+', discount : '+res.data.Data.data.discount, 1)
                        .then(function(res) {

                           // $scope.Test();
                        });
                    } else { 
                        popUp.msgPopUp(res.data.StatusMessage, 2);
                    }
                    console.log(res); 
                    $scope.discount=res.data.Data.data;
                    console.log($scope.discount);
                    return res;
                });
            }
        },

        /*
          Method - Post : RemoveUserPromoByUserPromoId
          [Parameters : userId, userPromoId]
        */
        RemoveUserPromoByUserPromoId : function (userPromoId) {
          console.log(userPromoId);
            return ajaxCall
            .get('webapi/MyAccountAPI/RemoveUserPromoByUserPromoId', {
                userId      : $rootScope.userDetails.userId,
                userPromoId : userPromoId
            })
            .then(function (res) {
                if(res.data.Data.status) {
                    popUp.msgPopUp('Promo have been removed.', 1)
                    .then(function(res) {
                        $scope.Test();
                    });
                }
                console.log(res);
            });
        },

        /*
          Method - Get : CancelMembership
          [Parameters : userId]
        */
        CancelMembership : function () {
            return popUp
            .confirm("Are you sure you want to cancel membership?")
            .then(function(res) {
                if(res) { // if true then cancel membership.
                    return ajaxCall
                    .post('webapi/MyAccountAPI/CancelMembership?userId='+$rootScope.userDetails.userId, {})
                    .then(function (res) {
                        if(res.data.Data.status == true) {
                            popUp.msgPopUp("You membership was canceled.", 2)
                            .then(function() {
                                membership_api.check_membership();
                            });
                        }
                        console.log(res);
                        return res;
                    });
                }
            });
        },
        /*
          Method - Get : ContinueMembership
          [Parameters : userId]
        */
        ContinueMembership : function () {
            loading.start();
            return ajaxCall
            .post('webapi/MyAccountAPI/ContinueMembership?userId='+$rootScope.userDetails.userId, {})
            .then(function (res) {
                loading.stop();
                console.log(res);
                var msg = '';
                if( $rootScope.membership_data != undefined && $rootScope.membership_data.IsCancelledMembership) {
                    msg = 'Welcome back. We missed you.';
                } else {
                    msg = 'Membership continued.';
                }
                popUp
                .msgPopUp(msg, 1)
                .then(function() {
                    membership_api.check_membership();
                });
                return res;
            });
        },

        //getting PAYSTACK REFERENCE
        get_paystack_reference : function() {
            //guid
            return payment
            .get_paystack_reference();
        },
        //Get Payment Data From Paystack
        get_payment_data_from_paystack : function(transactionRef) {
            return payment
            .get_paystack_response(transactionRef)
            .then(function(data) {
                console.log(data);
                if(data.status == '200') {
                    return data.data;
                } else {
                    popUp
                    .msgPopUp('Paystack verification unsuccessful.');
                    return data.data;
                }
            });
        },
        //return true if promo applied.
        getPromoApplied : function() {
            if($scope.datadeal.UpdatePaymentMethod) {
                if($scope.datadeal.UpdatePaymentMethod.PromoDiscountAmt > 0 && check_radio_button_selected == 0) {
                    check_radio_button_selected = 1;
                    $scope.datadeal.membershipTypeId_selected = $scope.datadeal.UpdatePaymentMethod.MembershipTypeID;
                    return true;
                } else if($scope.datadeal.UpdatePaymentMethod.PromoDiscountAmt > 0) {
                    return true;
                }
            }
        },
        // Method  (Get)  : GetPaymentHistoryByUserId [Parameter : userId]
        GetPaymentHistoryByUserId : function() {
            return ajaxCall
            .get('webapi/MyAccountAPI/GetPaymentHistoryByUserId', {
                userId : $rootScope.userDetails.userId
            })
            .then(function(res) {
                $scope.datadeal.paymentHistory = res.data.Data;
                console.log(res);
            });
        },
        change_promo_code : function(form_data) {
            console.log(form_data.membershipType.$modelValue);
            console.log($scope.datadeal.membershipTypeId_selected);
            
            if( $scope.datadeal.UpdatePaymentMethod.MembershipTypeID != null && $scope.datadeal.UpdatePaymentMethod.MembershipTypeID != $scope.datadeal.membershipTypeId_selected ) {
                loading.start();
                ajaxCall
                .get('webapi/MyAccountAPI/ApplyPromoCode', {
                    userId           : $rootScope.userDetails.userId,
                    promoCode        : 'Testing-123', // $scope.datadeal.UpdatePaymentMethod // promo code
                    amount           : get_payment_amount($scope.datadeal.membershipTypeId_selected).MemberShipFee,
                    membershipTypeId : get_payment_amount($scope.datadeal.membershipTypeId_selected).MembershipTypeID
                })
                .then(function (res) {
                    $scope.membership.GetMembershipTypeByUserId();
                    loading.stop();
                });
            }
            // $scope.membership.ApplyPromoCode(form_data)
        }
    }


    $scope.membership.GetMembershipTypeByUserId();
    $scope.membership.GetPaymentHistoryByUserId();

    $scope.Test = function () {
        return refreshTest.showrefreshtest($state.current.name, $state.params);
    }

    active_controller.set('MemberController');

    $scope.toggleGroup = function (group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };
    $scope.isGroupShown = function (group) {
        return $scope.shownGroup === group;
    };

    /*$scope.$watch('datadeal.membershipTypeId_selected', function() {
        console.log($scope.datadeal.membershipTypeId_selected);
    }, true);*/


  });


