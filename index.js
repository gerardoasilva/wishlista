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
app.post('/api/register', jsonParser, ( req, res ) => {
  let nombre = req.body.nombre;
  let apellido = req.body.apellido;
  let user = req.body.usuario;
  let correo = req.body.correo;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  let fecha = req.body.fechaNac;
  let pais = req.body.pais;

  if (!nombre || nombre == ""){
    res.statusMessage = "Nombre no proporcionado";
    return res.status(402).send();
  }

  if ( !apellido || apellido == ""){
    res.statusMessage = "Apellido no proporcionado";
    return res.status(402).send();
  }
  if (!user || user == ""){
    res.statusMessage = "Usuario no proporcionado";
    return res.status(402).send();
  }

  if ( !correo || correo == ""){
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

  if (!fecha || fecha == ""){
    res.statusMessage = "Fecha no proporcionada";
    return res.status(402).send();
  }

  if ( !pais || pais == ""){
    res.statusMessage = "Pais no proporcionado";
    return res.status(402).send();
  }

  if( password != confirmPassword){
    res.statusMessage = "Contraseña no concuerda";
    return res.status(402).send();
  }

  //Valida si el nombre de usuario ya esta en la BD
  UserList.findUsername(user)
    .then( result => {
      //En caso de que sí, manda error
      if ( result.length > 0 ){
        console.log("findUser");
        res.statusMessage = "Nombre de usuario no disponible";
        return res.status(406).send();
      }
      else{
        console.log("NOt findUser");

        UserList.findEmail(correo)
          .then( result => {
            //
            if(result.length > 0){
              console.log("findEmail");
              res.statusMessage = "Correo no disponible";
              return res.status(406).send();
            }

            else{

              let nuevoUsuario = {
                nombre: nombre,
                apellido: apellido,
                usuario: user,
                correo: correo,
                fechaNac: fecha,
                pais: pais
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
            console.log("Error BD");
            return Error ( error );
          });
   

      }
    })
    .catch( error => {
      return Error ( error );
    });


});

//Endpoint for login
app.post('/api/login', jsonParser, ( req, res ) => {
  let user = req.body.usuario;
  let password = req.body.password;

  if (!user || user == ""){
    res.statusMessage = "Usuario no proporcionado";
    return res.status(402);
  }

  if ( !password || password == ""){
    res.statusMessage = "Contraseña no proporcionado";
    return res.status(402);
  }

  //Verifica que el usuario exista y regresa su pass de la BD
  UserList.getUserPass(user)
    .then( function(password) {
      if(password){
        let hash = password;
        console.log(hash);
        console.log(bcrypt.compare(password, hash));
        return res.status(200).send();
       // let result = bcrypt.compare(password, hash)
       // console.log()
      }
      else{
        console.log("errir");
        res.statusMessage = "Usuario no encontrado";
        return res.status(404)

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