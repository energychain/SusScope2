$(document).ready(function() {
    $.ajax({
        url: '/api/logout',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function(response) {
            localStorage.removeItem('token');
            $('#content').html('Du wurdest erfolgreich abgemeldet.');
            setTimeout(function() {
                window.location.href = '/login.html';
            }, 1000);
        },
        error: function(xhr, status, error) {
            alert('Logout failed: ' + xhr.responseText);
        }
    });
})