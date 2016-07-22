"use strict";

const testerInit = require("../lib");

testerInit(`${__dirname}/..`, err => {
    console.log(err || "Success.");
});
