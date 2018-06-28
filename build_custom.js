let path = require('path');

require('./lib/csv_ga_import/index')({

    dir_csv: path.join(__dirname, 'csv'),
    dir_db: path.join(__dirname, 'db'),
    filename: 'pages',
    types: [

        // type 'day-users'
        {
            reportType: 'day-pages', // name of the report type
            csvHeaders: ['Page', 'Date', 'Pageviews'], // the headers in csv that must be present

            // set data in json by the maped value
            setBy: 'date',

            // map what headers to what (corresponds with csvHeaders)
            map: ['page', 'date', 'pageviews'],

            // test the sanity of cells (corresponds with csvHeaders)
            cellTest: [

                function (cell) {
                    return true;
                },

                // 'Day Index' cell data should follow this pattern
                function (cell) {

                    return !!cell.match(/\d+/);

                },

                // users cell should be a Number greater than or equal to zero
                function (cell) {

                    return Number(cell) >= 0;

                }

            ],

            forObj: function () {

                //let str = this.date.split('/');

                //this.timeStamp = new Date('20' + str[2], str[0] - 1, str[1]);

                //if (!this.pages) {

                //    this.pages = [];

                //}
				
				this.date = 'f00';

            }

        }
    ]

}).then((a) => {

    // run rest of app here

}).catch ((e) => {

    console.log(e.message);

});
