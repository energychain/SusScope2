$(document).ready(function() {
    $('#registerForm').submit(function(event) {
        event.preventDefault();

        const username = $('#email').val();
        const password = $('#password').val();
        const password2 = $('#password2').val();

        if(password !== password2 ) {
            $('#message').html('<div class="alert alert-danger"><strong>Registrierung fehlgeschlagen:</strong> Passwörter stimmen nicht überein.</div>');
            return;
        } 

        SusScope2.unauthPost("/api/register",{ username: username, password: password }).then(
            function(response) {
                $('#message').html('<div class="alert alert-success"><strong>Registrierung erfolgreich:</strong> Weiter <a href="./login.html">zur Anmeldung</a>.</div>');
                setTimeout(function() {
                    location.href = "./login.html";
                },2000);
            }).catch(function(e) {
                $('#message').html('<div class="alert alert-danger"><strong>Registrierung fehlgeschlagen:</strong> ' + e + '</div>');
            });
    });
});