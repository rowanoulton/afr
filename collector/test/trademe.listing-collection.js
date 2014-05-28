/**
 * Dependencies
 */
var chai       = require('chai'),
    _          = require('underscore'),
    Collection = require(__dirname + '/../lib/trademe/listing-collection'),
    Listing    = require(__dirname + '/../lib/trademe/listing'),
    expect     = chai.expect;

describe('Trademe.Collection', function () {
    var listingDataA,
        duplicatelistingDataA,
        listingDataB,
        listingDataC,
        invalidListingDataA;

    listingDataA = {
            ListingId: 1,
            SuburbId: 1,
            Bedrooms: 1,
            RentPerWeek: 100
    };

    duplicateListingDataA = {
            ListingId: 1,
            SuburbId: 20,
            Bedrooms: 5,
            RentPerWeek: 1200
    };

    listingDataB = {
            ListingId: 2,
            SuburbId: 1,
            Bedrooms: 1,
            RentPerWeek: 100
    };

    listingDataC = {
            ListingId: 3,
            SuburbId: 20,
            Bedrooms: 1,
            RentPerWeek: 100
    };

    invalidListingDataA = {
        ListingId: 4,
        SuburbId: 1
    };

    describe('#constructor', function () {
        var collection = new Collection();

        it('should set a length property', function () {
            expect(collection).to.have.property('length');
            expect(collection.length).to.be.a('number');
        });

        it('should set an empty listings property', function () {
            expect(collection).to.have.property('listings').with.length(0);
            expect(collection.listings).to.be.an('array');
        });
    });

    describe('#clear', function () {
        var collection = new Collection();

        it('should clear existing listings', function () {
            collection.add([listingDataA, listingDataB, listingDataC]);
            expect(collection.listings).to.have.length(3);
            collection.clear();
            expect(collection.listings).to.have.length(0);
        });

        it('should clear existing listing IDs', function () {
            collection.add([listingDataA, listingDataB, listingDataC]);
            expect(collection.listingIds).to.have.length(3);
            collection.clear();
            expect(collection.listingIds).to.have.length(0);
        });

        it('should reset length to zero', function () {
            collection.add([listingDataA, listingDataB, listingDataC]);
            expect(collection.length).to.equal(3);
            collection.clear();
            expect(collection.length).to.equal(0);
        });
    });

    describe('#contains', function () {
        var collection = new Collection(),
            listingA,
            dupeListingA,
            listingB,
            listingC;

        collection.add(listingDataA);
        collection.add(listingDataB);

        listingA = new Listing(listingDataA);
        dupeListingA = new Listing(duplicateListingDataA);
        listingB = new Listing(listingDataB);
        listingC = new Listing(listingDataC);

        it('should return a boolean', function () {
            expect(collection.contains(listingA)).to.be.a('boolean');
            expect(collection.contains(dupeListingA)).to.be.a('boolean');
            expect(collection.contains(listingB)).to.be.a('boolean');
            expect(collection.contains(listingC)).to.be.a('boolean');
        });

        it('should return true when collection already contains a given listing', function () {
            expect(collection.contains(listingA)).to.equal(true);
            expect(collection.contains(listingB)).to.equal(true);
        });

        it('should return false when collection does not contain a given listing', function () {
            expect(collection.contains(listingC)).to.equal(false);
        });

        it('should base its comparison soley on the listing ID', function () {
            expect(collection.contains(dupeListingA)).to.equal(true);
        });
    });

    describe('#getAll', function () {
        var collection = new Collection();

        collection.add([listingDataA, listingDataB]);

        it('should return collection.listings property', function () {
            expect(collection.getAll()).to.equal(collection.listings);
            expect(collection.getAll()).to.have.length(2);
        });

        it('should return an array', function () {
            expect(collection.getAll()).to.be.an('array');
        });
    });

    describe('#getSortedBySuburb', function () {
        var collection = new Collection(),
            suburbs;

        collection.add([listingDataA, listingDataB, listingDataC]);
        suburbs = collection.getSortedBySuburb();

        it('should return an array', function () {
            expect(suburbs).to.be.an('array');
        });

        it('should return an array of suburbs', function () {
            var count = 0;

            // Count suburbs - we have to use a loop as .length is spoiled by array keys
            _.each(suburbs, function (suburb) {
                count++;
            });

            expect(count).to.equal(2);
        });

        it('should use suburb IDs as array keys', function () {
            expect(suburbs[1]).to.exist;
            expect(suburbs[20]).to.exist;
            expect(suburbs[2]).to.not.exist;
            expect(suburbs[0]).to.not.exist;
        });

        it('should sort listings into correct suburbs', function () {
            expect(suburbs[1]).to.have.length(2);
            expect(suburbs[20]).to.have.length(1);
            _.each(suburbs, function (suburb, suburbId) {
                _.each(suburb, function (listing) {
                    expect(listing.get('suburb')).to.equal(suburbId);
                });
            });
        });
    });

    describe('#add', function () {
        it('should add a new listing to the collection', function () {
            var collection = new Collection();
            expect(collection.length).to.equal(0);
            expect(collection.listings.length).to.equal(0);
            collection.add(listingDataA);
            expect(collection.length).to.equal(1);
            expect(collection.listings.length).to.equal(1);
        });

        it('should only accept arrays or objects', function () {
            var collection       = new Collection(),
                nestedCollection = new Collection();

            // Test number
            collection.add(100);
            expect(collection.length).to.equal(0);
            expect(collection.listings.length).to.equal(0);

            // Test string
            collection.add('a string');
            expect(collection.length).to.equal(0);
            expect(collection.listings.length).to.equal(0);

            // Test null
            collection.add(void 0);
            expect(collection.length).to.equal(0);
            expect(collection.listings.length).to.equal(0);

            // Test undefined
            var undefinedObj = {};
            collection.add(undefinedObj.doesntExist);
            expect(collection.length).to.equal(0);
            expect(collection.listings.length).to.equal(0);

            // Test array
            collection.add([listingDataA, listingDataB]);
            expect(collection.length).to.equal(2);
            expect(collection.listings.length).to.equal(2);

            // Test object
            collection.add(listingDataC);
            expect(collection.length).to.equal(3);
            expect(collection.listings.length).to.equal(3);

            // Test array with nested numbers, strings, null, undefined, etc
            nestedCollection.add([
                100,
                'a string',
                void 0,
                undefinedObj.doesntExist
            ]);
            expect(collection.length).to.equal(3);
            expect(collection.listings.length).to.equal(3);
        });

        it('should only add valid listings', function () {
            var collection = new Collection();

            // Confirm an invalid listing isn't added
            collection.add(invalidListingDataA);
            expect(collection.length).to.equal(0);

            // Confirm a valid listing is added
            collection.add(listingDataA);
            expect(collection.length).to.equal(1);
        });

        it('should not add the same listing more than once', function () {
            var collection = new Collection();

            collection.add(listingDataA);
            collection.add(listingDataA);
            expect(collection.length).to.equal(1);
            expect(collection.listings.length).to.equal(1);
        });
    });

    describe('#_canAdd', function () {
        var collection     = new Collection(),
            listingA       = new Listing(listingDataA),
            listingB       = new Listing(listingDataB),
            invalidListing = new Listing(invalidListingDataA),
            dupeListingA   = new Listing(duplicateListingDataA);

        it('should return a boolean', function () {
            expect(collection._canAdd(listingA)).to.be.a('boolean');
        });

        it('should only accept valid listings', function () {
            expect(collection._canAdd(invalidListing)).to.equal(false);
        });

        it('should only accept unique listings', function () {
            collection.add(listingDataA);
            expect(collection._canAdd(listingA)).to.equal(false);
            expect(collection._canAdd(listingB)).to.equal(true);
        });

        it('should determine listing uniqueness based on listing id', function () {
            expect(collection._canAdd(dupeListingA)).to.equal(false);
        });
    });

    describe('#_add', function () {
        it('should add an entry to the internal listings array', function () {
            var collection = new Collection();

            collection._add(new Listing(listingDataA));
            expect(collection.listings.length).to.equal(1);
            collection._add(new Listing(listingDataB));
            expect(collection.listings.length).to.equal(2);
        });

        it('should increment the length property of the collection', function () {
            var collection = new Collection();

            collection._add(new Listing(listingDataA));
            expect(collection.length).to.equal(1);
            collection._add(new Listing(listingDataB));
            expect(collection.length).to.equal(2);
        });

        it('should add listing ids to the internal listing id array', function () {
            var collection = new Collection();

            collection._add(new Listing(listingDataA));
            expect(collection.listingIds.length).to.equal(1);
            expect(collection.listingIds).to.contain(listingDataA.ListingId);

            collection._add(new Listing(listingDataB));
            expect(collection.listingIds.length).to.equal(2);
            expect(collection.listingIds).to.contain(listingDataB.ListingId);
        });
    });
});
