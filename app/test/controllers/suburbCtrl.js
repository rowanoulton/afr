'use strict';

describe('SuburbCtrl', function () {
    var $httpBackend,
        $rootScope,
        $controller,
        createController,
        selectedRegion,
        suburbs;

    beforeEach(module('afrApp'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope   = $injector.get('$rootScope');
        $controller  = $injector.get('$controller');

        selectedRegion = {
            id: 1,
            name: 'TestRegion'
        };

        suburbs = [
            {
                id: 1,
                name: 'TestSuburb'
            },
            {
                id: 2,
                name: 'TestSuburb2'
            }
        ];

        $httpBackend
            .expectGET('/regions/1/suburbs')
            .respond(suburbs);

        createController = function () {
            return $controller('SuburbCtrl', { $scope: $rootScope });
        };
    }));

    it('should have no suburbs defined until a region is selected', function () {
        var controller = createController();

        expect($rootScope.suburbs).toBeUndefined();
        expect($rootScope.selectedSuburb).toBeUndefined();
    });

    it('should listen for changes to selectedRegion and only request suburbs from server when a region is selected', function() {
        var controller = createController();

        $rootScope.$apply(function () {
            $rootScope.selectedRegion = selectedRegion;
        });

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        expect($rootScope.suburbs).toBeDefined();
        expect($rootScope.suburbs).toEqual(suburbs);
    });

    it('should select the first returned suburb', function() {
        var controller = createController();

        $rootScope.$apply(function () {
            $rootScope.selectedRegion = selectedRegion;
        });

        $httpBackend.flush();

        expect($rootScope.selectedSuburb).toEqual(suburbs[0]);
    });

    it('should not request suburbs when a falsey region is selected', function() {
        var controller = createController();

        $rootScope.$apply(function () {
            $rootScope.selectedRegion = false;
        });

        $httpBackend.verifyNoOutstandingRequest();

        $rootScope.$apply(function () {
            $rootScope.selectedRegion = null;
        });

        $httpBackend.verifyNoOutstandingRequest();
    });
});
