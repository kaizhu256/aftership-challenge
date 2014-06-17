/*jslint indent:2, nomen: true, regexp: true, stupid: true*/
/* eval(require('fs').readFileSync('lib/trackAsync.js', 'utf8')) */
(function () {
  /*
    this module provides an api to track courier packages asynchronously
  */
  'use strict';
  var local = {

    /* config setting */
    config: {
      /* cookie required for dpduk authoriazation */
      dpdukCookie: 'tracking=254cb810-f5fe-11e3-8c65-5b3809f7b35a',
      /* default timeout for http requests */
      timeout: 30000,
      /* timezone offset used to calculate utc time */
      timezoneOffset: new Date().getTimezoneOffset() * 60000,
      /* usps userid required for using their api */
      uspsUserid: '304DAVID1751'
    },

    _init: function () {
      return;
    },

    /* require fs */
    requiredFs: require('fs'),
    /* require http */
    requiredHttp: require('http'),
    /* require https */
    requiredHttps: require('https'),
    /* require url */
    requiredUrl: require('url'),

    nop: function () {
      /*
        this function performs no operation (nop)
      */
      return;
    },

    httpRequest: function (options, onEventError) {
      /*
        this functions performs an asynchronous http(s) request with error handling and timeout
      */
      var onEventError2, request, response, timeout, urlParsed;
      onEventError2 = function (error, data, headers) {
        /* clear timeout */
        clearTimeout(timeout);
        if (error) {
          /* garbage collect request socket */
          if (request) {
            request.destroy();
          }
          /* garbage collect response socket */
          if (response) {
            response.destroy();
          }
        }
        onEventError(error, data, headers);
      };
      /* set timeout */
      timeout = setTimeout(function () {
        onEventError2(new Error('timeout'));
      }, local.config.timeout);
      /* parse options.url */
      urlParsed = local.requiredUrl.parse(options.url);
      /* bug - disable socket pooling, because it causes timeout errors in tls tests */
      options.agent = options.agent || false;
      /* host needed for redirects */
      options.host = urlParsed.host;
      /* hostname needed for http(s).request */
      options.hostname = urlParsed.hostname;
      /* path needed for http(s).request */
      options.path = urlParsed.path;
      /* port needed for http(s).request */
      options.port = urlParsed.port;
      /* protocol needed for http(s).request */
      options.protocol = urlParsed.protocol;
      request = (options.protocol === 'https:' ? local.requiredHttps : local.requiredHttp)
        .request(options, function (_) {
          response = _;
          /* error handling */
          response.on('error', onEventError2);
          /* follow redirects */
          switch (response.statusCode) {
          case 301:
          case 302:
          case 303:
          case 304:
          case 305:
          case 306:
          case 307:
            options.redirected = options.redirected || 0;
            options.redirected += 1;
            if (options.redirected >= 8) {
              onEventError2(new Error('ajaxNodejs - too many http redirects to ' +
                response.headers.location));
              return;
            }
            options.url = response.headers.location;
            if (options.url && options.url[0] === '/') {
              options.url = options.protocol + '//' + options.host + options.url;
            }
            local.httpRequest(options, onEventError2);
            return;
          }
          /* get responseText */
          local.streamReadAll(
            response.on('error', onEventError2),
            function (error, data) {
              /* error handling */
              if (error) {
                onEventError2(error);
                return;
              }
              /* error handling for status code >= 400 */
              if (options.responseStatusCode >= 400) {
                onEventError2(new Error(data.toString()));
                return;
              }
              /* successful response */
              onEventError2(null, data, response.headers);
            }
          );
        });
      /* send request and / or data */
      request.end(options.data);
    },

    streamReadAll: function (readableStream, onEventError) {
      /*
        this function concats data from readable stream and passes it to callback when done
      */
      var chunks;
      chunks = [];
      /* read data from readable stream */
      readableStream.on('data', function (chunk) {
        chunks.push(chunk);
      /* call callback when finished reading */
      }).on('end', function () {
        onEventError(null, Buffer.concat(chunks));
      /* pass any errors to the callback */
      }).on('error', onEventError);
    },

    trackDpduk: function (tracking_number, onEventError) {
      /*
        this function fetches tracking data from dpduk
      */
      /* fetch tracking data from courier */
      local.httpRequest({
        headers: { Cookie: local.config.dpdukCookie },
        url: 'http://www.dpd.co.uk/esgServer/shipping/delivery/?parcelCode=' + tracking_number
      }, function (error, data) {
        if (error) {
          onEventError(error);
          return;
        }
        /* parse data in try catch block */
        try {
          data = data.toString();
          local._trackDpdukDataParse(data, onEventError);
        } catch (error2) {
          console.error(data);
          onEventError(error2);
        }
      });

    },

    _trackDpdukDataParse: function (data, onEventError) {
      /*
        this function parses the fetched tracking data from dpduk
      */
      /* json parse data */
      data = JSON.parse(data)
        .obj.trackingEvent
        /* reverse event list */
        .reverse()
        /* transform events to aftership format */
        .map(function (row) {
          return {
            country_name: row.trackingEventLocation,
            message: row.trackingEventStatus,
            checkpoint_time: row.trackingEventDate.slice(0, 19)
          };
        });
      onEventError(null, { checkpoints: data });
    },

    trackHkpost: function (tracking_number, onEventError) {
      /*
        this function fetches tracking data from hkpost
      */
      var data;
      /* fetch tracking data from courier */
      data = 'submit=Enter&tracknbr=' + tracking_number;
      local.httpRequest({
        data: data,
        headers: {
          'Content-Length': data.length,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        url: 'http://app3.hongkongpost.hk/CGI/mt/mtZresult.jsp'
      }, function (error, data) {
        if (error) {
          onEventError(error);
          return;
        }
        /* parse data in try catch block */
        try {
          data = data.toString();
          local._trackHkpostDataParse(data, onEventError);
        } catch (error2) {
          console.error(data);
          onEventError(error2);
        }
      });

    },

    _trackHkpostDataParse: function (data, onEventError) {
      /*
        this function parses the fetched tracking data from hkpost
      */
      var match, result;
      /* this is actually a horrible hack
       * as i don't know what to expect the actual test case should be
       * (the original test case has an expired tracking number),
       * so i'm just making up my own as i see fit.
       * also aftership's api doesn't seemed to have as nearly detailed tracking info as that
       * provided in the test case.
       * does that indicate hong kong post changed their tracking info details recently?
       */
      data = data.replace((/\s+/g), ' ');
      result = { checkpoints: [ {} ] };
      /* ugly hack to get country */
      match = (/<span class="textNormalBlack">Destination<\/span> - ([^<]+)<\/p>([^>]+)/)
        .exec(data);
      result.checkpoints[0].country_name = match[1];
      /* ugly hack to get message status - need more test data to fix potential edge cases */
      result.checkpoints[0].message = (/delivered|in transit/).exec(match[2])[0] + '.';
      /* capitalize first letter in message */
      result.checkpoints[0].message = result.checkpoints[0].message[0].toUpperCase() +
        result.checkpoints[0].message.slice(1);
      /* get date */
      result.checkpoints[0].checkpoint_time = new Date(
        new Date((/\d+-[A-Z][a-z]+-20\d\d/).exec(match[2])[0]).getTime() -
          local.config.timezoneOffset
      ).toISOString().slice(0, 19);
      onEventError(null, result);
    },

    trackUsps: function (tracking_number, onEventError) {
      /*
        this function fetches tracking data from usps
      */
      /* fetch tracking data from courier */
      local.httpRequest({
        url: 'http://production.shippingapis.com/ShippingAPITest.dll' +
          '?API=TrackV2&XML=<TrackRequest USERID="' +
          local.config.uspsUserid +
          '"><TrackID ID="' +
          tracking_number +
          '"></TrackID></TrackRequest>'
      }, function (error, data) {
        if (error) {
          onEventError(error);
          return;
        }
        /* parse data in try catch block */
        try {
          data = data.toString();
          local._trackUspsDataParse(data, onEventError);
        } catch (error2) {
          onEventError(error2);
        }
      });

    },

    _trackUspsDataParse: function (data, onEventError) {
      /*
        this function parses the fetched tracking data from usps
      */
      var result, time;
      result = { checkpoints: [] };
      /* parse xml data by search for <...> tags */
      data.replace((/<(\w+)>([^<]+)</g), function (_, type, message) {
        local.nop(_);
        time = new Date(
          new Date(message.match(/\d+:\d\d [ap]m|[A-Z][a-z]+ \d+, 20\d\d/g).join(','))
            /* offset local timezone */
            .getTime() - local.config.timezoneOffset
        ).toISOString().slice(0, 19);
        switch (type) {
        /* handle <TrackSummary> xml tag */
        case 'TrackSummary':
          result.checkpoints.push({
            country_name: '',
            message: message.indexOf('Your item was delivered') === 0 ? 'Delivered' : message,
            checkpoint_time: time
          });
          break;
        /* handle <TrackDetail> xml tag */
        case 'TrackDetail':
          result.checkpoints.push({
            country_name: '',
            message: message,
            checkpoint_time: time
          });
          break;
        }
      });
      /* pass parsed result to callback */
      onEventError(null, result);
    }

  };

  module.exports = local;
  local._init();
}());
