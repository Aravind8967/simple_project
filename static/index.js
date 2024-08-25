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

async function add_company(user_id) {
    let company_name = document.getElementById('search_name').value
    let url = `http://127.0.0.1:300/home/${user_id}/${company_name}`
    let responce = await fetch(url)
    if (responce.ok){
        let res = await responce.json()
        let p = document.createElement('p')
        p.textContent = res.c_name
        document.querySelector('.watchlist').appendChild(p)
        document.getElementById('search_name').value = ''
        console.log(responce.json())
    }
    else{
        console.log(responce.json())
    }
}

async function get_all_data() {
    let url = "http://127.0.0.1:300/get_all_data"
}

function home(id){
    window.location.href = `/home/${id}`
}