"use strict";

const isThere = require("is-there")
    , ul = require("ul")
    , path = require("path")
    , abs = require("abs")
    , rJson = require("r-package-json")
    , wJson = require("w-package-json")
    , oneByOne = require("one-by-one")
    , writeFile = require("write-file-p")
    , camelo = require("camelo")
    ;

/**
 * testerInit
 * Init tests for tester.
 *
 * @name testerInit
 * @function
 * @param {Number} a Param descrpition.
 * @param {Number} b Param descrpition.
 * @return {Number} Return description.
 */
module.exports = function testerInit (dir, opts, cb) {

    if (typeof opts === "function") {
        cb = opts;
        opts = {};
    }

    opts = ul.merge({
        path: "index.js"
        testDir: "test"
    });

    dir = abs(dir);

    let indexPath = path.join(dir, opts.testDir, opts.path);

    rJson(dir,

    oneByOne([
        next => rJson(dir, next)
      , (next, pack) => {
            pack = ul.merge({
                scripts: {}
            });
            pack.scripts.test = "node " + indexPath.replace(dir, '');
            wJson(pack, next);
        }
      , (next, pack) => isThere(indexPath, exists => next(exists && new Error("The test file already exists. Refusing to delete it."), pack)
      , (next, pack) => {
            let cName = camelo(pack.name);
            writeFile(indexPath, `"use strict";

const tester = require("tester")
    , ${cName} = require("${pack.name}")
    ;

tester.describe("${pack.name}", t => {
    t.should("${pack.description}", () => {
        t.except(${cName}()).toEqual(/*...*/);
    });
});`, next);
        }
    ], cb);
};
