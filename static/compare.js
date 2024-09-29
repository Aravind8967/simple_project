document.addEventListener('DOMContentLoaded', compare_btn);


async function add_company_to_compare(u_id) {
    let search_box = document.getElementById('portfolio_search-box');
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
        recived_data = await response.json()
        load_compare(u_id);
        console.log(recived_data);
    }
    else{
        console.log('unknown error');
    }
}

async function delete_compare_company(c_symbol, u_id) {
    let url = `http://127.0.0.1:300/${u_id}/${c_symbol}/remove_from_compare`;
    let response = await fetch(url, {method:'DELETE'});
    if(response.ok){
        let data = await response.json();
        if (data['status'] == 200){
            load_compare(u_id);
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
    if(responce.ok){
        let c_data = await responce.json()
        return c_data
    }
    else{
        return "unknown error"
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

async function get_c_details() {
    let c_symbol_list = await companies_list(); // Fetch list of companies
    let company_data_promises = c_symbol_list.map(async (company) => {
        let company_data = await yfinance_data(company);
        return { company, company_data };
    });

    // Use Promise.all to wait for all promises concurrently
    let company_data_array = await Promise.all(company_data_promises);

    // Create a dictionary with the company name as the key
    let companies_data = {};
    for (let { company, company_data } of company_data_array) {
        companies_data[company] = company_data;
    }
    return companies_data;
}


async function prepare_chart_data(companies_data) {
    console.log('calling prepare chart data function')
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
        debt_list
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
        operating_cashflow_list
    } = await prepare_chart_data(companies_data);

    // Call the chart functions with the data
    revenue_compare_chart(c_symbol_list, year_list, revenue_list, net_income_list);
    eps_compare_chart(c_symbol_list, year_list, eps_list);
    roe_compare_chart(c_symbol_list, year_list, roe_list);
    asset_compare_chart(c_symbol_list, year_list, asset_list, liabilities_list);
    cashflow_compare_chart(c_symbol_list, year_list, operating_cashflow_list, revenue_list);
    pe_compare_chart(c_symbol_list, pe_list);
}

async function compare_btn() {
    console.log('you clicked compare button');
    let companies_data = await get_c_details();
    console.log('calling generate chart function');
    let generate_chart = await generate_charts(companies_data);
}



// ================================== Compare charts =====================================
async function revenue_compare_chart(c_symbol_list, year_list, revenue_list, net_income_list){
    console.log('Calling revenue compare chart function');
    console.log({
        'year_list' : year_list,
        'revenue_list': revenue_list,
        'net_income_list' : net_income_list
    })

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
    console.log('calling eps compare chart function');
    console.log({
        'c_symbol_list' : c_symbol_list,
        'year_list' : year_list,
        'eps_list' : eps_list
    });
    
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
    console.log('calling roe compare chart function')
    console.log({'c_symbol_list' : c_symbol_list,
                'year_list' : year_list, 
                'roe_list' : roe_list
            });
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
    console.log('calling asset compare chart function')
    console.log({'c_symbol_list' : c_symbol_list,
                 'year_list' : year_list, 
                 'assets_list' : assets_list, 
                 'liabilities_list' : liabilities_list
                });
    
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
    console.log('calling cashflow compare chart function');
    console.log({'c_symbol_list' : c_symbol_list, 
                 'year_list' : year_list, 
                 'operating_cashflow_list' : operating_cashflow_list,
                 'revenue_list' : revenue_list});

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
    console.log('calling debt compare chart function')
    console.log(c_symbol_list, pe_list)
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


