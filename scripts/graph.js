/*
 * Concept Map Visualizer
 * Copyright (c) 2016 Jake Hartz
 * Licensed under the MIT Licence. For more information, see the LICENSE file.
 */


/**
 * Generate an incremental ID.
 */
var nextID = (function () {
    var i = 0;
    return (function () {
        return ++i;
    });
})();


/**
 * Class representing a node in the graph.
 * @constructor
 *
 * @param {string} key - The unique key or ID for this node.
 * @param {Object} obj - The data with this node.
 */
function Node(key, obj) {
    this.id = nextID();
    this.key = key;

    obj = obj || {};
    this.isRoot = !!obj.isRoot;
    this.title = obj.title || key;
    this.data = obj.data || {};
    this.childrenKeys = obj.children || [];
    this.childrenVisible = true;
}

/**
 * Check whether we can reach another Node from this Node through visible
 * children.
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


/**
 * Class representing a Graph created from a tree structure of nodes.
 * @constructor
 *
 * @param {Object.<string, Node|Object>} nodesByID - The Nodes in this graph,
 *        organized by ID. (If an Object is used as one of the properties
 *        instead of a Node, a new Node is automatically constructed for it.)
 */
function Graph(nodesByID) {
    // Reset the nodes
    this._nodesByKey = {};
    this._nodes = [];
    this._rootKeys = [];

    Object.keys(nodesByID).forEach(function (key) {
        var node = nodesByID[key];
        if (!(node instanceof Node)) {
            node = new Node(key, node);
        }

        this._nodesByKey[key] = node;
        this._nodes.push(node);
        if (node.isRoot) this._rootKeys.push(key);
    }, this);
}

/**
 * Get the nodes and the links between nodes in the graph.
 * @public
 *
 * @return {Object} An object with a "nodes" array and a "links" array.
 */
Graph.prototype.get = function () {
    // Only return nodes reachable from a root node
    var visitedKeys = {};
    var nodes = [];
    var links = [];

    var queue = [];
    this._rootKeys.forEach(function (key) {
        queue.push(key);
        visitedKeys[key] = true;
    });

    var currentKey, currentNode;
    while (queue.length > 0) {
        // Get the node at the front of the queue
        currentKey = queue.shift();
        currentNode = this._nodesByKey[currentKey];

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
                    target: this._nodesByKey[childKey]
                });

                // If we haven't visited this child, add it to the queue
                if (!visitedKeys[childKey]) {
                    queue.push(childKey);
                    visitedKeys[childKey] = true;
                }
            }, this);
        }
    }

    return {
        nodes: nodes,
        links: links
    };
};

