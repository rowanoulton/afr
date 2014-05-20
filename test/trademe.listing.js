/**
 * Dependencies
 */
var chai    = require('chai'),
    Listing = require(__dirname + '/../lib/trademe/listing'),
    expect  = chai.expect;

describe('Trademe.Listing', function () {
    var validListingData,
        invalidListingData;

    validListingData = {
        ListingId: 123,
        SuburbId: 321,
        Bedrooms: 1,
        RentPerWeek: 100,
        RentPerMonth: 400,
        IgnoredProperty: true
    };

    invalidListingData = {
        ListingId: 123,
        SuburbId: 321,
        Bedrooms: 1
    };

    describe('#constructor', function () {
        var listing = new Listing(validListingData);

        it('should set a property for data', function () {
            expect(listing).to.have.property('data');
            expect(listing.data).to.be.an('object');
        });

        it('should have a property set for properties', function () {
            expect(listing).to.have.property('properties');
            expect(listing.properties).to.be.an('object');
        });

        it('should have a property set for validity', function () {
            expect(listing).to.have.property('valid');
            expect(listing.valid).to.be.a('boolean');
        });
    });

    describe('#get', function () {
        var listing = new Listing(validListingData);

        it('should retrieve values from the listings properties', function () {
            expect(listing.get('id')).to.equal(listing.properties.id);
            expect(listing.get('suburb')).to.equal(listing.properties.suburb);
            expect(listing.get('bedrooms')).to.equal(listing.properties.bedrooms);
            expect(listing.get('price')).to.equal(listing.properties.price);
            expect(listing.get('price_per_room')).to.equal(listing.properties.price_per_room);
        });

        it('should return undefined when values are not found', function () {
            expect(listing.get('non-existent')).to.be.undefined;
        });

        it('should not return properties assigned against the listing itself', function () {
            expect(listing.get('valid')).to.be.undefined;
        });

        it('should not return properties from listing.data', function () {
            expect(listing.get('ListingId')).to.be.undefined;
            expect(listing.get('SuburbId')).to.be.undefined;
            expect(listing.get('Bedrooms')).to.be.undefined;
            expect(listing.get('RentPerWeek')).to.be.undefined;
        });
    });

    describe('#isValid', function () {
        var validListing   = new Listing(validListingData),
            invalidListing = new Listing(invalidListingData);

        it('should return a boolean', function () {
            expect(validListing.isValid()).to.be.a('boolean');
            expect(invalidListing.isValid()).to.be.a('boolean');
        });

        it('should return true for a valid listing', function () {
            expect(validListing.isValid()).to.equal(true);
        });

        it('should return false for an invalid listing', function () {
            expect(invalidListing.isValid()).to.equal(false);
        });
    });

    describe('#_isValid', function () {
        var validListing   = new Listing(validListingData),
            invalidListing = new Listing(invalidListingData);

        it('should return a boolean', function () {
            expect(validListing._isValid()).to.be.a('boolean');
            expect(invalidListing._isValid()).to.be.a('boolean');
        });

        it('should return true for a valid listing', function () {
            expect(validListing._isValid()).to.equal(true);
        });

        it('should return false for an invalid listing', function () {
            expect(invalidListing._isValid()).to.equal(false);
        });
    });

    describe('#_getRelevantInformation', function () {
        var listing = new Listing(validListingData);

        it('should include listing id', function () {
            expect(listing.properties.id).to.exist;
            expect(listing.properties.id).to.equal(validListingData.ListingId);
        });

        it('should include suburb id', function () {
            expect(listing.properties.suburb).to.exist;
            expect(listing.properties.suburb).to.equal(validListingData.SuburbId);
        });

        it('should include the number of bedrooms', function () {
            expect(listing.properties.bedrooms).to.exist;
            expect(listing.properties.bedrooms).to.equal(validListingData.Bedrooms);
        });

        it('should include the price', function () {
            expect(listing.properties.price).to.exist;
            expect(listing.properties.price).to.equal(validListingData.RentPerWeek);
        });

        it('should calculate a price per room', function () {
            expect(listing.properties.price_per_room).to.exist;
            expect(listing.properties.price_per_room).to.be.a('number');
            expect(listing.properties.price_per_room).to.equal(validListingData.RentPerWeek / validListingData.Bedrooms)
        });

        it('should prune out unnecessary properties', function () {
            expect(listing.properties.RentPerMonth).to.be.undefined;
            expect(listing.properties.IgnoredProperty).to.be.undefined;
        });
    });
});
