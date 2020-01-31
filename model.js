let mongoose = require( 'mongoose');

mongoose.Promise = global.Promise;

let usersCollection = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    usuario: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    fechaNac: {
        type: Date,
        required: true
    },
    pais: {
        type: String,
        required: true
    },
    wishlist: {
        type: String
    }
});

let User = mongoose.model('users', usersCollection);

//Querys
let UserList = {
    //Function to validate if the username is already in the DB
    findUserByUsername : function( username ){
        return User.find({usuario: username})
            .then( user => {
                return user;
            })
            .catch ( error => {
                return Error ( error );
            });
    },

    //function to encrypt password 
    encryptPasword : function( pass ){
        let password = pass;
        bcrypt.hash(password, 10)

    }

        



}

module.exports = {
    UserList
}

