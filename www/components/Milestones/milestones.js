angular.module('LoyalBonus')
.controller('MileStoneController', function ($scope, $state, ajaxCall, active_controller,$rootScope,saveData, refreshTest, $cordovaBarcodeScanner) {

	$scope.open_detail_page = function (BusinessID) {
        $state.go("home.kaseydiner", { id: BusinessID });
    };

    var restaurantData = [];
    active_controller.set('MileStoneController');

    $scope.Test = function () {
        return refreshTest.showrefreshtest($state.current.name, $state.params);
    }
    console.log('yoyoyoyo');

	$scope.myloyalbonus = {};


    $scope.printTick_html = function(total_visits, bonus_discount_toCust, loyalDiscount) {
        // console.log('Start');
        var printTick         = [];
        var printNonTick      = [];
        var printGift         = [];
        var printGiftDiscount = [];
        printTick             = $scope.myloyalbonus.printTick(total_visits, bonus_discount_toCust).length;
        printNonTick          = $scope.myloyalbonus.printNonTick(total_visits, bonus_discount_toCust).length;
        printGift             = $scope.myloyalbonus.printGift(total_visits, bonus_discount_toCust).length;
        printGiftDiscount     = $scope.myloyalbonus.printGiftDiscount(total_visits, bonus_discount_toCust).length;
        var total_length      = +printTick + +printNonTick + +printGift + +printGiftDiscount;
        /*console.log('total_length');
        console.log(total_length);
        console.log( $scope.myloyalbonus.printTick(total_visits, bonus_discount_toCust) );
        console.log( $scope.myloyalbonus.printNonTick(total_visits, bonus_discount_toCust) );
        console.log( $scope.myloyalbonus.printGift(total_visits, bonus_discount_toCust) );
        console.log( $scope.myloyalbonus.printGiftDiscount(total_visits, bonus_discount_toCust) );
        console.log('End');*/

        var out = '';
        for(i=0; i<total_length; i++) {
            var gone = 0;
            if(i == 0 || i == 5) {
                out += '<ul>';
            }
            if(printTick > 0) {
                // out += '1';
                out +=      '<li class="checkbox">';
                out +=           '<img src="img/tick.png" >';
                out +=      '</li>';
                printTick--;
                gone = 1;
            }
            if( printTick == 0 && printNonTick > 0 && gone == 0 ) {
                // out += '2';
                out +=      '<li class="round">';
                out +=           '<span class="round-span">'+loyalDiscount+'%</span><p>off</p>';
                out +=      '</li>';
                printNonTick--;
                gone == 1;
            }
            if( printTick == 0 && printNonTick == 0 && printGift > 0 && gone == 0 ) {
                // out += '3';
                out +=      '<li class="checkbox">';
                out +=           '<img src="img/icon.png">';
                out +=      '</li>';
                printGift--;
                gone == 1;
            }
            if( printTick == 0 && printNonTick == 0 && printGift == 0 &&  printGiftDiscount > 0 && gone == 0 ) {
                // out += '4';
                out +=      '<li class="checkbox">';
                out +=           '<img src="img/discountwithtick.png">';
                out +=      '</li>';
                printGiftDiscount--;
                gone == 1;
            }
            if(i == 4 || i == 9 || i == total_length-1 ) {
                out += '</ul>';
            }
            // out += '('+i+')';
        }
        // console.log(total_visits, bonus_discount_toCust);
        // return 'ellloo';
        return {
            out          : out,
            total_length : total_length
        };
    }

	$scope.myloyalbonus.print = [];

    //.get('webapi/BusinessMaster/GetBusinessbyIDUserId?BusinessId=' + $scope.state_on() + '&UserId='+$rootScope.userDetails.userId, {})
	ajaxCall
	.get('webapi/BusinessMaster/GetAllBusinessLocationsVisitedByUser?UserId='+$rootScope.userDetails.userId, {})
	.then(function(res) {
		$scope.myloyalbonus.print = res.data.Data;
		//saveData.set('kaseyDinnerBusinessName', $scope.myloyalbonus.print.Name);
		return $scope.myloyalbonus.print;
	});

   function mydummyJson(input) {

        var output = [];
        //console.log(input);
        for (var i = 0; i < input; i++) {
            output.push(i)
            //console.log(output.push(i));
        }
        return output;
    }


    $scope.myloyalbonus.printTick    = function ( uservisits, BonusDiscountToCust ) {
        if( +uservisits == +BonusDiscountToCust ) {
            return mydummyJson(+uservisits - 1);
        }
        return mydummyJson(+uservisits);
    }
        
    $scope.myloyalbonus.printNonTick = function ( uservisits, BonusDiscountToCust ) {
        var answerNontick =  +BonusDiscountToCust - +uservisits ;
        if( answerNontick - 1 <= 0 ) {
            return mydummyJson(0);
        } else {
            return mydummyJson(answerNontick - 1);
        }
    }
        
    $scope.myloyalbonus.printGift    = function ( uservisits, BonusDiscountToCust ) {
        if (+BonusDiscountToCust == uservisits) {
            return mydummyJson(0);
        } else {
            return mydummyJson(1);
        }
    }

    $scope.myloyalbonus.printGiftDiscount    = function ( uservisits, BonusDiscountToCust ) {
        if( +uservisits == +BonusDiscountToCust ) {
            return mydummyJson(1);
        }
        return mydummyJson(0);
    }
         
        


});


