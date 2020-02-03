let mongoose = require( 'mongoose');

mongoose.Promise = global.Promise;

let itemCollection = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    productImage: {
        type: String,
    },
    priority: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    shoppingURL: {
        type: String,
    },
    isReserved: {
        type: Boolean,
        default: false,
        required: true
    },
    creationDate: {
        type: Date,
        default: Date.now,
        required: true
    }
});

let wishlistCollection = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    isPublic: {
        type: Boolean,
        default: "false"
    },
    isSecured: {
        type: Boolean,
        default: "false",
    },
    password: {
        type: String,
    },
    creationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    wishes: [ itemCollection ]
});

let userCollection = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
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
    wishlists: [ wishlistCollection ],
    friends: [
        {
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
        }
    ]
     
});



let User = mongoose.model('users', userCollection);

// Querys
let UserList = {
    getAll : function(){
        return User.find()
        .then( users => {
            return users;
        })
        .catch( error => {
            return error;
        });
    },
    findByUsername : function( userN ){
        return User.findOne({username: userN})
            .then( user => {
                return user;
            })
            .catch ( error => {
                return Error ( error );
            });
    },
    findByEmail : function( userEmail ){
        return User.findOne({email: userEmail})
            .then( user => {
                return user;
            })
            .catch ( error => {
                return Error ( error );
            });
    },
    create : function( newUser ){
        return User.create( newUser )
        .then( user => {
            return user;
        })
        .catch(error => {
            throw Error(error);
        });
    },
    delete: function( username ){
        return User.findOneAndDelete( {username: username})
            .then( deletedUsr => {
                return deletedUsr;
            })
            .catch( error => {
                throw Error(error);
            })
    },
    getUserByUsername : function( username ){
        return User.findOne( {username: username} )
        .then( user => {
            if( user ){
                return user;
            }
            throw new Error('User not found');
        })
        .catch(error => {
            throw Error(error);
        });
    },
    createWishlist : function(username, newWishlist ){
        return User.findOneAndUpdate({username: username}, {$push:{wishlists: newWishlist}})
            .then( wishlist => {
                return wishlist;
            })
            .catch( error => {
                return error;
            });
    },
    deleteWishlist : function(username, title){
        return User.findOneAndUpdate({username: username},{$pull: {wishlists:{title: title}}})
            .then( result => {
                return result;
            })
            .catch( error => {
                throw Error(error);
            });
    }
};







module.exports = {
    UserList
}

