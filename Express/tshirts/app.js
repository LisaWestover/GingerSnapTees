const createError = require('http-errors');
const express = require('express');
const cors = require('cors')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload')
const fs = require('fs')

//import routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/api/V1/products');
const userRouter = require('./routes/api/V1/users')

//pasted from MONGODB
//mongodb+srv://NormalAccess:<password>@cluster0-wbvhd.mongodb.net/test
// Connection URL
const url = 'mongodb+srv://NormalAccess:H3lioTr%40ining@cluster0-wbvhd.mongodb.net/test?retryWrites=true&w=majority'
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

let app = client.connect()
  .then(connection => {

    const app = express();
    console.log("Connected to DB")
    app.locals.collectionProducts = connection.db('GingerSnapTees').collection("Products");
    app.locals.collectionUsers = connection.db('GingerSnapTees').collection("Users");

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    //built in middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(fileUpload())
    
    //third party middleware
    app.use(cors());
    app.use(logger('dev'));
    app.use(cookieParser());

    //bind routes
    app.use('/', indexRouter);
    app.use('/users', usersRouter);
    app.use('/api/v1/products', productsRouter)
    app.use('/api/v1/users', userRouter)

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    process.on('SIGINT', () => {
      client.close()
      process.exit()
    })

    return app

  })
  .catch(error => {
    console.log("Error connecting to MongoDB")
  })

module.exports = app;
