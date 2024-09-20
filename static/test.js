function add_img() {
    // Use the URLs passed from the HTML page
    document.getElementById('summary').src = summaryImageURL;
    document.getElementById('rsi').src = rsiImageURL;
    document.getElementById('adx').src = adxImageURL;
}

function remove_img() {
    // Remove the image sources to hide them
    document.getElementById('summary').src = "";
    document.getElementById('rsi').src = "";
    document.getElementById('adx').src = "";
}
