'use strict';

describe('RegionCtrl', function () {
    var $httpBackend,
        $rootScope,
        $controller,
        createController,
        regions;

    beforeEach(module('afrApp'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope   = $injector.get('$rootScope');
        $controller  = $injector.get('$controller');

        regions = [
            {
                name: 'Test'
            },
            {
                name: 'Test 2'
            }
        ];

        $httpBackend
            .expectGET('/regions')
            .respond(regions);

        createController = function () {
            return $controller('RegionCtrl', { $scope: $rootScope });
        };
    }));

    it('should request regions from server', function() {
        var controller = createController();

        expect($rootScope.regions).toBeUndefined();
        $httpBackend.flush();
        expect($rootScope.regions).toBeDefined();
        expect($rootScope.regions.length).toBe(2);
        expect($rootScope.regions).toEqual(regions);
    });

    it('should set a selected region once regions have been loaded from server', function () {
        var controller = createController();

        expect($rootScope.selectedRegion).toBeUndefined();
        $httpBackend.flush();
        expect($rootScope.selectedRegion).toBeDefined();
        expect($rootScope.selectedRegion).toEqual(regions[0]);
    });

    it('should update the selected region when one is selected', function () {
        var controller = createController();
        $httpBackend.flush();

        $rootScope.select(regions[1]);
        expect($rootScope.selectedRegion).toEqual(regions[1]);
        $rootScope.select(regions[0]);
        expect($rootScope.selectedRegion).toEqual(regions[0]);
    });

    it('should provide a selected class only for the selected region', function () {
        var controller = createController();
        $httpBackend.flush();

        $rootScope.select(regions[1]);
        expect($rootScope.getClass(regions[0])).toEqual('');
        expect($rootScope.getClass(regions[1])).toEqual('is-selected');

        $rootScope.select(regions[0]);
        expect($rootScope.getClass(regions[1])).toEqual('');
        expect($rootScope.getClass(regions[0])).toEqual('is-selected');
    });
});
