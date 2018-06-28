require('./index')({

    dir_csv: '../csv',
    dir_db: '../db'

}).then((a) => {

    console.log('that went well.');

}).catch ((e) => {

    console.log(e.message);

});
