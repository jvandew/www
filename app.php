<!DOCTYPE html>
<html>
<head>
<title>MapGraph</title>
</head>
<body>
<!--<style type="text/css">
div.olControlAttribution, div.olControlScaleLine {
    font-family: Verdana;
    font-size: 10px;
    bottom: 3px;
}
</style>
<div id="map" style="height:270px; width:480px"></div>
<script src="http://www.openlayers.org/api/OpenLayers.js"></script>
<script type="text/javascript">
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
</script>-->
</body>
</html>
