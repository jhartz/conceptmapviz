// Anonymous function to encapsulate D3 initialization
(function () {
    // The main D3 Force layout
    var force = d3.layout.force()
        .charge(-500)
        .linkDistance(90)
        .on("tick", tick);

    // The svg element into which everything goes
    var svg = d3.select("#d3-content").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    // References to the links and nodes in the svg element
    var svgLinks = svg.selectAll(".link"),
        svgNodes = svg.selectAll(".node");


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
        svgLinks.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

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

    // Toggle children on click
    function click(d) {
        if (!d3.event.defaultPrevented) {
            d.childrenVisible = !d.childrenVisible;
            update();
        }
    }


    window.addEventListener("load", function () {
        graph.init(MY_TEST_DATA);
        resize();
        update();
    }, false);

    window.addEventListener("resize", function () {
        resize();
    }, false);
})();

