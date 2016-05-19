/*
 * Concept Map Visualizer
 * Copyright (c) 2016 Jake Hartz
 * Licensed under the MIT Licence. For more information, see the LICENSE file.
 */


// These "DATA_..._COLUMN" constants below are the labels of columns from the
// spreadsheets (referenced in data.js) for data that will be shown to the user
// or used in building the map.
// Most other important column labels are in the data.js file.

// The label of the "Latitude" column in a node's data
var DATA_LATITUDE_COLUMN = "Latitude";

// The label of the "Longitude" column in a node's data
var DATA_LONGITUDE_COLUMN = "Longitude";

// The label of the "Zoom" column in a node's data
var DATA_ZOOM_COLUMN = "Zoom";

// The label of the "Color" column in a node's data
var DATA_COLOR_COLUMN = "Color";

// The labels of any columns that contain HTML content to be shown to the user
var DATA_HTML_COLUMNS = [];

// The labels of any columns that contain long descriptions to be shown to the user
var DATA_DESCRIPTION_COLUMNS = ["Description"];

// The labels of any columns that contain key/value data to be shown to the user
// (The column name is used as the "key" or title)
var DATA_INFO_COLUMNS = [];

// The labels of any columns that contain URLs to images
var DATA_IMAGE_COLUMNS = ["Image"];

// The labels of any columns that contain URLs to be shown directly to the user
var DATA_URL_COLUMNS = [];


// Object to hold all exported functions from this file
var arcgisContent = {
    // initMapPoints
    // centerMapPoint
};


require([
    "esri/map", "esri/layers/FeatureLayer",
    "esri/geometry/Point", "esri/InfoTemplate",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", 
    "esri/graphic", "esri/layers/GraphicsLayer",
    "esri/Color", "dojo/number", "dojo/dom-style", 
    "dijit/TooltipDialog", "dijit/popup", "dojo/domReady!"
], function(
    Map, FeatureLayer,
    Point, InfoTemplate,
    SimpleMarkerSymbol, SimpleLineSymbol,
    Graphic, GraphicsLayer,
    Color, number, domStyle, 
    TooltipDialog, dijitPopup
) {
    var map = new Map("arcgis-content", {
        basemap: "osm",
        center: [36.322427, 32.303399],
        zoom: 16
    });

    var graphicsLayer = null;
    map.on("load", function () {
        graphicsLayer = new GraphicsLayer();
        graphicsLayer.on("click", function (event) {
            if (event.graphic) {
                showInfoWindow(event);
            }
        });
        map.addLayer(graphicsLayer);
    });

    var graphicsByNodeID = {};

    /**
     * Load points on the map based on a set of nodes.
     * @public
     *
     * @param {Array.<Node>} nodes - The nodes representing the points to put
     *        on the map.
     */
    arcgisContent.initMapPoints = function (nodes) {
        // Get rid of the old map points
        Object.keys(graphicsByNodeID).forEach(function (graphic) {
            graphicsLayer.remove(graphic);
            delete graphicsByNodeID[graphic];
        });

        // Add the new map points
        nodes.forEach(function (n) {
            var lat = n.data[DATA_LATITUDE_COLUMN],
                lng = n.data[DATA_LONGITUDE_COLUMN];
            if (typeof lat == "undefined" || typeof lng == "undefined") {
                return;
            }

            var p = new Point(lng, lat);
            var s = new SimpleMarkerSymbol().setSize(20);
            if (n.data[DATA_COLOR_COLUMN]) {
                s.setColor(Color.fromString(n.data[DATA_COLOR_COLUMN]));
            }

            var g = new Graphic(p, s);
            g.setInfoTemplate(generateInfoTemplate(n));

            graphicsByNodeID[n.id] = g;
            graphicsLayer.add(g);
        });
    };

    /**
     * Center the map on a certain point and open its popup.
     * @public
     *
     * @param {Node} node - The node containing the Lat/Lng/Zoom to center on.
     */
    arcgisContent.centerMapPoint = function (node) {
        var lat = node.data[DATA_LATITUDE_COLUMN],
            lng = node.data[DATA_LONGITUDE_COLUMN];
        if (typeof lat != "undefined" && typeof lng != "undefined") {
            var zoom = node.data[DATA_ZOOM_COLUMN];
            map.centerAndZoom([lng, lat], zoom || 14);
        }
    };

    /**
     * Show an InfoWindow on the map giving data about a specific node.
     * @private
     *
     * @param {Event} event - The click event causing this InfoWindow to show.
     */
    function showInfoWindow(event) {
        var graphic = event.graphic;
        map.infoWindow.setTitle(graphic.getTitle());
        map.infoWindow.setContent(graphic.getContent());
        map.infoWindow.show(event.screenPoint,
                map.getInfoWindowAnchor(event.screenPoint));
    }

    /**
     * Generate a new InfoTemplate for a specific node.
     * @private
     *
     * @param {Node} node - The node to generate info about.
     *
     * @return {InfoTemplate} An ArcGIS InfoTemplate with data about this Node.
     */
    function generateInfoTemplate(node) {
        var html = '<table><tbody>';

        html += '<tr><th colspan="2">' + escapeHTML(node.title) + '</th></tr>';

        // First, add the HTML columns
        DATA_HTML_COLUMNS.forEach(function (col) {
            if (node.data[col]) {
                html += '<tr><td colspan="2">' + node.data[col] + '</td></tr>';
            }
        });

        // Next, add the long description columns
        DATA_DESCRIPTION_COLUMNS.forEach(function (col) {
            if (node.data[col]) {
                html += '<tr><td colspan="2">' + escapeHTML(node.data[col]) + '</td></tr>';
            }
        });

        // Next, add the key/value info columns
        DATA_INFO_COLUMNS.forEach(function (col) {
            if (node.data[col]) {
                html += '<tr><th>' + escapeHTML(col) + '</th><td>' + escapeHTML(node.data[col]) + '</td></tr>';
            }
        });

        // Next, add any image columns
        DATA_IMAGE_COLUMNS.forEach(function (col) {
            if (node.data[col]) {
                html += '<tr><td colspan="2"><img src="' + escapeHTML(node.data[col]) + '" style="max-width: 100%;"></td></tr>';
            }
        });

        // Finally, add any URL columns
        DATA_URL_COLUMNS.forEach(function (col) {
            var url = node.data[col];
            if (url) {
                html += '<tr><td colspan="2"><a href="' + escapeHTML(url) + '" target="_blank">' + escapeHTML(url) + '</a></td></tr>';
            }
        });

        // Whew, all done!
        html += '</tbody></table>';
        return new InfoTemplate(node.title, html);
    }
});


