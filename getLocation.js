var NodeGeocoder = require('node-geocoder');
const fetch = require("node-fetch")

// Using callback
function getLocation (lat, lon, result, callback){
  var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: process.env.GOOGLE_API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
  };
  try{
    fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${new Date().getTime()}&key=${process.env.GOOGLE_API_KEY}`)
    .then((res)=> res.json())
    .then((json)=>{
      console.log("json", json)
    })
  } catch(err){
    console.log("err", err)
  }

  var geocoder = NodeGeocoder(options);
  
  geocoder.reverse({ lat: lat, lon: lon}, (err, res) => {
    if(err) {
      console.error(err);
      return { err: "err" };
    }
    let loc = {
      street: res[0].streetNumber + " " + res[0].streetName,
      address: res[0].formattedAddress,
      city: res[0].city,
      county: res[0].administrativeLevels.level1short,
      state: res[0].administrativeLevels.level2short,
      postal: res[0].zipcode,
      timeZone: ""
    };
    callback(result, loc);
    return;
  })
}

module.exports = getLocation;