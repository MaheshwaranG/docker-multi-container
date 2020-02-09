const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const {Pool} = require('pg');
const redis = require('redis');

app.use(cors());
let options = {
    user : keys.pgUser,
    password : keys.pgPassword,
    host : keys.pgHost,
    port : keys.pgPort,
    database : keys.pgDatabase
}
app.use(bodyParser.json());

console.log(" Test "+ JSON.stringify(options))
const pgClient = new Pool(options)

pgClient.on('error', ()=> console.log("Lost database connection"));

pgClient.query('create table if not exists values(number INT) ').catch(err => console.log("Error "+err));

// Redis client setup
const redisClient = redis.createClient({
    host : keys.redisHost,
    port : keys.redisPort,
    retry_strategy : () => 1000
})

const redisPublisher = redisClient.duplicate();

// Express router
app.get('/', (req, res) => {
    res.send('HI');
})

app.get('/test', (req, res) => {
    res.send('HI TTTTTTTTTTTTTTTTT');
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('select * from values');
    let rows = values.rows.map(row => row.number)
    res.send(rows);
})

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    })
})

app.post('/values', async (req, res) => {
    const index = req.body.index;
    if(parseInt(index) > 40 ) {
        return res.send('Index is too high');
    }
    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('insert into values(number) values($1)', [index]);
    res.send({working : true})
})

app.listen(5000, err => {
    console.log("Listen 5000 - server started")
});