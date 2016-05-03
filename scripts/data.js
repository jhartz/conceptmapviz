/*
 * Concept Map Visualizer
 * Copyright (c) 2016 Jake Hartz
 * Licensed under the MIT Licence. For more information, see the LICENSE file.
 */


// These constants identify the column titles of certain columns in the data
// source.

// The label of the column for the ID of the node
var ID_COLUMN = "ID";

// The label of the column for the title of the node
var TITLE_COLUMN = "Label";

// The label of the column for the group of the node
var GROUP_COLUMN = "District";

// The label of the "Is root" column
var ROOT_COLUMN = "Is Root? (y/n)";

// The label of any "link to" columns (can be 0 or more)
var LINK_COLUMN = "Link To";


// These constants below represent the URLs of the data sources. They can be
// anything that can be interpreted by a Google Charts data query, including
// Google Docs spreadsheets. For more info, see:
// https://developers.google.com/chart/interactive/docs/queries


// The URL of the data source for the nodes and the links between them.
// It should have an ID_COLUMN, a TITLE_COLUMN, a GROUP_COLUMN, a ROOT_COLUMN,
// and one or more LINK_COLUMN.
var NODE_DATA_URL = "https://docs.google.com/spreadsheets/d/1CQOrv5ireKNJw-oRAer68FWsc67F_CRMfmI7RA7tM44/edit?headers=1&sheet=Nodes";

// The URL of the data source for additional information about each node.
// It must have an ID_COLUMN that matches IDs from NODE_DATA_URL.
var EXTRA_INFO_URL = "https://docs.google.com/spreadsheets/d/1CQOrv5ireKNJw-oRAer68FWsc67F_CRMfmI7RA7tM44/edit?headers=1&sheet=Info";

// Any other columns in either spreadsheet (e.g. Latitude, Longitude) will be
// added to the "data" object attached to each node.


// Anonymous function to encapsulate private data and functions
(function () {
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
     * @return {Promise} The resulting Google Charts data table.
     */
    function loadData(dataSourceURL) {
        return new Promise(function (resolve, reject) {
            google.load("visualization", "1");
            google.setOnLoadCallback(function () {
                var query = new google.visualization.Query(dataSourceURL);
                query.send(function (response) {
                    if (response.isError()) {
                        console.error("ERROR retreiving map data from spreadsheet!",
                            response.getMessage(), response.getDetailedMessage());
                        return reject();
                    }

                    resolve(response.getDataTable());
                });
            });
        });
    }


    /**
     * Parse and interpret data from a Google Charts data table.
     * @private
     *
     * @param dataTable - A Google Charts data table holding the information to
     *        be parsed.
     * @param {string} idColumn - The column label that represents the unique
     *        identifier of each row.
     * @param {Array.<string>} [requiredColumns] - A list of all the required
     *        columns in the data table (NOT including idColumn).
     * @param {Array.<string>} [repeatableColumns] - A list of any columns that
     *        may be repeated 0 or more times (MUST NOT be in requiredColumns).
     *
     * @return {Promise.<Object>} The data from the table, with keys being from
     *         idColumn.
     */
    function parseDataTable(dataTable, idColumn, requiredColumns, repeatableColumns) {
        if (!requiredColumns) requiredColumns = [];
        if (!repeatableColumns) repeatableColumns = [];

        // List of all the non-required (data) column labels (in order)
        var extraColumns = [];

        // Maps column labels to indexes
        var columnIndexes = {};

        // For each repeatable column, the list of indexes of that column
        var repeatableColumnIndexes = {};
        repeatableColumns.forEach(function (col) {
            repeatableColumnIndexes[col] = [];
        });

        // Get the columns
        var i, label;
        for (i = 0; i < dataTable.getNumberOfColumns(); i++) {
            label = dataTable.getColumnLabel(i);
            if (repeatableColumnIndexes[label]) {
                repeatableColumnIndexes[label].push(i);
            } else if (typeof columnIndexes[label] == "undefined") {
                columnIndexes[label] = i;

                // If this is a non-required (data) column, add it to the list
                if (requiredColumns.indexOf(label) == -1) {
                    extraColumns.push(label);
                }
            }
        }

        // Make sure we have all the required columns
        var foundMissing = false;
        requiredColumns.concat(idColumn).forEach(function (col) {
            if (typeof columnIndexes[col] == "undefined") {
                console.error("ERROR parsing data from spreadsheet:",
                        "Missing required column: " + col);
                foundMissing = true;
            }
        });
        if (foundMissing) return Promise.reject("Missing required column(s)");

        // Get the rows
        var data = {};
        var row, rowID;
        for (row = 0; row < dataTable.getNumberOfRows(); row++) {
            rowID = dataTable.getValue(row, columnIndexes[idColumn]);
            if (typeof data[rowID] != "undefined") {
                console.warn("WARNING parsing data from spreadsheet:",
                        "Found duplicate ID: " + rowID);
                continue;
            }

            // Create the data object for this row
            data[rowID] = {};

            // Add all the required columns
            requiredColumns.forEach(function (col) {
                data[rowID][col] = dataTable.getValue(row, columnIndexes[col]);
            });

            // Add any repeatable columns
            repeatableColumns.forEach(function (col) {
                data[rowID][col] = repeatableColumnIndexes[col].map(function (colIndex) {
                    var value = dataTable.getValue(row, colIndex);
                    if (!value) return "";
                    return (value + "").trim();
                }).filter(function (value) {
                    return !!value;
                });
            });

            // Add any extra data columns
            data[rowID].data = {};
            extraColumns.forEach(function (col) {
                data[rowID].data[col] = dataTable.getValue(row, columnIndexes[col]);
            });
        }

        // Woohoo, all done!
        return Promise.resolve(data);
    }


    /**
     * Merge node and link data into one object structure, grouped by the
     * GROUP_COLUMN.
     * @private
     *
     * @param {Object} nodeDataByID - Basic data about the nodes and how they
     *        are linked together.
     *          This is organized as ID's mapping to objects with...
     *          - a TITLE_COLUMN property,
     *          - a GROUP_COLUMN property,
     *          - a ROOT_COLUMN property,
     *          - a LINK_COLUMN property (an array of ID's), and
     *          - a "data" property (an object containing any other data).
     * @param {Object} extraInfoByID - More information about the nodes,
     *        organized as ID's mapping to objects with a "data" property
     *        (which is an object containing any other data).
     *
     * @return {Object.<string, Object>} The nodes, organized by group, then by
     *         ID.
     */
    function mergeData(nodeDataByID, extraInfoByID) {
        var nodesByGroup = {};

        // Parse based on nodeData
        Object.keys(nodeDataByID).forEach(function (id) {
            var nodeData = nodeDataByID[id],
                nodeTitle = nodeData[TITLE_COLUMN],
                nodeGroup = nodeData[GROUP_COLUMN],
                nodeIsRoot = parseBooleanColumn(nodeData[ROOT_COLUMN]),
                nodeLinks = nodeData[LINK_COLUMN];

            // Make sure this group exists
            if (!nodesByGroup.hasOwnProperty(nodeGroup)) {
                nodesByGroup[nodeGroup] = {};
            }

            // Create an object to hold ALL the data about this node
            var node = {
                title: nodeTitle,
                isRoot: nodeIsRoot,
                children: nodeLinks,
                data: {}
            };
            nodesByGroup[nodeGroup][id] = node;

            // Add any extra data columns from the nodeData
            Object.keys(nodeData.data).forEach(function (dataKey) {
                node.data[dataKey] = nodeData.data[dataKey];
            });

            // If there's any data on this node in extraInfo, add that too
            if (extraInfoByID.hasOwnProperty(id) && extraInfoByID[id].data) {
                Object.keys(extraInfoByID[id].data).forEach(function (dataKey) {
                    node.data[dataKey] = extraInfoByID[id].data[dataKey];
                });
            }
        });

        // Woohoo, all done!
        return nodesByGroup;
    }


    // Let's get started!
    var nodeDataPromise = loadData(NODE_DATA_URL).then(function (dataTable) {
        return parseDataTable(dataTable, ID_COLUMN,
                [TITLE_COLUMN, GROUP_COLUMN, ROOT_COLUMN],
                [LINK_COLUMN]);
    });
    var extraInfoPromise = loadData(EXTRA_INFO_URL).then(function (dataTable) {
        return parseDataTable(dataTable, ID_COLUMN);
    });

    // Wait for both data to be ready
    Promise.all([nodeDataPromise, extraInfoPromise]).then(function (datas) {
        var nodeData = datas[0],
            extraInfo = datas[1];

        // Combine the two data objects into one
        var nodesByGroup = mergeData(nodeData, extraInfo);

        // Create a Graph object for each group
        var graphsByGroup = {};
        Object.keys(nodesByGroup).forEach(function (group) {
            graphsByGroup[group] = new Graph(nodesByGroup[group]);
        });

        // Initialize the display with our new graphs
        initGraphs(GROUP_COLUMN, graphsByGroup);
    }).catch(function (err) {
        console.error("ERROR retreiving data from spreadsheet:", err);
        alert("Error retreiving data from spreadsheet!\n" +
              "See the Error Console for more information.");
    });
})();

