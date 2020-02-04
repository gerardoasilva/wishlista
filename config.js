// mongodb://localhost/wishlista
// mongodb+srv://wishlista:wishlistainvierno20@cluster0-xilgz.mongodb.net/wishlista?retryWrites=true&w=majority
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb+srv://wishlista:wishlistainvierno20@cluster0-xilgz.mongodb.net/wishlista?retryWrites=true&w=majority";
exports.PORT = process.env.PORT || 8080;