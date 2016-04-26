// Object to hold all exported functions from this file
var d3Content = {};

// Anonymous function to encapsulate D3 initialization
(function () {
    // Handlers for when an element is clicked
    var clickHandlers = [];

    // The main D3 Force layout
    var force = d3.layout.force()
        .charge(-500)
        .linkDistance(250)
        .on("tick", tick);

    // The svg element into which everything goes
    var svg = d3.select("#d3-content").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    // References to the links and nodes in the svg element
    var svgLinks = svg.selectAll(".link"),
        svgNodes = svg.selectAll(".node");

    // Define arrow markers for graph links
    svg.append("svg:defs")
        .append("svg:marker")
        .attr("id", "end-arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 6)
        .attr("markerWidth", 3)
        .attr("markerHeight", 3)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#000");

    svg.append("svg:defs")
        .append("svg:marker")
        .attr("id", "start-arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 4)
        .attr("markerWidth", 3)
        .attr("markerHeight", 3)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M10,-5L0,0L10,5")
        .attr("fill", "#000");


    /**
     * Register a new click handler.
     *
     * @public
     */
    d3Content.registerClickHandler = function (callback) {
        if (!callback) return false;
        clickHandlers.push(callback);
        return true;
    };

    /**
     * Remove a registered click handler.
     *
     * @public
     */
    d3Content.unregisterClickHandler = function (callback) {
        var index = clickHandlers.indexOf(callback);
        if (index == -1) return false;
        clickHandlers.splice(index, 1);
        return true;
    };


    /**
     * Handle resizing of the force layout to fit its parent size.
     */
    function resize() {
        var width = document.getElementById("d3-content").clientWidth;
        var height = document.getElementById("d3-content").clientHeight;
        force.size([width, height]);
    }


    /**
     * Update the D3 visualization.
     */
    function update() {
        var graphData = graph.get();
        var nodes = graphData.nodes,
            links = graphData.links;

        // Restart the force layout
        force
            .nodes(nodes)
            .links(links)
            .start();

        // Update the links
        svgLinks = svgLinks.data(links);

        // Exit any old links
        svgLinks.exit().remove();

        // Enter any new links
        svgLinks.enter()
            .insert("line", ".node")
            .attr("class", "link")
            .style("marker-end", "url(#end-arrow)")
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        // Update the nodes
        svgNodes = svgNodes.data(nodes);

        // Exit any old nodes
        svgNodes.exit().remove();

        // Enter any new nodes
        var g = svgNodes.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .on("dblclick", dblclick)
            .on("click", click)
            .call(force.drag);

        g.append("circle")
            .attr("r", 35);

        g.append("text")
            .style("text-anchor", "middle")
            .text(function (d) { return d.title; });

        // Update all nodes
        svgNodes.select("circle").style("fill", color);
    }

    function tick() {
        // Update positions of links
        //svgLinks.attr("x1", function(d) { return d.source.x; })
        //    .attr("y1", function(d) { return d.source.y; })
        //    .attr("x2", function(d) { return d.target.x; })
        //    .attr("y2", function(d) { return d.target.y; });
        svgLinks.each(function (d) {
            var deltaX = d.target.x - d.source.x,
                deltaY = d.target.y - d.source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                //sourcePadding = d.left ? 17 : 12,
                //targetPadding = d.right ? 17 : 12,
                sourcePadding = 35,
                targetPadding = 38,
                sourceX = d.source.x + (sourcePadding * normX),
                sourceY = d.source.y + (sourcePadding * normY),
                targetX = d.target.x - (targetPadding * normX),
                targetY = d.target.y - (targetPadding * normY);

            this.setAttribute("x1", sourceX);
            this.setAttribute("y1", sourceY);
            this.setAttribute("x2", targetX);
            this.setAttribute("y2", targetY);
        });

        // Update positions of nodes
        svgNodes.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }

    // Color leaf nodes orange, and packages white or blue
    function color(d) {
        if (d.isRoot) {
            // Root node
            return "#fd8d3c";
        } else if (d.childrenVisible || d.childrenKeys.length == 0) {
            // Visible children or no children
            return "#c6dbef";
        } else {
            // Hidden children
            return "#3182bd";
        }
    }

    var clickTimeouts = [];

    // Run click handlers on click
    function click(d) {
        if (!d3.event.defaultPrevented) {
            var elem = this;
            var index = -1 + clickTimeouts.push(setTimeout(function () {
                clickTimeouts.splice(index, 1);

                var needsUpdate = false;
                clickHandlers.forEach(function (handler) {
                    needsUpdate = handler(d, elem) || needsUpdate;
                });
                if (needsUpdate) update();
            }, 300));
        }
    }

    // Toggle children on double-click
    function dblclick(d) {
        if (!d3.event.defaultPrevented) {
            while (clickTimeouts.length) {
                clearTimeout(clickTimeouts.pop());
            }

            d.childrenVisible = !d.childrenVisible;
            update();
        }
    }


    onReady(function () {
        graph.init(MY_TEST_DATA);
        resize();
        update();
    });

    window.addEventListener("resize", function () {
        resize();
    }, false);
})();

