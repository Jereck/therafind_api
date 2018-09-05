const   express         = require('express'),
        mongoose        = require('mongoose'),
        bodyParser      = require('body-parser'),
        passport        = require('passport'),
        LocalStrategy   = require('passport-local'),
        methodOverride  = require('method-override'),

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

// METHOD OVERRIDE
app.use(methodOverride("_method"));

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

// ======================
// STEP 1 - CREATE USER
// ======================
app.get('/register', (req, res) => {
    res.render('register');
});
app.post('/register', (req, res) => {
    var newUser = new User({ 
        username: req.body.username,
    });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render('index');
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect('/therapy_setup');
        });
    });
});

// ========================
// STEP 2 - CREATE THERAPY
// ========================
app.get('/therapy_setup', (req, res) => {
    res.render('therapy-reg');
});
app.post('/submit', isLoggedIn, (req, res) => {
    let user = {
        id: req.user._id,
        username: req.user.username
    }
    let newTherapy = {
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        phone: req.body.phonenumber,
        email: req.body.email,
        user: user
    }

    Therapy.create(newTherapy, (err, newlyCreated) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/profile/' + req.user._id);
        }
    });
});

// ========================
// STEP 3 - REVIEW THERAPY
// ========================
app.get('/profile/:id', isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            Therapy.find({'user.id': foundUser._id}, (err, foundTherapy) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render('dashboard', { user: foundUser, therapy: foundTherapy });
                }
            });
        }
    });
});

// ===========================
// STEP 4 - EDIT THERAPY INFO
// ===========================
app.get('/therapy/:id/edit', isLoggedIn, (req, res) => {
    Therapy.findById(req.params.id, (err, foundTherapy) => {
        if (err) {
            console.log(err);
        } else {
            res.render('edit', {therapy: foundTherapy});
        }
    });
});
app.put('/therapy/:id', (req, res) => {
    let newTherapy = {
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        phone: req.body.phonenumber,
        email: req.body.email
    }
    Therapy.findByIdAndUpdate(req.params.id, newTherapy, (err, updatedTherapy) => {
        if (err) {
            res.redirect('/');
        } else {
            res.redirect('/profile/' + req.user._id);
        }
    });
});

// ===========================
// STEP 5 - DELETE THERAPY INFO
// ===========================
app.delete("/therapy/:id", (req, res) => {
    Therapy.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect('/profile/' + req.user._id);
        } else {
            res.redirect('/profile/' + req.user._id);
        }
    });
});



app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate("local",
    {
        failureRedirect: '/login'
    }), (req, res) => {
        res.redirect('/profile/' + req.user._id);
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
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