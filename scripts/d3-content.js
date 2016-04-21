var MY_TEST_DATA = {
    "kitchen": {
        title: "Kitchen",
        children: ["kitchen2", "stovetop", "bathroom"],
        data: {
            latitude: 5,
            longitude: 20
        }
    },
    "kitchen2": {
        title: "Kitchen 2",
        children: ["stovetop"]
    },
    "stovetop": {
        title: "Stovetop"
    },
    "bathroom": {
        title: "Bathroom"
    },
    "store": {
        title: "Store",
        children: ["bathroom"]
    }
};



(function () {
    var root = MY_TEST_DATA;
    var nodes = getNodes(root);

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
     * Class representing a node in our graph.
     * @constructor
     */
    function Node(key, obj, nodesByKey) {
        this.id = this.key = key;
        this.title = obj.title;
        this.data = obj.data;
        this.childrenKeys = obj.children || [];

        this.nodesByKey = nodesByKey;
        this.childrenVisible = true;
    }

    /**
     * Get link objects for each child of this Node.
     */
    Node.prototype.getChildLinks = function () {
        if (!this.childrenVisible) {
            return [];
        }

        var sourceNode = this,
            nodesByKey = this.nodesByKey;

        return this.childrenKeys.map(function (childKey) {
            return {
                source: sourceNode,
                target: nodesByKey[childKey]
            };
        });
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
     * Transform a tree structure of nodes into an array of Node objects.
     */
    function getNodes(root) {
        var nodes = [];
        var nodesByKey = {};

        var key, obj, node;
        for (key in root) if (root.hasOwnProperty(key)) {
            obj = root[key];
            node = new Node(key, obj, nodesByKey);
            nodesByKey[key] = node;
            nodes.push(node);
        }

        return nodes;
    }


    /**
     * Create an array of links between nodes from an array of Node objects.
     */
    function getLinks(nodes) {
        return nodes.reduce(function (prev, node) {
            return prev.concat(node.getChildLinks());
        }, []);
    }


    /**
     * Update the D3 visualization.
     */
    function update() {
        var links = getLinks(nodes);

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
            .append("line")
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
            .attr("r", 35)
            .style("fill", color);

        g.append("text")
            .style("text-anchor", "middle")
            .text(function (d) { return d.title; });
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
        if (d.childrenKeys.length == 0) {
            return "#fd8d3c";
        } else if (d.childrenVisible) {
            return "#c6dbef";
        } else {
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
        // Start
        resize();
        update();
    }, false);

    window.addEventListener("resize", function () {
        resize();
        update();
    }, false);
})();

