'use strict';

describe('StatisticCtrl', function () {
    var $httpBackend,
        $rootScope,
        $controller,
        createController,
        types,
        keys;

    beforeEach(module('afrApp'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $rootScope   = $injector.get('$rootScope');
        $controller  = $injector.get('$controller');

        types = [
            'a',
            'b'
        ];

        keys = [
            'key1',
            'key2',
            'volume'
        ];

        $httpBackend
            .expectGET('/statistics/keys')
            .respond(keys);

        $httpBackend
            .expectGET('/statistics/types')
            .respond(types);

        createController = function () {
            return $controller('StatisticCtrl', { $scope: $rootScope });
        };
    }));

    it('should request keys from server', function() {
        var controller = createController();

        expect($rootScope.keys).toBeUndefined();
        $httpBackend.flush();
        expect($rootScope.keys).toBeDefined();
        expect($rootScope.keys.length).toBe(3);
        expect($rootScope.keys).toEqual(keys);
    });

    it('should request types from server', function() {
        var controller = createController();

        expect($rootScope.types).toBeUndefined();
        $httpBackend.flush();
        expect($rootScope.types).toBeDefined();
        expect($rootScope.types.length).toBe(2);
        expect($rootScope.types).toEqual(types);
    });

    it('should request all the necessary data on construction', function () {
        var controller = createController();
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should set a selected key once regions have been loaded from server', function () {
        var controller = createController();

        expect($rootScope.selectedKey).toBeUndefined();
        $httpBackend.flush();
        expect($rootScope.selectedKey).toBeDefined();
        expect($rootScope.selectedKey).toEqual(keys[0]);
    });

    it('should set a selected type once regions have been loaded from server', function () {
        var controller = createController();

        expect($rootScope.selectedType).toBeUndefined();
        $httpBackend.flush();
        expect($rootScope.selectedType).toBeDefined();
        expect($rootScope.selectedType).toEqual(types[0]);
    });

    it('should provide a selected class only for the selected key', function () {
        var controller = createController();
        $httpBackend.flush();

        $rootScope.selectedKey = keys[1];
        expect($rootScope.getKeyClass(keys[0])).toEqual('');
        expect($rootScope.getKeyClass(keys[1])).toEqual('btn--selected');
        expect($rootScope.getKeyClass(keys[2])).toEqual('');

        $rootScope.selectedKey = keys[0];
        expect($rootScope.getKeyClass(keys[0])).toEqual('btn--selected');
        expect($rootScope.getKeyClass(keys[1])).toEqual('');
        expect($rootScope.getKeyClass(keys[2])).toEqual('');

        $rootScope.selectedKey = keys[2];
        expect($rootScope.getKeyClass(keys[0])).toEqual('');
        expect($rootScope.getKeyClass(keys[1])).toEqual('');
        expect($rootScope.getKeyClass(keys[2])).toEqual('btn--selected');
    });

    it('should provide a selected class only for the selected type', function () {
        var controller = createController();
        $httpBackend.flush();

        $rootScope.selectedType = types[1];
        expect($rootScope.getTypeClass(types[0])).toEqual('');
        expect($rootScope.getTypeClass(types[1])).toEqual('btn--selected');

        $rootScope.selectedType = types[0];
        expect($rootScope.getTypeClass(types[0])).toEqual('btn--selected');
        expect($rootScope.getTypeClass(types[1])).toEqual('');
    });

    it('should disable the type group when volume key is selected', function () {
        var controller = createController();
        $httpBackend.flush();

        $rootScope.selectedKey = keys[2]; // Key: volume
        expect($rootScope.getTypeGroupClass()).toEqual('btn-group--disabled');

        $rootScope.selectedKey = keys[1];
        expect($rootScope.getTypeGroupClass()).toEqual('');
    });

    it('should not provide a selected class for any type when volume key is selected', function () {
        var controller = createController();
        $httpBackend.flush();

        $rootScope.selectedKey  = keys[2]; // Key: volume

        $rootScope.selectedType = types[0];
        expect($rootScope.getTypeClass(types[0])).toEqual('');
        expect($rootScope.getTypeClass(types[1])).toEqual('');
        $rootScope.selectedType = types[1];
        expect($rootScope.getTypeClass(types[0])).toEqual('');
        expect($rootScope.getTypeClass(types[1])).toEqual('');
    });
});
