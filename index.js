let express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt"),
  jsonParser = bodyParser.json(),
  { UserList } = require("./model"),
  { DATABASE_URL, PORT } = require("./config");

let server;

let app = express();

app.use(express.static("public"));
app.use(morgan("dev"));

/* 
////////////////////// ENDPOINTS AQUI //////////////////////
*/

////// TESTING ENDPOINT - GET
////// Retrieves all users
app.get("/users", jsonParser, (req, res) => {
  console.log(req.body);
  UserList.getAll()
    .then(userList => {
      return res.status(200).json(userList);
    })
    .catch(error => {
      console.log(error);
      res.statusMessage = "Hubo un error de conexion con la BD";
      return res.status(500).send();
    });
});

                                ///////////////////////
                                ///// CREATE USER /////
                                ///////////////////////

app.post('/register', jsonParser, (req, res) => {
  let username = req.body.username;
  let fName = req.body.fName;
  let lName = req.body.lName;
  let email = req.body.email;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  let bDate = req.body.bDate;
  let country = req.body.country;

  if (!fName || fName == "") {
    res.statusMessage = "Nombre no proporcionado";
    return res.status(402).send();
  }

  if (!lName || lName == "") {
    res.statusMessage = "Apellido no proporcionado";
    return res.status(402).send();
  }
  if (!username || username == "") {
    res.statusMessage = "Usuario no proporcionado";
    return res.status(402).send();
  }

  if (!email || email == "") {
    res.statusMessage = "Correo no proporcionado";
    return res.status(402).send();
  }

  if (!password || password == "") {
    res.statusMessage = "Contraseña no proporcionada";
    return res.status(402).send();
  }

  if (!confirmPassword || confirmPassword == "") {
    res.statusMessage = "Contraseña de confirmacion no proporcionada";
    return res.status(402).send();
  }

  if (!bDate || bDate == "") {
    res.statusMessage = "Fecha no proporcionada";
    return res.status(402).send();
  }

  if (!country || country == "") {
    res.statusMessage = "Pais no proporcionado";
    return res.status(402).send();
  }

  if (password != confirmPassword) {
    res.statusMessage = "Contraseña no concuerda";
    return res.status(402).send();
  }

  // Validate if username is repeated
  UserList.findByUsername(username)
    .then(result => {
      // User repeated
      if (result) {
        console.log("foundUser");
        res.statusMessage = "Nombre de usuario no disponible";
        return res.status(406).send();
      }
      // User not repeated
      else {
        console.log("Not findUser");

        // Validate if email is repeated
        UserList.findByEmail(email)
          .then(result => {
            // Email repeated
            if (result) {
              console.log("findByEmail");
              res.statusMessage = "Correo no disponible";
              return res.status(406).send();
            }
            // Email not repeated
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
                  console.log(" Hash");
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
                      res.statusMessage = "Hubo un error de conexi'on con BD";
                      return res.status(500).send();
                    });
                })
                .catch(error => {
                  console.log("Error de hashing");
                  res.statusMessage = "Error hashing";
                  return res.status(500).send();
                });
            }
          })

          .catch(error => {
            console.log("Error bd");
            return Error(error);
          });
      }
    })
    .catch(error => {
      return Error(error);
    });
});

                                ///////////////////////
                                ///// DELETE USER /////
                                ///////////////////////

app.delete('/:username/unregister', jsonParser, (req, res) => {
  let usrN = req.params.username;
  let token = req.headers.authorization;
  token = token.replace("Bearer ", "");

  // Validates token
  jwt.verify(token, "secret", (error, user) => {
    // Not valid token
    if ( error ) {
      res.statusMessage = "Token no válido";
      return res.status(409).send();
    }

    // Valid token
    // Validate parameter username and active session are the same
    if( usrN != user.username ){
      res.statusMessage = "El usuario de sesión y del parámetro no coinciden";
      return res.status(403).send();
    }

    UserList.delete( user.username )
      .then( deletedUsr => {
        res.statusMessage = "Usuario eliminado exitosamente";
        return res.status(204).json(deletedUsr);
      })
      .catch( error => {
        res.statusMessage = "Hubo un error con la BD";
        return res.status(500).send();
      });

  });
});

// Endpoint for signIn
app.post("/signIn", jsonParser, (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (!username || username == "") {
    res.statusMessage = "Usuario no proporcionado";
    return res.status(402).send();
  }

  if (!password || password == "") {
    res.statusMessage = "Contraseña no proporcionado";
    return res.status(402).send();
  }

  //Verifica que el usuario exista y regresa su pass de la BD
  UserList.findByUsername(username)
    .then(user => {
      if (user) {
        let hashedPassword = user.password;

        bcrypt
          .compare(password, hashedPassword)
          .then(result => {
            if (result) {
              let data = {
                username
              };
              let token = jwt.sign(data, "secret", {
                expiresIn: 60 * 10
              });

              return res.status(200).json({ token });
            } else {
              console.log("Contraseña incorrecta");
              res.statusMessage = "Contraseña incorrecta";
              return res.status(402).send();
            }
          })
          .catch(error => {
            throw Error(error);
          });
      } else {
        console.log("error");
        res.statusMessage = "Usuario no encontrado";
        return res.status(404).send();
      }
    })
    .catch(error => {
      return Error(error);
    });
});

// Token validation
app.get("/validate", (req, res) => {
  let token = req.headers.authorization;
  token = token.replace("Bearer ", "");

  jwt.verify(token, "secret", (err, username) => {
    if (err) {
      res.statusMessage = "Token no valido";
      return res.status(400).send();
    }

    res.statusMessage = "Token válido";
    return res.status(200).send();
  });
});

// Create wishlist
app.post("/newWishlist", jsonParser, (req, res) => {});

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
