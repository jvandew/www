<!DOCTYPE html>
<html>
<head>
<title>Jacob Van De Weert</title>
</head>
<body>
<img src="me.jpg" alt="This is me" width=162 height=121/><br/><br/>
     Hi!<br/>
     My name is Jacob Van De Weert. This is my humble website. It&#39;s 
     currently more of a sandbox for me to play around in.<br/><br/>
     <a href="resume.pdf">Here is my resume</a><br/><br/>
     <?php echo "The current time is: ".date("H:i:s")."<br/><br/>"; ?><br/>
     <!--Listen to some smooth jazz while you peruse the page! 
     <a href="http://www.youtube.com/watch?v=AaEmCFiNqP0">Original here</a><br/>
     <audio controls>
     <source src="NyanCatJazz.mp3" type="audio/mpeg" preload="metadata"/>
     Upgrade to a newer browser to enjoy the musical stylings of Nyan Cat.
     </audio>
     <br/><br/>-->
     Log in to <a href="https://foursquare.com/oauth2/authenticate?client_id=bw4gcp2zccek00xof4y5ghnhizbps5dx5fnjuvlcqunjyrie&response_type=token&redirect_uri=http://www.contrib.andrew.cmu.edu/~jvandew/app.html">foursquare</a> for crazy map funtimes.
     <style type="text/css">
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
</script>
</body>
</html>
