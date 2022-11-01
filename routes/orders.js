import express from 'express';
import bcrypt from 'bcrypt';
import uid2 from 'uid2';
import { validateReqBody } from '../lib/helpers.js';
import Partner from '../db/models/Partner.js';
import Trip from '../db/models/Trip.js';
import Order from '../db/models/Order.js'
const router = express.Router();

//! status : 'Quotation requested' - 'Quotation received' - 'Quotation validated' - 'Payed'

//* ADD AN ORDER

router.post('/', async (req, res) => {
    if (
      validateReqBody({
        body: req.body,
        expectedPropertys: ['user', 'trip', 'start','end', 'nbDays', 'nbTravelers', 'comments'],
      })
    ) {
      const { user, trip, nbDays, nbTravelers,start,end, comments } = req.body; 
      new Order({
        user,
        trip,
        start,
        end,
        nbDays,
        nbTravelers,
        comments, 
        status : 'Quotation requested', // 
      }).save().then(data => {
          res.json({ result: true, newOrder: data }); //? a verifier
      })
    } else {
      res.json({ result: false, error: 'Invalid data' }); //? a verifier
    }
  });

  //* GET AN ORDER TO DISPLAY - QUOTATION RECEIVED

  router.get('/offer', (req, res) => {
    const id = req.body.id
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
        if ( await !Order.findById({ orderID })) return res.json({ result: false, error: 'Order doesnt exist' });
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
