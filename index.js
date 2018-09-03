const   express         = require('express'),
        mongoose        = require('mongoose'),
        bodyParser      = require('body-parser'),
        passport        = require('passport'),
        LocalStrategy   = require('passport-local'),

        // MODELS
        Therapy     = require('./models/therapy'),
        User        = require('./models/user'),

        app         = express();

var port = process.env.PORT || 3000;

// VIEW ENGINE
app.set('view engine', 'ejs')

// STATIC FILES
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));

// BODY PARSER SETUP
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MONGOOSE
mongoose.connect('mongodb://Jereck:stella1011@ds119422.mlab.com:19422/therafind', { useNewUrlParser: true });

// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: "Once again Stella is the cutest",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// CURRENT USER MIDDLEWARE
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// INDEX ROUTE
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render('index');
        }
        console.log(user);
        passport.authenticate("local")(req, res, () => {
            res.redirect('/therapy-reg');
        });
    });
});

app.get('/therapy-reg', (req, res) => {
    res.render("therapy-reg");
})

// SUBMIT THERAPY
app.post('/submit', isLoggedIn, (req, res) => {

    // GET THE DATA FROM THE THERAPY FORM
    let name = req.body.name;
    let address = req.body.address;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;
    let author = {
        id: req.user._id,
        username: req.user.username
    }

    // CREATE VARIABLE THE NEW THERAPY
    let newTherapy = {
        name: name,
        address: address,
        city: city,
        state: state,
        zip: zip,
        author: author
    }

    // CREATE NEW THERAPY ON THE DB
    Therapy.create(newTherapy, (err, newlyCreated) => {
        if (err) {
            console.log(err);
        } else {
            console.log(newlyCreated);
            res.redirect('/therapy/' + newlyCreated._id);
        }
    });
});

app.get('/therapy', (req, res) => {
    Therapy.find({}, (err, allTherapies) => {
        if (err) {
            console.log(err);
        } else {
            res.render("therapies", { therapies: allTherapies });
        }
    })
})

app.get('/therapy/:id', (req, res) => {
    // FIND THERAPY BY ID
    Therapy.findById(req.params.id, (err, therapy) => {
        if (err) {
            console.log(err);
        } else {
            res.render('therapy', { therapy: therapy });
        }
    })
})


// AUTHENTICATION
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: '/login'
    }), (req, res) => {
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.get('/about', (req, res) => {
    res.render('about');
});


// CHECK LOGIN MIDDLEWARE
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

// RUNNING SERVER
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});