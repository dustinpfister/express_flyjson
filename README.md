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