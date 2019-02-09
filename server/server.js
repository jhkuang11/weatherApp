const express = require('express')
const bodyParser = require('body-parser')
const path = require('path');
const app = express()
//const db = require('./queries')
const port = 8080;

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'LIBEXTMAC',
  host: 'localhost',
  database: 'postgres',
  password: 'IamL5noeleven',
  port: 5432,
})

app.get('/', function(req,res) {
  res.sendFile(path.join(__dirname+'/index.html'));
})


var server = app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

var io = require('socket.io')(server);
io.on('connection', socket => {

  socket.on('UpdateCity', city =>{
    const text = 'SELECT * FROM weather WHERE location = ($1)';
    const values = [city];
    pool.query(text, values, (error, results) => {
      if (error) {
        throw error
      }
      console.log(results.rows);
      if (results.rows.length == 0){
        notFoundObject = {location: "City not found",condition: '', degree: ''};
        results.rows.push(notFoundObject);
      }
      socket.emit('UpdateWeatherInfo', results.rows[0])
    })

  })

  socket.on('createNewData', dataReceiverd => {
    const {Location, Weather, Degree} = dataReceiverd;
    console.log(Location, Weather, Degree);
    const text = 'INSERT INTO weather(location, condition, degree) VALUES($1, $2, $3) RETURNING *';
    const values = [Location, Weather, Degree];
    pool.query(text, values, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(res.rows[0])
      }
    })
  })


  socket.on('updateOldData', (updateData)=> {
    console.log('updating');
    const {Location, Weather, Degree} = updateData;
    const text = 'UPDATE weather SET condition = ($2), degree = ($3) WHERE location = ($1) RETURNING *';
    const values = [Location, Weather, Degree];
    pool.query(text, values, (err, res2) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(res2.rows[0]);
      }
      socket.broadcast.emit('dataUpdate', res2.rows[0]);
    })
  });


});

