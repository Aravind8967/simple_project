import { chart_function, finance_charts } from "./chart.js";
import { section_selection } from "./index.js";

window.chart_function = chart_function;
window.get_c_data = get_c_data;   
window.chart_function = chart_function;
window.share_price_arr = share_price_arr;
window.get_c_data = get_c_data;  
window.finance_charts = finance_charts;
window.section_selection = section_selection;

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
        let val = (data.share_price * data.change)/100
        let change_num = val.toFixed(2);
        // Select elements
        let c_name = document.getElementById('company_name');
        let c_symbol_elem = document.getElementById('company_symbol');
        let share_price = document.getElementById('share_price');
        let change_num_tag = document.getElementById('change_num');
        let change = document.getElementById('change');

        // Update elements with fetched data
        c_name.innerHTML = data.c_name;
        c_symbol_elem.innerHTML = data.c_symbol;
        share_price.innerHTML = data.share_price;
        change_num_tag.innerHTML = change_num;
        change.innerHTML = `${data.change} % `;

        // Create and configure the arrow icon
        let arrowIcon = document.createElement('span');
        arrowIcon.className = 'material-symbols-outlined';

        let change_num_sign = document.createElement('span');
        change_num_sign.className = 'material-symbols-outlined';
        
        // Check the change value to update styles and add the arrow
        if (data.change <= 0) {
            share_price.style.color = 'red';
            change.style.color = 'red';
            arrowIcon.textContent = 'keyboard_double_arrow_down';
            arrowIcon.style.color = 'red';

            change_num_tag.style.color = 'red';
            change_num_sign.textContent = 'remove';
            change_num_sign.style.color = 'red';
        } else {
            share_price.style.color = 'rgb(29, 233, 29)';
            change.style.color = 'rgb(29, 233, 29)';
            arrowIcon.textContent = 'keyboard_double_arrow_up'; // Changed to up arrow if the change is positive
            arrowIcon.style.color = 'rgb(29, 233, 29)';

            change_num_tag.style.color = 'rgb(29, 233, 29)';
            change_num_sign.textContent = 'add';
            change_num_sign.style.color = 'rgb(29, 233, 29)';
        }

        // Ensure there's no duplicate arrow by removing any existing arrow
        const existingArrow = change.querySelector('.material-symbols-outlined');
        if (existingArrow) {
            existingArrow.remove();
        }

        // Append the arrow icon beside the change value
        change.appendChild(arrowIcon);

        return;
    } else {
        console.log('Unknown error');
        return;
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
