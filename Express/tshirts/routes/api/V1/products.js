var express = require('express');
var router = express.Router();
const fs = require('fs');
const ObjectId = require('mongodb').ObjectID

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("I am trying to do a get on the server")
  try {
    req.app.locals.collectionProducts.find({}).toArray(function (err, result) {
      if (err) {
        throw err;
      }
      console.log("Trying to return the json result", result)
      res.json(result)
    })
  } catch (error) {
    console.log('Error', error)
  }
})

// add a new tshirt term
router.post('/', function (req, res, next) {
  try {
    const image = req.files.image
    image.mv(`${__dirname}/../public/images/${image.name}`)
    req.body.imageName = image.name  
    req.app.locals.collectionProducts.insertOne(req.body)
    res.send("OK")
  }
  catch (error) {
      console.log(error)
    res.status(400).json({msg:"Item Not Added"})
  }
})


//delete a specific tshirt term
router.delete('/products/:id', function (req, res, next) {
    console.log('/products/:id')
  res.app.locals.collectionProducts.findOne({_id: ObjectId(req.params.id)}, {imageName: 1})
      .then(document => {
        if (document !== null) {
            fs.unlinkSync(`${__dirname}/../public/images/${document.imageName}`)
        }
        return req.app.locals.collectionProducts.deleteOne({_id: ObjectId(req.params.id)})
      })
      .then(delResult => {
          res.send('OK')
      })
        .catch(error => {
            res.status(400).json({msg:"Item Not Deleted"})
            
  })

})


//update inventory
router.put('/products/:id', function (req, res, next) {

  try {
    req.app.locals.collectionProducts.replaceOne({ _id: ObjectId(req.params.id) }, req.body)
    res.send("OK")

  }
  catch {
    console.log('Error', error)
  }

})

module.exports = router;
