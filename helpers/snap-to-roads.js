const fetch = require("node-fetch");
// Snap a user-created polyline to roads and draw the snapped path
module.exports = runSnapToRoad = async (path) => {
    var chunks = [], i = 0
    while (i < path.length) {
      chunks.push(path.slice(i, i += 100));
    }
    var pathChunk = []
    chunks.forEach((chunk)=>{
      pathChunk.push(chunk.map((point)=>
        `${point.latitude},${point.longitude}`
      ))
    })
  
    const getPaths = async () => {
      let res = pathChunk.map(async (path)=>{
        let response = await fetch(`https://roads.googleapis.com/v1/snapToRoads?path=${path.join('|')}&interpolate=${true}&key=${process.env.GOOGLE_API_KEY}`)
        return response.json();
      })
      return await Promise.all(res)
    }
    let paths = await getPaths()
    return processSnapToRoadResponse(paths);
  }
  
  const processSnapToRoadResponse = (res) => {
    var sp = []
    for(var j = 0; j < res.length; j++){
      for (var i = 0; i < res[j].snappedPoints.length; i++) {
        var latlng = {
          lat: res[j].snappedPoints[i].location.latitude,
          lng: res[j].snappedPoints[i].location.longitude
        };
        sp.push(latlng);
      }
    }
    return sp
  }