require('./index')({

    dir_csv: '../csv',
    dir_db: '../db'

}).then((a) => {

    console.log('build good');
    console.log(a);

});
