document.addEventListener('DOMContentLoaded', updateSharePrices);

// ============= portfolio search box section ===================================
function handle_portfolio_search() {
    let query = $('#portfolio_search-box').val();
    if (query.length > 1) {
        $.ajax({
            url: '/search',  // Your Flask route that handles the search
            data: { query: query },
            success: function(data) {
                $('#portfolio_suggestions').empty(); // Clear previous suggestions

                if (data.length > 0) {
                    data.forEach(function(item) {
                        // Append each suggestion as a clickable list item
                        const suggestionItem = $('<li></li>').text(item);
                        suggestionItem.on('click', function() {
                            $('#portfolio_search-box').val(item); // Set input value to clicked suggestion
                            $('#portfolio_suggestions').empty(); // Clear suggestions
                            $('#portfolio_suggestions').hide(); // Hide the dropdown
                        });
                        $('#portfolio_suggestions').append(suggestionItem);
                    });
                    // Show the dropdown if there are suggestions
                    $('#portfolio_suggestions').show();
                } else {
                    // Hide the dropdown if no suggestions
                    $('#portfolio_suggestions').hide();
                }
            },
            error: function() {
                // Handle errors if necessary
                $('#portfolio_suggestions').empty();
                $('#portfolio_suggestions').hide();
            }
        });
    } else {
        $('#portfolio_suggestions').empty(); // Clear suggestions if input is too short
        $('#portfolio_suggestions').hide(); // Hide the dropdown
    }
}

$(document).ready(function(){
    $('#portfolio_search-box').on('input', handle_portfolio_search);

    // Hide suggestions when clicking outside the search box
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.portfolio-search-container').length) {
            $('#portfolio_suggestions').hide();
        }
    });
});

// ==================== Portfolio operation functions =======================================

async function add_company_to_portfolio(u_id) {
    let search_box = document.getElementById('portfolio_search-box');
    let c_name = search_box.value;
    let quantity = document.getElementById('portfolio_quantity');
    let quantity_val = quantity.value
    let bought_price = document.getElementById('portfolio_bought-price');
    let bought_price_val = bought_price.value
    search_box.value = '';
    quantity.value = '';
    bought_price.value = '';
    data = {
        'c_name' : c_name,
        'quantity' : quantity_val,
        'bought_price' : bought_price_val
    }
    let url = `http://127.0.0.1:300/${u_id}/add_to_portfolio`
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok){
        let recived_data = await response.json();
        if (recived_data['status'] == 404){
            alert(recived_data['data'])
        }
        else{
            load_holding(u_id);
            location.reload(true);
        }
    }
    else{
        console.log('unknown error');
    }

}


// function to help load holding list without refreshing the page
async function load_holding(u_id) {
    let url = `http://127.0.0.1:300/${u_id}/load_holding`;
    let response = await fetch(url, { method: 'GET' });
    
    if (response.ok) {
        let data = await response.json();
        let holding_items = document.getElementById('holding_items');
        holding_items.innerHTML = '';  // Clear any existing items
        
        if (data.holding.length > 0) {
            data.holding.forEach(async (company) => {
                let s_price = await share_price(company.c_symbol);
                let company_row = `
                    <div class="holding_row">
                        <div class="row">
                            <div class="holding_company">
                                <div class="row">
                                    <div class="col-sm-6" id="c_symbol">
                                        <p>${ company.c_symbol }</p>
                                    </div>
                                    <div class="col-sm-5" id="share_price">
                                        <p>${s_price}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-5">
                                    <label id="holding_quantity_label" for="quantity">Qut : </label>
                                    <input id="holding_quantity" name="quantity" type="number" value="${ company.quantity }">.No
                                </div>
                                <div class="col-sm-5" style="float: right;">
                                    <label id="bought_price_label" for="bought_price">Bought : </label>
                                    <input id="bought_price" name="bought_price" type="number" value="${ company.bought_price }">.Rs
                                </div>
                                <button class="holding_del_btn" onclick="delete_holding_company('${company.c_symbol}', '${u_id}')">
                                    <span class="material-symbols-outlined">
                                        delete
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                // Append the company row to the holding_items container
                holding_items.insertAdjacentHTML('beforeend', company_row);
            });
        } else {
            let empty_msg = document.createElement('p');
            empty_msg.classList.add('text-center');
            empty_msg.textContent = 'Add company';
            holding_items.appendChild(empty_msg);
        }
    } else {
        console.log('unknown error');
    }
}

async function update_company(u_id, data) {
    let url = `http://127.0.0.1:300/${u_id}/update_holding`
    let response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (response.ok){
        let response_data = await response.json() 
        return response_data
    }
    else{
        console.log('unknown error')
    }
}

async function updateSharePrices() {
    const holdings = document.querySelectorAll('.holding_row');
    for (let holding of holdings) {
        const symbolElement = holding.querySelector('#c_symbol p');
        const priceElement = holding.querySelector('#share_price p');
        const symbol = symbolElement.textContent.trim();

        const sharePrice = await share_price(symbol);
        if (sharePrice !== null) {
            priceElement.textContent = sharePrice;
        } else {
            priceElement.textContent = 'Error';
        }
    }
    await Promise.all(portfoilo_charts())
}

async function share_price(c_symbol) {
    let url = `http://127.0.0.1:300/${c_symbol}/get/share_price`;
    let response = await fetch(url, { method: 'GET' });

    if (response.ok) {
        let data = await response.json();
        return data['share_price'];  // Return the share price directly
    } else {
        console.log('Unknown error');
        return null;  // Return null on error
    }
}

// ========================== jquery for delete button =================================
async function delete_holding_company (c_symbol, u_id){
    let url = `http://127.0.0.1:300/${u_id}/${c_symbol}/remove_from_portfolio`;
    let response = await fetch(url, {method:'DELETE'});
    if(response.ok){
        let data = await response.json();
        if (data['status'] == 200){
            load_holding(u_id);
            location.reload();
        }
        else{
            console.log('database connection error');
        }
    }
    else{
        console.log('Unknown error');
    }
}

$(document).ready(function(){
    // Use event delegation for dynamically added elements
    $('#holding_items').on('mouseover', '.holding_row', function(){
        $(this).find('.holding_del_btn').show(); // Show the delete button only within the hovered row
    });

    $('#holding_items').on('mouseleave', '.holding_row', function(){
        $(this).find('.holding_del_btn').hide(); // Hide the delete button when not hovering
    });
});

// ================== analysis section ================================

async function analysis_btn(u_id) {
    let holding_items = document.getElementById('holding_items');
    let rows = holding_items.getElementsByClassName('holding_row');

    // Create an array of promises to wait for all async operations
    let updatePromises = Array.from(rows).map(async (row) => {
        let c_symbol = row.querySelector('.holding_company p').innerText.trim();
        let quantity = row.querySelector('input[name="quantity"]').value;
        let bought_price = row.querySelector('input[name="bought_price"]').value;

        let update_data = {
            'u_id': u_id,
            'c_symbol': c_symbol,
            'quantity': quantity,
            'bought_price': bought_price
        };

        // Await the update for each company
        let update_status = await update_company(u_id, update_data);
        return update_status;  // Return the status or result from update_company
    });
    await Promise.all(updatePromises);
    let load_updated_data = await load_holding(u_id)
    .then(console.log("loading done"))
    .then(portfoilo_charts(u_id));
}


// =============================== portfolio chart ==================================================

function portfoilo_charts() {
    const holdings = document.querySelectorAll('.holding_row');
    let data = []
    for (let holding of holdings) {
        const symbolElement = holding.querySelector('#c_symbol p');
        const priceElement = holding.querySelector('#share_price p');
        const quantityElement = holding.querySelector('#holding_quantity');
        const bought_priceElement = holding.querySelector('#bought_price');
        const symbol = symbolElement.textContent.trim();
        const share_price = priceElement.textContent.trim();
        const quantity = quantityElement.value;
        const bought_price = bought_priceElement.value;
        data.push({
            'symbol':symbol,
            'share_price' : share_price,
            'quantity' : quantity,
            'bought_price' : bought_price,
            'investment' : quantity * bought_price,
            'current_investment' : quantity * share_price,
        });
    }
    total_holdings(data);
    current_portfolio(data);
    portfolio_contribution(data);
}

function total_holdings(input_data){
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Company');
    data.addColumn('number', 'Investment');
    let test = []
    for(let holding_data of input_data){
        data.addRow([
            holding_data.symbol,
            holding_data.investment
        ]);
    };

    let options = {
        title: `Total Investment`,
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
        pieSliceText: 'label',
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
    var chart = new google.visualization.PieChart(document.getElementById('holdings_bought_chart'));
    chart.draw(data, options)
}

function current_portfolio (input_data) {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Company');
    data.addColumn('number', 'Investment');
    for(let holding_data of input_data){
        data.addRow([
            holding_data.symbol,
            holding_data.current_investment
        ]);
    };

    let options = {
        title: `Total Investment`,
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
        pieSliceText: 'label',
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
    var chart = new google.visualization.PieChart(document.getElementById('holdings_current_chart'));
    chart.draw(data, options)
}

function portfolio_contribution(input_data) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Company');
    data.addColumn('number', 'Profit Percent');
    data.addColumn({ role: 'style' }); // Column for styling

    for (let company_data of input_data) {
        let profit_percent = (((company_data.current_investment - company_data.investment) / company_data.investment) * 100).toFixed(2);
        let data_row = [];

        data_row.push(company_data.symbol);  // Add company symbol
        data_row.push(parseFloat(profit_percent));  // Add the calculated profit percent as a number

        // Add style based on profit percentage
        if (profit_percent <= 0) {
            data_row.push('color: rgb(255, 51, 0); opacity: 0.7'); // Red for loss
        } else {
            data_row.push('color: rgb(51, 204, 51); opacity: 0.7'); // Green for profit
        }

        data.addRow(data_row);  // Add the row to the data table
    }

    // Set chart options
    let options = {
        title: `Profit Contribution by Each Company`,
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
        colors: ['rgb(50, 70, 184)'],
        curveType: 'function',
        legend: {
            position: 'bottom',
            textStyle: {
                color: 'white'
            }
        },
        backgroundColor: 'transparent',
        chartArea: {
            left: 50,
            right: 10,
            top: 50,
            bottom: 50,
            width: '80%',
            height: '70%'
        }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById("profit_contribution_chart"));
    chart.draw(data, options);
}
