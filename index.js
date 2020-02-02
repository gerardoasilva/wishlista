let express     = require('express'),
    morgan      = require('morgan'),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    jsonParser  = bodyParser.json(), 
    { UserList } = require('./model'),
    { DATABASE_URL, PORT } = require('./config');

let server;

let app = express();

app.use(express.static("public"));
app.use(morgan("dev"));

/* 
////////////////////// ENDPOINTS AQUI //////////////////////
*/
//Endpoint for register
app.post('/register', jsonParser, ( req, res ) => {
  let fName = req.body.fName;
  let lName = req.body.lName;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  let bDate = req.body.bDate;
  let country = req.body.country;

  if (!fName || fName == ""){
    res.statusMessage = "Nombre no proporcionado";
    return res.status(402).send();
  }

  if ( !lName || lName == ""){
    res.statusMessage = "Apellido no proporcionado";
    return res.status(402).send();
  }
  if (!username || username == ""){
    res.statusMessage = "Usuario no proporcionado";
    return res.status(402).send();
  }

  if ( !email || email == ""){
    res.statusMessage = "Correo no proporcionado";
    return res.status(402).send();
  }

  if ( !password || password == ""){
    res.statusMessage = "Contraseña no proporcionada";
    return res.status(402).send();
  }

  if ( !confirmPassword || confirmPassword == ""){
    res.statusMessage = "Contraseña de confirmacion no proporcionada";
    return res.status(402).send();
  }

  if (!bDate || bDate == ""){
    res.statusMessage = "Fecha no proporcionada";
    return res.status(402).send();
  }

  if ( !country || country == ""){
    res.statusMessage = "Pais no proporcionado";
    return res.status(402).send();
  }

  if( password != confirmPassword){
    res.statusMessage = "Contraseña no concuerda";
    return res.status(402).send();
  }

  //Valida si el nombre de usuario ya esta en la BD
  UserList.findUsername(username)
    .then( result => {
      //En caso de que sí, manda error
      if ( result ){
        console.log("findUser");
        res.statusMessage = "Nombre de usuario no disponible";
        return res.status(406).send();
      }
      else{
        console.log("NOt findUser");

        UserList.findEmail(email)
          .then( result => {
            //
            if(result.length > 0){
              console.log("findEmail");
              res.statusMessage = "Correo no disponible";
              return res.status(406).send();
            }

            else{

              let nuevoUsuario = {
                fName: fName,
                lName: lName,
                username: username,
                email: email,
                bDate: bDate,
                country: country
              };
      
              //Encriptar password y crear usuario en BD
              bcrypt.hash(password, 10)
                .then( hash => {
                  console.log(" Hash");
                  //Guardar contrase;a encriptada en el nuevo usuario

                  nuevoUsuario.password = hash;
                  console.log(hash);

                  //Guarda usuario en BD 
                  UserList.createUser( nuevoUsuario )
                    .then ( usuario => {
                      console.log("User");
                      res.statusMessage = "Usuario agregado a BD";
                      return res.status(200).json(nuevoUsuario);
                    })
                    .catch( error => {
                      console.log("NOt User");
                      throw Error (error);
                  });
      
                })
                .catch( err => {
                  console.log("NOt HAsh");
                  throw Error (error);
                });

            }

          })

          .catch( error => {
            console.log("Error bd");
            return Error ( error );
          });
   

      }
    })
    .catch( error => {
      return Error ( error );
    });


});

//Endpoint for login
app.post('/login', jsonParser, ( req, res ) => {
  let username = req.body.username;
  let password = req.body.password;

  if (!username || username == ""){
    res.statusMessage = "Usuario no proporcionado";
    return res.status(402).send();
  }

  if ( !password || password == ""){
    res.statusMessage = "Contraseña no proporcionado";
    return res.status(402).send();
  }

  //Verifica que el usuario exista y regresa su pass de la BD
  UserList.findUsername(username)
    .then( user => {
      if(user){
        let hash = user.password;

        bcrypt.compare(password, hash)
          .then( result => {
            if(result){

              let data = {
                username
            };
              let token = jwt.sign(data, 'secret', {
                expiresIn: 60 * 10
              });

              return res.status(200).json({token});
            }
            else{
              console.log("Contraseña incorrecta");
              res.statusMessage = "Contraseña incorrecta";
              return res.status(402).send();
            }
          })
          .catch( error => {
            throw Error( error );
          })

      }
      else{
        console.log("error");
        res.statusMessage = "Usuario no encontrado";
        return res.status(404).send();

      }
    })
    .catch( error => {
      return Error( error );
    }); 

});

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