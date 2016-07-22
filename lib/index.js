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
    , npm = require("spawn-npm")
    ;


/**
 * testerInit
 * Init tests for tester.
 *
 * @name testerInit
 * @function
 * @param {String} dir The dir path.
 * @param {Object} opts An object containing:
 *
 *  - `path` (String): The test script name (default: `test/index.js`)
 *
 * @param {Function} cb The callback function.
 */
module.exports = function testerInit (dir, opts, cb) {

    if (typeof opts === "function") {
        cb = opts;
        opts = {};
    }

    opts = ul.merge({
        path: "test/index.js"
    });

    dir = path.normalize(abs(dir));

    let indexPath = path.join(dir, opts.path);

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

    // Sync
    t.should("${pack.description}", () => {
        t.expect(${cName}()).toEqual(/*...*/);
    });

    // Async
    t.should("${pack.description}", cb => {
        ${cName}((err, data) => {
            t.expect(data).toEqual(/*...*/);
            cb();
        })
    });
});`, next);
        }
      , next => {
            npm("install", {
                "save-dev": true
              , _: ["tester"]
            }, { cwd: dir, _showOutput: true }, next);
        }
    ], cb);
};
