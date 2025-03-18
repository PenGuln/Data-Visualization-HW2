/**
 * heatmap.js
 * Responsible for rendering the heatmap with mini line charts
 */

// Module for heatmap creation and rendering
const Heatmap = (function() {
    // Private variables
    let svg;                // Main SVG element
    let tooltip;            // Tooltip div element
    let data = [];          // Temperature data
    let colorScale;         // D3 color scale
    let dimensions;         // Chart dimensions
    let years = [];         // Array of years
    let months = [];        // Array of months
    let currentView = 'max'; // 'max', 'min'
    let enableMiniChart = document.getElementById('level2');    // Whether to draw mini-chart

    /**
     * Initialize the heatmap visualization
     * @param {string} selector - CSS selector for the container
     * @param {Object} dims - Object with width, height, and margins
     */
    function initialize(selector, dims) {
        dimensions = dims;
        
        // Create SVG container
        svg = d3.select(selector)
            .append("svg")
            .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
            .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
            .append("g")
            .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);

        // Create tooltip
        tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip");

        // Define color scale - reversed domain for better visual mapping
        colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRdYlBu)
            .domain([40, 0]); // Higher values are red/purple, lower are yellow
    }

    /**
     * Update the heatmap with new data
     * @param {Object} processedData - Processed temperature data
     */
    function update(processedData) {
        years = processedData.years;
        months = processedData.months;
        data = processedData.data;
        render();
    }

    /**
     * Render or re-render the heatmap visualization
     */
    function render() {
        // Clear previous elements
        svg.selectAll("*").remove();
        
        // Set up scales for the heatmap grid
        const x = d3.scaleBand()
            .range([0, dimensions.width])
            .domain(years)
            .padding(0.1);
            
        const y = d3.scaleBand()
            .range([0, dimensions.height])
            .domain(d3.range(12)) // 12 months
            .padding(0.1);
        
        // Add X axis (years)
        svg.append("g")
            .attr("transform", `translate(0,${dimensions.height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .style("text-anchor", "middle");
        
        // Add Y axis (months)
        svg.append("g")
            .call(d3.axisLeft(y)
                .tickFormat(d => months[d])
                .tickSizeOuter(0));
        
        // Create cells with mini charts
        const cells = svg.selectAll(".cell-group")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "cell-group")
            .attr("transform", d => {
                return `translate(${x(d.year)},${y(d.month)})`;
            });
        
        // Add background rectangles (colored by avg temp)
        cells.append("rect")
            .attr("class", "heatmap-cell")
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => {
                const value = currentView === 'min' ? d.avgMin : d.avgMax;
                return value !== null ? colorScale(value) : "#f0f0f0";
            })
            .on("mouseover", function(event, d) {
                handleMouseOver(event, d);
            })
            .on("mouseout", function() {
                handleMouseOut();
            });
        
        // Add mini line charts to each cell
        if (enableMiniChart) {
            cells.each(function(d) {
                const cell = d3.select(this);
                
                // Dimensions for the mini chart (slightly smaller than cell)
                const chartWidth = x.bandwidth() - 4;
                const chartHeight = y.bandwidth() - 4;
                
                // Create scales for this mini chart
                const scales = MiniChart.createScales(d.dailyTemps, chartWidth, chartHeight);
                
                // Create a nested g element for the chart positioned within the cell
                const chartContainer = cell.append("g")
                    .attr("transform", `translate(2, 2)`);
                
                // Draw the mini chart
                MiniChart.drawMiniChart(chartContainer, d, scales, chartWidth, chartHeight);
            });
        }
        
    }

    /**
     * Handle mouse over event on heatmap cells
     * @param {Event} event - Mouse event
     * @param {Object} d - Data point
     */
    function handleMouseOver(event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
            
        tooltip.html(`
            <div class="tooltip-title">${d.monthName} ${d.year}</div>
            <div>Max: ${d.avgMax !== null ? d.avgMax.toFixed(1) + "°C" : "N/A"}</div>
            <div>Min: ${d.avgMin !== null ? d.avgMin.toFixed(1) + "°C" : "N/A"}</div>
        `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    /**
     * Handle mouse out event on heatmap cells
     */
    function handleMouseOut() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    /**
     * Set the current view and redraw
     * @param {string} view - View type ('max', 'min', or 'both')
     */
    function setView(view) {
        currentView = view
        render();
    }

    /**
     * Get the current color scale
     * @returns {Function} D3 color scale function
     */
    function getColorScale() {
        return colorScale;
    }

    // Expose public methods
    return {
        initialize: initialize,
        update: update,
        setView: setView,
        getColorScale: getColorScale
    };
})();