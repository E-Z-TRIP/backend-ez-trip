import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import uid2 from 'uid2';
import { validateReqBody } from '../lib/helpers.js';
import Partner from '../db/models/Partner.js';
import Trip from '../db/models/Trip.js';
import Order from '../db/models/Order.js'
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

  //* -------------- GET AN ORDER TO DISPLAY - QUOTATION RECEIVED --------------

  router.get('/offer/:id', (req, res) => {
    const {id} = req.params
    Order.findById({_id : id})
    .populate('trip')
    .then((data) => {
      if (data) {
        res.json({result:true, data : data})
      }
      else {
        res.json({result: false, error : 'order not found'})
      }
    })
  })
 //* ------------- GET ALL THE ORDERS ----------- 
  router.get('/', (req, res) => {
    Order.find()
    .then((data) => {
      if (data) {
        res.json({result : true, orders: data})
      } else {
        res.json({result: false, error : 'no order in DB'})
      }
    })
  })

    //* GET THE ORDERS FROM ONE USER

    router.get('/ordersByUser/:token', (req, res) => {
      const token = req.params.token
      Order.find({user : token})
      .populate('trip')
      .then((data) => {
        if (data) {
          res.json({result:true, data : data})
        }
        else {
          res.json({result: false, error : 'order not found'})
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
