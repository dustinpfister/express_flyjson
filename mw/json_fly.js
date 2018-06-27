
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
        function (req, res) {

            let jRes = req.app.locals.jRes;

            try {

                let db = require(flyJS.get('dir_db'));

                jRes.success = true;
                jRes.data = db;
                jRes.mess = 'got the database';
                res.json(jRes);

            } catch (e) {

                jRes.mess = 'error getting database';
                jRes.eMess = e.message;
                res.json(jRes);

            }

        }
    ]);

module.exports = function (options) {

    flyJS.set('dir_db', options.dir_db || 'db.json');

    return flyJS;

};
