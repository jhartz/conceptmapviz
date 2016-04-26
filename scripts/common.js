/**
 * Register a new DOMContentLoaded (page load) handler.
 */
function onReady(callback) {
    window.addEventListener("DOMContentLoaded", callback, false);
}

// Anonymous function to encapsulate private data and functions
(function () {
    onReady(function () {
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
    });
})();
