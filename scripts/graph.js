// Object to hold all exported functions from this file
var graph = {};

// Anonymous function to encapsulate private data and functions
(function () {
    // The nodes that we have created
    var _nodesByKey = {};
    var _nodes = [];
    var _rootKeys = [];

    /**
     * Class representing a node in our graph.
     *
     * @constructor
     */
    function Node(key, obj) {
        this.id = this.key = key;

        obj = obj || {};
        this.isRoot = !!obj.root;
        this.title = obj.title || key;
        this.data = obj.data;
        this.childrenKeys = obj.children || [];
        this.childrenVisible = true;
    }


    /**
     * Transform a tree structure of nodes into Node objects.
     *
     * @public
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
     *
     * @public
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
     *
     * @public
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

