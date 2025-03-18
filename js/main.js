/**
 * main.js
 * Main application entry point and controller for Level 2 visualization
 */

// Main application controller
(function() {
    // Chart dimensions
    const dimensions = {
        width: 960 - 80 - 25,          // Width minus left/right margins
        height: 600 - 50 - 70,          // Height minus top/bottom margins
        margin: {
            top: 50,
            right: 25,
            bottom: 70,
            left: 100
        }
    };
    
    // Legend dimensions
    const legendDimensions = {
        width: 960,                     // Same as chart width
        height: 100,                    // Fixed height for legend
        margin: {
            left: 100,                  // Match the chart's left margin
            right: 25                   // Match the chart's right margin
        }
    };
    
    /**
     * Initialize the application
     */
    function initialize() {
        // Initialize heatmap
        Heatmap.initialize('#heatmap', dimensions);
        
        // Initialize legend
        Legend.initialize('#legend', legendDimensions);
        
        // Set up button event listeners
        setupEventListeners();
        
        // Load data
        DataProcessor.loadData(dataLoaded);
    }
    
    /**
     * Callback when data is loaded
     * @param {Object} processedData - Processed temperature data
     */
    function dataLoaded(processedData) {
        // Update heatmap with data
        Heatmap.update(processedData);
        
        // Render legend with the color scale from the heatmap
        Legend.render(Heatmap.getColorScale());
    }
    
    /**
     * Set up event listeners for UI controls
     */
    function setupEventListeners() {
        // Max temperature button
        document.getElementById("maxTempBtn").addEventListener("click", function() {
            setView('max');
        });
        
        // Min temperature button
        document.getElementById("minTempBtn").addEventListener("click", function() {
            setView('min');
        });
    }
    
    /**
     * Change the current view and update UI
     * @param {string} view - View type ('max', 'min', or 'both')
     */
    function setView(view) {
        // Update buttons
        document.getElementById("maxTempBtn").className = 
            view === 'max' ? "button active" : "button inactive";
            
        document.getElementById("minTempBtn").className = 
            view === 'min' ? "button active" : "button inactive";
        
        // Update heatmap view
        Heatmap.setView(view);
        
        // Update legend to match current view
        Legend.render(Heatmap.getColorScale());
    }
    
    // Initialize application when the DOM is loaded
    document.addEventListener('DOMContentLoaded', initialize);
})();