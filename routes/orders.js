import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import uid2 from 'uid2';
import { validateReqBody } from '../lib/helpers.js';
import Partner from '../db/models/Partner.js';
import Trip from '../db/models/Trip.js';
import Order from '../db/models/Order.js'
import User from '../db/models/User.js'

const router = express.Router();

//! status : 'requested' - 'received' - 'validated'

//* ---------------------- ADD AN ORDER -----------------------

router.post('/', async (req, res) => {
    if (
      validateReqBody({
        body: req.body,
        expectedPropertys: ['user', 'trip', 'start','end', 'nbDays', 'nbTravelers', 'comments', "totalPrice"],
      })
    ) {
      const { user, trip, nbDays, nbTravelers,start,end, comments, totalPrice } = req.body; 
      new Order({
        user,
        trip,
        start,
        end,
        nbDays,
        nbTravelers,
        comments, 
        totalPrice,
        status : 'Quotation requested', // 
      }).save().then(data => {
          res.json({ result: true, newOrder: data }); //? a verifier
      })
    } else {
      res.json({ result: false, error: 'Invalid data' }); //? a verifier
    }
  });

  //* -------------- GET ALL THE ORDER OF A GIVEN USER --------------

  router.get('/:token', (req, res) => {
    const {token} = req.params
    User.findOne({token: token})
    .then((dataUser) => {
      if(dataUser) {
        Order.find({user: dataUser._id})
        .populate('trip')
        .then(orderResult => {
          if(orderResult) {
            res.json({ result: true, data: orderResult });
          }
          else {res.json({ result: true, data: 'Not order in BDD' })}
        })
      }
      else {
        res.json({ result: false, error: 'User not found' });
      }  
    })
  })
 



  //* ------------ UPDATE LE STATUS -----------------  requested -> received -> validated

  router.put('/updateStatus/:orderID', async (req, res) => {
        const {orderID} = req.params;
        if ( await !Order.findById({ orderID })) return res.json({ result: false, error: 'Order doesnt exist' });
        Order.updateOne(
            {_id : orderID},
            [
// * -------------------- si le statut est requested alors ça passe en received et s'il est received ça passe en validated --------------
              {$set : { status : { $switch: {
                  branches: [
                    {case: {$eq: ['$status', 'Requested']}, then : 'Received'},
                    {case :{ $eq:  [ '$status', 'Received']}, then : 'Validated'}
                  ]
              }}}}
            ]  
            ).then(() => {
                Order.find().then(data => {

                    res.json({ result: true, Orders: data }); 
                })
            })
  })


export default router;
