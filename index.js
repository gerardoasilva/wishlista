let express     = require('express'),
    morgan      = require('morgan'),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    jwt = require('jsonwebtoken'),
    jsonParser  = bodyParser.json(),
    { OperationHelper } = require('apac'),
    { DATABASE_URL, PORT } = require('./config');

const opHelper = new OperationHelper({
  awsId:     '[YOUR AWS ID HERE]',
  awsSecret: '[YOUR AWS SECRET HERE]',
  assocId:   '[YOUR ASSOCIATE TAG HERE]'
});

let server;

let app = express();

app.use(express.static("public"));
app.use(morgan("dev"));

/* 
////////////////////// ENDPOINTS AQUI //////////////////////
*/

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