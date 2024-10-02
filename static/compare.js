document.addEventListener('DOMContentLoaded', function(){
    const user_id = document.getElementById('u_id').textContent.trim();
    compare_btn(user_id);
});


async function add_company_to_compare(u_id) {
    try{
        $('#loading').show();
        let search_box = document.getElementById('portfolio_search-box');
        let rowCount = $('#holding_items .holding_row').length;
        if (rowCount <= 3){
            let c_name = search_box.value;
            search_box.value = '';
            data = {
                'c_name' : c_name
            }
            let url = `http://127.0.0.1:300/${u_id}/add_to_compare`
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if(response.ok){
                let recived_data = await response.json()
                if(recived_data['status'] == 404){
                    alert('company already present in compare list')
                }
                else{
                    load_compare(u_id);
                    location.reload(true);
                }
            }
            else{
                console.log('unknown error');
            }
        }
        else{
            alert("Only 4 companies can compare at a time");
        }
    }
    finally{
        $('#loading').hide();
    }
}

async function delete_compare_company(c_symbol, u_id) {
    let url = `http://127.0.0.1:300/${u_id}/${c_symbol}/remove_from_compare`;
    let response = await fetch(url, {method:'DELETE'});
    if(response.ok){
        let data = await response.json();
        if (data['status'] == 200){
            load_compare(u_id);
            location.reload(true);
        }
        else{
            console.log('database connection error');
        }
    }
    else{
        console.log('Unknown error');
    }

}

// function to help load compare list without refreshing the page
async function load_compare(u_id) {
    let url = `http://127.0.0.1:300/${u_id}/load_compare`;
    let response = await fetch(url, { method: 'GET' });
    
    if (response.ok) {
        let data = await response.json();
        let compare_items = document.getElementById('holding_items');
        compare_items.innerHTML = '';  // Clear any existing items
        
        if (data.compare.length > 0) {
            data.compare.forEach(async (company) => {
                let s_price = await share_price(company.c_symbol);
                let company_row = `
                    <div class="holding_row"  style="width: 25rem; float: left;">
                        <div class="row">
                            <div class="holding_company">
                                <div class="row">
                                    <div class="col-sm-6" id="c_symbol">
                                        <p>${ company.c_symbol }</p>
                                    </div>
                                    <div class="col" id="share_price">
                                        <p>${s_price}</p>
                                    </div>
                                    <div class="col">
                                        <button class="holding_del_btn" onclick="delete_compare_company('${company.c_symbol}', '${u_id}')">
                                            <span class="material-symbols-outlined">
                                                delete
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                // Append the company row to the compare_items container
                compare_items.insertAdjacentHTML('beforeend', company_row);
            });
        } else {
            let empty_msg = document.createElement('p');
            empty_msg.classList.add('text-center');
            empty_msg.textContent = 'Add company';
            compare_items.appendChild(empty_msg);
        }
    } else {
        console.log('unknown error');
    }
}

// ==================== getting chart data ================================
async function yfinance_data(c_symbol) {
    let url = `/get/${c_symbol}/yfinance_data`;
    let responce = await fetch(url, {method:'GET'});
    if(responce.status == 500){
        return null
    }
    else if(responce.ok){
        let c_data = await responce.json()
        return c_data
    }
    else{
        console.log('Unknown error');
        return null;
    }
}

async function companies_list () {
    let holding_items = document.getElementById('holding_items');
    let rows = holding_items.getElementsByClassName('holding_row');
    let c_symbol_list = []
    let c_symbol_list_promise = Array.from(rows).map(async (row) => {
        let c_symbol = row.querySelector('.holding_company p').innerText.trim();
        c_symbol_list.push(c_symbol);
    });
    await Promise.all(c_symbol_list_promise)
    return c_symbol_list
}

async function compare_share_price_arr(c_symbol, period) {
    let url = `/get/${c_symbol}/${period}/share_price_period_arr`;
    let response = await fetch(url, {method:'GET'})
    if (response.ok){
        let share_price = await response.json();
        return share_price.shareprice_arr
    }
    else{
        console.log('Unknown error');
    }
}

async function get_c_details(u_id) {
    let c_symbol_list = await companies_list(); // Fetch list of companies
    let company_data_promises = c_symbol_list.map(async (company) => {
        let company_data = await yfinance_data(company);
        if(company_data == null){
            await delete_compare_company(company, u_id);
            alert(`${company}'s Financial data not found so removing from list`);
            location.reload(true)
        }
        else{
            company_data['share_price_arr'] = await compare_share_price_arr(company, '1y');        
            return { company, company_data };
        }
    });
    let company_data_array = await Promise.all(company_data_promises);
    let companies_data = {};
    for (let { company, company_data } of company_data_array) {
        companies_data[company] = company_data;
    }
    return companies_data;
}


async function prepare_chart_data(companies_data) {
    let c_symbol_list = Object.keys(companies_data);
    let year_list = companies_data[c_symbol_list[0]]['dates']; // Assuming all companies have the same date list

    let revenue_list = c_symbol_list.map(company => companies_data[company]['revenue']);
    let net_income_list = c_symbol_list.map(company => companies_data[company]['net_income']);
    let eps_list = c_symbol_list.map(company => companies_data[company]['eps']);
    let roe_list = c_symbol_list.map(company => companies_data[company]['roe']);
    let pe_list = c_symbol_list.map(company => companies_data[company]['pe']);
    let asset_list = c_symbol_list.map(company => companies_data[company]['total_assets']);
    let liabilities_list = c_symbol_list.map(company => companies_data[company]['total_liabilities']);
    let free_cashflow_list = c_symbol_list.map(company => companies_data[company]['free_cashflow']);
    let operating_cashflow_list = c_symbol_list.map(company => companies_data[company]['operating_cashflow']);
    let debt_list = c_symbol_list.map(company => companies_data[company]['total_debt']);
    let share_price_arr_list = c_symbol_list.map(company => companies_data[company]['share_price_arr']);

    return {
        c_symbol_list,
        year_list,
        revenue_list,
        net_income_list,
        eps_list,
        roe_list,
        pe_list,
        asset_list,
        liabilities_list,
        free_cashflow_list,
        operating_cashflow_list,
        debt_list,
        share_price_arr_list
    };
}


async function generate_charts(companies_data) {
    // Prepare the data for the charts
    let {
        c_symbol_list,
        year_list,
        revenue_list,
        net_income_list,
        eps_list,
        roe_list,
        pe_list,
        asset_list,
        liabilities_list,
        operating_cashflow_list,
        share_price_arr_list
    } = await prepare_chart_data(companies_data);

    // Call the chart functions with the data
    revenue_compare_chart(c_symbol_list, year_list, revenue_list, net_income_list);
    eps_compare_chart(c_symbol_list, year_list, eps_list);
    roe_compare_chart(c_symbol_list, year_list, roe_list);
    asset_compare_chart(c_symbol_list, year_list, asset_list, liabilities_list);
    cashflow_compare_chart(c_symbol_list, year_list, operating_cashflow_list, revenue_list);
    pe_compare_chart(c_symbol_list, pe_list);
    shareprice_comparison_chart(c_symbol_list, share_price_arr_list)
}

async function compare_btn(u_id) {
    try{
        $('#loading').show();
        let companies_data = await get_c_details(u_id);
        console.log(companies_data);
        let generate_chart = await generate_charts(companies_data);
    }
    finally{
        $('#loading').hide();
    }
}



// ================================== Compare charts =====================================
async function revenue_compare_chart(c_symbol_list, year_list, revenue_list, net_income_list){
    function adjest_array_length(arr, length){
        while (arr.length < length){
            arr.unshift(0)
        }
        return arr
    }
    revenue_list = revenue_list.map(arr => adjest_array_length(arr, year_list.length));
    net_income_list = net_income_list.map(arr => adjest_array_length(arr, year_list.length));

    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    for (let company of c_symbol_list) {
        data.addColumn('number', `${company} Profit %`);
    }
    for (let year = 0; year < year_list.length; year++) {
        let row = [year_list[year]]; // Start each row with the year
        
        // For each company, calculate the revenue/net income ratio and add it to the row
        for (let c_symbol = 0; c_symbol < c_symbol_list.length; c_symbol++) {
            let profit_percent = (100 * net_income_list[c_symbol][year]) / revenue_list[c_symbol][year];
            row.push(profit_percent);
        }

        // Add the row to the data table
        data.addRow(row);
    }

    // Chart options
    let options = {
        title: 'Profit margin in %',
        titleTextStyle: {
            color: 'white',
            fontSize: 15
        },
        vAxis: {
            title: '--- Profit Margin in % --->',
            titleTextStyle: { color: 'white' },
            gridlines: { color: 'none' }, // No gridlines
            textStyle: { color: 'white' }
        },
        hAxis: {
            title: '---- Year ---->',
            titleTextStyle: { color: 'white' },
            textStyle: { color: 'white' },
            gridlines: { color: 'transparent' } // No gridlines
        },
        lineWidth: 5,
        curveType: 'function',
        legend: {
            position: 'bottom',
            textStyle: { color: 'white' }
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,
            right: 10,
            top: 50,
            bottom: 50,
            width: '80%',
            height: '70%'
        },

        // Tooltip to show all data points in one tooltip on hover
        tooltip: {
            isHtml: true,  // Enable HTML tooltips for more customization
            trigger: 'focus'  // Show the tooltip for all companies when hovering over a single year
        },

        // Focus on column data, no crosshair lines
        focusTarget: 'category', // This shows all data for a year when hovering over that year

        // Column width increase
        pointSize: 7, // Make points slightly larger
        interpolateNulls: true  // For smooth lines even if there's missing data
    };

    // Create and draw the chart
    var chart_anual = new google.visualization.LineChart(document.getElementById("revenue_compare_chart"));
    chart_anual.draw(data, options);
}

async function eps_compare_chart(c_symbol_list, year_list, eps_list) {
    function adjest_array_length(arr, length){
        while (arr.length < length){
            arr.unshift(0)
        }
        return arr
    }
    eps_list = eps_list.map(arr => adjest_array_length(arr, year_list.length));
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    for(let company of c_symbol_list){
        data.addColumn('number', `${company} EPS`)
    }
    for(let year = 0; year < year_list.length; year++){
        let row = [year_list[year]];
        for(let c_symbol = 0; c_symbol < c_symbol_list.length; c_symbol++){
            row.push(eps_list[c_symbol][year]);
        }
        data.addRow(row);
    }

    let options = {
        title : 'Earning Per Share in Rs',
        titleTextStyle: {
            color: 'white',
            fontSize:15
        },
        vAxis: {
            title: '----- EPS ----> ',
            titleTextStyle: {color : 'white'},
            gridlines: {color: 'none'},
            textStyle: {color: 'white'}
        },
        hAxis: {
            title: '----- Year ---->',
            titleTextStyle: { color: 'white' },
            textStyle: { color: 'white' },
            gridlines: { color: 'transparent' } // No gridlines
        },
        lineWidth: 5,
        curveType: 'function',
        legend: {
            position: 'bottom',
            textStyle: { color: 'white' }
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,
            right: 10,
            top: 50,
            bottom: 50,
            width: '80%',
            height: '70%'
        },
        tooltip: {
            isHtml: true,  // Enable HTML tooltips for more customization
            trigger: 'focus'  // Show the tooltip for all companies when hovering over a single year
        },

        // Focus on column data, no crosshair lines
        focusTarget: 'category', // This shows all data for a year when hovering over that year

        // Column width increase
        pointSize: 7, // Make points slightly larger
        interpolateNulls: true
    };
    var chart_anual = new google.visualization.LineChart(document.getElementById("eps_compare_chart"));
    chart_anual.draw(data, options);
}

async function roe_compare_chart(c_symbol_list, year_list, roe_list) {
    function adjest_array_length(arr, length){
        while (arr.length < length){
            arr.unshift(0)
        }
        return arr
    }
    roe_list = roe_list.map(arr => adjest_array_length(arr, year_list.length));
    
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    for(let company of c_symbol_list){
        data.addColumn('number', `${company} ROE`)
    }
    for(let year = 0; year < year_list.length; year++){
        let row = [year_list[year]];
        for(let c_symbol = 0; c_symbol < c_symbol_list.length; c_symbol++){
            row.push(roe_list[c_symbol][year]);
        }
        data.addRow(row);
    }

    let options = {
        title : 'Return on Equity Chart',
        titleTextStyle: {
            color: 'white',
            fontSize:15
        },
        vAxis: {
            title: '----- ROE ----> ',
            titleTextStyle: {color : 'white'},
            gridlines: {color: 'none'},
            textStyle: {color: 'white'}
        },
        hAxis: {
            title: '----- Year ---->',
            titleTextStyle: { color: 'white' },
            textStyle: { color: 'white' },
            gridlines: { color: 'transparent' } // No gridlines
        },
        lineWidth: 5,
        curveType: 'function',
        legend: {
            position: 'bottom',
            textStyle: { color: 'white' }
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,
            right: 10,
            top: 50,
            bottom: 50,
            width: '80%',
            height: '70%'
        },
        tooltip: {
            isHtml: true,  // Enable HTML tooltips for more customization
            trigger: 'focus'  // Show the tooltip for all companies when hovering over a single year
        },

        // Focus on column data, no crosshair lines
        focusTarget: 'category', // This shows all data for a year when hovering over that year

        // Column width increase
        pointSize: 7, // Make points slightly larger
        interpolateNulls: true
    };
    var chart_anual = new google.visualization.LineChart(document.getElementById("roe_compare_chart"));
    chart_anual.draw(data, options);

}

async function asset_compare_chart(c_symbol_list, year_list, assets_list, liabilities_list) {  
    function adjest_array_length(arr, length){
        while (arr.length < length){
            arr.unshift(0)
        }
        return arr
    }

    assets_list = assets_list.map(arr => adjest_array_length(arr, year_list.length));
    liabilities_list = liabilities_list.map(arr => adjest_array_length(arr, year_list.length));
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    for (let company of c_symbol_list) {
        data.addColumn('number', `${company} current ratio`);
    }
    for (let year = 0; year < year_list.length; year++) {
        let row = [year_list[year]]; // Start each row with the year
        
        // For each company, calculate the revenue/net income ratio and add it to the row
        for (let c_symbol = 0; c_symbol < c_symbol_list.length; c_symbol++) {
            let asset_liability_ratio = (100 - (100 * liabilities_list[c_symbol][year]) / assets_list[c_symbol][year]);
            row.push(asset_liability_ratio);
        }

        // Add the row to the data table
        data.addRow(row);
    }
    let options = {
        title: 'Asset / Liability Ratio',
        titleTextStyle: {
            color: 'white',
            fontSize: 15
        },
        vAxis: {
            title: '--- Current ratio --->',
            titleTextStyle: { color: 'white' },
            gridlines: { color: 'none' }, // No gridlines
            textStyle: { color: 'white' }
        },
        hAxis: {
            title: '---- Year ---->',
            titleTextStyle: { color: 'white' },
            textStyle: { color: 'white' },
            gridlines: { color: 'transparent' } // No gridlines
        },
        lineWidth: 5,
        curveType: 'function',
        legend: {
            position: 'bottom',
            textStyle: { color: 'white' }
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,
            right: 10,
            top: 50,
            bottom: 50,
            width: '80%',
            height: '70%'
        },

        // Tooltip to show all data points in one tooltip on hover
        tooltip: {
            isHtml: true,  // Enable HTML tooltips for more customization
            trigger: 'focus'  // Show the tooltip for all companies when hovering over a single year
        },

        // Focus on column data, no crosshair lines
        focusTarget: 'category', // This shows all data for a year when hovering over that year

        // Column width increase
        pointSize: 7, // Make points slightly larger
        interpolateNulls: true  // For smooth lines even if there's missing data
    };

    // Create and draw the chart
    var chart_anual = new google.visualization.LineChart(document.getElementById("asset_compare_chart"));
    chart_anual.draw(data, options);
}

async function cashflow_compare_chart(c_symbol_list, year_list, operating_cashflow_list, revenue_list) {
    function adjest_array_length(arr, length){
        while (arr.length < length){
            arr.unshift(0)
        }
        return arr
    }

    operating_cashflow_list = operating_cashflow_list.map(arr => adjest_array_length(arr, year_list.length));
    revenue_list = revenue_list.map(arr => adjest_array_length(arr, year_list.length));
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    for (let company of c_symbol_list) {
        data.addColumn('number', `${company} cashflow margin`);
    }
    for (let year = 0; year < year_list.length; year++) {
        let row = [year_list[year]]; // Start each row with the year
        
        // For each company, calculate the revenue/net income ratio and add it to the row
        for (let c_symbol = 0; c_symbol < c_symbol_list.length; c_symbol++) {
            let operating_cashflow_margin = ((operating_cashflow_list[c_symbol][year] / revenue_list[c_symbol][year])*100);
            row.push(operating_cashflow_margin);
        }

        // Add the row to the data table
        data.addRow(row);
    }
    let options = {
        title: 'Operating Cashflow Margin',
        titleTextStyle: {
            color: 'white',
            fontSize: 15
        },
        vAxis: {
            title: '--- Cashflow margin --->',
            titleTextStyle: { color: 'white' },
            gridlines: { color: 'none' }, // No gridlines
            textStyle: { color: 'white' }
        },
        hAxis: {
            title: '---- Year ---->',
            titleTextStyle: { color: 'white' },
            textStyle: { color: 'white' },
            gridlines: { color: 'transparent' } // No gridlines
        },
        lineWidth: 5,
        curveType: 'function',
        legend: {
            position: 'bottom',
            textStyle: { color: 'white' }
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,
            right: 10,
            top: 50,
            bottom: 50,
            width: '80%',
            height: '70%'
        },

        // Tooltip to show all data points in one tooltip on hover
        tooltip: {
            isHtml: true,  // Enable HTML tooltips for more customization
            trigger: 'focus'  // Show the tooltip for all companies when hovering over a single year
        },

        // Focus on column data, no crosshair lines
        focusTarget: 'category', // This shows all data for a year when hovering over that year

        // Column width increase
        pointSize: 7, // Make points slightly larger
        interpolateNulls: true  // For smooth lines even if there's missing data
    };
    var chart_anual = new google.visualization.LineChart(document.getElementById("cashflow_compare_chart"));
    chart_anual.draw(data, options);

}

async function pe_compare_chart(c_symbol_list, pe_list) {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Company');
    data.addColumn('number', 'PE');
    for(let i = 0; i < c_symbol_list.length; i++){
        data.addRow([
            c_symbol_list[i],
            pe_list[i],
        ]);;
    };
    let options = {
        title: 'Price to Earning (PE) Ratio',
        titleTextStyle: {
            color: 'white',
            fontSize: 15
        },
        vAxis: {
            title: '--- PE Ratio --->',
            titleTextStyle: { color: 'white' },
            gridlines: { color: 'none' }, // No gridlines
            textStyle: { color: 'white' }
        },
        hAxis: {
            title: '---- Year ---->',
            titleTextStyle: { color: 'white' },
            textStyle: { color: 'white' },
            gridlines: { color: 'transparent' } // No gridlines
        },
        lineWidth: 5,
        curveType: 'function',
        legend: {
            position: 'bottom',
            textStyle: { color: 'white' }
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,
            right: 10,
            top: 50,
            bottom: 50,
            width: '80%',
            height: '70%'
        },

        // Tooltip to show all data points in one tooltip on hover
        tooltip: {
            isHtml: true,  // Enable HTML tooltips for more customization
            trigger: 'focus'  // Show the tooltip for all companies when hovering over a single year
        },

        // Focus on column data, no crosshair lines
        focusTarget: 'category', // This shows all data for a year when hovering over that year
        pointSize: 7,
        interpolateNulls: true
    };
    var chart_anual = new google.visualization.ColumnChart(document.getElementById("pe_compare_chart"));
    chart_anual.draw(data, options);
}
async function shareprice_comparison_chart(c_symbol_list, share_price_arr_list) {
    const chart_id = document.getElementById('shareprice_compare_chart');
    chart_id.innerHTML = '';

    // Chart options
    const chartOptions = {
        layout: {
            textColor: 'white',
            background: { type: 'solid', color: 'black' }
        },
        rightPriceScale: {
            scaleMargins: {
                top: 0.4,
                bottom: 0.15,
            },
        },
        crosshair: {
            horzLine: {
                visible: false,
                labelVisible: false,
            },
            vertLine: {
                visible: true,
                style: 0,
                width: 2,
                color: 'rgba(32, 38, 46, 0.1)',
                labelVisible: false,
            }
        },
        grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
        },
    };

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

    // Function to assign a color to each series
    function getColor(index) {
        const colors = ['#2962FF', '#1DE9B6', '#F44336', '#FFC107'];
        return colors[index % colors.length]; // Reuse colors if there are more than 4 companies
    }

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

        // Add price line with the company symbol as label
        const lastPrice = formattedData[formattedData.length - 1].value;
        lineSeries.createPriceLine({
            price: lastPrice,
            color: getColor(i),
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Dotted,
            axisLabelVisible: true,
            title: symbolName,
        });

        // Push the series and symbol to the list
        seriesList.push({ series: lineSeries, symbol: symbolName, color: getColor(i) }); // Store color in seriesList
    }

    // Create and style the tooltip html element
    const toolTipWidth = 150; // Width for tooltip
    const toolTip = document.createElement('div');
    toolTip.style = `width: ${toolTipWidth}px; position: absolute; display: none; padding: 8px; box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000; pointer-events: none; border: 1px solid; border-radius: 4px; font-family: sans-serif;`;
    toolTip.style.background = `rgba(0, 0, 0, 0.75)`;
    toolTip.style.color = 'white';
    chart_id.appendChild(toolTip);

    // Update the tooltip based on crosshair movement
    chart.subscribeCrosshairMove(param => {
        if (
            param.point === undefined ||
            !param.time ||
            param.point.x < 0 ||
            param.point.x > chart_id.clientWidth ||
            param.point.y < 0 ||
            param.point.y > chart_id.clientHeight
        ) {
            toolTip.style.display = 'none';
        } else {
            // Time format is assumed to be YYYY-MM-DD
            const dateStr = param.time;
            toolTip.style.display = 'block';
            let tooltipText = '';

            // Iterate over series to get data at crosshair point
            seriesList.forEach(({ series, symbol, color }) => { // Destructure color from seriesList
                const data = param.seriesData.get(series);
                if (data) {
                    const price = data.value !== undefined ? data.value : data.close;
                    tooltipText += `<div style="color: ${color};">⬤ ${symbol}</div><div style="font-size: 16px; margin: 4px 0px; color: white;">${Math.round(100 * price) / 100}</div>`;
                }
            });

            toolTip.innerHTML = `${tooltipText}<div style="color: white;">${dateStr}</div>`;
            
            // Adjust tooltip position
            let left = param.point.x;
            let top = param.point.y;

            if (left > chart_id.clientWidth - toolTipWidth) {
                left = param.point.x - toolTipWidth;
            }
            if (top > chart_id.clientHeight - 80) { // Adjust height if needed
                top = param.point.y - 80;
            }

            toolTip.style.left = left + 'px';
            toolTip.style.top = top + 'px';
        }
    });

    chart.timeScale().fitContent(); // Fit chart to display all data
}
