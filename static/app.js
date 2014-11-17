function jsonHandler(data) {
  var edges = new Object();
  var venues = new Object();
  var prevVenueId = null;
  var prevPoint = null;

  for(var i = 0; i < data["response"]["checkins"]["count"]; i++) {
    var checkin = data["response"]["checkins"]["items"][i];
    if (checkin == undefined || checkin["venue"] == undefined) {
      prevVenueId = null;
      prevPoint = null;
      continue;
    }

    var lonlat = new OpenLayers.LonLat(checkin["venue"]["location"]["lng"],
                                       checkin["venue"]["location"]["lat"])
                 .transform(new OpenLayers.Projection("EPSG:4326"),
                            map.projection);
    var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
    var pointId = checkin["venue"]["id"];

    if (prevPoint == null || prevVenueId == null) {
      if (venues[pointId] != undefined) {
        venues[pointId]["attributes"]["count"]++;
      } else {
        venues[pointId] = new OpenLayers.Feature.Vector(point);
        venues[pointId]["attributes"] = new Object();
        venues[pointId]["attributes"]["count"] = 1;
      }

      prevVenueId = pointId;
      prevPoint = point;
      continue;
    }

    var edgeId = prevVenueId + "" + pointId;
    if (edges[edgeId] != undefined) {
      edges[edgeId]["attributes"]["count"]++;
      prevVenueId = pointId;
      prevPoint = point;
      continue;
    }

    var edge = new OpenLayers.Geometry.LineString([prevPoint, point]);
    edges[edgeId] = new OpenLayers.Feature.Vector(edge);
    edges[edgeId]["attributes"] = new Object();
    edges[edgeId]["attributes"]["count"] = 1;

    if (venues[pointId] != undefined) {
        venues[pointId]["attributes"]["count"]++;
    } else {
      venues[pointId] = new OpenLayers.Feature.Vector(point);
      venues[pointId]["attributes"] = new Object();
      venues[pointId]["attributes"]["count"] = 1;
    }

    if (lastCheckin == null) {
      lastCheckin = point;
    }

    prevPoint = point;
    prevVenueId = pointId;
  }

  var edgeMax = 0;
  var venueMax = 0;

  for (key in edges) {
    if (edgeMax < edges[key]["attributes"]["count"]) {
      edgeMax = edges[key]["attributes"]["count"];
    }
  }

  for (key in venues) {
    if (venueMax < venues[key]["attributes"]["count"]) {
      venueMax = venues[key]["attributes"]["count"];
    }
  }

  var edgeStep = 510.0 / edgeMax;
  var venueStep = 510.0 / venueMax;
  for (key in edges) {
    var colors = Math.round(edgeStep * edges[key]["attributes"]["count"]);

    var red = Math.min(colors, 255).toString(16);
    if (red.length < 2) {
      red = "0" + red;
    }
    var green = Math.min(255 - (colors - 255), 255).toString(16);
    if (green.length < 2) {
      green = "0" + green;
    }

    edges[key]["attributes"]["color"] = "#" + red + green + "00";
    vectors.addFeatures([edges[key]]);
  }

  for (key in venues) {
    var colors = Math.round(edgeStep * venues[key]["attributes"]["count"]);

    var red = Math.min(colors, 255).toString(16);
    if (red.length < 2) {
      red = "0" + red;
    }
    var green = Math.min(255 - (colors - 255), 255).toString(16);
    if (green.length < 2) {
      green = "0" + green;
    }

    venues[key]["attributes"]["color"] = "#" + red + green + "00";
    vectors.addFeatures([venues[key]]);
  }

}

