let mongoose = require( 'mongoose');

mongoose.Promise = global.Promise;

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
    getIdByUsername : function( username ){
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
    }
};







module.exports = {
    UserList
}

