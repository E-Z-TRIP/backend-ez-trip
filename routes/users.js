
import express from 'express';
import bcrypt from 'bcrypt';
import uid2 from 'uid2';
import { validateReqBody } from '../lib/helpers.js';
import User from '../db/models/User.js';
const router = express.Router();
import { checkBody } from '../lib/helpers.js';


//SIGN-UP ROUTE

router.post('/signup', (req, res) => {
  console.log(req.body);
    if (!checkBody(req.body, ['lastName', 'firstName', 'password', 'email'])){
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
  
    // Check if the user has not already been registered via son email
    User.findOne({ email: req.body.email }).then(data => {

      //Si on ne trouve rien, l'utilisateur n'est pas déjà enregistré. On peut créer un nouvel User.
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);
        const date = Date.now();
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

      } 
      
      else {
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

    ///////////LIKE ROUTES

    router.post('/like', (req, res) => {
      // Si le token n'est pas reçu, le User n'est pas connecté et ne peut donc pas sauvegarder de trips.
      if (!validateReqBody({body: req.body, expectedPropertys:['token', 'tripID']})){
          res.json({ result: false, error: 'User not connected' });
        return;
      }
      
      //Trouve le bon User à qui rajouter le trip liké, via le token renvoyé par le front
      User.findOne({ token: req.body.token }).then(data => {
          if(data) {
            //push l'ID du trip liked dans la BDD
            User.updateOne({_id: data.id}, {$push:{"tripsLiked":req.body.tripID}})
            res.json({ result: true, tripsLiked: data.tripsLiked });
          }
          //si le token n'est pas reconnu, le user n'est pas enregistré en BDD.
          else {
              res.json({ result: false, error: 'User not found' });
          }
      });
    });


//////GET THE TRIPS LIKED BY USER

router.get('/tripsLiked/:token', (req, res) => {
  // Si le token n'est pas reçu, le User n'est pas connecté et ne peut donc pas sauvegarder de trips.
  if (!req.params) {
      res.json({ result: false, error: 'User not connected' });
    return;
  }

    User.findOne({ token: req.body.token }).populate('tripsLiked')
    .then(data => {
      if(data) {
        //renvoi tous les objets contenus dans tripsLiked
        res.json({ result: true, tripsLiked: data.tripsLiked });
      }
      //si le token n'est pas reconnu, le user n'est pas enregistré en BDD.
      else {
          res.json({ result: false, error: 'User not found' });
      }
  });

})


export default router;