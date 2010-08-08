$(document).ready(function(){
    function search(){
        $.ajax({ 
            url: '/search',
            data: {q: $('#book-field').val()},
            success: function(data){
                $('#search-results').show().html(data);
            }
        });
    }
    var search_timer = 0;
    $('#book-field').keyup(function(){
        clearTimeout(search_timer);
        search_timer = setTimeout(search, 1000);
    });
});
