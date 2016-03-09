function make_request(offset, handler) { 
  var limit = 250;
  var url = "https://api.foursquare.com/v2/users/self/checkins";
  var version = "20141130";
  var token = window.location.href.split('=')[1];

  $.getJSON(url + "?oauth_token="+token + "&limit="+limit + "&offset="+offset + "&v="+version, handler);
}

function response_handler(offset) {
  return function(data) {
    $.each(data["response"]["checkins"]["items"], function(i, checkin) {
      CHECKINS[offset+i] = checkin;
    });
  };
}

function initial_handler(data) {
  var response = data["response"]["checkins"];
  CHECKINS = new Array(response["count"]-1);

  $.each(response["items"], function(i, checkin) {
    CHECKINS[i] = checkin;
  });

  if (response["count"] > 250) {
    for (var i = 1; i < response["count"]/250; i++) {
      var offset = 250*i;
      make_request(offset, response_handler(offset));
    }
  }
}

function process_checkins() {
  if (CHECKINS == null) {
    setTimeout(process_checkins, 100);
    return;
  }
  for (var i = 0; i < CHECKINS.length; i++) {
    if (CHECKINS[i] === undefined) {
      setTimeout(process_checkins, 100);
      return;
    }
  }

  var edges = new Object();
  var venues = new Object();
  var prevVenueId = null;
  var prevPoint = null;

  $.each(CHECKINS, function(i, checkin) {
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
      return;
    }

    var edgeId = prevVenueId + "" + pointId;
    if (edges[edgeId] != undefined) {
      edges[edgeId]["attributes"]["count"]++;
      prevVenueId = pointId;
      prevPoint = point;
      return;
    }

    var edge = new OpenLayers.Geometry.LineString([prevPoint, point]);
    edges[edgeId] = new OpenLayers.Feature.Vector(edge);
    edges[edgeId]["attributes"] = new Object();
    edges[edgeId]["attributes"]["count"] = 1;

    if (venues[pointId] !== undefined) {
        venues[pointId]["attributes"]["count"]++;
    } else {
      venues[pointId] = new OpenLayers.Feature.Vector(point);
      venues[pointId]["attributes"] = new Object();
      venues[pointId]["attributes"]["count"] = 1;
    }

    prevPoint = point;
    prevVenueId = pointId;
  });

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

var CHECKINS = null;

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

var token = window.location.href.split('=')[1];
if (token == undefined) {
  document.write("Log in to <a href='https://foursquare.com/oauth2/authenticate?client_id=bw4gcp2zccek00xof4y5ghnhizbps5dx5fnjuvlcqunjyrie&response_type=token&redirect_uri=https://" + window.location.host + "/app'>foursquare</a> for crazy map funtimes.");
} else {
  make_request(0, initial_handler);
}

var layer = new OpenLayers.Layer.OSM();
map.addLayer(layer);
map.addLayer(vectors);
var center = new OpenLayers.LonLat(-79.94297997867707, 40.4455930477455)
                           .transform(new OpenLayers.Projection("EPSG:4326"),
                                      map.projection);
map.setCenter(center, 6);

process_checkins();

