angular.module('LoyalBonus')

.controller('SuccessController', function ($scope, $state) {
	$scope.tabName = $state.params.id;

	$state.params.id == 'kaseydiner'
		$scope.datadeal = [{
			name: 'Stack House',
			rating : {},
			rate : 3,
  			max : 5
		}];

		$scope.datadeal2 = [{
			name:'Kasey Diner',
			para :'Kasey’s diner is a small family owned restaurant in the middle of the city. Held here for generations,this restaurant is our pride and joy. We offer friendly environment,nice music and great food with great prices. Our home made steak is a world class dish,prepared with care and love by our chefs,and a vast selection of wines will get you appetite going. '
		}]
		$scope.datadeal3 = [{
			para2 :'Success! Thank you for visiting us! You will receive 10% OFF for this visit. '
		}]

	});


