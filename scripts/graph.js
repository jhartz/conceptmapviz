/*
 * Concept Map Visualizer
 * Copyright (c) 2016 Jake Hartz
 * Licensed under the MIT Licence. For more information, see the LICENSE file.
 */


// Object to hold all exported functions from this file
var graph = {
    // init
    // get
};


// Anonymous function to encapsulate private data and functions
(function () {
    // The nodes that we have created
    var _nodesByKey = {};
    var _nodes = [];
    var _rootKeys = [];

    /**
     * Class representing a node in our graph.
     * @private
     * @constructor
     *
     * @param {string} key - The key or ID for this node.
     * @param {Object} obj - The data with this node.
     */
    function Node(key, obj) {
        this.id = this.key = key;

        obj = obj || {};
        this.isRoot = !!obj.root;
        this.title = obj.title || key;
        this.data = obj.data || {};
        this.childrenKeys = obj.children || [];
        this.childrenVisible = true;
    }


    /**
     * Transform a tree structure of nodes into Node objects.
     * @public
     *
     * @param {Object} data - Initialize the new graph with a new object full
     *        of data.
     */
    graph.init = function (data) {
        // Reset the nodes
        _nodesByKey = {};
        _nodes = [];
        _rootKeys = [];

        var key, obj, node;
        for (key in data) if (data.hasOwnProperty(key)) {
            obj = data[key];
            node = new Node(key, obj);

            _nodesByKey[key] = node;
            _nodes.push(node);
            if (node.isRoot) _rootKeys.push(key);
        }
    }


    /**
     * Get the nodes and the links between nodes in the graph.
     * @public
     *
     * @return {Object} An object with a "nodes" array and a "links" array.
     */
    graph.get = function () {
        // Only return nodes reachable from a root node
        var visitedKeys = {};
        var nodes = [];
        var links = [];

        var queue = [];
        _rootKeys.forEach(function (key) {
            queue.push(key);
            visitedKeys[key] = true;
        });

        var currentKey, currentNode;
        while (queue.length > 0) {
            // Get the node at the front of the queue
            currentKey = queue.shift();
            currentNode = _nodesByKey[currentKey];

            if (!currentNode) {
                // AHH! Found a key that doesn't correspond to a node!
                throw new Error("Key \"" + currentKey + "\" does not " +
                        "correspond to an existing node!");
            }

            // Add this node to our list
            nodes.push(currentNode);

            // Look at this node's children, if they're visible
            if (currentNode.childrenVisible) {
                currentNode.childrenKeys.forEach(function (childKey) {
                    // Add the parent-child link to the list
                    links.push({
                        source: currentNode,
                        target: _nodesByKey[childKey]
                    });

                    // If we haven't visited this child, add it to the queue
                    if (!visitedKeys[childKey]) {
                        queue.push(childKey);
                        visitedKeys[childKey] = true;
                    }
                });
            }
        }

        return {
            nodes: nodes,
            links: links
        };
    };


    /**
     * Check whether we can reach another Node from this Node through visible
     * children.
     * @public
     *
     * @param {Node} otherNode - The node to compare with.
     * @return {boolean} Whether we can reach otherNode.
     */
    Node.prototype.canReachNode = function (otherNode) {
        // BFS search from this node to the other node
        var queue = [this];
        var visited = {};

        var current, child, i;
        while (queue.length > 0) {
            current = queue.shift();
            if (current == otherNode) {
                return true;
            }
            if (otherNode.childrenVisible) {
                for (i = 0; i < otherNode.childrenKeys.length; i++) {
                    child = _nodesByKey[otherNode.childrenKeys[i]];
                    if (!visited[child]) {
                        queue.push(child);
                        visited[child] = true;
                    }
                }
            }
        }

        return false;
    };
})();

