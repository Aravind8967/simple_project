async function data() {
    let responce = await fetch("http://127.0.0.1:301/data")
    console.log(responce.json())
}