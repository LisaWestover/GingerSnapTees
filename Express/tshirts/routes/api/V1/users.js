var express = require('express');
var router = express.Router();
const fs = require('fs');
const ObjectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library')

const secret = 'iU_AhYaY_Kk87L2DTg_CL-c4lah'
const googleAuth = new OAuth2Client("401032698719-0ghbhambj0mqguup441992pr6p98o26u.apps.googleusercontent.com")


router.get('/', function (req, res, next) {
  try {
    req.app.locals.collectionUsers.find({}).toArray(function (err, result) {
      if (err) {
        throw err;
      }
      res.json(result)
    })
  } catch (error) {
    console.log('Error', error)
  }
})

// add a new user
router.post('/', function (req, res, next) {

  req.app.locals.collectionUsers.findOne({ email: req.body.email })
    .then(foundDoc => {
      if (foundDoc !== null) {
        throw new Error("User Exists")
      }
      else {
        // create hash
        bcrypt.hash(req.body.password, 10)
          .then(passwordHash => {
            req.body.passwordHash = passwordHash
            // req.body.googleId = ''
            delete req.body.password
            req.app.locals.collectionUsers.insertOne(req.body)
              .then(result => {
                res.send("OK")
              })
              .catch(error => {
                console.log(error)
                res.status(400).json({ msg: "User Not Added" })
              })
          })
      }
    })
    .catch(error => {
      res.status(400).json({ msg: "User Not Added", })
      console.log('Error', error)
    })
})

router.post('/login', function (req, res, next) {
  console.log(req.body.email)
  //get the matching document
  req.app.locals.collectionUsers.findOne({ email: req.body.email })

    .then(foundDoc => {

      if (foundDoc === null) {
        throw new Error("User Doesn't Exists")
      }

      //if email or google body getMatchedCSSRules
      
      return bcrypt.compare(req.body.password, foundDoc.passwordHash)

    })
    .then(validPassword => {
      if (validPassword !== true) {
        throw new Error("Ivalid Password")
      }

      return new Promise((resolve, reject) => {
        jwt.sign({ email: req.body.email }, secret, (error, token) => {
          
          if (error !== null) {
            reject(error)
          }
          else {
            resolve(token)
          }
        })
      })

    })
    .then(token => {
      console.log(token)
      res.json(token)
    })
    .catch(error => {
      console.log(error)
      res.sendStatus(403).statusMessage(error.msg)
    })
})

router.post('/oauth/google', function (req, res, next) {
  console.log(req.body)
  // validate the google token
  googleAuth.verifyIdTokenAsync({
    idToken: req.body.tokenId,
    audience: "401032698719-0ghbhambj0mqguup441992pr6p98o26u.apps.googleusercontent.com"
  })
  .then(ticket => {
    console.log("trying to return the payload")
    return ticket.getPayload()
  })
  .then(payload => {

    
  //get the matching document
  console.log(payload.email)
  return req.app.locals.collectionUsers.findOne({ email: payload.email })

  })
    .then(foundDoc => {

      if (foundDoc === null) {
        console.log("Document is null")
        throw new Error("User Doesn't Exists")
      }

      return new Promise((resolve, reject) => {
        jwt.sign({ email: req.body.email }, secret, (error, token) => {
          
          if (error !== null) {
            console.log("Error - not returning the promise token")
            reject(error)
          }
          else {
            console.log("token resolved")
            resolve(token)
          }
        })
      })

    })
    .then(token => {
      console.log(token)
      res.json(token)
    })
    .catch(error => {
      console.log(error)
      res.sendStatus(403)//.statusMessage(error.msg)
    })
})

//delete a user
router.delete('/:id', function (req, res, next) {

  res.app.locals.collectionUsers.findOne({ _id: ObjectId(req.params.id) }, { imageName: 1 })
    .then(document => {

      return req.app.locals.collectionUsers.deleteOne({ _id: ObjectId(req.params.id) })
    })
    .then(delResult => {
      res.send('OK')
    })
    .catch(error => {
      res.status(400).json({ msg: "Item Not Deleted" })

    })

})


//update user
router.put('/:id', function (req, res, next) {

  try {
    req.app.locals.collectionUsers.replaceOne({ _id: ObjectId(req.params.id) }, req.body)
    res.send("OK")

  }
  catch {
    console.log('Error', error)
  }

})

module.exports = router;
