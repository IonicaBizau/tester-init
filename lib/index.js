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
      , testDir: "test"
    });

    dir = path.normalize(abs(dir));

    let indexPath = path.join(dir, opts.testDir, opts.path);

    oneByOne([
        next => rJson(dir, next)
      , (next, pack) => {
            pack = ul.merge(pack, {
                scripts: {}
            });
            debugger
            pack.scripts.test = "node " + indexPath.replace(`${dir}/`, '');
            wJson(dir, pack, err => next(err, pack));
        }
      , (next, pack) => isThere(indexPath, exists => next(exists && new Error("The test file already exists. Refusing to override it."), pack))
      , (next, pack) => {
            let cName = camelo(pack.name);
            writeFile(indexPath, `"use strict";

const tester = require("tester")
    , ${cName} = require("..")
    ;

tester.describe("${pack.name}", t => {
    t.should("${pack.description}", () => {
        t.except(${cName}()).toEqual(/*...*/);
    });
});`, next);
        }
    ], cb);
};
