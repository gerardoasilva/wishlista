let mongoose = require( 'mongoose');

mongoose.Promise = global.Promise;

let itemCollection = mongoose.Schema({
    wishlist: {
        type: mongoose.Schema.Types.ObjectId, ref: 'wishlists'
    },
    wishName: {
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
        default: "false",
        required: true
    },
    creationDate: {
        type: Date,
        default: Date.now,
        required: true
    }
});

let wishlistCollection = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: 'users'
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
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
    wishes: [ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        }
     ]
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
    wishlists: [ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wishlist'
        }
     ],
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
let Wishlist = mongoose.model('wishlists', wishlistCollection);
let Item = mongoose.model('items', itemCollection);

// Querys
let UserList = {
    getAll : function(){
        return User.find()
        .then( users => {
            return users;
        })
        .catch( error => {
            throw Error(error);
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
                console.log(user);
                return user;
            }
            throw new Error('User not found');
        })
        .catch(error => {  
            throw Error(error);
        });
    },
    // createWishlist : function(username, newWishlist ){
    //     return User.findOneAndUpdate({username: username}, {$push:{wishlists: newWishlist}})
    //         .then( wishlist => {
    //             return wishlist;
    //         })
    //         .catch( error => {
    //             throw Error(error);
    //         });
    // },
    // deleteWishlist : function(username, title){
    //     return User.findOneAndUpdate({username: username},{$pull: {wishlists:{title: title}}})
    //         .then( result => {
    //             return result;
    //         })
    //         .catch( error => {
    //             throw Error(error);
    //         });
    // },

    // updateWishlist : function(username, newWishlist ){
    //     //return User.findOneAndUpdate({username: username}, {$set:{wishlists: newWishlist}})
    //     return User.findOneAndUpdate({username: username }, {$set:{wishlists: {title: title, wishes: newWishlist}} } )            
    //         .then( wishlist => {
    //             return wishlist;
    //         })
    //         .catch( error => {
    //             return error;
    //         });
    // },
    //findOneAndUpdate({username: username}, {$set:{wishlists: {title:title}}})

    // updateWishes : function(username, title, newWishlist ){
    //     return User.findOneAndUpdate({username: username }, {$set:{wishlists: {title: title, wishes: newWishlist}} } )
    //         .then( wishlist => {
    //             return wishlist;
    //         })
    //         .catch( error => {
    //             return error;
    //         });

    // },
/*
    serModel.update( {_id: myid }, { $push: { "Uv.$[u].votes.$[v].critaire3": "df" } }, { upsert: true, arrayFilters: [ { 'u.code': "Info204" }, { "v.critaire3": {$exists:true} } ] } )
*/
    // createWish : function(username, title, newItem ){
        
    //     return User.update(
    //         {username: username},
    //         {$push: {"wishlists.$[t].wishes": newItem}},
    //         {upsert: true, arrayFilters: [ { 't.title': title } ]}

    //         )
    //     .then( wish => {
    //         return wish;
    //     })
    //     .catch( error => {
    //         throw Error(error);
    //     });

    // }
    
};

let WishlistList = {
    getAll : function(){
        return Wishlist.find()
            .then( wishlists => {
                return wishlists;
            })
            .catch( error => {
                throw Error(error);
            });
    },
    createWishlist: function(newWishlist){
        return Wishlist.create( newWishlist )
        .then( addedWishlist => {
            return addedWishlist;
        })
        .catch( error => {
            throw Error(error);
        });
    },
    getAllByAuthor : function(author){
        return Wishlist.find({username: author})
        .populate("author")
        .then( wishlists => {
            return wishlists;
        })
        .catch( error => {
            throw Error(error);
        });
    },
    getIdByAuthor : function(author) {
        return User.findOne( {username: author} )
        .then( user => {
            return user;
        })
        .catch( error => {
            throw Error(error);
        })
    }
};

let ItemList = {

};

module.exports = {
    UserList, WishlistList, ItemList
};

