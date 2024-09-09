// Load the Google Charts package
google.charts.load('current', { packages: ['corechart'] });

// Set a callback function to run when the package is loaded
google.charts.setOnLoadCallback(drawChart);

// Callback function to create and draw the chart
function drawChart() {
    // Define the chart data
    var data = google.visualization.arrayToDataTable([
        ['Galaxy', 'Distance', 'Brightness'],
        ['Canis Major Dwarf', 8000, 23.3],
        ['Sagittarius Dwarf', 24000, 4.5],
        ['Ursa Major II Dwarf', 30000, 14.3],
        ['Lg. Magellanic Cloud', 50000, 0.9],
        ['Bootes I', 60000, 13.1]
      ]);

    // Define the chart options with enhanced styling
    const options = {
        title: 'Company Performance',
        titleTextStyle: {
            color: '#ffffff',
            fontSize: 18,
            bold: true
        },
        chartArea: { 
            width: '60%', 
            backgroundColor: '#2c2c2c'  // Chart area background
        },
        hAxis: {
            title: 'Total Amount',
            minValue: 0,
            textStyle: { color: '#ffffff' },
            titleTextStyle: { color: '#ffffff' },
            gridlines: { color: '#555555' } // Light gridlines
        },
        vAxis: {
            title: 'Year',
            textStyle: { color: '#ffffff' },
            titleTextStyle: { color: '#ffffff' },
            gridlines: { color: '#555555' } // Light gridlines
        },
        legend: {
            position: 'top',
            textStyle: { color: '#ffffff' }
        },
        bars: 'horizontal', 
        backgroundColor: '#333333', // Overall chart background
        colors: ['#4caf50', '#f44336'], // Custom colors for bars
    };

    // Create and draw the chart
    const chart = new google.visualization.BarChart(document.getElementById('bar-chart'));
    chart.draw(data, options);
}
