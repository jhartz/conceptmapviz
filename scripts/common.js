/*
 * Concept Map Visualizer
 * Copyright (c) 2016 Jake Hartz
 * Licensed under the MIT Licence. For more information, see the LICENSE file.
 */


/**
 * Register a new DOMContentLoaded (page load) handler.
 *
 * @return {Promise} A Promise that will be resolved when the window is ready.
 */
function onReady() {
    return new Promise(function (resolve, reject) {
        window.addEventListener("DOMContentLoaded", function () {
            resolve();
        }, false);
    });
}


// Anonymous function to encapsulate private data and functions
(function () {
    var graphs = {};

    /**
     * Set up a new set of graphs.
     * @public
     *
     * @param {string} groupLabel - The label to use for the group selector.
     * @param {Object.<string, Graph>} graphsByGroup - The Graph objects,
     *        organized by group.
     */
    window.initGraphs = function (groupLabel, graphsByGroup) {
        graphs = graphsByGroup;
        var groupSelector = document.getElementById("group-selector"),
            groupSelectorLabel = document.getElementById("group-selector-label");

        // Label the group selector
        groupSelectorLabel.textContent = groupLabel + ": ";

        // Clear out any previous groups
        while (groupSelector.firstChild) {
            groupSelector.removeChild(groupSelector.firstChild);
        }

        // Add the new groups
        var groups = Object.keys(graphsByGroup);
        groups.sort();
        var defaultGroup = groups[0];
        groups.forEach(function (group) {
            var option = document.createElement("option");
            option.setAttribute("value", group);
            if (group == defaultGroup) option.setAttribute("selected", "selected");
            option.appendChild(document.createTextNode(group));
            groupSelector.appendChild(option);
        });

        // Initialize the D3 content with the default group
        d3Content.setGraph(graphs[defaultGroup]);
    };


    // Set up anything that needs to run when the document is ready
    onReady().then(function () {
        // Set up "toggler" elements
        // (elements that toggle the visibility of another element when clicked)
        d3.selectAll(".toggler").on("click", function (d) {
            d3.event.preventDefault();
            var id = this.getAttribute("data-show-id"),
                elem = document.getElementById(id);
            if (elem) {
                var style = getComputedStyle(elem, null),
                    hidden = style.getPropertyValue("display") == "none";
                elem.style.display = hidden ? "block" : "none";
            }
        });

        // Set up changing groups (graphs)
        var groupSelector = document.getElementById("group-selector");
        groupSelector.addEventListener("change", function (event) {
            // Switch to the Graph represented by the currently selected group
            if (graphs.hasOwnProperty(this.value)) {
                d3Content.setGraph(graphs[this.value]);
            }
        }, false);
    });
})();
