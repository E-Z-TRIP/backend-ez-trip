import express from 'express';
import bcrypt from 'bcrypt';
import uid2 from 'uid2';
import { validateReqBody } from '../lib/helpers.js';
import Partner from '../db/models/Partner.js';
import Trip from '../db/models/Trip.js';
import Order from '../db/models/Order.js'
const router = express.Router();

//! status : 'Devis demandé' - 'Devis reçu' - 'devis envoyé' - 'devis validé' - 'payé'

//* ADD AN ORDER
//? a tester lorsque l'on aura un user et un trip d'ajoutés

router.post('/', async (req, res) => {
    if (
      validateReqBody({
        body: req.body,
        expectedPropertys: ['userId', 'trip', 'bookingDate', 'nbDays', 'nbTravelers', 'comments'],
      })
    ) {
      const { userID, trip, bookingDate, nbDays, nbTravelers, comments } = req.body;
      if (Order.findOne({ name })) return res.json({ result: false, error: 'Partner already exists' }); //? a vérifier
      new Order({
        userID,
        trip,
        bookingDate,
        nbDays,
        nbTravelers,
        comments, //!dans le front si pas d'input envoyer une chaine de caractères vide
        status : 'Devis demandé', // 
      }).save().then(data => {
          res.json({ result: true, newOrder: data }); //? a verifier
      })
    } else {
      res.json({ result: false, error: 'Invalid partner data' }); //? a verifier
    }
  });

  //* UPDATE LE STATUS
  //? a tester lorsque l'on aura one order

  router.put('/updateStatus', async (req, res) => {
    if (
        validateReqBody({
          body: req.body,
          expectedPropertys: [ 'orderID','status'],
        })
      ) {
        const {orderID, status} = req.body;
        if ( await !Order.findById({ orderID })) return res.json({ result: false, error: 'Order doesnt exist' });//? a vérifier
        Order.updateOne(
            {_id : orderID},
          {status: status}   
            ).then(() => {
                Order.find().then(data => {

                    res.json({ result: true, Orders: data }); //? a verifier
                })
            })
      } else {
        res.json({ result: false, error: 'Invalid order data' }); //? a verifier
      }
  })


export default router;
