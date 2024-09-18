import { chart_function, revenue } from "./chart.js";

window.chart_function = chart_function;
window.revenue = revenue;
window.get_c_data = get_c_data;     

// =============== finding compan which is pressed ============================


$(document).ready(function() {
    $('#watchlist_items').on('click', '.watchlist-row', async function() {
        $('.watchlist-row').css({'border':'none'})
        $('.watchlist-row').hover({'border':'2px solid white','border-radius':'10px'})
        $(this).css({'border':'2px solid white','border-radius':'10px'})
        let company_symbol = $(this).find('.company-name p').text();
        let data = await share_price_arr(company_symbol);
        get_c_data(company_symbol)
        chart_function(company_symbol, data)
        document.getElementById('company_section').style.display = 'block'
        document.getElementById('chart_container').style.display = 'block'
        if(data == 0){
            console.log("Unknown error");
        }
    });
});

async function share_price_arr(c_name) {
    let share_price_arr_url = `http://127.0.0.1:300/home/${c_name}/share_price_arr`;
    let responce = await fetch(share_price_arr_url, {method:'GET'})
    if (responce.ok){
        let row_data = await responce.json()
        return row_data
    }
    else{
        return 0
    }
}

async function get_c_data(c_symbol) {
    let url = `http://127.0.0.1:300/${c_symbol}/get_data`;
    let responce = await fetch(url);
    if (responce.ok){
        let data = await responce.json();
        let c_name = document.getElementById('company_name');
        let c_symbol = document.getElementById('company_symbol');
        let share_price = document.getElementById('share_price');
        let change = document.getElementById('change');
        c_name.innerHTML = data.c_name;
        c_symbol.innerHTML = data.c_symbol;
        share_price.innerHTML = data.share_price;
        change.innerHTML = data.change
        return
    }
    else{
        console.log('unknown error')
        return
    }
}

// ======================== finding the company name in database ================
// for watchlist search bar
function handleSearchInput() {
    let query = $('#search-box').val();
    if (query.length > 1) {
        $.ajax({
            url: '/search',
            data: { query: query },
            success: function(data) {
                $('#suggestions').empty(); // Clear previous suggestions

                if (data.length > 0) {
                    data.forEach(function(item) {
                        // Append each suggestion as a clickable list item
                        const suggestionItem = $('<li></li>').text(item);
                        suggestionItem.on('click', function() {
                            $('#search-box').val(item); // Set input value to clicked suggestion
                            $('#suggestions').empty(); // Clear suggestions
                            $('#suggestions').hide(); // Hide the dropdown
                        });
                        $('#suggestions').append(suggestionItem);
                    });
                    // Show the dropdown if there are suggestions
                    $('#suggestions').show();
                } else {
                    // Hide the dropdown if no suggestions
                    $('#suggestions').hide();
                }
            },
            error: function() {
                // Handle errors if necessary
                $('#suggestions').empty();
                $('#suggestions').hide();
            }
        });
    } else {
        $('#suggestions').empty(); // Clear suggestions if input is too short
        $('#suggestions').hide(); // Hide the dropdown
    }
}

$(document).ready(function(){
    $('#search-box').on('input', handleSearchInput);
    // Hide suggestions when clicking outside the search box
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-container').length) {
            $('#suggestions').hide();
        }
    });
});


// ======================== this is for finding the company form database ==================
// for nave bar
function handleNavSearchInput() {
    let query = $('#nav_search_box').val();
    if (query.length > 1) {
        $.ajax({
            url: '/search',
            data: { query: query },
            success: function(data) {
                $('#navbar-suggestions').empty(); // Clear previous suggestions

                if (data.length > 0) {
                    data.forEach(function(item) {
                        const suggestionItem = $('<li></li>').text(item);
                        suggestionItem.on('click', function() {
                            $('#nav_search_box').val(item);
                            $('#navbar-suggestions').empty();
                            $('#navbar-suggestions').hide();
                        });
                        $('#navbar-suggestions').append(suggestionItem);
                    });
                    $('#navbar-suggestions').show();
                } else {
                    $('#navbar-suggestions').hide();
                }
            },
            error: function() {
                $('#navbar-suggestions').empty();
                $('#navbar-suggestions').hide();
            }
        });
    } else {
        $('#navbar-suggestions').empty();
        $('#navbar-suggestions').hide();
    }
}

$(document).ready(function(){
    $('#nav_search_box').on('input', handleNavSearchInput);
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.d-flex').length) {
            $('#navbar-suggestions').hide();
        }
    });
});



// ==================== delete icon show ===============

$(document).ready(function(){
    $('.watchlist-row').on('mouseover', function(){
        $(this).find('#del_item').show(); // Show the delete button only within the hovered row
    });

    $('.watchlist-row').on('mouseleave', function(){
        $(this).find('#del_item').hide(); // Hide the delete button when not hovering
    });
});
