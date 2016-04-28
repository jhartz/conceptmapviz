/*
 * Concept Map Visualizer
 * Copyright (c) 2016 Jake Hartz
 * Licensed under the MIT Licence. For more information, see the LICENSE file.
 */


var map;

require([
    "esri/map", "esri/layers/FeatureLayer",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", 
    "esri/renderers/SimpleRenderer", "esri/graphic", "esri/lang",
    "esri/Color", "dojo/number", "dojo/dom-style", 
    "dijit/TooltipDialog", "dijit/popup", "dojo/domReady!"
], function(
    Map, FeatureLayer,
    SimpleMarkerSymbol, SimpleLineSymbol,
    SimpleRenderer, Graphic, esriLang,
    Color, number, domStyle, 
    TooltipDialog, dijitPopup
) {
    map = new Map("arcgis-content", {
        basemap: "osm",
        center: [36.322427, 32.303399],
        zoom: 16
    });

    d3Content.registerClickHandler(function (d, elem) {
        if (d.data &&
                typeof d.data.Latitude == "number" &&
                typeof d.data.Longitude == "number") {
            // TODO: Check return value (Promise?)
            map.centerAndZoom([d.data.Longitude, d.data.Latitude], d.data.Zoom || 14);
        }
    });
});
