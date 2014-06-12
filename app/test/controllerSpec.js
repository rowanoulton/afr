'use strict';


describe('afrApp.controllers', function () {
    var $scope = null;

    beforeEach(module('afrApp'));

    beforeEach(inject(function ($rootScope) {
        $scope = $rootScope.$new();
    }));

    it('should have a controller for regions', inject(function($controller) {
        var regionCtrl = $controller('RegionCtrl', { $scope: $scope });

        expect(regionCtrl).toBeDefined();
    }));

    it('should have a controller for suburbs', inject(function($controller) {
        var suburbCtrl = $controller('SuburbCtrl', { $scope: $scope });

        expect(suburbCtrl).toBeDefined();
    }));
});
