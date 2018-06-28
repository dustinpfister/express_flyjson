let path = require('path')

require('./lib/csv_ga_import/index')({

    dir_csv: path.join(__dirname, 'csv'),
    dir_db: path.join(__dirname, 'db')

}).then((a) => {

    console.log('that went well.');

}).catch ((e) => {

    console.log(e.message);

});
