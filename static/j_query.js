import { chart_function, finance_charts } from "./chart.js";
import { section_selection } from "./index.js";

window.chart_function = chart_function;
window.get_c_data = get_c_data;   
window.chart_function = chart_function;
window.share_price_arr = share_price_arr;
window.get_c_data = get_c_data;  
window.finance_charts = finance_charts;
window.section_selection = section_selection;
window.company_details = company_details;

// =============== finding compan which is pressed ============================

$(document).ready(function() {
    $('#watchlist_items').on('click', '.watchlist-row', async function() {
        $('.watchlist-row').css({'border':'none'}).hover(function() {
            $(this).css({'border':'2px solid white','border-radius':'10px'});
        }, function() {
            $(this).css({'border':'none'});
        });

        
        // Set border on the clicked row
        $(this).css({'border':'2px solid white','border-radius':'10px'});

        // Extract the company symbol
        let company_symbol = $(this).find('.company-name p').text();

        section_selection('chart', company_symbol)

        if(data === 0) {
            console.log("Unknown error");
        }
    });
});

export async function share_price_arr(c_name) {
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

export async function get_c_data(c_symbol) {
    let url = `http://127.0.0.1:300/${c_symbol}/get_data`;
    let response = await fetch(url);
    
    if (response.ok) {
        let data = await response.json();
        console.log(data)
        // Select elements
        let c_name = document.getElementById('company_name');
        let c_symbol_elem = document.getElementById('company_symbol');
        let share_price = document.getElementById('share_price');
        let change_num_tag = document.getElementById('change_num');
        let change_percent = document.getElementById('change_percent');

        // Update elements with fetched data
        c_name.innerHTML = data.c_name;
        c_symbol_elem.innerHTML = data.c_symbol;
        share_price.innerHTML = data.share_price;
        change_percent.innerHTML = `${data.change_percent} %`;

        // Remove any existing arrow icons to avoid duplicates
        let existingArrow = change_num_tag.querySelector('.material-symbols-outlined');
        if (existingArrow) {
            existingArrow.remove();
        }

        // Create and configure the arrow icon
        let arrowIcon = document.createElement('span');
        arrowIcon.className = 'material-symbols-outlined';
        
        // Check the change value to update styles and add the arrow
        if (data.change_percent <= 0) {
            share_price.style.color = 'red';
            change_percent.style.color = 'red';
            change_num_tag.innerHTML = `${data.change_num}`;
            arrowIcon.textContent = 'keyboard_double_arrow_down'; // Down arrow for negative change
            arrowIcon.style.color = 'red';
            change_num_tag.style.color = 'red';
        } else {
            share_price.style.color = 'rgb(29, 233, 29)';
            change_percent.style.color = 'rgb(29, 233, 29)';
            change_num_tag.innerHTML = `+ ${data.change_num}`;
            arrowIcon.textContent = 'keyboard_double_arrow_up'; // Up arrow for positive change
            arrowIcon.style.color = 'rgb(29, 233, 29)';
            change_num_tag.style.color = 'rgb(29, 233, 29)';
        }

        // Append the arrow icon to the change_num_tag (or change_percent if needed)
        change_num_tag.appendChild(arrowIcon); // Adjust this based on your design
        company_details(data);
        return;
    } else {
        console.log('Unknown error');
        return;
    }
}

function company_details(data){
    let bussiness = document.getElementById('bussiness')
    let marketcap = document.getElementById('marketcap');
    let industry = document.getElementById('industry');
    let sector = document.getElementById('sector');
    let pe = document.getElementById('pe');
    let pb = document.getElementById('pb');
    let eps = document.getElementById('eps');
    let targetprice = document.getElementById('targetprice');
    let fifty2_high_low = document.getElementById('fifty2_high_low');
    let divident_yield = document.getElementById('dividentyield');
    let bookvalue = document.getElementById('bookvalue');
    let earning_growth = document.getElementById('earninggrowth');
    let revenue_growth = document.getElementById('revenuegrowth');
    let total_revenue = document.getElementById('totalrevenue');
    let total_cash = document.getElementById('totalcash');
    let total_debt = document.getElementById('totaldebt')

    bussiness.innerHTML = data.bussiness;
    marketcap.innerHTML = `${data.marketcap} Cr`;
    industry.innerHTML = data.industry;
    industry.innerHTML = data.industry;
    sector.innerHTML = data.sector;
    pe.innerHTML = data.pe;
    pb.innerHTML = data.pb;
    eps.innerHTML = data.eps;
    targetprice.innerHTML = data.targetprice;
    fifty2_high_low.innerHTML = `${data.fifty2_week_high} / ${data.fifty2_week_low}`;
    divident_yield.innerHTML = data.divident_yield;
    bookvalue.innerHTML = data.bookvalue;
    earning_growth.innerHTML = data.earning_growth;
    revenue_growth.innerHTML = data.revenue_growth;
    total_revenue.innerHTML = `${data.total_revenue} Cr`;
    total_cash.innerHTML = `${data.total_cash} Cr`;
    total_debt.innerHTML = `${data.total_debt} Cr`;
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
