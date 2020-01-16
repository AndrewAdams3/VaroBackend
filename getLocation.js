var NodeGeocoder = require('node-geocoder');

// Using callback
function getLocation (lat, lon, result, callback){
  var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: process.env.GOOGLE_API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
  };

  var geocoder = NodeGeocoder(options);
  
  geocoder.reverse({ lat: lat, lon: lon}, (err, res) => {
    if(err) {
      console.error(err);
      return { err: "err" };
    }
    console.log("res", res);
    let loc = {
      street: res[0].streetNumber + " " + res[0].streetName,
      address: res[0].formattedAddress,
      city: res[0].city,
      county: res[0].administrativeLevels.level2short,
      state: res[0].administrativeLevels.level1short,
      postal: res[0].zipcode,
      timeZone: ""
    };
    callback(result, loc);
    return;
  })
}

module.exports = getLocation;