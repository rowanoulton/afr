/*jshint undef:true, unused:true*/
/*global require*/

var angular = require('angular');

var app = angular.module('afrApp', []);

app.controller('RegionCtrl', function($scope, $http) {
  $http.get('/regions').success(function (data) {
    $scope.regions  = data;
    $scope.selectedRegion = $scope.regions[0];
  });

  $scope.select = function (region) {
    $scope.selectedRegion = region;
  };

  $scope.getClass = function (region) {
    return region === $scope.selectedRegion ? 'is-selected' : '';
  };
});
