function watchRegister() {
    // SignUp event listener
    $('#signUpForm').submit(function (e) { 
        e.preventDefault();
        
        let fName = $("#fName").val(),
            lName = $("#lName").val(),
            username = $("#username").val(),
            email = $("#email").val(),
            password = $("#password").val(),
            confirmPassword = $("#confirmPassword").val(),
            bDate = $("#bDate").val();

        $.ajax({
            type: "POST",
            url: "/signUp",
            data: JSON.stringify( { fName, lName, username, email, password, confirmPassword, bDate } ),
            contentType: "application/json",
            dataType: "json",
            success: responseJSON => {
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

function init(){
    watchRegister();
}

init();