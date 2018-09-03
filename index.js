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


// CREATES USER
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
            res.redirect('/dashboard/' + req.user._id);
        });
    });
});

// USERS DASHBOARD
app.get('/dashboard/:id', (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            res.render('dashboard');
        }
    });
});


// ==========================
// THERAPY ROUTES
// ==========================

// NEW THERAPY FORM
app.get('/dashboard/:id/therapy/new', (req,res) =>{
    User.findById(req.params.id, (err, user) =>{
        if (err) {
            console.log(err);
        } else {
            console.log(user);
            res.render("therapy-reg", {user: user})
        }
    });
});
// CREATE NEW THERAPY
app.post('/dashboard/:id/therapy', (req,res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            console.log(err);
        } else {
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

            Therapy.create(newTherapy, (err, therapy) => {
                if (err) {
                    console.log(err);
                    res.redirect('/dashboard/' + user._id);
                } else {
                    user.therapy.push(therapy);
                    user.save();
                    res.redirect('/dashboard/' + user._id);
                }
            })
        }
    })
});

// EDIT THERAPY
app.get('/dashboard/:id/therapy/:therapy_id/edit', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            console.log(err);
        } else {
            Therapy.findById(req.params.therapy_id, (err, foundTherapy) => {
                console.log(foundTherapy);
                if (err) {
                    console.log(err);
                } else {
                    res.render("edit", { therapy: foundTherapy, user: user });
                }
            })
        }
    })
})



app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate("local",
    {
        failureRedirect: '/login'
    }), (req, res) => {
        res.redirect('/dashboard/' + req.user._id);
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

// CHECK THERAPY OWNERSHIP
function checkTherapyOwnership(req, res, next) {
    if(req.isAuthenticated()){
        User.findById(req.params.id, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else {
                next();
            }
        })
    }
}

// RUNNING SERVER
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});