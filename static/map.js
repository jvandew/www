var map = new OpenLayers.Map("map");
map.projection = new OpenLayers.Projection("EPSG:3857");
var vectors = new OpenLayers.Layer.Vector("vectors");

var lonlat = new OpenLayers.LonLat(-79.94297997867707, 40.4455930477455)
                           .transform(new OpenLayers.Projection("EPSG:4326"),
                                      map.projection);
var testPoint = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
var testFeat = new OpenLayers.Feature.Vector(testPoint);
vectors.addFeatures([testFeat]);
var layer = new OpenLayers.Layer.OSM();

map.addLayer(layer);
map.addLayer(vectors);
map.setCenter(lonlat, 14);

