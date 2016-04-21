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
        basemap: "hybrid",
        center: [36.322427, 32.303399],
        zoom: 14
    });
});
