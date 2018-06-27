require('./index')({

    dir_csv: '../csv',
    dir_db: '../db'

}).then(() => {

    console.log('build good');

});
