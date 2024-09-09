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


$(document).ready(function(){
    $('#watchlist-table-body').on('click', 'tr', function(){
        console.log('you clicked');
        let company_name = $(this).find('td[c_symbol]').text();
        console.log(company_name)
    })
})