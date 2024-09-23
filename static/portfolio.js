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
    console.log(data);
    let url = `http://127.0.0.1:300/${u_id}/add_to_portfolio`
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok){
        recived_data = await response.json();
        load_holding(u_id);
        console.log(recived_data);
    }
    else{
        console.log('unknown error');
    }

}
async function load_holding(u_id) {
    let url = `http://127.0.0.1:300/${u_id}/load_holding`;
    let response = await fetch(url, { method: 'GET' });
    
    if (response.ok) {
        let data = await response.json();
        let holding_items = document.getElementById('holding_items');
        holding_items.innerHTML = '';  // Clear any existing items
        
        if (data.holding.length > 0) {
            data.holding.forEach((company) => {
                let company_row = `
                    <div class="holding_row">
                        <div class="row">
                            <div class="holding_company">
                                <p>${company.c_symbol}</p><br>
                            </div>
                            <div class="row">
                                <div class="col-sm-5">
                                    <label id="holding_quantity_label" for="quantity">Qut : </label>
                                    <input id="holding_quantity" name="quantity" type="number" value="${company.quantity}">.No
                                </div>
                                <div class="col-sm-5" style="float: right;">
                                    <label id="bought_price_label" for="bought_price">Bought : </label>
                                    <input id="bought_price" name="bought_price" type="number" value="${company.bought_price}">.Rs
                                </div>
                            </div>
                        </div>
                        <button id="del_item" onclick="delete_company('${company.c_symbol}', '${u_id}')">
                            <span class="material-symbols-outlined">
                                delete
                            </span>
                        </button>
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
