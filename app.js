var express = require('express')
var path = require('path');
const connectDB = require('./db/database');
var bodyParser = require('body-parser')
var session = require('express-session')
require('./db/database')
var expressValidator = require('express-validator')
const flash = require('connect-flash')
var fileUpload = require('express-fileUpload')


// Initializing the Application
var app = express();

// Connecting to the database
connectDB();

// View engine setup
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

// Setting up the public folder
app.use(express.static(path.join(__dirname,'public')));

// Set global errors variables
app.locals.errors = null;


// Express file upload middleware
app.use(fileUpload());





// Usign body parser middlewares
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());



// Express Session Middlewares
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }))


// Setting up the routes 
var pages = require('./routes/pages')
var adminPages = require('./routes/admin_pages')
var adminCategories = require('./routes/admin_categories')
var adminProducts = require('./routes/admin_products')


// Using express-messages. To be done before any routing pages
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Routing to the pages  
app.use('/',pages)
app.use('/admin',adminPages)
app.use('/admin/categories',adminCategories)
app.use('/admin/products',adminProducts)

// Setting up validator middlewares
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    },
    customValidators:{
      isImage : function(value, filename){
        var extension = (path.extname(filename)).toLowerCase();
        console.log(extension)
        switch (extension){
          case '.jpg':
            return '.jpg';
          case '.jpeg':
            return '.jpeg';
          case '.png':
            return '.png';
          case '':
            return '.jpg';
          default:
            return false;

        }
            }
          }
  }));

//   Express messages middlewares

// Startiong the server 
const port = 3000;
app.listen(port,()=>{
    console.log("Server is running at port " + port)
})