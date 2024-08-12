async function truncate () {
    let url = "http://127.0.0.1:300/truncate"
    let responce = await fetch(url)
    console.log(responce.json())
}

async function delete_profile(u_name) {
    let url = `http://127.0.0.1:300/home/${u_name}/delete_account`
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

async function get_all_data() {
    let url = "http://127.0.0.1:300/get_all_data"
}

function home(username){
    window.location.href = `/home/${username}`
}