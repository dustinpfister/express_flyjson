
let express = require('express'),
FileAsync = require('lowdb/adapters/FileAsync'),
low = require('lowdb'),
flyJS = express();

// adapter = new FileAsync(path_lists);

// low(adapter);

// db.defaults({days:[]});

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
                //req.db = require(flyJS.get('path_db'));

                let adapt = new FileAsync(flyJS.get('path_db'));

                low(adapt).then((db) => {

                    // if all goes well continue
                    req.db = db;
                    next();

                }).catch ((e) => {

                    // else spit out an error response
                    jRes.mess = 'error getting database';
                    jRes.eMess = e.message;
                    res.json(jRes);

                });

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

                    dayCount: req.db.get('days').value().length

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

                let sd = req.query.sd.split('/'),
                ed = sd;

                if (req.query.ed) {

                    ed = req.query.ed.split('/');

                }

                sd = new Date('20' + sd[2], sd[0] - 1, sd[1]);
                ed = new Date('20' + ed[2], ed[0] - 1, ed[1]);

                req.db.get('days')
                .filter((day) => {

                    // filter by date
                    let date = new Date(day.timeStamp);


                    return date >= sd && date <= ed;

                })
                .sortBy('date').write().then((data) => {

                    jRes.success = true;
                    jRes.mess = 'data for days ' + 
					    (sd.getMonth()+1) + '/'+sd.getDay() + '/'+ sd.getFullYear() + ' to ' +
						(ed.getMonth()+1) + '/'+ed.getDay() + '/'+ ed.getFullYear()
                    jRes.data = data;
                    res.json(jRes);

                }).catch ((e) => {

                    jRes.mess = 'error';
                    res.json(jRes);

                });

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

    flyJS.set('path_db', options.path_db || 'db.json');

    return flyJS;

};
