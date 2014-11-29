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

function getZoom(feat) {
  var max = map.getNumZoomLevels();
  var zoom = map.getZoom();
  return Math.round((zoom * zoom * zoom)/(max * max * max));
}

var map = new OpenLayers.Map("map");
map.projection = new OpenLayers.Projection("EPSG:3857");

var style = new OpenLayers.Style(
  {
    "strokeColor": "${color}",
    "fillColor": "${color}",
    "strokeWidth": 2,
    "pointRadius": "${zoom}"
  },
  {
    "context": {
      "zoom": function(feat) {
        return map.getZoom();
      }
    }
  }
);
style = OpenLayers.Util.applyDefaults(style, OpenLayers.Feature.Vector.style["default"]);
var styleMap = new OpenLayers.StyleMap({"default": style});
var vectors = new OpenLayers.Layer.Vector("vectors", {"styleMap": styleMap});
var lastCheckin = null;

var limit = 10000;
var url = "https://api.foursquare.com/v2/users/self/checkins";
var date = new Date(Date.now());
var year = date.getFullYear().toString();
var month = date.getMonth() + 1;
var day = date.getDate();
var version = year + month + day;
var token = window.location.href.split('=')[1];

if (token == undefined) {
  document.write("Log in to <a href='https://foursquare.com/oauth2/authenticate?client_id=bw4gcp2zccek00xof4y5ghnhizbps5dx5fnjuvlcqunjyrie&response_type=token&redirect_uri=http://www.contrib.andrew.cmu.edu/~jvandew/app.html'>foursquare</a> for crazy map funtimes.");
} else {
  $.getJSON(url + "?oauth_token="+token + "&limit="+limit + "&v="+version, jsonHandler);
}

var layer = new OpenLayers.Layer.OSM();
map.addLayer(layer);
map.addLayer(vectors);
if (lastCheckin == null)
  lastCheckin = new OpenLayers.LonLat(-79.94297997867707, 40.4455930477455)
                              .transform(new OpenLayers.Projection("EPSG:4326"),
                                         map.projection);
map.setCenter(lastCheckin, 6);

