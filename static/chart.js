google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(finance_charts);

export function technical_indicator(indicator_data){
    let summary = document.getElementById('summary');
    let rsi = document.getElementById('rsi');
    let adx = document.getElementById('adx');
    let momentum = document.getElementById('momentum');
    let macd = document.getElementById('macd');
    let bbp = document.getElementById('bbp');
    
    // let summary = indicator_data['summary'];
    // let rsi = indicator_data['rsi'];
    // let adx = indicator_data['adx'];
    // let momentum = indicator_data['momentum'];
    // let macd = indicator_data['macd'];
    // let bbp = indicator_data['bbp'];
    if (indicator_data['summary'] == 'BUY'){
        summary.src = bull;
    }
    else if(indicator_data['summary'] == 'SELL'){
        summary.src = bear;
    }
    else{
        summary.src = nutral;
    }

    if (indicator_data['rsi'] == 'BUY'){
        rsi.src = bull;
    }
    else if(indicator_data['rsi'] == 'SELL'){
        rsi.src = bear;
    }
    else{
        rsi.src = nutral;
    }

    if (indicator_data['adx'] == 'BUY'){
        adx.src = bull;
    }
    else if(indicator_data['adx'] == 'SELL'){
        adx.src = bear;
    }
    else{
        adx.src = nutral;
    }

    if (indicator_data['momentum'] == 'BUY'){
        momentum.src = bull;
    }
    else if(indicator_data['momentum'] == 'SELL'){
        momentum.src = bear;
    }
    else{
        momentum.src = nutral;
    }

    if (indicator_data['macd'] == 'BUY'){
        macd.src = bull;
    }
    else if(indicator_data['macd'] == 'SELL'){
        macd.src = bear;
    }
    else{
        macd.src = nutral;
    }

    if (indicator_data['bbp'] == 'BUY'){
        bbp.src = bull;
    }
    else if(indicator_data['bbp'] == 'SELL'){
        bbp.src = bear;
    }
    else{
        bbp.src = nutral;
    }
}

export function technical_chart(c_name, share_price_arr, line_data){
    console.log({'data from chart.js' : {'share' : share_price_arr, 'line_data' : line_data}})
    const chartOptions = {
        layout: {
            textColor: 'white',
            background: { type: 'solid', color: 'black' },
        },
    };

    const chart_id = document.getElementById('technical_chart');
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

    const areaSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
    }); 

    // Map your data to the format expected by the chart
    const formattedData_line = share_price_arr.map(item => ({
        time: item.time,         // Ensure time is in 'YYYY-MM-DD' format
        value: item.share_price, // Use 'share_price' for value
    }));

    let fifty2_low = line_data['52week_low'];
    let fifty2_high = line_data['52week_high'];
    let support1 = line_data['support1'];
    let support2 = line_data['support2'];
    let support3 = line_data['support3'];
    let resistance1 = line_data['resistance1'];
    let resistance2 = line_data['resistance2'];
    let resistance3 = line_data['resistance3'];

    // Set the data for the area series
    areaSeries.setData(formattedData_line);
    const symbolName = c_name;

    const fifty2_low_line = {
        price: fifty2_low,
        color: 'rgb(0, 255, 255)',
        lineWidth: 2,
        lineStyle: 0, 
        axisLabelVisible: true,
        title: '52 weeks Low'
    };

    const fifty2_high_line = {
        price: fifty2_high,
        color: 'rgb(237, 235, 97)',
        lineWidth: 2,
        lineStyle: 0, 
        axisLabelVisible: true,
        title: '52 weeks High'
    };

    const support1_line = {
        price: support1,
        color: 'rgb(0, 255, 00)',
        lineWidth: 2,
        lineStyle: 4, 
        axisLabelVisible: true,
        title: '1st Support'
    }

    const support2_line = {
        price: support2,
        color: 'rgb(0, 255, 00)',
        lineWidth: 2,
        lineStyle: 2, 
        axisLabelVisible: true,
        title: '2nd Support'
    }
    const support3_line = {
        price: support3,
        color: 'rgb(0, 255, 00)',
        lineWidth: 2,
        lineStyle: 3, 
        axisLabelVisible: true,
        title: '3nd Support'
    }
    
    const resistance1_line = {
        price: resistance1,
        color: 'rgb(255, 0, 00)',
        lineWidth: 2,
        lineStyle: 4, 
        axisLabelVisible: true,
        title: '1st Resistance'
    }
    
    const resistance2_line = {
        price: resistance2,
        color: 'rgb(255, 0, 00)',
        lineWidth: 2,
        lineStyle: 2, 
        axisLabelVisible: true,
        title: '2nd Resistance'
    }
    
    const resistance3_line = {
        price: resistance3,
        color: 'rgb(255, 0, 00)',
        lineWidth: 2,
        lineStyle: 3, 
        axisLabelVisible: true,
        title: '3nd Resistance'
    }

    areaSeries.createPriceLine(fifty2_high_line);
    areaSeries.createPriceLine(fifty2_low_line);
    areaSeries.createPriceLine(support1_line);
    areaSeries.createPriceLine(support2_line);
    areaSeries.createPriceLine(support3_line);
    areaSeries.createPriceLine(resistance1_line);
    areaSeries.createPriceLine(resistance2_line);
    areaSeries.createPriceLine(resistance3_line);

    // Create legend
    const container = document.getElementById('technical_chart');
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

    const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: '', // set as an overlay by setting a blank priceScaleId
        // set the positioning of the volume series
        scaleMargins: {
            top: 0.7, // highest point of the series will be 70% away from the top
            bottom: 0,
        },
    });
    volumeSeries.priceScale().applyOptions({
        scaleMargins: {
            top: 0.7, // highest point of the series will be 70% away from the top
            bottom: 0,
        },
    });

    // Map your data to the format expected by the chart
    const formattedData_line = data.map(item => ({
        time: item.time,         // Ensure time is in 'YYYY-MM-DD' format
        value: item.share_price, // Use 'share_price' for value
    }));
    const formattedData_volume = data.map(item => ({
        time: item.time,         // Ensure time is in 'YYYY-MM-DD' format
        value: item.volume, // Use 'share_price' for value
        color: 'rgb(0, 179, 179)',
    }));

    // Set the data for the area series
    areaSeries.setData(formattedData_line);
    volumeSeries.setData(formattedData_volume);
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

export async function finance_charts(company_symbol){
    if(company_symbol == undefined){
        console.log('undefined error')
        return 0
    }
    else{
        let url = `/get/${company_symbol}/yfinance_data`;
        let responce = await fetch(url, {method:'GET'});
        console.log(company_symbol);
        if (responce.ok){
            let yfinance_data = await responce.json();
            let dates = yfinance_data.dates;
            let revenue = yfinance_data.revenue;
            let net_income = yfinance_data.net_income;
    
            let total_assets = yfinance_data.total_assets;
            let total_liabilities = yfinance_data.total_liabilities;
            let total_debt = yfinance_data.total_debt;
    
            let cash_equivalents = yfinance_data.cash_equivalents;
            let free_cashflow = yfinance_data.free_cashflow;
    
            let eps = yfinance_data.eps;
            let roe = yfinance_data.roe;
    
            let holding = yfinance_data.holding;
    
            revenue_chart(company_symbol,dates, revenue, net_income);
            asset_liability(company_symbol, dates, total_assets, total_liabilities, total_debt);
            cashflow(company_symbol, dates, cash_equivalents, free_cashflow, total_debt);
            eps_pm(company_symbol, dates, eps, roe)
            share_holding(company_symbol, holding)
        }
        else{
            console.log('data not found')
        }
    }
}

export function share_holding(company_symbol, holding){
    let ownership = ['Promotor', 'FII/DII', 'Public'];
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Ownership');
    data.addColumn('number', 'Holding');

    for (let i = 0; i < ownership.length; i++){
        data.addRow([
            ownership[i],
            holding[i]
        ]);
    };

    let options = {
        title: `${company_symbol}'s Ownership`,
        titleTextStyle: {
            color: 'white',  // Change the axis title color (red here)
            fontSize: 15
        },
        legend: { 
            position: 'bottom',
            textStyle: {
                color: 'white'
            }
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,         // Reduces space on the left (adjust value as needed)
            right: 10,        // Reduces space on the right (adjust value as needed)
            top: 50,          // Adjust the top margin (for title)
            bottom: 50,       // Adjust space at the bottom
            width: '100%',     // Adjust the chart width within the container
            height: '100%'     // Adjust the chart height within the container
        }
    }
    var chart = new google.visualization.PieChart(document.getElementById('shareholding_chart'));
    chart.draw(data, options);
}


export function eps_pm(company_symbol, dates, eps, roe){
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');    // X-axis: Dates
    data.addColumn('number', 'EPS'); // Y-axis: Revenue
    data.addColumn('number', 'ROE');
    data.addColumn({role: 'style'});

    for (let i = 0; i < dates.length; i++) {
        data.addRow([
            dates[i], 
            eps[i], 
            roe[i],
            'opacity: 0.7'                              // bar's transparency
        ]);
    }
    let options = {
        title: `${company_symbol}'s EPS And ROE`,
        titleTextStyle: {
            color: 'white',  // Change the axis title color (red here)
            fontSize: 15
        },
        vAxis: {
            gridlines: { color: 'none' },
            format: 'short',
            textStyle: {
                color: 'white'
            }
        },
        hAxis: {
            gridlines: { color: 'white' },
            textStyle: {
                color: 'white'
            }
        },
        lineWidth:5,
        colors: ['rgb(255, 163, 26)', 'rgb(62, 178, 36)'],
        curveType: 'function',
        legend: { 
            position: 'bottom',
            textStyle: {
                color: 'white'
            }
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,         // Reduces space on the left (adjust value as needed)
            right: 10,        // Reduces space on the right (adjust value as needed)
            top: 50,          // Adjust the top margin (for title)
            bottom: 50,       // Adjust space at the bottom
            width: '80%',     // Adjust the chart width within the container
            height: '70%'     // Adjust the chart height within the container
        }
    };
    var chart_anual = new google.visualization.LineChart(document.getElementById("eps_pm_chart_annual"));
    chart_anual.draw(data, options);
}

export function cashflow(company_symbol, dates, cash_equivalents, free_cashflow, total_debt){
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');    // X-axis: Dates
    data.addColumn('number', 'Debt'); // Y-axis: Revenue
    data.addColumn('number', 'Free Cashflow');
    data.addColumn('number', 'Cash Equivalents');
    data.addColumn('number', 'Debt/Free Cash Ratio');
    data.addColumn({role: 'style'});

    // Populate the data table with your arrays
    for (let i = 0; i < dates.length; i++) {
        data.addRow([
            dates[i], 
            total_debt[i],
            free_cashflow[i],
            cash_equivalents[i],
            ((100 * free_cashflow[i]) / total_debt[i]),
            'opacity: 0.7'
        ]);
    }

    console.log(data);
    let options = {
        title: `${company_symbol} Cashflow`,
        titleTextStyle: {
            color: 'white',
            fontSize: 15
        },
        vAxis: {
            gridlines: { color: 'none' },
            format: 'short',
            textStyle: {
                color: 'white'
            }
        },
        hAxis: {
            gridlines: { color: 'white' },
            textStyle: {
                color: 'white'
            }
        },
        colors: ['rgb(255, 51, 0)', 'rgb(62, 178, 36)', 'rgb(255, 255, 0)', 'rgb(255, 163, 26)'],
        curveType: 'function',
        legend: { 
            position: 'bottom',
            textStyle: {
                color: 'white'
            }
        },
        seriesType: 'bars',
        series: {
            3: {type: 'line', targetAxisIndex: 1, lineWidth:5}
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,         // Reduces space on the left (adjust value as needed)
            right: 10,        // Reduces space on the right (adjust value as needed)
            top: 50,          // Adjust the top margin (for title)
            bottom: 50,       // Adjust space at the bottom
            width: '80%',     // Adjust the chart width within the container
            height: '70%'     // Adjust the chart height within the container
        }
    };
    var chart_annual = new google.visualization.ComboChart(document.getElementById("cashflow_chart_annual"));
    chart_annual.draw(data, options);
}

export function revenue_chart(company_symbol, dates, revenue, net_income){
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');    // X-axis: Dates
    data.addColumn('number', 'Revenue'); // Y-axis: Revenue
    data.addColumn('number', 'Net income');
    data.addColumn('number', 'Revenue/Net-income Ratio');
    data.addColumn({role: 'style'});
    // Populate the data table with your arrays
    for (let i = 0; i < dates.length; i++) {
        data.addRow([
            dates[i], 
            revenue[i], 
            net_income[i], 
            ((100 * net_income[i]) / revenue[i]),       // profitability ratio
            'opacity: 0.7'                              // bar's transparency
        ]);
    }

    // Set chart options
    let options = {
        title: `${company_symbol} Revenue / Net Income`,
        titleTextStyle: {
            color: 'white',  // Change the axis title color (red here)
            fontSize: 15
        },
        vAxis: {
            gridlines: { color: 'none' },
            format: 'short',
            textStyle: {
                color: 'white'
            }
        },
        hAxis: {
            gridlines: { color: 'white' },
            textStyle: {
                color: 'white'
            }
        },
        colors: ['rgb(50, 70, 184)', 'rgb(62, 178, 36)', 'rgb(255, 255, 0)'],
        curveType: 'function',
        legend: { 
            position: 'bottom',
            textStyle: {
                color: 'white'
            }
        },
        seriesType: 'bars',
        series: {
            2: {type: 'line', targetAxisIndex: 1, lineWidth:5}
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,         // Reduces space on the left (adjust value as needed)
            right: 10,        // Reduces space on the right (adjust value as needed)
            top: 50,          // Adjust the top margin (for title)
            bottom: 50,       // Adjust space at the bottom
            width: '80%',     // Adjust the chart width within the container
            height: '70%'     // Adjust the chart height within the container
        }
    };
    var chart_anual = new google.visualization.ComboChart(document.getElementById("revenue_chart_anual"));
    chart_anual.draw(data, options);
}

export function asset_liability(company_symbol, dates, total_assets, total_liabilities, total_debt){
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');    // X-axis: Dates
    data.addColumn('number', 'Total Assets'); // Y-axis: Revenue
    data.addColumn('number', 'Total Liabilities');
    data.addColumn('number', 'Total Debt');
    data.addColumn('number', 'Asset/Liability Ratio');
    data.addColumn('number', 'Asset/debt Ratio');
    data.addColumn({role: 'style'});

    for (let i = 0; i < dates.length; i++) {
        data.addRow([
            dates[i], 
            total_assets[i], 
            total_liabilities[i],
            total_debt[i],
            ((100 * total_liabilities[i]) / total_assets[i]),       // profitability ratio
            ((100 * total_debt[i]) / total_assets[i]),       // profitability ratio
            'opacity: 0.7'                              // bar's transparency
        ]);
    };

    let options = {
        title: `${company_symbol} Assets And Liabilities`,
        titleTextStyle: {
            color: 'white',  // Change the axis title color (red here)
            fontSize: 15
        },
        vAxis: {
            gridlines: { color: 'none' },
            format: 'short',
            textStyle: {
                color: 'white'
            }
        },
        hAxis: {
            gridlines: { color: 'white' },
            textStyle: {
                color: 'white'
            }
        },
        // colors: [ Assets      |      Liabilities    |        Debt      |   Asset/liabilities  | Assets/debt]
        colors: ['rgb(0, 128, 0)', 'rgb(255, 255, 51)', 'rgb(255, 51, 0)', 'rgb(255, 255, 0)', 'rgb(255, 0, 0)'],
        curveType: 'function',
        legend: { 
            position: 'bottom',
            textStyle: {
                color: 'white'
            }
        },
        seriesType: 'bars',
        series: {
            3: {type: 'line', targetAxisIndex: 1, lineWidth:5},
            4: {type: 'line', targetAxisIndex: 1, lineWidth:5}
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,         // Reduces space on the left (adjust value as needed)
            right: 10,        // Reduces space on the right (adjust value as needed)
            top: 50,          // Adjust the top margin (for title)
            bottom: 50,       // Adjust space at the bottom
            width: '80%',     // Adjust the chart width within the container
            height: '70%'     // Adjust the chart height within the container
        }
    };
    var chart_anual = new google.visualization.ComboChart(document.getElementById("assets_liability_chart_annual"));
    chart_anual.draw(data, options);
}