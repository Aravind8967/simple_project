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

async function add_company_test(user_id) {
    let company_name = document.getElementById('search_name').value
    let url = `http://127.0.0.1:300/home/${user_id}/${company_name}`
    let responce = await fetch(url)
    if (responce.ok){
        let res = await responce.json()
        let p = document.createElement('p')
        p.textContent = res.data
        document.querySelector('.watchlist-content').appendChild(p)
        document.getElementById('search_name').value = ''
        console.log("data updated")
    }
    else{
        console.log(responce.json())
    }
}

async function add_company(user_id) {
    let company_name = document.getElementById("search_name").value
    let url = `http://127.0.0.1:300/home/${user_id}/${company_name}`
    let responce = await fetch(url)
    console.log(responce)
    if (responce.ok){
        let db_data = await responce.json()
        let table = document.querySelector(".watchlist-content")
        let sl_no = table.rows.length + 1
        let new_row = document.createElement('tr')
        console.log(db_data)
        new_row.innerHTML = `
            <th scope='row'>${sl_no}</th>
            <td>${db_data.c_name}</td>
            <td>${db_data.share_price}</td>
            <td>
                <button class="btn btn-danger">Remove</button>
            </td>
        `
        table.appendChild(new_row)
        console.log(new_row)
        document.getElementById('search_name').value = ''
    }
    else{
        console.log("unknown error")
    }
}

async function get_all_data() {
    let url = "http://127.0.0.1:300/get_all_data"
}

function home(id){
    window.location.href = `/home/${id}`
}