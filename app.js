/**
 * Created by intelligrape on 2/7/14.
 */
const express = require('express');
const app = express();
const db = require('./db');


const InvitationController = require('./invitation/InvitationController');
app.use('/invitation', InvitationController);

module.exports = app;