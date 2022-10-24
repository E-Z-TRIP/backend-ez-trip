import express from 'express';
import bcrypt from 'bcrypt';
import uid2 from 'uid2';
import { validateReqBody } from '../lib/helpers.js';
import Trip from '../db/models/Trip.js';
const router = express.Router();
import { checkBody } from '../lib/helpers.js';
import cloudinary from 'cloudinary';
import fs from 'fs';
import uniqid from 'uniqid';


/////GET ALL TRIPS

router.get('/', (req, res) => {

      Trip.find()
      .then(data => {
        if(data) {
          res.json({ result: true, trips: data});
        }

        else {
            res.json({ result: false, error: 'No trips to show' });
        }
    });
  
  })

  ///GET TRIPS BY PARTNER

  router.get('/byPartner/:partner', (req, res) => {

    Trip.find({name: req.params.partner})
    .then(data => {
        console.log(data);

      if(data && data.length > 0) {
        res.json({ result: true, trips: data.trips});
      }

      else {
          res.json({ result: false, error: 'This partner has not listed trips yet' });
      }
  });

})

/////GET TRIPS FILTERED BY PARAMS

router.get('/filter', (req, res) => {
    const filters = req.query;
    //Array de réponse où push les résultats du filtre
    const response = []
    //définition des constantes de mois pour comparer à l'intervale
    let minDay = (filters.minDurationDay ? filters.minDurationDay : undefined)
    let maxDay = (filters.maxDurationDay ? filters.maxDurationDay : undefined)
    let startDate = (filters.startDate ? filters.startDate : undefined)
    let endDate = (filters.endDate ? filters.endDate : undefined)

        Trip.find()
        .then(data => {
            
            for (let key in filters) {
                //Si les filtres mentionnent des intervalles de temps :
                if (key === 'minDurationDay' || key === 'maxDurationDay' || key === 'startDate' || key === 'endDate') {
                    
                }
                //Si les filtres sont des arrays de strings
                else if (key === 'tags', key === 'included') {

                }
                //pour tous les autres query parameters : 
                else {
                    data.map(trip => {
                        trip[key] == filters[key] && response.filter(e => e.id === trip.id).length === 0 ? response.push(trip) : false;
                })

                }
                
            }
            console.log(response);
            if(response.length > 0) {
                res.json({ result: true, trips: response});
              }
        
              else {
                  res.json({ result: false, error: 'No trips corresponding to the filters' });
              }
        }) 
  });


  export default router;
