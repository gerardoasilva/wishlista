function watchButtons(){
    // SignIn event listener
    $('#signInForm').submit(function (e) { 
        e.preventDefault();
        
        let username = $("#username").val(),
            password = $("#password").val();

        $.ajax({
            type: "POST",
            url: "/signIn",
            data: JSON.stringify( { username, password } ),
            contentType: "application/json",
            dataType: "json",
            success: responseJSON => {
                localStorage.setItem('token',responseJSON.token);
                console.log(responseJSON);
                location.href = "/home.html";
            },
            error: err => {

                // Falta validar err.status
                // 403 - forbidden
                // 406 - Dato faltante

                console.log(err);
            }
        });
    });
}

function init() {
    watchButtons();
}

init();