var express = require('express')
var mysql   = require('mysql')
var config  = require('config')
var app     = express()

dbConfig = config.get("dbConfig")
appConfig = config.get("appConfig")

var conn = mysql.createConnection(dbConfig);

app.get('/', (req, res) => {

    // This query can be modified but at least the start_time, target and failed_tests fields need to be present in the result set
    const query = "select * from ( " +
          "select a.start_time, a.target, maxscale_commit_id, count(b.result) as failed_tests " +
          "from test_run as a join results as b on (a.id = b.id) " +
          "where start_time between date_sub(now(), interval 1 month) and now() and " +
          "maxscale_commit_id <> 'NOT FOUND'and " +
          "result = 1 " +
          "group by a.id order by a.start_time " +
          ") as d having failed_tests < 100;"

    conn.query(query, (err, rows) => {
        if (err) {
            console.log(err)
            res.send("Error")
        } else {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.send(rows)
        }
    })
})

app.listen(appConfig.port, appConfig.host)
