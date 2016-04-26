(function () {
    window.addEventListener("load", function (event) {
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
    }, false);
})();
