async function shareprice_comparison_chart_from_gpt(c_symbol_list, share_price_arr_list) {
    console.log('Called shareprice_comparison_chart function');
    console.log({ 'c_symbol_list': c_symbol_list, 'share_price_arr_list': share_price_arr_list });

    const chartOptions = {
        layout: {
            textColor: 'white',
            background: { type: 'solid', color: 'black' }
        },
        rightPriceScale: {
            mode: LightweightCharts.PriceScaleMode.Percentage, // Set percentage scale
            labelFormatter: value => `${value.toFixed(2)}%`, // Format labels with percentage
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal, // Enable crosshair mode for tracking
        },
        grid: {
            vertLines: { color: '#e0e0e0' },
            horzLines: { color: '#e0e0e0' },
        },
    };

    const chart_id = document.getElementById('shareprice_compare_chart');
    chart_id.innerHTML = ''; // Clear the chart div for re-rendering

    const chart = LightweightCharts.createChart(chart_id, chartOptions);

    // Function to normalize data (convert to percentage)
    function normalizeData(data) {
        const firstValue = data[0].share_price;
        return data.map(item => ({
            time: item.time,
            value: ((item.share_price - firstValue) / firstValue) * 100,
        }));
    }

    // Store all the series for multiple companies
    let seriesList = [];

    // Iterate through each company's symbol and data
    for (let i = 0; i < c_symbol_list.length; i++) {
        const symbolName = c_symbol_list[i];
        const sharePriceData = share_price_arr_list[i];

        // Normalize the data for percentage comparison
        const formattedData = normalizeData(sharePriceData);

        // Create a line series for each company
        const lineSeries = chart.addLineSeries({
            lineWidth: 2,
            color: getColor(i), // Function to assign different colors to each series
            crossHairMarkerVisible: false,
        });

        // Set the data for each line series
        lineSeries.setData(formattedData);
        seriesList.push({ series: lineSeries, symbol: symbolName });
    }

    // Function to assign a color to each series
    function getColor(index) {
        const colors = ['#2962FF', '#1DE9B6', '#F44336', '#FFC107'];
        return colors[index % colors.length]; // Reuse colors if there are more than 4 companies
    }

    // Set up legend for each company
    const container = document.getElementById('shareprice_compare_chart');
    const legend = document.createElement('div');
    legend.style = `position: absolute; left: 12px; top: 12px; z-index: 1; font-size: 14px; font-family: sans-serif; line-height: 18px; font-weight: 300; color: white;`;
    container.appendChild(legend);

    const formatPrice = price => (Math.round(price * 100) / 100).toFixed(2);

    // Set tooltip content with name, date, and price
    const setTooltipHtml = (name, date, price) => {
        legend.innerHTML = `<div style="font-size: 24px; margin: 4px 0px;">${name}</div>
                            <div style="font-size: 22px; margin: 4px 0px;">${price}%</div>
                            <div>${date}</div>`;
    };

    // Update the legend based on crosshair movement
    const updateLegend = param => {
        const validCrosshairPoint = param && param.time !== undefined && param.point.x >= 0 && param.point.y >= 0;

        if (validCrosshairPoint) {
            const time = param.time;

            seriesList.forEach(({ series, symbol }) => {
                const dataPoint = param.seriesData.get(series);
                if (dataPoint) {
                    const price = formatPrice(dataPoint.value);
                    setTooltipHtml(symbol, time, price);
                }
            });
        }
    };

    // Subscribe to crosshair movement for tooltip updates
    chart.subscribeCrosshairMove(updateLegend);
    updateLegend(undefined);

    chart.timeScale().fitContent(); // Fit chart to display all data
}



async function shareprice_comparison_chart_current(c_symbol_list, share_price_arr_list) {
    console.log('called shareprice_comparison_chart function');
    console.log({ 'c_symbol_list': c_symbol_list, 'share_price_arr_list': share_price_arr_list });

    const chartOptions = {
        layout: {
            textColor: 'white',
            background: { type: 'solid', color: 'black' }
        }
    };

    const chart_id = document.getElementById('shareprice_compare_chart');
    chart_id.innerHTML = ''; // Clear the chart div for re-rendering

    const chart = LightweightCharts.createChart(chart_id, chartOptions);

    chart.applyOptions({
        rightPriceScale: {
            scaleMargins: {
                top: 0.4,
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

    // Function to normalize data (convert to percentage)
    function normalizeData(data) {
        const firstValue = data[0].share_price;
        return data.map(item => ({
            time: item.time,
            value: ((item.share_price - firstValue) / firstValue) * 100,
        }));
    }

    // Store all the series for multiple companies
    let seriesList = [];

    // Iterate through each company's symbol and data
    for (let i = 0; i < c_symbol_list.length; i++) {
        const symbolName = c_symbol_list[i];
        const sharePriceData = share_price_arr_list[i];

        // Normalize the data for percentage comparison
        const formattedData = normalizeData(sharePriceData);

        // Create a line series for each company
        const lineSeries = chart.addLineSeries({
            lineWidth: 2,
            color: getColor(i), // Function to assign different colors to each series
            crossHairMarkerVisible: false,
        });

        // Set the data for each line series
        lineSeries.setData(formattedData);
        seriesList.push({ series: lineSeries, symbol: symbolName });
    }

    // Function to assign a color to each series
    function getColor(index) {
        const colors = ['#2962FF', '#1DE9B6', '#F44336', '#FFC107'];
        return colors[index % colors.length]; // Reuse colors if there are more than 4 companies
    }

    // Set up legend for each company
    const container = document.getElementById('shareprice_compare_chart');
    const legend = document.createElement('div');
    legend.style = `position: absolute; left: 12px; top: 12px; z-index: 1; font-size: 14px; font-family: sans-serif; line-height: 18px; font-weight: 300; color: white;`;
    container.appendChild(legend);

    const formatPrice = price => (Math.round(price * 100) / 100).toFixed(2);

    // Set tooltip content with name, date, and price
    const setTooltipHtml = (name, date, price) => {
        legend.innerHTML = `<div style="font-size: 24px; margin: 4px 0px;">${name}</div>
                            <div style="font-size: 22px; margin: 4px 0px;">${price}%</div>
                            <div>${date}</div>`;
    };

    // Update the legend based on crosshair movement
    const updateLegend = param => {
        const validCrosshairPoint = param && param.time !== undefined && param.point.x >= 0 && param.point.y >= 0;

        if (validCrosshairPoint) {
            const time = param.time;

            seriesList.forEach(({ series, symbol }) => {
                const dataPoint = param.seriesData.get(series);
                if (dataPoint) {
                    const price = formatPrice(dataPoint.value);
                    setTooltipHtml(symbol, time, price);
                }
            });
        }
    };

    // Subscribe to crosshair movement for tooltip updates
    chart.subscribeCrosshairMove(updateLegend);
    updateLegend(undefined);

    chart.timeScale().fitContent(); // Fit chart to display all data
}




const y = param.point.y;
let left = param.point.x + toolTipMargin;
if (left > container.clientWidth - toolTipWidth) {
    left = param.point.x - toolTipMargin - toolTipWidth;
}

let top = y + toolTipMargin;
if (top > container.clientHeight - toolTipHeight) {
    top = y - toolTipHeight - toolTipMargin;
}
toolTip.style.left = left + 'px';
toolTip.style.top = top + 'px';