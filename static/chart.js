google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(revenue)

// =================== Line chart function form home page ===============================
export function chart_function(c_name, data){
    const chartOptions = {
        layout: {
            textColor: 'white',
            background: { type: 'solid', color: 'black' },
        },
    };

    const chart_id = document.getElementById('chart');
    chart_id.innerHTML = ''; // Clear previous chart

    const chart = LightweightCharts.createChart(chart_id, chartOptions);

    chart.applyOptions({
        rightPriceScale: {
            scaleMargins: {
                top: 0.4, // leave some space for the legend
                bottom: 0.15,
            },
        },
        crosshair: {
            horzLine: {
                visible: true,
                labelVisible: false,
            },
        },
        grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
        },
    });

    const areaSeries = chart.addAreaSeries({
        topColor: '#2962FF',
        bottomColor: 'rgba(41, 98, 255, 0.28)',
        lineColor: '#2962FF',
        lineWidth: 2,
        crossHairMarkerVisible: false,
    });

    // Map your data to the format expected by the chart
    const formattedData = data.map(item => ({
        time: item.time,         // Ensure time is in 'YYYY-MM-DD' format
        value: item.share_price, // Use 'share_price' for value
    }));

    // Set the data for the area series
    areaSeries.setData(formattedData);

    const symbolName = c_name;

    // Create legend
    const container = document.getElementById('chart');
    const legend = document.createElement('div');
    legend.style = `position: absolute; left: 12px; top: 12px; z-index: 1; font-size: 14px; font-family: sans-serif; line-height: 18px; font-weight: 300; color: white;`;
    container.appendChild(legend);

    const formatPrice = price => (Math.round(price * 100) / 100).toFixed(2);
    
    const setTooltipHtml = (name, date, price) => {
        legend.innerHTML = `<div style="font-size: 24px; margin: 4px 0px;">${name}</div><div style="font-size: 22px; margin: 4px 0px;">${price}</div><div>${date}</div>`;
    };

    const updateLegend = param => {
        const validCrosshairPoint = param && param.time !== undefined && param.point.x >= 0 && param.point.y >= 0;
        const bar = validCrosshairPoint ? param.seriesData.get(areaSeries) : areaSeries.dataByIndex(areaSeries.data().length - 1);

        if (bar) {
            const time = bar.time; // Ensure 'time' is in 'YYYY-MM-DD'
            const price = bar.value; // Use 'value' directly from formatted data
            const formattedPrice = formatPrice(price);
            setTooltipHtml(symbolName, time, formattedPrice);
        }
    };

    chart.subscribeCrosshairMove(updateLegend);
    updateLegend(undefined);

    chart.timeScale().fitContent();
}


// ======================== finance chart in home page ============================

export function revenue() {
    const data = google.visualization.arrayToDataTable([
        ['Year', 'Sales', 'Expenses'],
        ['2018', 1000, 400],
        ['2019', 1170, 460],
        ['2020', 660, 1120],
        ['2021', 1030, 540]
    ]);

    const options = {
        title: 'Company Performance',
        chartArea: { width: '50%' },
        hAxis: {
            title: 'Total Amount',
            minValue: 0
        },
        vAxis: {
            title: 'Year'
        },
        legend: { position: 'top' },
        bars: 'vertical' // Use 'horizontal' for horizontal bars
    };
    const chart = new google.visualization.BarChart(document.getElementById('bar-chart'));
    chart.draw(data, options);
}