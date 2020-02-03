let express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt"),
  jsonParser = bodyParser.json(),
  { UserList } = require("./model"),
  { DATABASE_URL, PORT } = require("./config"),
  app = express(),
  server;

app.use(express.static("public"));
app.use(morgan("dev"));

/* 
////////////////////// ENDPOINTS AQUI //////////////////////
*/

///////////////////////////
/////     SIGN IN     /////
///////////////////////////
app.post("/signIn", jsonParser, (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  // Validates inputs
  if (!username || username == "") {
    res.statusMessage = "Nombre de usuario no proporcionado";
    return res.status(406).send();
  }

  if (!password || password == "") {
    res.statusMessage = "Contraseña no proporcionada";
    return res.status(406).send();
  }

  // Validates if user exists
  UserList.findByUsername(username)
    .then(user => {
      // User exists
      if (user) {
        // Stores hashed password of user
        let hashedPassword = user.password;

        // Compares input password to saved password in DB
        bcrypt
          .compare(password, hashedPassword)
          .then(result => {
            // Password matches
            if (result) {
              let data = {
                username
              };
              // Create token
              let token = jwt.sign(data, "secret", {
                expiresIn: 60 * 10
              });

              return res.status(200).json({ token });
              // Password doesn't match
            } else {
              console.log("Contraseña incorrecta");
              res.statusMessage = "Contraseña incorrecta";
              return res.status(400).send();
            }
          })
          .catch(error => {
            throw Error(error);
          });
      } else {
        // User doen't exist
        console.log("error");
        res.statusMessage = "Usuario no encontrado";
        return res.status(400).send();
      }
    })
    .catch(error => {
      res.statusMessage = "Hubo un error de conexión con la BD";
      return res.status(500).send();
    });
});

///////////////////////////
/////   CREATE USER   /////
///////////////////////////
app.post("/register", jsonParser, (req, res) => {
  let { username, fName, lName, email, password, confirmPassword, bDate, country } = req.body;

  if (!fName || fName == "") {
    res.statusMessage = "Nombre no proporcionado";
    return res.status(406).send();
  }

  if (!lName || lName == "") {
    res.statusMessage = "Apellido no proporcionado";
    return res.status(406).send();
  }
  if (!username || username == "") {
    res.statusMessage = "Usuario no proporcionado";
    return res.status(406).send();
  }

  if (!email || email == "") {
    res.statusMessage = "Correo electrónico no proporcionado";
    return res.status(406).send();
  }

  if (!password || password == "") {
    res.statusMessage = "Contraseña no proporcionada";
    return res.status(406).send();
  }

  if (!confirmPassword || confirmPassword == "") {
    res.statusMessage = "Contraseña de confirmación no proporcionada";
    return res.status(406).send();
  }

  if (!bDate || bDate == "") {
    res.statusMessage = "Fecha de nacimiento no proporcionada";
    return res.status(406).send();
  }

  if (!country || country == "") {
    res.statusMessage = "País no proporcionado";
    return res.status(406).send();
  }

  if (password != confirmPassword) {
    res.statusMessage = "Contraseñas no coinciden";
    return res.status(406).send();
  }

  // Validate if username is unique
  UserList.findByUsername(username)
    .then(result => {
      // User repeated
      if (result) {
        console.log("foundUser");
        res.statusMessage = "Nombre de usuario no disponible";
        return res.status(409).send();
      }
      // Unique user
      else {
        console.log("Not findUser");
        // Validate if email is unique
        UserList.findByEmail(email)
          .then(result => {
            // Email repeated
            if (result) {
              console.log("findByEmail");
              res.statusMessage =
                "Correo electrónico no disponible, ya existe una cuenta con este correo electrónico";
              return res.status(406).send();
            }
            // Unique email
            else {
              let newUser = {
                username: username,
                fName: fName,
                lName: lName,
                email: email,
                bDate: bDate,
                country: country
              };

              // Encrypt password and adds user to DB
              bcrypt
                .hash(password, 10)
                .then(hashedPassword => {
                  console.log("Hash:");
                  // Add hashed password to user
                  newUser.password = hashedPassword;
                  console.log(hashedPassword);
                  // Create user in DB
                  UserList.create(newUser)
                    .then(result => {
                      let data = {
                        username
                      };
                      // Creates token
                      let token = jwt.sign(data, "secret", {
                        expiresIn: 60 * 10
                      });

                      console.log("User");
                      res.statusMessage = "Usuario agregado a BD";
                      return res.status(200).json({ result, token });
                    })
                    .catch(error => {
                      res.statusMessage = "Hubo un error de conexión con la BD";
                      return res.status(500).send();
                    });
                })
                .catch(error => {
                  console.log("Error de hashing");
                  res.statusMessage = "Hubo un error al encriptar el password";
                  return res.status(500).send();
                });
            }
          })

          .catch(error => {
            console.log("Error bd");
            res.statusMessage = "Hubo un error de conexión con la BD";
            return res.status(500).send();
          });
      }
    })
    .catch(error => {
      res.statusMessage = "Hubo un error de conexión con la BD";
      return res.status(500).send();
    });
});

///////////////////////////
/////   UPDATE USER   /////
///////////////////////////

///////////////////////////
/////   DELETE USER   /////
///////////////////////////
app.delete("/:username/unregister", jsonParser, (req, res) => {
  let usrN = req.params.username;
  let token = req.headers.authorization;
  token = token.replace("Bearer ", "");

  // Validate token
  jwt.verify(token, "secret", (err, user) => {
    // Not valid token
    if (err) {
      res.statusMessage = "Token no es válido";
      return res.status(403).send();
    }

    // Valid token
    // Validate username and active session's username are the same
    if (usrN != user.username) {
      res.statusMessage = "El usuario de la sesión activa no coincide";
      return res.status(400).send();
    }

    // Delete user from DB
    UserList.delete(user.username)
      .then(deletedUsr => {
        res.statusMessage = "Usuario eliminado exitosamente de la BD";
        return res.status(200).json(deletedUsr);
      })
      .catch(error => {
        res.statusMessage = "Hubo un error de conexión con la BD";
        return res.status(500).send();
      });
  });
});

///////////////////////////
///// CREATE WISHLIST /////
///////////////////////////
app.post("/:username/newWishlist", jsonParser, (req, res) => {
  // Store token
  let token = req.headers.authorization;
  token = token.replace("Bearer ", "");
  // Validate token
  jwt.verify(token, "secret", (err, user) => {
    // Token not valid
    if (err) {
      res.statusMessage = "Token no valido";
      return res.status(403).send();
    }
    // Token valid
    let username = req.params.username;
    let { title, description, isPublic, isSecured, password } = req.body;

    // Validate user with active session to the url parameter
    if (username != user.username) {
      res.statusMessage = "El usuario de la sesión activa no coincide";
      return res.status(400).send();
    }

    // Validate inputs
    if (!title || title == "") {
      res.statusMessage = "Título no proporcionado";
      return res.status(406).send();
    }

    let newWishlist = {
      title
    };

    if (description && description != "") {
      newWishlist.description = description;
    }

    if (isPublic) {
      newWishlist.isPublic = true;
    }

    if (isSecured) {
      newWishlist.isSecured = true;
      if (!password || password == "") {
        res.statusMessage = "Contraseña no proporcionada";
        return res.status(406).send();
      }
      newWishlist.password = password;
    }

    // Get user obj from username
    UserList.getUserByUsername(username)
      // Exists username in DB
      .then(user => {
        // Iterates over wishlists from user
        for (let list of user.wishlists) {
          // Wishlist title already exists
          if (list.title == title) {
            res.statusMessage = "Título de wishlista no disponible, ya existe";
            return res.status(409).send();
          }
        }

        // Whishlist title available
        UserList.createWishlist(username, newWishlist)
          .then(result => {
            let data = {
              username
            };
            // Renew token
            token = jwt.sign(data, "secret", {
              expiresIn: 60 * 10
            });

            res.statusMessage = "Wishlista creada exitosamente";
            return res.status(200).json({ result, token });
          })
          .catch(error => {
            res.statusMessage = "Hubo un error de conexión con la BD";
            return res.status(500).send();
          });
      })
      // Doesn't exist username in DB
      .catch(error => {
        res.statusMessage = "Hubo un error de conexión con la BD";
        return res.status(500).json(error);
      });
  });
});

///////////////////////////
///// UPDATE WISHLIST /////
///////////////////////////

///////////////////////////
///// DELETE WISHLIST /////
///////////////////////////
app.delete("/:username/deleteWishlist/:title", (req, res) => {
  // Store token
  let token = req.headers.authorization;
  token = token.replace("Bearer ", "");

  // Validate token
  jwt.verify(token, "secret", (err, user) => {
    // Not valid token
    if (err) {
      res.statusMessage = "Token no valido";
      return res.status(403).send();
    }

    // Valid token
    let username = req.params.username;
    let title = req.params.title;

    // Validate active user and param user are the same
    if (username != user.username) {
      res.statusMessage = "El usuario de la sesión activa no coincide";
      return res.status(400).send();
    }

    //Validate title
    if (!title || title == "") {
      res.statusMessage = "Título no proporcionado";
      return res.status(406).send();
    }
    // Deletes wishlist
    UserList.deleteWishlist(username, title)
      .then(result => {
        let data = {
          username
        };

        // Renew token
        let token = jwt.sign(data, "secret", {
          expiresIn: 60 * 10
        });

        return res.status(200).json({ result, token });
      })
      .catch(error => {
        res.statusMessage = "Hubo un error de conexion con la BD";
        return res.status(500).send();
      });
  });
});

///////////////////////////
/////   CREATE WISH   /////
///////////////////////////
app.post("/:username/:wishlist/createWish", jsonParser, (req, res) => {
  // Store token
  let token = req.headers.authorization;
  token = token.replace("Bearer ", "");
  // Validate token
  jwt.verify(token, "secret", (err, user) => {
    // Token not valid
    if (err) {
      res.statusMessage = "Token no valido";
      return res.status(400).send();
    }
    // Token valid
    let username = req.params.username;
    let wishlistTitle = req.params.wishlist;
    let {
      wishName,
      productImage,
      priority,
      notes,
      shoppingURL,
      isReserved
    } = req.body;

    // Item to add to wishlist
    let newItem = { wishName, priority };

    // Validate inputs
    if (!wishName || wishName == "") {
      res.statusMessage = "Nombre no proporcionado";
      return res.status(406).send();
    }

    if (!priority || priority == "") {
      res.statusMessage = "Prioridad no proporcionada";
      return res.status(406).send();
    }

    if (username != user.username) {
      res.statusMessage = "El usuario de la sesión activa no coincide";
      return res.status(400).send();
    }

    if (productImage && productImage != "") {
      newItem.productImage = productImage;
    }

    if (notes && notes != "") {
      newItem.notes = notes;
    }

    if (shoppingURL && shoppingURL != "") {
      newItem.shoppingURL = shoppingURL;
    }

    if (isReserved) {
      newItem.isReserved = true;
    }

    UserList.createWish(user.username, wishlistTitle, newItem)
      .then(addedItem => {
        let data = {
          username
        };
        let token = jwt.sign(data, "secret", {
          expiresIn: 60 * 10
        });

        res.statusMessage =
          "Wish agregado exitosamente a la wishlist " + wishlistTitle;
        return res.status(200).json({ addedItem, token });
      })
      .catch(error => {
        res.statusMessage = "Hubo un error con la BD";
        return res.status(500).send();
      });
  });
});

///////////////////////////
/////   UPDATE WISH   /////
///////////////////////////

///////////////////////////
/////   DELETE WISH   /////
///////////////////////////


/* Server & Database config */
function runServer(port, databaseUrl) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, response => {
      if (response) {
        return reject(response);
      } else {
        server = app
          .listen(port, () => {
            console.log("App is running on port " + port);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            return reject(err);
          });
      }
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing the server");
      server.close(err => {
        if (err) {
          return reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

runServer(PORT, DATABASE_URL);

module.exports = { app, runServer, closeServer };
