/*jshint undef:true, unused:true, browser:true, devel:true */
/*global require*/

var angular = require('angular');

var app = angular.module('afrApp', []);

app.controller('RegionCtrl', function($scope, $http) {
  $http.get('/regions').success(function (regions) {
    $scope.regions        = regions;
    $scope.selectedRegion = $scope.regions[0];
  });

  $scope.select = function (region) {
    $scope.selectedRegion = region;
  };

  $scope.getClass = function (region) {
    return region === $scope.selectedRegion ? 'is-selected' : '';
  };
});

app.controller('SuburbCtrl', function ($scope, $http) {
    $scope.$watch('selectedRegion', function (selectedRegion) {
        if (selectedRegion) {
            $http.get('/regions/' + selectedRegion.id + '/suburbs').success(function (suburbs) {
                $scope.suburbs        = suburbs;
                $scope.selectedSuburb = $scope.suburbs[0];
            });
        }
    });

    $scope.select = function (suburb) {
        $scope.selectedSuburb = suburb;
    };
});
