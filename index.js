const   express     = require('express'),
        mysql       = require('mysql'),
        bodyParser  = require('body-parser'),

        app         = express();

var port = process.env.PORT || 3000;

// VIEW ENGINE
app.set('view engine', 'ejs')

// STATIC FILES
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/public"));

// BODY PARSER SETUP
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DATABASE SETUP
var db = mysql.createConnection({
    host    : "127.0.0.1",
    user    : "root",
    password: "123456",
    database: 'therapy_api'
});

db.connect((err) => {
    if(!err) {
        console.log("Database is connected...");
    } else {
        console.log("Database is not connected...");
    }
});

// CREATE DATABASE
app.get('/create_database', (req, res) => {
    let sql = "CREATE DATABASE therapy_api";
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Therapy_api database created');
    })
})

// CREATE TABLE
app.get('/create_table', (req, res) => {
    let sql = 'CREATE TABLE therapies(id int AUTO_INCREMENT, name VARCHAR(255), address VARCHAR(255), city VARCHAR(255), state VARCHAR(255), zip VARCHAR(255), PRIMARY KEY (id))';
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Therapies table added...')
    });
});

// INDEX ROUTE
app.get('/', (req, res) => {
    res.render('index');
});

// SUBMIT THERAPY
app.post('/submit', (req, res) => {
    let name = req.body.name;
    let address = req.body.address;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;
    let newTherapy = {
        name: name,
        address: address,
        city: city,
        state: state,
        zip: zip
    }

    let sql = "INSERT INTO therapies (name, address, city, state, zip) VALUES ?";
    values = [
        [ name, address, city, state, zip ]
    ];

    db.query(sql, [values], (err, result) => {
        if (err) throw err;
        console.log("New Therapy Added");
        res.send("Added new Therapy");
    })

});

// SHOW ROUTE
app.get('/show_therapies', (req, res) => {
    let sql = "SELECT * FROM therapies";
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

// RUNNING SERVER
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});