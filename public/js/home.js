function watchButton(){
    $('#wishlistForm').on('submit', (function (e) { 

        e.preventDefault();

        let
            title = $('#title').val();
            description = $('#descripction').val();
            isPublic = $('input[name=publicConfirmation]:checked','#wishlistForm').val();
            isSecured = $('input[name=securedConfirmation]:checked','#wishlistForm').val();
            password = $('#password').val();

            $.ajax({
                type: "POST",
                url: '/'+username+'/newWishlist',
                data: JSON.stringify( {username, title, description, isPublic, isSecured, password} ),
                headers: {
                    Authorization: `Berarer `+`${localStorage.getItem("token")}`,
                    contentType: "application/json"

                },
                dataType: "json",
                success: responseJSON => {
                    console.log(title);
                    location.href = "/home.html";
                },
                error: err => {
                    console.log(title);
                    // Falta validar err.status
                    // 403 - forbidden
                    // 406 - Dato faltante
    
                    console.log(err);
                }
            });
    }));

}

function init(){
    watchButton();
}

init();