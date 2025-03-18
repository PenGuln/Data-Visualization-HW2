/**
 * miniChart.js
 * Handles creating and rendering mini line charts within heatmap cells
 */

// Module for mini line chart creation and rendering
const MiniChart = (function() {    
    /**
     * Draw a mini line chart inside a cell
     * @param {Object} parent - D3 selection of the parent element
     * @param {Object} data - Data for this cell including dailyTemps array
     * @param {Object} scales - Object with x and y scales
     * @param {number} width - Width of the chart
     * @param {number} height - Height of the chart
     */
    function drawMiniChart(parent, data, scales, width, height) {
        // Create a container for the line chart
        const chart = parent.append('g')
            .attr('class', 'line-chart-container');
        
        // Line generator for maximum temperature
        const lineMax = d3.line()
            .defined(d => d.maxTemp !== null)
            .x(d => scales.x(d.day))
            .y(d => scales.y(d.maxTemp));
            
        // Line generator for minimum temperature
        const lineMin = d3.line()
            .defined(d => d.minTemp !== null)
            .x(d => scales.x(d.day))
            .y(d => scales.y(d.minTemp));
        
        chart.append('path')
            .datum(data.dailyTemps)
            .attr('class', 'line-max')
            .attr('d', lineMax);
    
        chart.append('path')
            .datum(data.dailyTemps)
            .attr('class', 'line-min')
            .attr('d', lineMin);
        
        return chart;
    }
    
    /**
     * Create scales for the mini chart
     * @param {Array} dailyTemps - Array of daily temperature objects
     * @param {number} width - Width of the chart
     * @param {number} height - Height of the chart
     * @param {Object} [domainPadding] - Optional padding for y domain
     * @returns {Object} Object with x and y scales
     */
    function createScales(dailyTemps, width, height, domainPadding = { top: 2, bottom: 2 }) {
        // Create x scale for days
        const x = d3.scaleLinear()
            .domain([1, dailyTemps.length])
            .range([0, width]);
            
        // Determine y scale domain from temperature data
        let minTemp = Infinity;
        let maxTemp = -Infinity;
        
        dailyTemps.forEach(d => {
            if (d.minTemp !== null && d.minTemp < minTemp) minTemp = d.minTemp;
            if (d.maxTemp !== null && d.maxTemp > maxTemp) maxTemp = d.maxTemp;
        });
        
        // Apply padding to domain
        minTemp = Math.floor(minTemp) - domainPadding.bottom;
        maxTemp = Math.ceil(maxTemp) + domainPadding.top;
        
        // Create y scale for temperatures
        const y = d3.scaleLinear()
            .domain([minTemp, maxTemp])
            .range([height, 0]);
            
        return { x, y };
    }

    // Expose public methods
    return {
        drawMiniChart: drawMiniChart,
        createScales: createScales
    };
})();