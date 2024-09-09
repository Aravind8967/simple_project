// editing =========================

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
// =================================================================

async function add_company_to_watchlist(user_id) {
    let search_box = document.getElementById("search-box");
    let company_name = search_box.value;
    let url = `http://127.0.0.1:300/home/${user_id}/${company_name}`;
    search_box.value = '';
    
    let response = await fetch(url);
    
    if (response.ok) {
        let db_data = await response.json();
        let watchlist_items = document.getElementById('watchlist_items');
        watchlist_items.innerHTML = ''; // Clear existing items

        if (db_data.watchlist.length > 0) {
            db_data.watchlist.forEach((company) => {
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
                
                // Append both divs to the row
                watchlistRow.appendChild(companyNameDiv);
                watchlistRow.appendChild(sharePriceDiv);

                // Append the row to the watchlist items
                watchlist_items.appendChild(watchlistRow);
            });
        } else {
            // Display a message if the watchlist is empty
            let emptyMessage = document.createElement('p');
            emptyMessage.classList.add('text-center');
            emptyMessage.textContent = 'Add company';
            watchlist_items.appendChild(emptyMessage);
        }
    } else {
        console.log("Unknown error");
    }
}

async function clear_watchlist(user_id) {
    let url = `/delete_alldata_by_user/${user_id}`;
    let response = await fetch(url);
    
    if (response.ok) {
        let data = await response.json();
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


// =================================================================

async function add_company(user_id) {
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
                row.id = `c_row_${index+1}`
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td c_name="${company.c_name}">${company.c_name}</td>
                    <td c_symbol="${company.c_symbol}">${company.c_symbol}</td>
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


async function get_all_data() {
    let url = "http://127.0.0.1:300/get_all_data"
}

function home(id){
    window.location.href = `/home/${id}`
}