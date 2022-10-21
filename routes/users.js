
import express from 'express';
import bcrypt from 'bcrypt';
import uid2 from 'uid2';
import { validateReqBody } from '../lib/helpers.js';
import User from '../db/models/User.js';
const router = express.Router();

//SIGN-UP ROUTE

router.post('/signup', (req, res) => {
    if (!validateReqBody({body: req.body, expectedPropertys:['firstName', 'lastName', 'email', 'password']})){
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
  
    // Check if the user has not already been registered via son email
    User.findOne({ email: req.body.email }).then(data => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);
        const date = new Date.now();
        const newUser = new User({
          token: uid2(32),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          password: hash,
          inscriptionDate: date,
          email: req.body.email,
          address: req.body.address,
          tags: req.body.tags,
          likes: [],
          booked: [],
          document: [],
        });
        //renvoyer le token vers le front pour le store dans le reducer
        newUser.save().then(data => {
          res.json({ result: true, token: data.token });
        });
      } else {
        // L'email fourni est déjà en database : le user est déjà inscrit
        res.json({ result: false, error: 'Cet email existe déjà' });
      }
    });
  });
  

  //SIGN-IN ROUTE
  router.post('/signin', (req, res) => {
    if (!validateReqBody({body: req.body, expectedPropertys:['email', 'password']})){
        res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
  
    User.findOne({ email: req.body.email }).then(data => {
        if(data) {
            if (bcrypt.compareSync(req.body.password, data.password)) {
                res.json({ result: true, token: data.token });
              } 
              //si le bcrypt.password ne match pas le password fourni, renvoi une erreur
              else {
                res.json({ result: false, error: 'Wrong password' });
              }
        }
        //si le findOne avec l'email n'a rien renvoyé, l'email n'est pas en BDD.
        else {
            res.json({ result: false, error: 'User not found' });
        }
    });
  });