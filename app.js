const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const https = require('https');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;


var fs = require('fs');
var privateKey = fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem');
var cert = fs.readFileSync('/etc/letsencrypt/live/example.com/fullchain.pem');
var options = {
    key: privateKey,
    cert: cert
};
//connecting to mongo db
const config = require("./config/database");
mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
    console.log("database connected " + config.database);
});

mongoose.connection.on('error', (err) => {
    console.log("Error while connecting to db: " + err);
});

if (cluster.isMaster) {
    MasterProcess();
} else {
    WorkerProcess();
}

function MasterProcess() {
    console.log('Master %s is running', process.pid);

    for (var i = 0; i < numCPUs; i++) {
        console.log('Forking process number %s...', i);
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {

        // Replace the dead worker,
        // we're not sentimental
        console.log('Worker %d died :(', worker.id);
        cluster.fork();

    });
}

function WorkerProcess() {
    //initialize express obj
    const app = new express();

    const port = 3001;

    //cors middleware
    app.use(cors());

    //body parser midleware
    app.use(bodyParser.json());

    //authentication (Passport jwt middleware)
    app.use(passport.initialize());
    app.use(passport.session());
    require('./config/passport')(passport);

    // user module
    const users = require('./controllers/users.js');
    app.use('/users', users);

    var server = https.createServer(options, app);

    server.listen(port, function () {
        console.log("Worker %s is listening on port --> %s ", cluster.worker.id, port);
    });
}
