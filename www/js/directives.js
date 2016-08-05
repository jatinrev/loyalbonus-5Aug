angular.module('LoyalBonus.directives',[])

/*.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(43.07493, -89.381388),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map($element[0], mapOptions);
  
        $scope.onCreate({map: map});

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });
      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
});*/
.directive('scrollHeight', function($window) {
  return {
    link: function(scope, element, attrs) {
      scope.onResize = function() {
        var winHeight = $window.innerHeight;
        var form = angular.element(document.querySelector('.bar-footer'))[0];
        var formHeight = form.scrollHeight;
        var scrollHeight = winHeight - formHeight;

        element.css("height", scrollHeight + "px");
      }
      scope.onResize();

      angular.element($window).bind('resize', function() {
        scope.onResize();
      })
    }
  }
});