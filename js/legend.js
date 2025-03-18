/**
 * legend.js
 * Responsible for rendering the color legend for the heatmap
 */

// Module for legend creation and rendering
const Legend = (function() {
    // Private variables
    let legendSvg;   // SVG element for legend
    let dimensions;  // Legend dimensions
    
    /**
     * Initialize the legend
     * @param {string} selector - CSS selector for the container
     * @param {Object} dims - Object with width and height
     */
    function initialize(selector, dims) {
        dimensions = dims;
        
        // Create legend SVG
        legendSvg = d3.select(selector)
            .append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);
    }
    
    /**
     * Render the color legend
     * @param {Function} colorScale - D3 color scale to visualize
     */
    function render(colorScale) {
        // Clear previous elements
        legendSvg.selectAll("*").remove();
        
        // Legend title
        legendSvg.append("text")
            .attr("class", "legend-title")
            .attr("x", dimensions.margin.left)
            .attr("y", 20)
            .attr("text-anchor", "start")
            .text("Temperature (°C)");
        
        // Define temperature range for legend
        const tempRange = [0, 5, 10, 15, 20, 25, 30, 35, 40];
        const legendBarWidth = dimensions.width - (dimensions.margin.left + dimensions.margin.right);
        const legendBarHeight = 20;
        const legendX = dimensions.margin.left;
        const legendY = 30;
        
        // Calculate step width for each segment
        const stepWidth = legendBarWidth / (tempRange.length - 1);
        
        // Create color gradient rectangles
        for (let i = 0; i < tempRange.length - 1; i++) {
            legendSvg.append("rect")
                .attr("x", legendX + i * stepWidth)
                .attr("y", legendY)
                .attr("width", stepWidth)
                .attr("height", legendBarHeight)
                .style("fill", colorScale(tempRange[i]));
        }
        
        // Add ticks and labels
        tempRange.forEach((temp, i) => {
            // Tick marks
            legendSvg.append("line")
                .attr("x1", legendX + i * stepWidth)
                .attr("y1", legendY + legendBarHeight)
                .attr("x2", legendX + i * stepWidth)
                .attr("y2", legendY + legendBarHeight + 5)
                .style("stroke", "black")
                .style("stroke-width", 1);
                
            // Temperature labels
            legendSvg.append("text")
                .attr("x", legendX + i * stepWidth)
                .attr("y", legendY + legendBarHeight + 20)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .text(temp);
        });
    }
    
    // Expose public methods
    return {
        initialize: initialize,
        render: render
    };
})();