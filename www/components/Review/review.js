angular.module('LoyalBonus')

	.factory('reviewFactory', function (ajaxCall) {
		function printReview(businessId, pageNumber) {
			return ajaxCall
				.get('webapi/BusinessMaster/GetReviewsDetailByBusinessIdwithUsername?BusinessId=' + businessId + '&pageIndex=' + pageNumber + '&pageSize=3', {})
				.then(function (res) {
					//console.log(res);
					return res.data.Data;
				});
		}

		function giveFeedback(rating, pros, cons, businessId, userId) {
			return ajaxCall
				.post('webapi/BusinessMaster/BusinessGiveStar',
				{
					BusinessId: businessId,
					UserId: userId,
					Pros: pros,
					Cons: cons
				})
				.then(function (prosConsResult) {
					//console.log('prosConsResult');
					//console.log(prosConsResult);
					//http://beta2.loyalbonus.com/webapi/BusinessMaster/BusinessGiveStar
					return ajaxCall
						.post('webapi/BusinessMaster/BusinessGiveStar',
						{
							UserId: userId,
							BusinessId: businessId,
							Reviews: rating
						}
						)
						.then(function (ratingResult) {
							//console.log(prosConsResult);
							//console.log(ratingResult);
							return prosConsResult;
						});



				});
		}

		return {
			printReview: printReview,
			giveFeedback: giveFeedback
		};
	})

	.controller('ReviewController', function ($scope, $state, showRating, $ionicPopup, $timeout,reviewFactory, showRating, $rootScope, backFunctionality, refreshTest) {
		var allReviews = [];
		var reviewPage = 0;
		$scope.reviewVar = {
			businessImg: function () {
				return $state.params.businessImg;
			},
			businessRating: function () {
				return +$state.params.businessRating;
			}
		};
		console.log($state.params);

		$scope.Test = function () {
            return refreshTest.showrefreshtest($state.current.name, $state.params);
        }

		$scope.reviewVar.reviews = function (number) {
			//console.log(showRating.showRatingImages(number));
			return showRating.showRatingImages(number);
		};

		$scope.reviewVar.writeReveiwShow = false;
		$scope.reviewVar.ShowCommentShow = false;
		$scope.reviewVar.enableReveiw = function () {
			$scope.reviewVar.writeReveiwShow = $scope.reviewVar.writeReveiwShow == false ? true : false;
			$scope.reviewVar.ShowCommentShow = $scope.reviewVar.ShowCommentShow == false ? true : false;
		};




		$scope.stopLoading = true;
		$scope.reviewVar.loadMore = function () {
			if ($scope.stopLoading) {
				reviewFactory
					.printReview($state.params.businessId, reviewPage)
					.then(function (res) {
						//console.log(res);
						if (res.length > 0) {
							reviewPage += 1;
							for (i in res) {
								allReviews.push(res[i]);
							}
						} else {
							$scope.stopLoading = false;
						}
					});
			}
		}
		$scope.reviewVar.loadMore();

		$scope.reviewVar.allReview = function () {
			return allReviews;
		}

		/***Rating starts here***/

		$scope.reviewVar.ratingStarNumber = 0;

		$scope.reviewVar.giveRating = function (number) {
			$scope.reviewVar.ratingStarNumber = number;
			console.log(number);
			$scope.reviewVar.starsArr = [];
			for (var i = 1; i < 6; i++) {
				if (i > 0 && i <= number) {
					$scope.reviewVar.starsArr.push({
						class: 'filledStart',
						src: 'img/filledStar.png'
					});
				} else {
					$scope.reviewVar.starsArr.push({
						class: 'emptyStart',
						src: 'img/emptyStart.png'
					});
				}
			}
		}

		$scope.reviewVar.giveRating(0);
		 //console.log(giveRating.ratingImages(0));

		$scope.reviewVar.ratingMsg = false;

		
		
		$scope.showPopup = function (msg) {
            $scope.data = {}

            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
				/* template:'<i class="icon-gift"></i>',*/
                title: 'Success',
                template:'SuccessFully Data Entered',
                subTitle: msg,
                scope: $scope,
                buttons: [
                    { text: 'Cancel', type: 'button-positive' }

                ]
            });
            myPopup.then(function (res) {
                console.log('Tapped!', res);
            });
            $timeout(function () {
            	
                myPopup.close(); //close the popup after 3 seconds for some reason
                backFunctionality.one_step_back();
            }, 3000);
            //backFunctionality.one_step_back();
        };
        $scope.reviewVar.giveFeedback = function () {
			reviewFactory
				.giveFeedback($scope.reviewVar.ratingStarNumber
				, $scope.reviewVar.pros
				, $scope.reviewVar.cons
				, $state.params.businessId
				, $rootScope.userDetails.userId
				)
				.then(function (res) {
					console.log(res);
					$scope.reviewVar.ratingMsg = true;
					$scope.stopLoading = true;
					$scope.reviewVar.loadMore();
				});


		}

		$scope.reviewVar.giveDataFormat = function (date) {
			if (typeof (data) == 'undefined') {
				return '';
			}
			var monthNames = new Array("January", "February", "March",
				"April", "May", "June", "July", "August", "September",
				"October", "November", "December");

			var data = new Date(date);
			return monthNames[data.getMonth()] + ' ' + data.getDate() + ', ' + data.getFullYear() + ' ' + data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds();
		};

	});


