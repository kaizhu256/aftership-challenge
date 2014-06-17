/*
var should = require('should'),
	_ = require('underscore'),
	Courier = require('../lib/index');

describe('Test: .is', function() {

	// Courier: http://www.usps.com
	// Hints: You can apply the API from their web site
	// Time need: less than an hour if you have the api key

	describe('Track @ usps(\'9405903699300184125060\')', function() {

		var usps = {
			checkpoints: [
				{
					country_name: '',
					message: 'Delivered',
					checkpoint_time: '2014-05-16T12:00:00'
				}
			]
		};
		it('Expect return true', function() {
			var result = Courier.usps('9405903699300184125060');
			result.should.eql(usps);
		});
	});

	// Courier: http://www.hongkongpost.com/
	// Hints: There is no official API from hongkongpost, but you may use web or other method to get the result easily.
	// Time need: less than an hour if you find the correct way

	describe('Track @ hkpost(\'CP889331175HK\')', function() {

		var hkpost = {
			checkpoints: [
				{
					country_name: 'HK',
					message: 'Item posted.',
					checkpoint_time: '2013-12-11T00:00:00'
				},
				{
					country_name: 'HK',
					message: 'In transit.',
					checkpoint_time: '2013-12-12T00:00:00'
				},
				{
					country_name: 'HK',
					message: 'Processed for departure.',
					checkpoint_time: '2013-12-13T00:00:00'
				},
				{
					country_name: 'HK',
					message: 'The item left Hong Kong for its destination on  19-Dec-2013 ',
					checkpoint_time: '2013-12-17T00:00:00'
				},
				{
					country_name: 'NZ',
					message: 'Arrived.',
					checkpoint_time: '2014-01-14T00:00:00'
				},
				{
					country_name: 'NZ',
					message: 'In transit.',
					checkpoint_time: '2014-01-15T00:00:00'
				},
				{
					country_name: 'NZ',
					message: 'Delivered.',
					checkpoint_time: '2014-01-16T00:00:00'
				}
			]
		};

		it('Expect return true', function() {
			var result = Courier.hkpost('CP889331175HK');
			result.should.eql(hkpost);
		});
	});

	describe('Track @ dpduk(\'15502370264989N\')', function() {
		// Courier: http://www.dpd.co.uk
		// Hints: Not that easy, if you can't find the magic in the cookies
		// Time need: We spent two days to dig out the magic. Once you know it, can be done within 2 hours.

		var dpduk = {'checkpoints': [
			{
				country_name: 'Hub 3 - Birmingham',
				message: 'We have your parcel, and it\'s on its way to your nearest depot',
				checkpoint_time: '2014-01-08T22:33:50'
			},
			{
				country_name: 'Hub 3 - Birmingham',
				message: 'We have your parcel, and it\'s on its way to your nearest depot',
				checkpoint_time: '2014-01-08T22:34:58'
			},
			{
				country_name: 'Hub 3 - Birmingham',
				message: 'Your parcel has left the United Kingdom and is on its way to Saudi Arabia',
				checkpoint_time: '2014-01-09T03:56:57'
			},
			{
				country_name: 'United Kingdom',
				message: 'The parcel is in transit on its way to its final destination.',
				checkpoint_time: '2014-01-09T22:34:00'
			},
			{
				country_name: 'Bahrain',
				message: 'Your parcel has arrived at the local delivery depot',
				checkpoint_time: '2014-01-10T09:39:00'
			},
			{
				country_name: 'Bahrain',
				message: 'The parcel is in transit on its way to its final destination.',
				checkpoint_time: '2014-01-10T13:45:00'
			},
			{
				country_name: 'Bahrain',
				message: 'The parcel is in transit on its way to its final destination.',
				checkpoint_time: '2014-01-12T13:17:00'
			},
			{
				country_name: 'Saudi Arabia',
				message: 'Your parcel has arrived at the local delivery depot',
				checkpoint_time: '2014-01-14T06:30:00'
			},
			{
				country_name: 'Saudi Arabia',
				message: 'Your parcel is at the local depot awaiting collection',
				checkpoint_time: '2014-01-14T21:18:00'
			},
			{
				country_name: 'Saudi Arabia',
				message: 'Your parcel is on the vehicle for delivery',
				checkpoint_time: '2014-01-15T08:34:00'
			},
			{
				country_name: 'Saudi Arabia',
				message: 'The parcel has been delivered, signed for by BILAL',
				checkpoint_time: '2014-01-15T19:23:00'
			}
		]
		};

		it('Expect return true', function() {
			var result = Courier.dpduk('15502370264989N');
			result.should.eql(dpduk);
		});
	});
});
*/



/*
 * this test module as been heavily edited to accomodate for asynchronous testing
 */

var _ = require('underscore'),
  Courier = require('../lib/index');

/* init local object */
var local;
(function () {
  local = {
    jsonStringifyOrdered: function (value, replacer, space) {
      /*
        this function JSON.stringify's the value with dictionaries in sorted order,
        allowing reliable / reproducible string comparisons and tests
      */
      return JSON.stringify(value && (typeof value === 'object' || Array.isArray(value)) ?
        JSON.parse(
          local._jsonStringifyOrderedRecurse(value)
        )
        : value, replacer, space);
    },

    _jsonStringifyOrderedRecurse: function (value) {
      /*
        this function recurses the value looking for dictionaries to order
      */
      value = Array.isArray(value) ?
        '[' + value.map(local._jsonStringifyOrderedRecurse).join(',') + ']'
        : typeof value !== 'object' || !value ?
        JSON.stringify(value)
        /* sort list of keys */
        : '{' + Object.keys(value).filter(function (key) {
          return JSON.stringify(value[key]) !== undefined;
        }).sort().map(function (key) {
          return JSON.stringify(key) + ':' + local._jsonStringifyOrderedRecurse(value[key]);
        }).join(',') + '}';
      return value === undefined ? 'null' : value;
    }
  };
}());

describe('Test: .is', function() {

  // Courier: http://www.usps.com
  // Hints: You can apply the API from their web site
  // Time need: less than an hour if you have the api key

  /* set timeout for tests in ms */
  this.timeout(30000)

  describe('Track @ usps(\'9102999999302024326992\')', function() {

    var usps = local.jsonStringifyOrdered({ checkpoints: [
      { checkpoint_time: '2014-01-15T12:57:00',
        country_name: '',
        message: 'Delivered' },
      { checkpoint_time: '2014-01-15T08:07:00',
        country_name: '',
        message: 'Out for Delivery, January 15, 2014, 8:07 am, EDMOND, OK 73034' },
      { checkpoint_time: '2014-01-15T07:57:00',
        country_name: '',
        message: 'Sorting Complete, January 15, 2014, 7:57 am, EDMOND, OK 73034' },
      { checkpoint_time: '2014-01-15T02:42:00',
        country_name: '',
        message: 'Arrival at Post Office, January 15, 2014, 2:42 am, EDMOND, OK 73034' },
      { checkpoint_time: '2014-01-13T00:00:00',
        country_name: '',
        message: 'Electronic Shipping Info Received, January 13, 2014' },
      { checkpoint_time: '2014-01-10T03:48:00',
        country_name: '',
        message: 'Departed Shipping Partner Facility, January 10, 2014, 3:48 am, SECAUCUS, NJ 07094' },
      { checkpoint_time: '2014-01-08T13:50:00',
        country_name: '',
        message: 'Arrived Shipping Partner Facility, January 8, 2014, 1:50 pm, SECAUCUS, NJ 07094' }
      ]
    });

    it('Expect result === usps', function(done) {
      Courier.usps('9102999999302024326992', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== usps) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  describe('Track @ usps(\'9405903699300184125060\')', function() {

    var usps = local.jsonStringifyOrdered({
      checkpoints: [
        {
          country_name: '',
          message: 'Delivered',
          checkpoint_time: '2014-05-16T12:00:00'
        },
        { country_name: '',
          message: 'Out for Delivery, May 16, 2014, 9:26 am, FREDERIKSTED, VI 00840',
          checkpoint_time: '2014-05-16T09:26:00' },
        { country_name: '',
          message: 'Sorting Complete, May 16, 2014, 9:16 am, FREDERIKSTED, VI 00840',
          checkpoint_time: '2014-05-16T09:16:00' },
        { country_name: '',
          message: 'Arrival at Post Office, May 15, 2014, 3:22 pm, FREDERIKSTED, VI 00840',
          checkpoint_time: '2014-05-15T15:22:00' },
        { country_name: '',
          message: 'Electronic Shipping Info Received, May 13, 2014',
          checkpoint_time: '2014-05-13T00:00:00' }
      ]
    });

    it('Expect result === usps', function(done) {
      Courier.usps('9405903699300184125060', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== usps) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  describe('Track @ usps(\'9400109699939938223564\')', function() {

    var usps = local.jsonStringifyOrdered({ checkpoints: [
    { checkpoint_time: '2014-05-29T14:52:00',
      country_name: '',
      message: 'Delivered' },
    { checkpoint_time: '2014-05-29T10:11:00',
      country_name: '',
      message: 'Out for Delivery, May 29, 2014, 10:11 am, SPRINGFIELD GARDENS, NY 11413' },
    { checkpoint_time: '2014-05-29T10:01:00',
      country_name: '',
      message: 'Sorting Complete, May 29, 2014, 10:01 am, SPRINGFIELD GARDENS, NY 11413' },
    { checkpoint_time: '2014-05-29T09:52:00',
      country_name: '',
      message: 'Arrival at Post Office, May 29, 2014, 9:52 am, SPRINGFIELD GARDENS, NY 11413' },
    { checkpoint_time: '2014-05-29T03:35:00',
      country_name: '',
      message: 'Depart USPS Sort Facility, May 29, 2014, 3:35 am, BETHPAGE, NY 11714' },
    { checkpoint_time: '2014-05-28T13:33:00',
      country_name: '',
      message: 'Processed through USPS Sort Facility, May 28, 2014, 1:33 pm, BETHPAGE, NY 11714' },
    { checkpoint_time: '2014-05-27T22:21:00',
      country_name: '',
      message: 'Depart USPS Sort Facility, May 27, 2014, 10:21 pm, LINTHICUM HEIGHTS, MD 21090' },
    { checkpoint_time: '2014-05-27T22:17:00',
      country_name: '',
      message: 'Processed at USPS Origin Sort Facility, May 27, 2014, 10:17 pm, LINTHICUM HEIGHTS, MD 21090' },
    { checkpoint_time: '2014-05-27T21:02:00',
      country_name: '',
      message: 'Accepted at USPS Origin Sort Facility, May 27, 2014, 9:02 pm, HANOVER, MD 21076' },
    { checkpoint_time: '2014-05-26T00:00:00',
      country_name: '',
      message: 'Electronic Shipping Info Received, May 26, 2014' }
    ] });

    it('Expect result === usps', function(done) {
      Courier.usps('9400109699939938223564', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== usps) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  describe('Track @ usps(\'9374889949033131111143\')', function() {

    var usps = local.jsonStringifyOrdered({ checkpoints: [
    { checkpoint_time: '2014-05-27T14:44:00',
      country_name: '',
      message: 'Delivered' },
    { checkpoint_time: '2014-05-27T09:58:00',
      country_name: '',
      message: 'Out for Delivery, May 27, 2014, 9:58 am, SPRINGFIELD GARDENS, NY 11413' },
    { checkpoint_time: '2014-05-27T09:48:00',
      country_name: '',
      message: 'Sorting Complete, May 27, 2014, 9:48 am, SPRINGFIELD GARDENS, NY 11413' },
    { checkpoint_time: '2014-05-27T07:24:00',
      country_name: '',
      message: 'Arrival at Post Office, May 27, 2014, 7:24 am, SPRINGFIELD GARDENS, NY 11413' },
    { checkpoint_time: '2014-05-27T05:26:00',
      country_name: '',
      message: 'Acceptance, May 27, 2014, 5:26 am, SPRINGFIELD GARDENS, NY 11413' },
    { checkpoint_time: '2014-05-27T00:00:00',
      country_name: '',
      message: 'Electronic Shipping Info Received, May 27, 2014' }
    ] });

    it('Expect result === usps', function(done) {
      Courier.usps('9374889949033131111143', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== usps) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  describe('Track @ hkpost(\'RC933607107HK\')', function() {

    var hkpost = local.jsonStringifyOrdered({ checkpoints: [
    { checkpoint_time: '2014-05-27T00:00:00',
       country_name: 'Italy',
       message: 'In transit.' }
    ] });

    it('Expect result === hkpost', function(done) {
      Courier.hkpost('RC933607107HK', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== hkpost) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  describe('Track @ hkpost(\'RT224265042HK\')', function() {

    var hkpost = local.jsonStringifyOrdered({ checkpoints: [
    { checkpoint_time: '2014-05-28T00:00:00',
       country_name: 'Thailand',
       message: 'Delivered.' }
    ] });

    it('Expect result === hkpost', function(done) {
      Courier.hkpost('RT224265042HK', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== hkpost) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  describe('Track @ hkpost(\'LK059460815HK\')', function() {

    var hkpost = local.jsonStringifyOrdered({ checkpoints: [
    { checkpoint_time: '2014-05-27T00:00:00',
       country_name: 'United States of America',
       message: 'Delivered.' }
    ] });

    it('Expect result === hkpost', function(done) {
      Courier.hkpost('LK059460815HK', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== hkpost) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  // Courier: http://www.dpd.co.uk
  // Hints: Not that easy, if you can't find the magic in the cookies
  // Time need: We spent two days to dig out the magic. Once you know it, can be done within 2 hours.

  describe('Track @ dpduk(\'15502370264989N\')', function() {

    var dpduk = local.jsonStringifyOrdered({'checkpoints': [
      {
        country_name: 'Hub 3 - Birmingham',
        message: 'We have your parcel, and it\'s on its way to your nearest depot',
        checkpoint_time: '2014-01-08T22:33:50'
      },
      {
        country_name: 'Hub 3 - Birmingham',
        message: 'We have your parcel, and it\'s on its way to your nearest depot',
        checkpoint_time: '2014-01-08T22:34:58'
      },
      {
        country_name: 'Hub 3 - Birmingham',
        message: 'Your parcel has left the United Kingdom and is on its way to Saudi Arabia',
        checkpoint_time: '2014-01-09T03:56:57'
      },
      {
        country_name: 'United Kingdom',
        message: 'The parcel is in transit on its way to its final destination.',
        checkpoint_time: '2014-01-09T22:34:00'
      },
      {
        country_name: 'Bahrain',
        message: 'Your parcel has arrived at the local delivery depot',
        checkpoint_time: '2014-01-10T09:39:00'
      },
      {
        country_name: 'Bahrain',
        message: 'The parcel is in transit on its way to its final destination.',
        checkpoint_time: '2014-01-10T13:45:00'
      },
      {
        country_name: 'Bahrain',
        message: 'The parcel is in transit on its way to its final destination.',
        checkpoint_time: '2014-01-12T13:17:00'
      },
      {
        country_name: 'Saudi Arabia',
        message: 'Your parcel has arrived at the local delivery depot',
        checkpoint_time: '2014-01-14T06:30:00'
      },
      {
        country_name: 'Saudi Arabia',
        message: 'Your parcel is at the local depot awaiting collection',
        checkpoint_time: '2014-01-14T21:18:00'
      },
      {
        country_name: 'Saudi Arabia',
        message: 'Your parcel is on the vehicle for delivery',
        checkpoint_time: '2014-01-15T08:34:00'
      },
      {
        country_name: 'Saudi Arabia',
        message: 'The parcel has been delivered, signed for by BILAL',
        checkpoint_time: '2014-01-15T19:23:00'
      }
    ]
    });

    it('Expect result === dpduk', function(done) {
      Courier.dpduk('15502370264989N', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== dpduk) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  describe('Track @ dpduk(\'15501498140350\')', function() {

    var dpduk = local.jsonStringifyOrdered({'checkpoints': [
      { checkpoint_time: '2014-05-29T19:32:15',
        country_name: 'Hub 3 - Birmingham',
        message: 'We have your parcel, and it\'s on its way to your nearest depot in Crawley' },
      { checkpoint_time: '2014-05-30T00:22:06',
        country_name: 'Crawley',
        message: 'Your parcel is with your nearest delivery depot in Crawley' },
      { checkpoint_time: '2014-05-30T06:44:00',
        country_name: 'Crawley',
        message: 'Your parcel will be with you today ' },
      { checkpoint_time: '2014-05-30T08:02:33',
        country_name: 'DPD Consumer',
        message: 'As requested, your parcel will now be delivered on Mon 02 June 2014' },
      { checkpoint_time: '2014-05-30T12:42:54',
        country_name: 'Crawley',
        message: 'Your parcel has been delivered to your neighbour at number 30 and signed for by C PATEL' }
    ] });

    it('Expect result === dpduk', function(done) {
      Courier.dpduk('15501498140350', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== dpduk) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  describe('Track @ dpduk(\'15501733652085\')', function() {

    var dpduk = local.jsonStringifyOrdered({'checkpoints': [
      { checkpoint_time: '2014-05-28T01:18:19',
        country_name: 'Hub 3 - Birmingham',
        message: 'We have your parcel, and it\'s on its way to your nearest depot in Southall' },
      { checkpoint_time: '2014-05-28T05:38:19',
        country_name: 'Southall',
        message: 'Your parcel is with your nearest delivery depot in Southall' },
      { checkpoint_time: '2014-05-28T08:46:00',
        country_name: 'Southall',
        message: 'Your parcel will be with you today ' },
      { checkpoint_time: '2014-05-28T09:58:04',
        country_name: 'Southall',
        message: 'Your parcel has been delivered and signed for by FERNANDO' }
    ] });

    it('Expect result === dpduk', function(done) {
      Courier.dpduk('15501733652085', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== dpduk) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

  describe('Track @ dpduk(\'07081002031105O\')', function() {

    var dpduk = local.jsonStringifyOrdered({'checkpoints': [
      { checkpoint_time: '2014-05-28T19:50:20',
        country_name: 'Hub 3 - Birmingham',
        message: 'We have your parcel, and it\'s on its way to your nearest depot in Southall' },
      { checkpoint_time: '2014-05-29T02:06:40',
        country_name: 'Southall',
        message: 'Your parcel is with your nearest delivery depot in Southall' },
      { checkpoint_time: '2014-05-29T07:53:00',
        country_name: 'Southall',
        message: 'Your parcel will be with you today ' },
      { checkpoint_time: '2014-05-29T09:06:09',
        country_name: 'Southall',
        message: 'Your parcel has been delivered and signed for by KABA' }
    ] });

    it('Expect result === dpduk', function(done) {
      Courier.dpduk('07081002031105O', function (error, result) {
        result = local.jsonStringifyOrdered(result);
        if (error) {
          done(error);
        } else if (result !== dpduk) {
          done(new Error(result));
        } else {
          done();
        }
      });
    });
  });

});
