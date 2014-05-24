![Auckland For Rent](http://i.imgur.com/lgtjyJ6.png)



AFR polls the [Trademe API](http://developer.trademe.co.nz/) for rental listings each day and processes the results into a digest of statistics. It also provides an easy-to-use API endpoint for access to the data.

## Goal

It is the goal of this project that eventually the collection of statistics not be tied to any specific API or data source, and that data might be provided by any means. Similarly, it would ideally not be limited to processing statistics on any single region or country.

At present, it is dependant on the Trademe API as its data source, and limited to New Zealand.

## Statistics

Currently the project processes statistics on a per-suburb and per-region basis. The statistics calculated are as follows:

- Price
	- Median
	- Mean
- Price per bedroom
	- Median
	- Mean
- Volume

Other statistics will be introduced in future, such as information about standard deviation, percentiles, minimums, maximums and range.

## Running

#### The collection script

In order to run the collection script you must copy and create your own configuration file. A template is provided here: [config/config.default.json](https://github.com/rowanoulton/afr/blob/master/config/config.default.json). 

Copy and rename yours to `config/config.json`, filling in the necessary fields. See the configuration section below for more information.

Once configured, you may run the collection script with: `node afrd`

It will run a collection job immediately, ensuring that all regions and suburbs are inserted into the database before beginning. Following that, it will continue to run once at the very beginning of each day.

#### The API

The API uses the same `config.json` file as the collection script, however only uses the MongoDB connection URI.

The API can be run with: `node api`

## Configuration

As the script is currently tied to the Trademe API, you must provide an auth token. Details about how you can obtain this can be found [here](http://developer.trademe.co.nz/api-overview/registering-an-application/).

AFR uses MongoDB, and as such you must also specify a connection URI for both the daemon script and the API to use.

The regions which are collected by the daemon script ([afrd.js](https://github.com/rowanoulton/afr/blob/master/afrd.js)) are configurable. In `config/config.json` you can specify an array of regions to collect statistics for:

```
"regions": [
    {
        "id": "your-region-id",
        "name": "your-region-name"
    }
]
```
The region ids must match the id given by the Trademe API. You can find a full list of regions [here](http://api.trademe.co.nz/v1/Localities.json). The region name does not have to match. As an example, if you wanted to collect statistics for both Auckland and Wellington, your configuration might look like this:

```
"regions": [
    {
        "id": 1,
        "name": "Auckland"
    },
    {
        "id": 15,
        "name": "Wellington"
    }
]
```

At least one region must be specified.

## Notes

To ensure that the script continues to run, it is recommended that the collection script be managed by [Forever](https://github.com/nodejitsu/forever) or similar.

A frontend for the API will be provided in a separate repository.