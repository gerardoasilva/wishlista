let mongoose = require( 'mongoose');

mongoose.Promise = global.Promise;

let usersCollection = mongoose.Schema({
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        select: false,
        required: true
    },
    bDate: {
        type: String,
        required: true
    },
    signupDate: {
        type: Date,
        default: Date.now,
        required: true
    },

    country: {
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
    findUsername : function( userN ){
        return User.find({username: userN})
            .then( function (user) {
                return user;
            })
            .catch ( error => {
                return Error ( error );
            });
    },
    findEmail : function( userEmail ){
        return User.find({email: userEmail})
            .then( function (user) {
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
    },
    getUserPass : function( userN){
        return User.findOne({username: userN})
            .then( function(user) {
                return user.password;
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

