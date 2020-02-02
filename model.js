let mongoose = require( 'mongoose');

mongoose.Promise = global.Promise;

let userCollection = mongoose.Schema({
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
    wishlists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wishlist"
        }
    ],
    friends: [
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        status: Number,
        enums: [
            0, // 'Not friend'
            1, // 'requested'
            2, // 'pendig'
            3  // 'friends'
        ]
    ]
    
});

let wishlistCollection = mongoose.Schema({
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String,
    },
    privacy: {
        type: Boolean,
        default: "false",
    },
    password: {
        type: String
    },
    creationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    wishes: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "Item"
        }
    ]

});

let itemCollection = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    productImage: {
        type: String
    },
    priority: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    link: {
        type: String
    },
    reserved: {
        type: Boolean,
        default: "false",
        required: true
    },
    creationDate: {
        type: Date,
        default: Date.now,
        required: true
    }

});

let User = mongoose.model('users', usersCollection);
let Wishlist = mongoose.model('wishlists', wishlistCollection);
let Item = mongoose.model('items', wishlistCollection);

// Querys
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

