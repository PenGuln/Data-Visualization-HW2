/**
 * dataProcessor.js
 * Responsible for loading and processing temperature data
 */

// Module for handling data loading and processing
const DataProcessor = (function() {
    // Month names for reference
    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Number of days in each month (non-leap year)
    const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Year range
    let START_YEAR = document.getElementById('level2')? 2008 : 1997;
    let END_YEAR = 2017;

    /**
     * Try to load CSV file, fall back to sample data if not found
     * @param {Function} callback - Function to call with processed data
     */
    function loadData(callback) {
        try {
            fetch('temperature_daily.csv')
                .then(response => {
                    return response.text();
                })
                .then(text => {
                    parseCSV(text, callback);
                });
        } catch (err) {
            console.log("Error reading file, using sample data");
        }
    }

    /**
     * Parse CSV data and process it
     * @param {string} csvText - Raw CSV text content
     * @param {Function} callback - Function to call with processed data
     */
    function parseCSV(csvText, callback) {
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(results) {
                const processedData = processRawData(results.data);
                callback(processedData);
            },
            error: function(error) {
                console.error('Error parsing CSV:', error);
            }
        });
    }

    /**
     * Process raw data to organize by year, month, and day
     * @param {Array} rawData - Raw data from CSV
     * @returns {Object} Processed data organized by year, month, and day
     */

    function processRawData(rawData) {
        // First organize data by year, month, and day
        const organizedData = {};
        const dailyData = {};
        const monthlyAverages = {};
        
        // Initialize data structures
        for (let year = START_YEAR; year <= END_YEAR; year++) {
            organizedData[year] = {};
            monthlyAverages[year] = {};
            
            for (let month = 0; month < 12; month++) {
                organizedData[year][month] = {
                    days: [],
                    maxTemps: [],
                    minTemps: []
                };
                monthlyAverages[year][month] = {
                    avgMax: null,
                    avgMin: null
                };
            }
        }

        // Process each row from the CSV
        rawData.forEach(row => {
            if (row.date && row.max_temperature !== undefined && row.min_temperature !== undefined) {
                const parts = row.date.split('-');
                const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                const year = date.getFullYear();
                const month = date.getMonth();
                const day = date.getDate();

                // Only include data within our target year range
                if (year < START_YEAR || year > END_YEAR) return;
                
                // Convert temperature values
                const maxTemp = typeof row.max_temperature === 'string' 
                    ? parseFloat(row.max_temperature) 
                    : row.max_temperature;
                    
                const minTemp = typeof row.min_temperature === 'string' 
                    ? parseFloat(row.min_temperature) 
                    : row.min_temperature;
                
                // Store data by day for each month/year
                if (!organizedData[year][month].days.includes(day)) {
                    organizedData[year][month].days.push(day);
                }
                
                // Create key for daily data lookup
                const dateKey = `${year}-${month+1}-${day}`;
                dailyData[dateKey] = {
                    maxTemp: maxTemp,
                    minTemp: minTemp
                };
                
                // Add to arrays for calculating monthly averages
                organizedData[year][month].maxTemps.push(maxTemp);
                organizedData[year][month].minTemps.push(minTemp);
            }
        });

        // Calculate monthly averages and prepare data for visualization
        const yearMonthData = [];
        
        for (let year = START_YEAR; year <= END_YEAR; year++) {
            for (let month = 0; month < 12; month++) {
                const monthData = organizedData[year][month];
                
                // Calculate monthly summary
                const avgMax = monthData.maxTemps.length > 0 ? Math.max(...monthData.maxTemps) : null;
                const avgMin = monthData.minTemps.length > 0 ? Math.min(...monthData.minTemps) : null;
                
                // Keep one decimal place
                monthlyAverages[year][month] = {
                    avgMax: avgMax !== null ? Math.round(avgMax * 10) / 10 : null,
                    avgMin: avgMin !== null ? Math.round(avgMin * 10) / 10 : null
                };
                
                // Prepare daily data
                const daysInMonth = DAYS_IN_MONTH[month];
                const dailyTemps = [];
                
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateKey = `${year}-${month+1}-${day}`;
                    if (dailyData[dateKey]) {
                        dailyTemps.push({
                            day: day,
                            maxTemp: dailyData[dateKey].maxTemp,
                            minTemp: dailyData[dateKey].minTemp
                        });
                    } else {
                        // Fill missing days with null values
                        dailyTemps.push({
                            day: day,
                            maxTemp: null,
                            minTemp: null
                        });
                    }
                }
                
                // Add entry for this year/month
                yearMonthData.push({
                    year: year,
                    month: month,
                    monthName: MONTHS[month],
                    avgMax: monthlyAverages[year][month].avgMax,
                    avgMin: monthlyAverages[year][month].avgMin,
                    dailyTemps: dailyTemps
                });
            }
        }

        return {
            years: Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i),
            months: MONTHS,
            data: yearMonthData
        };
    }

    // Expose public methods and constants
    return {
        loadData: loadData,
        MONTHS: MONTHS,
        DAYS_IN_MONTH: DAYS_IN_MONTH,
        START_YEAR: START_YEAR,
        END_YEAR: END_YEAR
    };
})();