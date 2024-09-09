window.logout = logout;
window.delete_profile = delete_profile;
window.home = home;
window.truncate = truncate;
window.search_company = search_company;
window.add_company_to_watchlist = add_company_to_watchlist;
window.clear_watchlist = clear_watchlist;
window.delete_company = delete_company;
window.load_watchlist = load_watchlist;
window.hide_all_section = hide_all_section;
window.chart = chart;
window.technical = technical;

window.addEventListener('DOMContentLoaded', function () {
    // Hide sections by default
    document.getElementById('company_section').style.display = 'none';
    document.getElementById('chart_container').style.display = 'none';
    document.getElementById('finance_charts').style.display = 'none';

    // Check if the watchlist is empty
    const watchlistItems = document.getElementById('watchlist_items');
    const hasCompanies = watchlistItems.querySelectorAll('.watchlist-row').length > 0;

    // If the watchlist is not empty, select the first row
    if (hasCompanies) {
        const firstRow = watchlistItems.querySelector('.watchlist-row');
        firstRow.style.border = '2px solid white';
        firstRow.style.borderRadius = '10px';

        // Trigger click event for the first company
        $(firstRow).trigger('click');
        console.log("first row clicked")
    } else {
        // If the watchlist is empty, set default view
        document.getElementById('chart_container').style.display = 'block';
    }
});

async function truncate () {
    let url = "http://127.0.0.1:300/truncate"
    let responce = await fetch(url)
    console.log(responce.json())
}

async function delete_profile(id) {
    let url = `http://127.0.0.1:300/home/${id}/delete_account`
    let responce = await fetch(url, {method:'DELETE'})
    let data = await responce.json()
    if (data["status"] == 200){
        window.location.href = '/login'
    }
    console.log(data)
}


async function logout() {
    let url = "http://127.0.0.1:300/logout"
    let responce = await fetch(url)
    if (responce.ok){
        window.location.href = "/login"
    }
    else{
        window.location.href = "/page_not_found"
    }
}

async function search_company(user_id) {
    let search_box = document.getElementById("search-box");
    let company_name = search_box.value;
    let url = `http://127.0.0.1:300/home/${user_id}/${company_name}`;
    search_box.value = '';
    let responce = await fetch(url)
    if (responce.ok){
        let db_data = await responce.json()
        let table_body = document.getElementById('watchlist-table-body')
        table_body.innerHTML = ''
        if (db_data.watchlist.length > 0){
            db_data.watchlist.forEach((company, index) => {
                let row = document.createElement('tr')
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${company.c_name}</td>
                    <td>${company.c_symbol}</td>
                    <td>${company.share_price !== null ? company.share_price : 'not found'}</td>
                    
                `
                table_body.appendChild(row)
            })
        }
        else{
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="4" class="text-center">Add company</td>`;
            table_body.appendChild(emptyRow);
        }
    }
    else{
        console.log("Unknown error")
    }
}

async function add_company_to_watchlist(user_id) {
    let search_box = document.getElementById("search-box");
    let company_name = search_box.value;
    let url = `http://127.0.0.1:300/home/${user_id}/${company_name}/add_company`;
    search_box.value = '';

    try {
        let response = await fetch(url);
        if (response.ok) {
            load_watchlist(user_id)
        } 
        else {
            console.log("Unknown error");
            return
        }
    } 
    catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function clear_watchlist(user_id) {
    let url = `/delete_alldata_by_user/${user_id}`;
    let response = await fetch(url);
    
    if (response.ok) {
        let  data = await response.json();
        let watchlist_items = document.getElementById('watchlist_items');
        watchlist_items.innerHTML = ''; // Clear existing items
        
        // Add empty message after clearing
        let emptyMessage = document.createElement('p');
        emptyMessage.classList.add('text-center');
        emptyMessage.textContent = 'Add company';
        watchlist_items.appendChild(emptyMessage);
    } else {
        console.log(response.json());
    }
}

async function delete_company(c_symbol, user_id) {
    console.log("you clicked del button of : ",c_symbol, "user id : ", user_id)
    let url = `http://127.0.0.1:300/${user_id}/${c_symbol}/delete_company`
    let responce = await fetch(url, {method:'DELETE'})
    if (responce.ok){
        load_watchlist(user_id)
    }
    else{
        console.log("unknown error")
    }
}

async function load_watchlist(user_id){
    console.log(user_id);
    let url = `/load_watchlist/${user_id}`
    let responce = await fetch(url, {method:'GET'})
    if (responce.ok){
        let db_data = await responce.json();
        let watchlist_items = document.getElementById('watchlist_items');
        console.log("all data length: ",db_data.data.length);
        watchlist_items.innerHTML = '';
        if (db_data.data.length > 0) {
            db_data.data.forEach((company) => {
                // Create the watchlist row
                let watchlistRow = document.createElement('div');
                watchlistRow.classList.add('watchlist-row');

                // Create company name div
                let companyNameDiv = document.createElement('div');
                companyNameDiv.classList.add('company-name');
                companyNameDiv.innerHTML = `<p>${company.c_symbol}</p>`;

                // Create share price div
                let sharePriceDiv = document.createElement('div');
                sharePriceDiv.classList.add('share-price');
                sharePriceDiv.innerHTML = `<p>${company.share_price !== null ? company.share_price : 'not found'}</p>`;

                // Create delete button
                let deleteButton = document.createElement('button');
                deleteButton.id = 'del_item'
                deleteButton.classList.add('del_item'); // Use class instead of id
                deleteButton.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
                deleteButton.style.display = 'none'; // Initially hide the delete button

                deleteButton.onclick = function(){
                    delete_company(company.c_symbol, user_id)
                }

                // Show delete button on hover
                watchlistRow.addEventListener('mouseover', function() {
                    deleteButton.style.display = 'inline'; // Show the delete button on hover
                });

                watchlistRow.addEventListener('mouseleave', function() {
                    deleteButton.style.display = 'none'; // Hide the delete button when not hovering
                });

                // Append the company name, share price, and delete button to the row
                watchlistRow.appendChild(companyNameDiv);
                watchlistRow.appendChild(sharePriceDiv);
                watchlistRow.appendChild(deleteButton);

                // Append the row to the watchlist items
                watchlist_items.appendChild(watchlistRow);
                return
            });
        } 
        else {
            // Display a message if the watchlist is empty
            let emptyMessage = document.createElement('p');
            emptyMessage.classList.add('text-center');
            emptyMessage.textContent = 'Add company';
            watchlist_items.appendChild(emptyMessage);
            return
        }
    }
    else{
        console.log("data not found in watchlist")
        return
    }
}

function hide_all_section(){
    let chart_container = document.getElementById('chart_container');
    let finance_charts = document.getElementById('finance_charts');
    chart_container.style.display = 'none';
    finance_charts.style.display = 'none';
}

function chart(){
    hide_all_section();
    let chart_container = document.getElementById('chart_container');
    chart_container.style.display = 'block';
}

function technical(){
    hide_all_section();
    let finance_charts = document.getElementById('finance_charts');
    finance_charts.style.display = 'block';
}


function home(id){
    window.location.href = `/home/${id}`
}
