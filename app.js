/**
 *     Copyright (c) 2019, ExploShot
 *     Copyright (c) 2019, The Qwertycoin Project
 *
 *     All rights reserved.
 *     Redistribution and use in source and binary forms, with or without modification,
 *     are permitted provided that the following conditions are met:
 *
 *     ==> Redistributions of source code must retain the above copyright notice,
 *         this list of conditions and the following disclaimer.
 *     ==> Redistributions in binary form must reproduce the above copyright notice,
 *         this list of conditions and the following disclaimer in the documentation
 *         and/or other materials provided with the distribution.
 *     ==> Neither the name of Qwertycoin nor the names of its contributors
 *         may be used to endorse or promote products derived from this software
 *          without specific prior written permission.
 *
 *     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *     A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *     CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
