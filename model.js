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
        required: true,
        unique: true
    },
    correo: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
  /*  confirmPassword: {
        type: String,
        required: true
    },*/
    fechaNac: {
        type: String,
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
    createUser : function(nuevoUsuario){
        return User.create( nuevoUsuario )
            .then ( usuario => {
                return usuario;
            })
            .catch ( error => {
                throw Error ( error );
            });
    }

    //function to encrypt password 
  /*  encryptPasword : function( pass, num ){
         return bcrypt.hash(password, 10)*/



}

module.exports = {
    UserList
}

