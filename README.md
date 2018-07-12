# express_flyjson

This is a project where the aim is to have a json path that will give different json responses depending on the query string given to it. The data is the statistics that are imported from the analytics of my [site here on github](https://dustinpfister.github.io). So this project provides a tool that can help parse the csv that is exported from google analytics, into JSON, it also provides an express.js middleware that provides a json path that will respond to query via a query string.


So when I give a url like this:
```
localost:8080/json/?sd=1/1/18
```

I end up with something like this.
```js
{
    "success": true,
    "mess": "data for days 1/2/2018 to 1/3/2018",
    "eMess": "",
    "data": [{
            "date": "1/2/18",
            "users": "26",
            "timeStamp": "2018-01-02T05:00:00.000Z",
            "pages": []
        }, {
            "date": "1/3/18",
            "users": "27",
            "timeStamp": "2018-01-03T05:00:00.000Z",
            "pages": []
        }
    ]
}
```

## csv_ga_import

This lib uses [csvtojson](https://www.npmjs.com/package/csvtojson) along with many other dependencies to parse csv files that should be in the main /csv folder into a json database at /db/db.json.

Run it with npm like this
```
$ npm run-script build
```

Or directly from the root dir by calling the main build.js file with node
```
$ node build.js
```

If you want to use it elsewhere do something like this:

```js
require('./lib/csv_ga_import/index')({
 
    dir_csv: path.join(__dirname, 'csv'),
    dir_db: path.join(__dirname, 'db')
 
}).then((a) => {
 
    // run rest of app here
 
}).catch ((e) => {
 
    console.log(e.message);
 
});
```

### Writing new report types

This will likely change.

```js
[

    // type 'day-users'
    {
        reportType: 'day-users', // name of the report type
        csvHeaders: ['Day Index', 'Users'], // the headers in csv that must be present

        // set data in json by the maped value
        setBy: 'date',

        // map what headers to what (corresponds with csvHeaders)
        map: ['date', 'users'],

        // test the sanity of cells (corresponds with csvHeaders)
        cellTest: [

            // 'Day Index' cell data should follow this pattern
            function (cell) {

                return !!cell.match(/\d+\/\d+\/\d+/);

            },

            // users cell should be a Number greater than or equal to zero
            function (cell) {

                return Number(cell) >= 0;

            }

        ],

        forObj: function () {

            let str = this.date.split('/');

            this.timeStamp = new Date('20' + str[2], str[0] - 1, str[1]);

            if (!this.pages) {

                this.pages = [];

            }

        }

    }
]
```

## Making queries

When the middleware is set up making a query is done by just simply making a get request to the path at which the middleware is mounted.

so if running the project locally, and having the middleware mounted at a middeware mounted at a path called flyjson then making a quiery would begin by just making a get request to that path.
```
http://localhost:8080/flyjson
```

This will result in a status report.
