let express = require('express'),
path = require('path'),
app = express();

app.set('port', process.env.PORT || process.argv[2] || 8080);

app.use('/json', require('./mw/json_fly')({

        //path_db: path.join(__dirname, 'db', 'days.json')
        path_db: path.join(__dirname, 'lib', 'db', 'db.json')

    }));

app.get('/', function (req, res) {

    res.send('okay');

});

app.listen(app.get('port'), function () {

    console.log('express_flyjson is up on port: ' + app.get('port'));

});
