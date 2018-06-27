
let express = require('express'),
flyJS = express();

flyJS.get('/',

    [

        // set standard response object defaults
        function (req, res, next) {

            req.app.locals.jRes = {

                success: false,
                mess: '',
                eMess: '',
                data: {}

            }

            next();

        },

        // get database
        function (req, res, next) {

            let jRes = req.app.locals.jRes;

            try {

                // try to populate req.db
                req.db = require(flyJS.get('dir_db'));

                // if all goes well continue
                next()

            } catch (e) {

                // else spit out an error response
                jRes.mess = 'error getting database';
                jRes.eMess = e.message;
                res.json(jRes);

            }

        },

        // check for query string
        function (req, res, next) {

            let jRes = req.app.locals.jRes,
            qKeys = Object.keys(req.query);

            // if no query string just give stats
            // not the whole db
            if (qKeys.length === 0) {

                jRes.success = true;
                jRes.mess = 'No query string given, so just giving database stats';
                jRes.data = {

                    daycount: req.db.days.length

                };
                res.json(jRes);

            } else {

                next();

            }

        },

        // respond to sd and ed query string values
        function (req, res, next) {

            let jRes = req.app.locals.jRes;

            if (req.query.sd) {

                let sd = req.query.sd,
                ed = sd;

                if (req.query.ed) {

                    ed = req.query.ed;

                }

                jRes.success = true;
                jRes.mess = 'data for days ' + sd + ' to ' + ed;
                res.json(jRes);

            } else {

                next();

            }

        },

        // end of line
        function () {

            let jRes = req.app.locals.jRes;

            jRes.mess = 'end of line sorry';
            res.json(jRes);

        }

    ]);

module.exports = function (options) {

    flyJS.set('dir_db', options.dir_db || 'db.json');

    return flyJS;

};
