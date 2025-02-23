// BCRYPT SETUP
const bcrypt = require('bcrypt');
const saltRounds = 10;

// CONNECT TO MONGO
const MongoClient = require('mongodb-legacy').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);
const dbname = 'hack';

// LOAD NPM PACKAGES
let express = require('express');
let session = require('express-session');
let bodyParser = require('body-parser');
const {Console, profile} = require('console');
const app = express();

app.use(session({secret: 'example'}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');

// CONNECT TO DB
let db;
connectDB();
async function connectDB(){
    await client.connect();
    console.log('Connected Successfully to Server');
    db = client.db(dbname);
    app.listen(8080);
    console.log('Connected to Port: 8080');
};

// RENDER PAGES


// INDEX PAGE
app.get('/', function(req, res){
    res.render('pages/index');
});

app.get('/dataform', function(req, res){
    if(!req.session.loggedin){res.redirect('/');return;}
    res.render('pages/dataform');
});

app.get('/signup', function(req, res){
    if(!req.session.loggedin){res.redirect('/');return;}
    res.render('pages/signup');
});

// DASHBOARD PAGE
app.get('/dashboard', function(req, res){
    if(!req.session.loggedin){res.redirect('/');return;}
    //Gets current user
    var currentuser = req.session.currentuser;

    db.collection('stock').countDocuments(function(err, count){

        res.render('pages/dashboard', {
            user: currentuser,
            stockCount: count
        })
    });
   
});


// DATA PAGE
app.get('/datapage', function(req, res){
    if(!req.session.loggedin){res.redirect('/');return;}

    db.collection("wildlife").find().toArray(function(err, result){
        if(err) throw err;

        res.render('pages/datapage', {
        wildlife: result
        })
    });

    

});

// data search
app.get('/datapage', function(req, res){
    if(!req.session.loggedin){res.redirect('/');return;}
    db.collection('wildlife').find('wildsearch').toArray(function(err, result){
        if(err) throw err;
    })
})

//ADDS FORM DATA TO DATABASE
app.post('/addData', function(req, res){
    const isoDate = new Date();
    const ISO = isoDate.toISOString();
    //data needs stored
    var wilddatatostore = {
        "wildlifeObservations": req.body.MWO,
        "wildImage": req.body.wildImage,
        "species": req.body.species,
        "Location": req.body.Location,
        "SpeciesImage": req.body.speciesImage,
        "username": req.session.currentuser,
        "date": ISO.slice(0 , 19) // Cuts out unwanted date information
    }
    db.collection('wildlife').insertOne(wilddatatostore, function(err, result){
        if (err) throw err;
            console.log("Saved to database");
            //when complete take back to index
        res.redirect('/dashboard');
    });
});











//USERS PAGE
app.get('/users', function(req, res){
    if(!req.session.loggedin){res.redirect('/');return;}


    res.render('pages/users')
});


// SIGN-UP
app.post('/signup', async function(req, res){

    bcrypt.genSalt(saltRounds, function(err, salt){
        if(err) throw err;
        bcrypt.hash(req.body.psw, salt, function(err, hash){
            if(err) throw err;
            let datatostore = {
                "email": req.body.email,
                "login": {"username": req.body.uname, "password": hash},
            }

            let uname = req.body.uname;
            db.collection('users').findOne({"login.username":uname}, function(err, result){
                if(err) throw err;

                if(!result){
                    db.collection('users').insertOne(datatostore, function(err, result){
                        if(err) throw err;
                        console.log("User Created");
                        res.redirect('/');
                    });
                } else {
                    console.log("User Already Exists");
                    res.redirect('/users');
                }
            });
        });
    });
});


// LOGIN
app.post('/login', async function(req, res){
    let username = req.body.username;
    let password = req.body.password;

    db.collection('users').findOne({"login.username":username}, function(err, result){
        if (err) throw err;
        
        //IF NO USER REDIRECT TO INDEX
        if(!result){res.redirect('/');
            console.log('No User Found')
        return
        }

        bcrypt.compare(password, result.login.password, function(err, result) {
        // result == true
        console.log(result);
        //CHECKS PASSWORD AGAINST USER
            if(result == true){
                console.log("true")
                console.log(result);
                req.session.loggedin = true; 
                req.session.currentuser = username;
                res.redirect('/dashboard');
            } else {
                res.redirect('/')
            }
        });
    });
});

//LOGOUT
app.get('/logout', function(req, res){
    req.session.loggedin = false;
    req.session.destroy();
    res.redirect('/');
});