/*
 * Concept Map Visualizer
 * Copyright (c) 2016 Jake Hartz
 * Licensed under the MIT Licence. For more information, see the LICENSE file.
 */


// The URL of the data source.
// This can be anything that can be interpreted by a Google Charts data query,
// including Google Docs spreadsheets. For more info, see:
// https://developers.google.com/chart/interactive/docs/queries
var DATA_URL = "https://docs.google.com/spreadsheets/d/1CQOrv5ireKNJw-oRAer68FWsc67F_CRMfmI7RA7tM44/edit?usp=sharing";


// The label of the column for the ID of the node
var ID_COLUMN = "ID";
// The label of the column for the title of the node
var TITLE_COLUMN = "Label";
// The label of the "Is root" column
var ROOT_COLUMN = "Is Root? (y/n)";
// The label of any "link to" columns (can be 0 or more)
var LINK_COLUMN = "Link To";

// Any other columns in the spreadsheet (e.g. Latitude, Longitude) will be
// added to the "data" object attached to each node.


// Anonymous function to encapsulate private data and functions
(function () {
    // List of required columns
    var REQUIRED_COLUMNS = [ID_COLUMN, TITLE_COLUMN, ROOT_COLUMN];


    /**
     * Get a boolean value from a string from the data.
     * (Used for interpreting the value of ROOT_COLUMN)
     * @private
     *
     * @param {string} text - The text in the column.
     * @return {boolean} Whether this column is boolean true or false.
     */
    function parseBooleanColumn(text) {
        if (!text) return false;
        text = ("" + text).trim().toLowerCase();
        if (text == "y" || text == "yes" || text == "true") {
            return true;
        }
        return false;
    }


    /**
     * Load data via a Google Charts data query.
     * @private
     *
     * @param {string} dataSourceURL - The URL of a Google Charts data source.
     */
    function loadData(dataSourceURL) {
        google.load("visualization", "1");
        google.setOnLoadCallback(function () {
            var query = new google.visualization.Query(dataSourceURL);
            query.send(function (response) {
                if (response.isError()) {
                    console.error("ERROR retreiving map data from spreadsheet!",
                        response.getMessage(), response.getDetailedMessage());
                    return;
                }

                parseData(response.getDataTable());
            });
        });
    }


    /**
     * Parse and interpret data.
     * @private
     *
     * @param dataTable - A Google Charts data table holding the data to be
     *        parsed.
     */
    function parseData(dataTable) {
        // List of all the non-required (data) column labels (in order)
        var extraColumns = [];

        // Maps column labels to indexes
        var columnIndexes = {};

        // List of all the columns that are links to other nodes
        var linkColumnIndexes = [];

        // Get the columns
        var i, label;
        for (i = 0; i < dataTable.getNumberOfColumns(); i++) {
            label = dataTable.getColumnLabel(i);
            if (label == LINK_COLUMN) {
                linkColumnIndexes.push(i);
            } else if (typeof columnIndexes[label] == "undefined") {
                columnIndexes[label] = i;

                // If this is a non-required (data) column, add it to the list
                if (REQUIRED_COLUMNS.indexOf(label) == -1) {
                    extraColumns.push(label);
                }
            }
        }

        // Make sure we have all the required columns
        var foundMissing = false;
        REQUIRED_COLUMNS.forEach(function (col) {
            if (typeof columnIndexes[col] == "undefined") {
                console.error("ERROR parsing data from spreadsheet!",
                        "Data missing required column: " + col);
                foundMissing = true;
            }
        });
        if (foundMissing) return;

        // Parse each row
        var data = {};
        var row, rowID;
        for (row = 0; row < dataTable.getNumberOfRows(); row++) {
            rowID = dataTable.getValue(row, columnIndexes[ID_COLUMN]);
            if (typeof data[rowID] != "undefined") {
                console.error("ERROR parsing data from spreadsheet!",
                        "Found duplicate ID: " + rowID);
                continue;
            }

            // Create the data node for this row
            data[rowID] = {};

            // Add the title of this node
            data[rowID].title = dataTable.getValue(row, columnIndexes[TITLE_COLUMN]);

            // Add whether this node is a root node
            data[rowID].root = parseBooleanColumn(dataTable.getValue(row, columnIndexes[ROOT_COLUMN]));

            // Add the list of child node ID's
            data[rowID].children = linkColumnIndexes.map(function (colIndex) {
                var value = dataTable.getValue(row, colIndex);
                if (!value) return "";
                return (value + "").trim();
            }).filter(function (value) {
                return !!value;
            });

            // Add any extra data columns
            data[rowID].data = {};
            extraColumns.forEach(function (col) {
                var value = dataTable.getValue(row, columnIndexes[col]);
                data[rowID].data[col] = value || null;
            });
        }

        // Woohoo, all done! Initialize the graph with this new data
        d3Content.initData(data);
    }


    // Let's get started!
    loadData(DATA_URL);
})();
