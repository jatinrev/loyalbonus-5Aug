angular.module('LoyalBonus')

    .factory('cart_functions', function (ajaxCall, $rootScope, loading, saveData) {

        /*
        get all cart data from BUSINESSID
         */
        function GetUserCartByBusinessId(businessId) {
            loading.start();
            return ajaxCall
                .get('webapi/UserCartAPI/GetUserCartByBusinessId?businessId='+businessId+'&userId='+$rootScope.userDetails.userId, {})
                .then(function (res) {
                    // console.log(res);
                    loading.stop();
                    //UPDATING CART DATA.
                    if( res.data.Data != null ) {
                        var qty = 0;
                        for (i in res.data.Data.UserCartDetails) {
                            qty += +res.data.Data.UserCartDetails[i].Qty;
                        }
                        saveData.set('business_cart_size', qty);
                        console.log(saveData.get('business_cart_size'));
                    } else {
                        saveData.set('business_cart_size', 0);
                        //CART EMPTY.
                        return 0;
                    }

                    /* Start : Save data for dhl */
                    saveData.set('business_DHL', {
                        isDHL : '',
                        ShipmentOptionId : ''
                    });
                    /** End : Save data for dhl **/


                    //GETTING TOTAL PRICE
                    var totalPrice     = 0,
                    priceAfterDiscount = 0;

                    // This is also done in checkout page as to give promo discount
                    for (value in res.data.Data.UserCartDetailPromos) {
                        totalPrice         = totalPrice + (+res.data.Data.UserCartDetailPromos[value].Price * +res.data.Data.UserCartDetailPromos[value].Qty);
                        priceAfterDiscount = priceAfterDiscount + (+res.data.Data.UserCartDetailPromos[value].PriceAfterDiscount * +res.data.Data.UserCartDetailPromos[value].Qty);
                    }
                    saveData.set('business_cart_totalPrice', totalPrice);
                    saveData.set('business_cart_priceAfterDiscount', priceAfterDiscount);
                    return res.data.Data;
                }, function (error) {
                    loading.stop();
                    return error;
                });
        }
        function update_cart(cartDetailId, productId, qty) {
            return ajaxCall
            .post('webapi/UserCartAPI/UpdateQuantityByCartDetailId', {
                cartDetailId : cartDetailId,
                productId    : productId,
                qty          : qty,
                userId       : $rootScope.userDetails.userId
            });
        }

        /*
            UserCartAPI/RemoveItemFromCart(Get): Parameters – [cartDetailId, cartId, businessStoreId, businessId, productId, userId]
            return 1, when product is removed.
         */
        function remove_product(cartDetailId, cartId, businessStoreId, businessId, productId) {
            loading.start();
            return ajaxCall
            .get('webapi/UserCartAPI/RemoveItemFromCart?cartDetailId='+cartDetailId+'&cartId='+cartId+'&businessStoreId='+businessStoreId+'&businessId='+businessId+'&productId='+productId+'&userId='+$rootScope.userDetails.userId, {})
            .then(function(res) {
                saveData.set('business_cart_size', +saveData.get('business_cart_size') - 1);

                loading.stop();
                if( res.data.Data.BusinessID == businessId ) {
                    return 1;
                }
            });
        }

        // ApplyPromoCode (Post): Parameters – [CartId, BusinessStoreId, PromoCode,  userId]
        function apply_promo(CartId, BusinessStoreId, PromoCode) {
            loading.start();
            return ajaxCall
            .post('webapi/UserCartAPI/ApplyPromoCode', {
                CartId          : CartId,
                BusinessStoreId : BusinessStoreId,
                PromoCode       : PromoCode,
                userId          : $rootScope.userDetails.userId
            })
            .then(function (res) {
                loading.stop();
                return res;
            });
        }

        // CheckOut(Get): Parameters – [cartId, businessStoreId, BusinessID, ProductID, userId].
        // THIS FUNCTION IS INCOMPLETE
        function checkout(cartId, businessStoreId, BusinessID, ProductID) {
            loading.start();
            return ajaxCall
            .get('webapi/UserCartAPI/CheckOut?cartId='+cartId+'&businessStoreId='+businessStoreId+'&BusinessID='+BusinessID+'&ProductID='+ProductID+'&userId='+$rootScope.userDetails.userId, {})
            .then(function(res) {
                loading.stop();
                //UPDATE TOTAL AND SUBTOTAL, BECAUSE CHECKOUT GIVES DIFFERENT RESULT.
                saveData.set('business_cart_priceAfterDiscount', res.data.Data.SubTotal)
                return res.data.Data;
            });
        }

        // http://beta2.loyalbonus.com/webapi/UserCartAPI/GetSavedCreditCards?userId=236
        function GetSavedCreditCards() {
            return ajaxCall
            .get('webapi/UserCartAPI/GetSavedCreditCards', {
                userId : $rootScope.userDetails.userId
            });
        }

        return {
            GetUserCartByBusinessId : GetUserCartByBusinessId,
            update_cart             : update_cart,
            remove_product          : remove_product,
            apply_promo             : apply_promo,
            checkout                : checkout,
            GetSavedCreditCards     : GetSavedCreditCards
        };
    })

    .controller('ShoppingCartController', function ($scope, $state,  active_controller, $ionicPlatform, refreshTest, $rootScope, businessVisit, cart_functions, productDetailFactory, popUp, ajaxCall, payment, $window, saveData, loading, $ionicModal, $cordovaInAppBrowser) {
        /*
        business Lising starts : this is comming from kaseyDinner.js
         */
        $scope.businessData = {};
        var shoppingCart    = {
            get_address : function() {
                // http://localhost:51566/webapi/ChangeUserAddressApi/GetUserAddressList?userId=236
                return ajaxCall
                .get('webapi/ChangeUserAddressApi/GetUserAddressList', {
                    userId : $rootScope.userDetails.userId
                });
            }
        }
        $scope.cart         = {
            shipping_dhl           : 0
            , shipping_dhl_charges : 0
            /**
             * To change quantity of the product.
             */
            , quantity_change : function (cartDetailId, productId, qty) {
                console.log(qty);
                if( qty != undefined && +qty != 0 ) {
                    loading.start();
                    cart_functions
                    .update_cart(cartDetailId, productId, qty)
                    .then(function (res) {
                        shoppingCart.get_cart_data();
                        loading.stop();
                    });
                }
            }
                                        //      1        2            3             4
            , remove_product : function (cartDetailId, cartId, businessStoreId, productId, ArrayKey) {
                cart_functions      //1         2             3                     4               5
                .remove_product(cartDetailId, cartId, businessStoreId, $state.params.businessId, productId)
                .then(function (res) {
                    if(res == 1) {
                        $scope.cart.data.UserCartDetails.splice(ArrayKey, 1);
                        $scope.Test();
                    } else {
                        alert('Unfortunately the product was not removed.');
                    }
                });
            }
            , apply_promo : function () {
                if($scope.cart.data.PromoId > 0) {
                    // REMOVE PROMO
                    /*  RemovePromoCode
                        UserID,BusinessStoreId,CartId
                        Method = Post
                    */
                    ajaxCall
                    .post('webapi/UserCartAPI/RemovePromoCode', {
                        UserID          : $rootScope.userDetails.userId,
                        BusinessStoreId : $scope.cart.data.BusinessStoreId,
                        CartId          : $scope.cart.data.CartId
                    })
                    .then(function(res) {
                        console.log(res);
                        if(res.data.Data.success) {
                            popUp
                            .msgPopUp( res.data.Data.result, 2)
                            .then(function() {
                                $scope.Test();
                            });
                        } else {
                            popUp
                            .msgPopUp( res.data.Data.result, 0)
                            .then(function() {
                                $scope.Test();
                            });
                        }
                    });
                } else {
                    // APPLY PROMO
                    cart_functions
                    .apply_promo($scope.cart.data.CartId, $scope.cart.data.BusinessStoreId, $scope.cart.promo)
                    .then(function(res) {
                        if(res.data.Data.success == true) {
                            popUp
                            .msgPopUp( res.data.Data.result, 1)
                            .then(function() {
                                $scope.Test();
                            });
                        } else {
                            popUp
                            .msgPopUp( res.data.Data.result, 0)
                            .then(function() {
                                $scope.Test();
                            });
                        }
                    });
                }
            } 
            , check_out : function() {
                cart_functions
                .checkout($scope.cart.data.CartId, $scope.cart.data.BusinessStoreId, $state.params.businessId, $scope.cart.data.UserCartDetails[0].ProductId)
                .then(function (res) {
                    $scope.cart.checkout_data = res;
                    console.log($scope.cart.checkout_data);


                    // [gtpay_mert_id,gtpay_tranx_id,gtpay_tranx_amt,gtpay_tranx_curr,gtpay_cust_id,gtpay_tranx_noti_url,hashkey]
                    var HashCode                  = gtpay_mert_id + gtpay_tranx_id + $scope.cart.totalPrice().price_after_discount + gtpay_tranx_curr + gtpay_cust_id + gtpay_tranx_noti_url + hashkey;
                    console.log($scope.cart.totalPrice().price_after_discount);
                    gtBank.getShaCode(HashCode);


                    /* getting state data */
                    $scope.address.get_state_govt_area($scope.cart.checkout_data.DefaultUserAddress.StateId)
                    .then(function (resultwa) {
                        var govt_area_id = $scope.cart.checkout_data.DefaultUserAddress.StateGovAreaId;
                        for(i in resultwa) {
                            if( govt_area_id == resultwa[i].StateGovAreaId ) {
                                $scope.cart.checkout_data.default_state_govt_name = resultwa[i].GovAreaName;
                            }
                        }
                    });
                    


                    //---------GET SAVED CREDIT CARDS---------
                    cart_functions.GetSavedCreditCards()
                    .then(function(res) {
                        $scope.cart.paystack_auth_code = res.data.Data;
                        // console.log(res);
                    });

                    $scope.$watch('cart.shipping_dhl', function() {
                        console.log($scope.cart.shipping_dhl);
                        if( $scope.cart.shipping_dhl == 0 ) {
                            $scope.cart.shipping_dhl_charges = 0;
                            saveData.set('business_cart_priceAfterDiscount', +$scope.cart.checkout_data.SubTotal + +$scope.cart.shipping_dhl_charges);
                        } else {
                            for(i in $scope.cart.checkout_data.DHLShippingOptionList) {
                                if($scope.cart.checkout_data.DHLShippingOptionList[i].ShippingOptionId == $scope.cart.shipping_dhl) {
                                    loading.start();
                                    $scope.cart
                                    .change_dhl($scope.cart.checkout_data.DHLShippingOptionList[i], function(res) {
                                        loading.stop();
                                        $scope.cart.shipping_dhl_charges = res.shipping_charges;
                                        saveData.set('business_cart_priceAfterDiscount', +$scope.cart.checkout_data.SubTotal + +$scope.cart.shipping_dhl_charges);
                                    });
                                    break;
                                }
                            }
                        }
                        // $scope.cart.change_dhl()
                    }, true);

                });
            }
            , payment : function(paymentMethod) {
                console.log(paymentMethod);
                loading.start();
                /*
                paymentMethod : 1 = paystack, 2 = gtbank
                 */
                $scope.cart.checkout_error = '';
                if( paymentMethod == undefined ) {
                    $scope.cart.checkout_error = 'Please select the payment you want to proceed with.';
                    loading.stop();
                } else if( paymentMethod > 2 ) {
                    paymentMethod = paymentMethod-3;

                    // MAKING PAYMENT TO PAYSTACK
                    payment
                    .chargingReturningCustomers($scope.cart.paystack_auth_code[paymentMethod].PaystackAuthCode, $scope.cart.totalPrice().price_after_discount)
                    .then(function(res) {
                        var referenceId = res.data.data.reference;

                        // PAYSTACK RESPONSE FROM REFERENCE ID
                        payment
                        .get_paystack_response(referenceId)
                        .then(function(callBackdata) {
                            callBackdata = callBackdata.data;
                            var paystack_authorization_code = callBackdata.data.authorization.authorization_code
                            , paystack_bank                 = callBackdata.data.authorization.bank
                            , paystack_card_type            = callBackdata.data.authorization.card_type
                            , paystack_channel              = callBackdata.data.authorization.channel
                            , paystack_last4                = callBackdata.data.authorization.last4
                            , paystack_message              = callBackdata.message
                            , input                         = {
                                BusinessId               : $state.params.businessId
                                , ProductId              : $scope.cart.data.UserCartDetails[0].ProductId
                                , CartId                 : $scope.cart.data.CartId
                                , BusinessStoreId        : $scope.cart.data.BusinessStoreId
                                , Paymentmethod          : 1 // ?
                                , TransactionReferenceNo : referenceId
                                , PayAmount              : $scope.cart.totalPrice().price_after_discount //*100
                                , PaystackAuthCode       : paystack_authorization_code
                                , PaystackCardType       : paystack_card_type
                                , PaystackCCLastFour     : paystack_last4
                                , PaystackChannel        : paystack_channel
                                , PaystackMessage        : paystack_message
                                , userId                 : $rootScope.userDetails.userId
                            };

                            // INSERT PAYMENT.
                            $scope.cart
                            .after_payment_checkout(input)
                            .then(function(payment_res) {
                                loading.stop();
                                if( payment_res.data.StatusMessage == 'Failed' ) {
                                    popUp
                                    .msgPopUp('Payment Failed', 0);
                                } else if(payment_res.data.Message == null) {
                                    popUp
                                    .msgPopUp('Your payment was successful. Your order id "'+payment_res.data.Data+'"', 1)
                                    .then(function() {
                                        $state.go("home.orderReciept", {order_id : payment_res.data.Data});
                                    });
                                } else {
                                    popUp
                                    .msgPopUp('Paystack Payment failed. Error : '+payment_res.data.Message);
                                }
                                console.log(payment_res);
                            }, function(payment_fail) {
                                loading.stop();
                                popUp
                                .msgPopUp(payment_fail);
                            });
                        });
                    }, function(error) {
                        console.log(error);
                    });
                } else if(paymentMethod == 1) {
                    console.log('starting of paystack method.');
                    // PAYSTACK
                    payment
                    .get_paystack_reference()
                    .then(function(referenceId) {
                        console.log(referenceId);
                        var handler = PaystackPop.setup({
                            key      : 'pk_test_9a83db45e3af2848c334742b3ffceadc45442a4f',
                            email    : $rootScope.userDetails.Email,
                            amount   : $scope.cart.totalPrice().price_after_discount, //*100,
                            ref      : referenceId,
                            callback : function(response) {
                                // response = Object {trxref: "1466954710"}
                                loading.start();
                                payment
                                .get_paystack_response(response.trxref)
                                .then(function(callBackdata) {
                                    callBackdata = callBackdata.data;
                                    var paystack_authorization_code = callBackdata.data.authorization.authorization_code
                                    , paystack_bank                 = callBackdata.data.authorization.bank
                                    , paystack_card_type            = callBackdata.data.authorization.card_type
                                    , paystack_channel              = callBackdata.data.authorization.channel
                                    , paystack_last4                = callBackdata.data.authorization.last4
                                    , paystack_message              = callBackdata.message
                                    , input                         = {
                                        BusinessId               : $state.params.businessId
                                        , ProductId              : $scope.cart.data.UserCartDetails[0].ProductId
                                        , CartId                 : $scope.cart.data.CartId
                                        , BusinessStoreId        : $scope.cart.data.BusinessStoreId
                                        , Paymentmethod          : 1 // ?
                                        , TransactionReferenceNo : referenceId
                                        , PayAmount              : $scope.cart.totalPrice().price_after_discount //*100
                                        , PaystackAuthCode       : paystack_authorization_code
                                        , PaystackCardType       : paystack_card_type
                                        , PaystackCCLastFour     : paystack_last4
                                        , PaystackChannel        : paystack_channel
                                        , PaystackMessage        : paystack_message
                                        , userId                 : $rootScope.userDetails.userId
                                    };

                                    // INSERT PAYMENT.
                                    $scope.cart
                                    .after_payment_checkout(input)
                                    .then(function(payment_res) {
                                        if( payment_res.data.StatusMessage == 'Failed' ) {
                                            popUp
                                            .msgPopUp('Payment Failed', 0);
                                        } else if(payment_res.data.Message == null) {
                                            popUp
                                            .msgPopUp('Paystack Payment was successfull. Your order id "'+payment_res.data.Data+'"', 1)
                                            .then(function() {
                                                $state.go("home.orderReciept", {order_id : payment_res.data.Data});
                                                // $scope.Test();
                                            });
                                        } else {
                                            popUp
                                            .msgPopUp('Paystack Payment failed. Error : '+payment_res.data.Message);
                                        }
                                        console.log(payment_res);
                                        loading.stop();
                                    }, function(payment_fail) {
                                        popUp
                                        .msgPopUp(payment_fail);
                                    });


                                    /*popUp
                                    .msgPopUp('Paystack verification successful.', 1);*/
                                });
                                // alert('success. transaction ref is ' + response.trxref);
                            },
                            onClose  : function() {
                                console.log('window closed');
                                loading.stop();
                            }
                        });
                        handler.openIframe();
                    });
                } else {
                    // GTBANK
                    gtBank.post_request();

                    /*
                    $window
                    .gtBank_custom
                    .output(function (res) {
                        console.log(res);
                        return ;
                        var obj = gtBank.parseQueryString(res.url);
                        console.log(obj);
                        
                        var input = {
                            BusinessId                  : $state.params.businessId
                            , ProductId                 : $scope.cart.data.UserCartDetails[0].ProductId
                            , CartId                    : $scope.cart.data.CartId
                            , BusinessStoreId           : $scope.cart.data.BusinessStoreId
                            , Paymentmethod             : 2 // ?
                            , TransactionReferenceNo    : obj.gtpay_tranx_id
                            , PayAmount                 : obj.gtpay_tranx_amt
                            , PaystackAuthCode          : null
                            , PaystackCardType          : null
                            , PaystackCCLastFour        : null
                            , PaystackChannel           : null
                            , PaystackMessage           : null
                            , userId                    : $rootScope.userDetails.userId
                            , GTPaygwayname             : obj.gtpay_gway_name
                            , GTPaytranshash            : obj.gtpay_tranx_hash
                            , GTPayverificationhash     : obj.gtpay_verification_hash
                            , GtPayfullverificationhash : obj.gtpay_full_verification_hash
                        };
                        // INSERT PAYMENT.
                        
                        if(obj.gtpay_tranx_status_code == "00") {
                            $scope.cart
                            .after_payment_checkout(input)
                            .then(function(payment_res) {
                                if( payment_res.data.StatusMessage == 'Failed' ) {
                                    popUp
                                    .msgPopUp('Payment Failed', 0);
                                } else if(payment_res.data.Message == null) {
                                    popUp
                                    .msgPopUp('GtBank Payment was successfull. Your order id "'+payment_res.data.Data+'"', 1);
                                } else {
                                    popUp
                                    .msgPopUp('GtBank Payment failed. Error : '+payment_res.data.Message);
                                }
                                loading.stop();
                                console.log(payment_res);
                            });
                        } else {
                            popUp
                            .msgPopUp('GtBank Payment failed.');
                            loading.stop();
                        }
                    });*/
                }
            }
            // UserCheckOut(Post): Parameters – [BusinessId, ProductId, CartId, BusinessStoreId, Paymentmethod, TransactionReferenceNo, PayAmount, PaystackAuthCode, PaystackCardType, PaystackCCLastFour, PaystackChannel, PaystackMessage, userId]
            , after_payment_checkout : function(input) {
                return ajaxCall
                .post('webapi/UserCartAPI/UserCheckOut', input)
                .then(function(res) {
                    return res;
                });
            }
            , ChangeAddress : function() {
                return 0;
            }
            /**
             * This function is here because in "UserCartAPI/GetUserCartByBusinessId" some of the data is comming in 'UserCartDetailPromos' and some in 'UserCartDetails'.
             */
            , UserCartDetails_data : function(productId) {
                // FUNCTION EH KHRAB HAI..
                for (key in $scope.cart.data.UserCartDetails) {
                    if($scope.cart.data.UserCartDetails[key].ProductId == productId) {
                        return $scope.cart.data.UserCartDetails[key];
                    }
                }
                // return $scope.cart.data.UserCartDetailPromos[key]
            }
            , totalPrice : function() {
                return {
                    total_price               : ( saveData.get('business_cart_totalPrice') == undefined ? 0 : +saveData.get('business_cart_totalPrice').toFixed(2)*100 ), // amount in kobo
                    price_after_discount      : ( saveData.get('business_cart_priceAfterDiscount') == undefined ? 0 : +saveData.get('business_cart_priceAfterDiscount').toFixed(2)*100 ), // amount in kobo
                    total_price_full          : ( saveData.get('business_cart_totalPrice') == undefined ? 0 : saveData.get('business_cart_totalPrice').toFixed(2) ), // amount in nigerian currency
                    price_after_discount_full : ( saveData.get('business_cart_priceAfterDiscount') == undefined ? 0 : saveData.get('business_cart_priceAfterDiscount').toFixed(2) ) // amount in nigerian currency
                }
            }
            , state_on : function() {
                return $state.params.businessId;
            }
            , business_cart_size : function() {
              var business_cart_size = saveData.get('business_cart_size');
              if( typeof(business_cart_size) == 'undefined' ) {
                return 0;
              } else {
                return saveData.get('business_cart_size');
              }
            }
            /*
                beta2.loyalbonus.com/webapi/ChangeUserAddressApi/ChangeUserAddress
                input = {
                    UserAddressId  : 0,
                    UserID         : $rootScope.userDetails.userId,
                    AddressType    : '',
                    City           : '',
                    CreatedDate    : '',
                    FirstName      : '',
                    LastName       : '',
                    MobileNo       : '',
                    OppNxtnearby   : '',
                    StateGovAreaId : '',
                    StateId        : '',
                    StreetAddress  : ''
                }
             */
            , change_shipping_address : function(input) {
                /*
                THIS FUNCTIONS IS USED IN $scope.address
                 */
                return ajaxCall
                .post('webapi/ChangeUserAddressApi/ChangeUserAddress', input);
            }
            , show_address_pop : function() {
                loading.start();
                shoppingCart
                .get_address()
                .then(function(address_res) {
                    $scope.address.form                   = {};
                    $scope.address.error_shown            = 0;
                    $scope.address.address_button_name    = 'Select Address';
                    $scope.address.edit_address_id        = 0;
                    $scope.address.edit_address_input     = 0;
                    $scope.address.output                 = {};
                    $scope.address.selected_address_radio = 0;

                    $scope.address.address_list = address_res.data.Data;
                    for (i in address_res.data.Data) {
                        if( address_res.data.Data[i].IsDefault ) {
                            $scope.address.selected_address_radio = address_res.data.Data[i].UserAddressId;
                            break;
                        }
                    }
                    $ionicModal.fromTemplateUrl('components/Shoppingcart/change_address.html', {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function(modal) {
                        console.log($scope.address.address_list);
                        loading.stop();
                        $scope.modal = modal;
                    }).then(function() {
                        $scope.modal.show();
                    });
                });
            }
            , change_dhl : function(DHL_options, output) {
                /*
                domainname/webapi/UserCartAPI/UpdateShipViaDHLCharges
                with parameters as in screenshot and you will get response like the one in screenshot
                Parameters to send in model : 
                    1. cartId(Guid)
                    2. userId(int)
                    3. quantity(int)
                    4. chargeVal(decimal) --  charges associated with selected DHL shipping option
                    5. checkedOption(string)
                    6. productId(int)
                in response, you will get :
                    1. BasePrice :  total price of product selected(quantity * price)
                    2. TotalPrice  :  total price including DHL charges
                    3. priceAfterDiscount :  it is price of individual item after discount
                    4. quanity
                    5. ShippingChargesViaDHL = chargeVal
                 */
                var productId    = '',
                shipping_charges = 0,
                loop_length      = $scope.cart.data.UserCartDetails.length,
                counter          = 1;
                console.log($scope.cart.data.UserCartDetails);
                console.log(DHL_options);
                
                for( i in $scope.cart.data.UserCartDetails ) {
                    productId          = $scope.cart.data.UserCartDetails[i].ProductId;
                    business_cart_size = $scope.cart.data.UserCartDetails[i].Qty;
                    ajaxCall
                    .post('webapi/UserCartAPI/UpdateShipViaDHLCharges', {
                        cartId        : $scope.cart.checkout_data.CartId,
                        userId        : $rootScope.userDetails.userId,
                        quantity      : business_cart_size,
                        chargeVal     : DHL_options.ShippingChargeAmount,
                        checkedOption : DHL_options.ShippingOptionName,
                        productId     : productId
                    })
                    .then(function(res) {
                        shipping_charges = +shipping_charges + +res.data.Data.ShippingChargesViaDHL;
                        if( counter == loop_length ) {
                            output({ shipping_charges : shipping_charges });
                        }
                        counter++;
                    });
                }


                /*return ;
                return ajaxCall
                .post('webapi/UserCartAPI/UpdateShipViaDHLCharges', {
                    cartId        : $scope.cart.checkout_data.CartId,
                    userId        : $rootScope.userDetails.userId,
                    quantity      : +saveData.get('business_cart_size'),
                    chargeVal     : chargeVal,
                    checkedOption : checkedOption,
                    productId     : productIds
                })
                .then(function(res) {
                    console.log(res);
                    return res;
                });*/
            }
        };
        // $scope.cart


        var address_function = {
            set_default_address : function(addressId) {
                return ajaxCall
                .get('webapi/ChangeUserAddressApi/SaveUserDefaultAddress', {
                    userid        : $rootScope.userDetails.userId,
                    useraddressid : addressId //$scope.address.selected_address_radio
                })
                .then(function(res) {
                    if(res.data.Data) {
                        $scope.address.output = { status : 1, result : 'Default address set.' };
                        $scope.modal.remove()
                        .then(function() {
                            $scope.cart.check_out();
                        });
                    } else {
                        $scope.address.output = { status : 0, result : 'Unable to set default address.' };
                    }
                });
            }
        }

        // Start : Address functions
        $scope.address = {
            form                       : {},
            error_shown                : 0,
            address_button_name        : 'Select Address',
            edit_address_id            : 0,
            edit_address_input         : 0,
            output                     : {},
            selected_address_radio     : 0,
            address_selection_by_click : null,
            closeZoomView              : function() {
                $scope.modal.hide();
                console.log($scope.modal);
            },
            CreateAddress : function(input, addressId) {
                
                var ajax_input = {
                    UserAddressId  : addressId,
                    UserID         : $rootScope.userDetails.userId,
                    AddressType    : 1,
                    City           : $scope.address.form.city,
                    CreatedDate    : null,
                    FirstName      : $scope.address.form.first_name,
                    LastName       : $scope.address.form.last_name,
                    MobileNo       : $scope.address.form.mobile_number,
                    OppNxtnearby   : $scope.address.form.near_by,
                    StateGovAreaId : $scope.address.state_govt_area_selected,
                    StateId        : $scope.address.state_selected,
                    StreetAddress  : $scope.address.form.street_address,
                    IsDefault      : true
                }

                return $scope.cart
                .change_shipping_address(ajax_input);
                /*
                $scope.modal.remove();
                $scope.cart.check_out();
                */
                // save data here.
            },
            edit_address : function(address_id) {
                var output = ''
                for(i in $scope.address.address_list) {
                    if( $scope.address.address_list[i].UserAddressId == address_id ) {
                        output = $scope.address.address_list[i];
                        break;
                    }
                }
                console.log(output);
                $scope.address.form.city           = output.City;
                $scope.address.form.first_name     = output.FirstName;
                $scope.address.form.last_name      = output.LastName;
                $scope.address.form.mobile_number  = output.MobileNo;
                $scope.address.form.street_address = output.StreetAddress;
                $scope.address.form.near_by        = output.OppNxtnearby;
                $scope.address.state_selected      = output.StateId;

                $scope.address.get_state_govt_area($scope.address.state_selected)
                .then(function(res) {
                    console.log(res);
                    console.log(output.StateGovAreaId);
                    $scope.address.state_govt_area_selected_temp = output.StateGovAreaId;
                    $scope.address.state_govt_area_selected      = output.StateGovAreaId;

                    /*Working*/
                    var ajax_input = {
                        UserAddressId  : 0,
                        UserID         : $rootScope.userDetails.userId,
                        AddressType    : 1,
                        City           : $scope.address.form.city,
                        CreatedDate    : null,
                        FirstName      : $scope.address.form.first_name,
                        LastName       : $scope.address.form.last_name,
                        MobileNo       : $scope.address.form.mobile_number,
                        OppNxtnearby   : $scope.address.form.near_by,
                        StateGovAreaId : $scope.address.state_govt_area_selected,
                        StateId        : $scope.address.state_selected,
                        StreetAddress  : $scope.address.form.street_address
                    }
                    console.log(ajax_input);
                    $scope.address.edit_address_id            = address_id;
                    $scope.address.address_button_name        = 'Edit Address';
                    $scope.address.selected_address_radio     = address_id;
                    $scope.address.address_selection_by_click = null;
                });
            },
            // http://beta2.loyalbonus.com/webapi/ChangeUserAddressApi/DeleteUserAddrerss?UserId=437&UserAddressId=18
            delete_address : function(addressId, key) {
                popUp
                .confirm('Are you sure you want to delete this address')
                .then(function (result) {
                    if(result) {
                        ajaxCall
                        .post('webapi/ChangeUserAddressApi/DeleteUserAddrerss?UserId='+$rootScope.userDetails.userId+'&UserAddressId='+addressId , {})
                        .then(function(res) {
                            console.log(res);
                            if(res.data.Data == true) {
                                popUp
                                .msgPopUp('Address deleted.', 1)
                                .then(function() {
                                    $scope.address.address_list.splice(key, 1);
                                    console.log('Call address api.');
                                });
                            } else {
                                popUp
                                .msgPopUp('You cannot delete this address as this is your default address.');
                            }
                        });
                    }
                });
            },
            // http://beta2.loyalbonus.com/webapi/ChangeUserAddressApi/GetAllState
            all_states_ajax : function() {
                ajaxCall
                .get('webapi/ChangeUserAddressApi/GetAllState', {})
                .then(function(res) {
                    console.log(res);
                    $scope.address.all_states = res.data.Data;
                });
            },
            get_state_from_state_id : function(state_id) {
                if( $scope.address.all_states != undefined ) {
                    for (i in $scope.address.all_states) {
                        if( $scope.address.all_states[i].StateId == state_id ) {
                            return $scope.address.all_states[i];
                        }
                    }
                }
            },
            get_state_govt_area : function(state_id) {
                loading.start();
                // http://beta2.loyalbonus.com/webapi/ChangeUserAddressApi/GetStateGovermentAreaBySelectedState?StateId=1
                return ajaxCall
                .get('webapi/ChangeUserAddressApi/GetStateGovermentAreaBySelectedState', {
                    StateId : state_id
                })
                .then(function(res) {
                    loading.stop();
                    $scope.address.all_state_govt_area = res.data.Data;
                    console.log(res.data.Data);
                    return res.data.Data;
                }, function (error) {
                    loading.stop();
                });
            },
            state_changed : function() {
                $scope.address.get_state_govt_area($scope.address.state_selected);
            },
            set_address   : function(formInput) {
                console.log($scope.address.edit_address_id);
                if( 
                    ($scope.address.form.first_name != undefined && $scope.address.form.first_name != '') ||
                    ($scope.address.form.last_name != undefined && $scope.address.form.last_name != '') ||
                    ($scope.address.form.mobile_number != undefined && $scope.address.form.mobile_number != '') ||
                    ($scope.address.form.street_address != undefined && $scope.address.form.street_address != '') ||
                    ($scope.address.form.city != undefined && $scope.address.form.city != '') ||
                    ($scope.address.form.near_by != undefined && $scope.address.form.near_by != '') ||
                    ($scope.address.state_selected != undefined && $scope.address.state_selected != '') ||
                    ($scope.address.state_govt_area_selected != undefined && $scope.address.state_govt_area_selected != '') 
                ) {
                    if($scope.address.edit_address_id > 0) {
                        // edit address here
                        $scope.address.edit_address_input == 1;
                        $scope.address.CreateAddress(formInput, $scope.address.edit_address_id)
                        .then(function() {
                            $scope.modal.remove()
                            .then(function() {
                                $scope.cart.check_out();
                            });
                        });
                    } else if( $scope.address.selected_address_radio == 0 ) {
                        console.log('comming yo');
                        // create address.
                        $scope.address.CreateAddress(formInput, 0)
                        .then(function(res) {
                            console.log(res);
                            address_function.set_default_address(res.data.Data.UserAddressId);
                        });
                    } else {
                        $scope.address.output = { status : 0, result : 'Please select the address if you want to save this address.' }
                        $scope.address.error_shown = 1;
                    }
                } else if( $scope.address.selected_address_radio > 0 ) {
                    address_function.set_default_address($scope.address.selected_address_radio);
                }
                $scope.address.error_shown = 0;
                return ;

            },
            // Radio button selection in address.
            select_radio_button_click : function(UserAddressId) {
                $scope.address.address_selection_by_click = UserAddressId;
            },
            get_radio_button_click    : function(UserAddressId, active_address, thisThing) {
                if( $scope.address.address_selection_by_click == null && active_address ) {
                    return true;
                } else if( $scope.address.address_selection_by_click != null && $scope.address.address_selection_by_click == UserAddressId ) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        // $scope.address
        

        $scope.address.all_states_ajax();

        /*
        Start : gtBank methods
         */
        var context       = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"))
        , baseUrl         = baseURL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + context
        , oauthUrl        = baseUrl + '/gtOauth.html';

        // HashCode
        var getSha512Hash    = "",
        gtpay_mert_id        = "4994",
        gtpay_tranx_id       = payment.get_paystack_reference_no_promise(),
        gtpay_tranx_curr     = "566",
        gtpay_tranx_amt, //*100, // amt in kodo
        gtpay_cust_id        = $rootScope.userDetails.userId,
        gtpay_tranx_noti_url = globaldata.prefix+"UserCart/OrderConfirmationMobile",  //"http://beta2.loyalbonus.com/UserCart/OrderConfirmationMobile", "http://revmobile.devserver.co.in/test_2.php", "http://localhost/ionic/gtPay.php",
        hashkey              = "D3D1D05AFE42AD50818167EAC73C109168A0F108F32645C8B59E897FA930DA44F9230910DAC9E20641823799A107A02068F7BC0F4CC41D2952E249552255710F";

        $scope.gtbank = {
            local_oauth_url      : oauthUrl,
            oauthUrl             : gtpay_tranx_noti_url,
            gtpay_mert_id        : gtpay_mert_id,
            gtpay_tranx_id       : gtpay_tranx_id,
            gtpay_tranx_curr     : gtpay_tranx_curr,
            gtpay_cust_id        : gtpay_cust_id,
            gtpay_tranx_noti_url : gtpay_tranx_noti_url
        };
        var gtBank = {
            post_request : function() {
                var options = {
                    location   : 'no',
                    clearcache : 'no',
                    toolbar    : 'no'
                },
                url = 'gtPay.html?gtpay_mert_id='+$scope.gtbank.gtpay_mert_id+'&gtpay_tranx_id='+$scope.gtbank.gtpay_tranx_id+'&gtpay_tranx_amt='+$scope.gtbank.gtpay_tranx_amt+'&gtpay_tranx_curr='+$scope.gtbank.gtpay_tranx_curr+'&gtpay_cust_id='+$scope.gtbank.gtpay_cust_id+'&gtpay_cust_name='+$scope.gtbank.gtpay_cust_name+'&local_oauth_url='+$scope.gtbank.local_oauth_url+'&HashCode='+$scope.gtbank.HashCode+'&oauthUrl='+$scope.gtbank.oauthUrl;
                var cordova_browser = $cordovaInAppBrowser.open(url, '_blank', options)
                .then(function(event) {
                    console.log('event');
                    console.log(event);
                })
                .catch(function(event) {
                    // error
                });

                console.log('cordova_browser');
                console.log(cordova_browser);

                $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event) {
                    console.log(e, event);
                    console.log('event.url, gtpay_tranx_noti_url');
                    console.log(event.url, gtpay_tranx_noti_url);
                    console.log(typeof(event.url), typeof(gtpay_tranx_noti_url));
                    console.log();
                    if(event.type == 'loadstop' && event.url == gtpay_tranx_noti_url) {
                        $cordovaInAppBrowser.executeScript({
                            code: '(function() { return document.getElementById("data").innerText })()'
                        })
                        .then(function(res) {
                            console.log('result cordova');
                            console.log(res);
                            var output_gtBank = res[0];
                            var obj = gtBank.parseQueryString(output_gtBank);
                            console.log(obj);
                            $cordovaInAppBrowser.close();
                            if( obj.gtpay_tranx_status_code != undefined ) {
                                loading.start();
                                var input = {
                                    BusinessId                  : $state.params.businessId
                                    , ProductId                 : $scope.cart.data.UserCartDetails[0].ProductId
                                    , CartId                    : $scope.cart.data.CartId
                                    , BusinessStoreId           : $scope.cart.data.BusinessStoreId
                                    , Paymentmethod             : 2 // ?
                                    , TransactionReferenceNo    : obj.gtpay_tranx_id
                                    , PayAmount                 : obj.gtpay_tranx_amt
                                    , PaystackAuthCode          : null
                                    , PaystackCardType          : null
                                    , PaystackCCLastFour        : null
                                    , PaystackChannel           : null
                                    , PaystackMessage           : null
                                    , userId                    : $rootScope.userDetails.userId
                                    , GTPaygwayname             : obj.gtpay_gway_name
                                    , GTPaytranshash            : obj.gtpay_tranx_hash
                                    , GTPayverificationhash     : obj.gtpay_verification_hash
                                    , GtPayfullverificationhash : obj.gtpay_full_verification_hash
                                };
                                // INSERT PAYMENT.
                                
                                if(obj.gtpay_tranx_status_code == "00") {
                                    $scope.cart
                                    .after_payment_checkout(input)
                                    .then(function(payment_res) {
                                        if( payment_res.data.StatusMessage == 'Failed' ) {
                                            popUp
                                            .msgPopUp('Payment Failed', 0);
                                        } else if(payment_res.data.Message == null) {
                                            popUp
                                            .msgPopUp('GtBank Payment was successfull. Your order id "'+payment_res.data.Data+'"', 1)
                                            .then(function() {
                                                $state.go("home.orderReciept", {order_id : payment_res.data.Data});
                                            });
                                        } else {
                                            popUp
                                            .msgPopUp('GtBank Payment failed. Error : '+payment_res.data.Message);
                                        }
                                        loading.stop();
                                        console.log(payment_res);
                                    });
                                } else {
                                    popUp
                                    .msgPopUp('GtBank Payment failed.');
                                    loading.stop();
                                }
                            } else {
                                popUp
                                .msgPopUp('GtBank Payment failed.');
                                loading.stop();
                            }
                        });
                    }
                });

                $rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event) {
                    console.log(e, event);
                    // loading.stop();
                    /*var query_string_response = event.url.replace($scope.gtbank.local_oauth_url, '');
                    if(event.type == 'loadstart' && query_string_response.length != event.url.length) {
                        
                    }*/
                });
                $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){
                    console.log(e, event);
                    loading.stop();
                });
                /*loginWindow.addEventListener('loadstart', loginWindow_loadStartHandler);
                loginWindow.addEventListener('exit', loginWindow_exitHandler);*/
            }
            // getShaCode(Post): Parameters – [HasCode]
            , getShaCode : function(hash_code) {
                return ajaxCall
                .get('webapi/UserCartAPI/getShaCode', {
                    HashCode : hash_code
                })
                .then(function(hash_code_res) {
                    $scope.gtbank.HashCode = hash_code_res.data.Data;  // This is correct
                    console.log($scope.gtbank);
                });
            }
            , parseQueryString : function(queryString) {
                /* TRUE : GETTING QUERY STRING. */
                // queryString = queryString.substring(35); // removing url from starting of the string.
                var qs      = decodeURIComponent(queryString),
                obj         = {},
                params      = qs.split('&');
                params.forEach(function (param) {
                    var splitter = param.split('=');
                    obj[splitter[0]] = splitter[1];
                });
                return obj;
            }
            , getQueryVariable : function(input_url, variable) {
                /*OLD*/
                /*GETTING QUERY STRING*/
                var parser = document.createElement('a');
                parser.href = input_url;

                var query = parser.search.substring(1);
                var vars = query.split('&');
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split('=');
                    if (decodeURIComponent(pair[0]) == variable) {
                        return decodeURIComponent(pair[1]);
                    }
                }
                console.log('Query variable %s not found', variable);
            }
        }


        /*
        THIS IS TO GET BUSINESS DATA.
         */
        businessVisit
        .businessDetail( $state.params.businessId, $rootScope.userDetails.userId )
        .then(function (res) {
            $scope.businessData = res.data.Data[0];
        });

        /*
        Listing cart products
         */
        shoppingCart.get_cart_data = function() {
            loading.start();
            return cart_functions
            .GetUserCartByBusinessId($state.params.businessId)
            .then(function (res) {
                loading.stop();
                if(res == 0) {
                    // Hide everything.
                    $scope.cart.hide_everything = true;
                    return 0;
                }
                $scope.cart.data = res;
                console.log($scope.cart.data);

                $scope.cart.data.PriceAfterDiscount = ( $scope.cart.data.PromoId ? $scope.cart.data.PriceAfterDiscount : $scope.cart.totalPrice().price_after_discount_full );
                
                $scope.promo_discount               = ( $scope.cart.data.PromoId ? +$scope.cart.totalPrice().price_after_discount_full - +$scope.cart.data.PriceAfterDiscount : 0 );
                
                $scope.price_without_promo          = $scope.cart.totalPrice().price_after_discount_full;
                
                // HASH RUN ONLY WHEN SUBTOTAL AMOUNT READY.
                var gtpay_tranx_amt                 = $scope.cart.totalPrice().price_after_discount; //*100, // amt in kodo
                $scope.gtbank.gtpay_tranx_amt       = $scope.cart.totalPrice().price_after_discount;
            }, function(error) {
                alert('An error occured, please restart the app.');
            });
        }
        shoppingCart.get_cart_data()
        .then(function() {
            // $scope.cart.check_out();
        });

        $scope.state_on = function () {
            return $state.params.id;
        };

        $scope.Test = function () {
            return refreshTest.showrefreshtest($state.current.name, $state.params);
        }

        $scope.isAndroid = ionic.Platform.isAndroid();

        active_controller.set('ShoppingCartController');

        /*ajaxCall
        .post('UserCart/OrderConfirmationMobile', {
            gtpay_tranx_id          : 'ed001373-f99b-4c69-b224-816aaf066410',
            gtpay_tranx_status_code : 'Z1',
            gtpay_tranx_curr        : 'NGN',
            gtpay_tranx_status_msg  : 'Transaction Error',
            gtpay_tranx_amt         : '0.00',
            gtpay_cust_id           : '236'
        })
        .then(function(res) {
            console.log(res);
        });*/

        /*$cordovaInAppBrowser.open(
            baseUrl+'/gtOauth.html',
            '_blank',
            {
                location   : 'yes',
                clearcache : 'yes',
                toolbar    : 'yes'
        })
        .then(function(event) {
            console.log(event);
        })
        .catch(function(event) {
            // error
        });*/


    });


