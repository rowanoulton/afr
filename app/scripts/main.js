/*jshint undef:true, unused:true, browser:true, devel:true */
/*global require*/

var angular = require('angular');

var app = angular.module('afrApp', []);

app.filter('capitalize', function () {
  return function (input) {
    if (input) {
      return input.charAt(0).toUpperCase() + input.slice(1);
    }
  };
});

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

    $scope.$watch('selectedSuburb', function () {
      // @todo
    });
});

app.controller('StatisticCtrl', function ($scope, $http) {
  var loadStatistics;

  $scope.statistics          = [];
  $scope.isLoadingStatistics = false;
  $scope.sortPredicate       = 'date'; // Sorting default: date
  $scope.sortReverse         = true;   // Sorting direction default: descending

  loadStatistics = function () {
    var canProceed = ($scope.selectedSuburb && $scope.selectedKey),
        requestParams;

    if (canProceed) {
        requestParams = {
          region: $scope.selectedRegion.id,
          suburb: $scope.selectedSuburb.id,
          key:    $scope.selectedKey
        };

        // Don't send statistic type if requesting volume, isn't supported and will return no results
        // @todo Fix on API end
        if ($scope.selectedKey !== 'volume') {
          requestParams.type = $scope.selectedType;
        }

        $scope.isLoadingStatistics = true;

        $http.get('/statistics', { params: requestParams }).success(function (statistics) {
          $scope.isLoadingStatistics = false;
          $scope.statistics = statistics;
        });
    }
  };

  $http.get('/statistics/keys').success(function (keys) {
    $scope.keys        = keys;
    $scope.selectedKey = $scope.keys[0];
  });

  $http.get('/statistics/types').success(function (types) {
    $scope.types        = types;
    $scope.selectedType = $scope.types[0];
  });

  $scope.selectKey = function (key) {
    $scope.selectedKey = key;
  };

  $scope.selectType = function (type) {
    $scope.selectedType = type;
  };

  $scope.getKeyClass = function (key) {
    return key === $scope.selectedKey ? 'btn--selected' : '';
  };

  $scope.getTypeClass = function (type) {
    var hasKeys          = ($scope.keys || $scope.selectedKey),
        isVolumeSelected = (hasKeys && $scope.selectedKey === 'volume'),
        isSelectedType    = (type === $scope.selectedType);

    return (isSelectedType && (!hasKeys || !isVolumeSelected)) ? 'btn--selected' : '';
  };

  $scope.getTypeGroupClass = function () {
    if ($scope.keys && $scope.selectedKey) {
      return $scope.selectedKey === 'volume' ? 'btn-group--disabled' : '';
    }

    return '';
  };

  $scope.getSortClass = function (sortType) {
    if ($scope.sortPredicate === sortType) {
      return $scope.sortReverse ? 'is-sorted--reversed' : 'is-sorted';
    }
  };

  $scope.$watch('selectedSuburb', loadStatistics);
  $scope.$watch('selectedType', loadStatistics);
  $scope.$watch('selectedKey', loadStatistics);
});
