$(document).ready(function() {
    $('#loginForm').submit(function(event) {
        event.preventDefault();

        const username = $('#email').val();
        const password = $('#password').val();

        SusScope2.unauthPost("/api/login",{ username: username, password: password }).then(
            function(response) {
                localStorage.setItem('token', response);
                $('#message').html('<div class="alert alert-success">Anmeldung erfolgreich!</div>');
                setTimeout(function() {
                    location.href = "./dashboard.html";
                },200);
            }).catch(function(e) {
                $('#message').html('<div class="alert alert-danger"><strong>Anmeldung fehlgeschlagen:</strong> '  + '<br/>Du kannst Dich <a href="./register.html">hier kostenlos registrieren</a>.<br/>'+e+'</div>/');
            });
    });
});