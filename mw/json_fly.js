
let express = require('express'),
flyJS = express();

flyJS.get('/', function (req,res) {

    let db = require(flyJS.get('dir_db'));

    res.json(db);

});

module.exports = function (options) {

    flyJS.set('dir_db', options.dir_db || 'db.json');

    return flyJS;

};
