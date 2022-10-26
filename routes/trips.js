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
    let minDay = (filters.minDurationDay ? filters.minDurationDay : 1)
    let maxDay = (filters.maxDurationDay ? filters.maxDurationDay : 365)
    let startMonth = (filters.startMonth ? filters.startMonth : 0)
    let endMonth = (filters.endMonth ? filters.endMonth : 12)
    let priceMin = (filters.priceMin ? filters.endMonth : 0)
    let priceMax = (filters.priceMax ? filters.endMonth : 30000)


        Trip.find()
        .then(data => {
            
            for (let key in filters) {
                //Si les filtres mentionnent des intervalles de temps :
                if (key === 'minDurationDay' || key === 'maxDurationDay' || key === 'startMonth' || key === 'endMonth' || key === 'priceMax' || key === 'priceMin') {
                    data.map(trip => {
                        (trip.price >= priceMin && trip.price <= priceMax) && (trip.minDurationDay >= minDay && trip.maxDurationDay <= maxDay) && (trip.travelPeriod.start >= startMonth && trip.travelPeriod.end <= endMonth) && response.filter(e => e.id === trip.id).length === 0 ? response.push(trip) : false;
                })
                }
                //Si les filtres sont des arrays de strings
                else if (key === 'tags', key === 'included') {
                    data.map(trip => {
                        trip[key].indexOf(filters[key]) != -1 && response.filter(e => e.id === trip.id).length === 0 ? response.push(trip) : false;
                })
                }
                //pour tous les autres query parameters : 
                else {
                    data.map(trip => {
                        trip[key] == filters[key] && response.filter(e => e.id === trip.id).length === 0 ? response.push(trip) : false;
                })

                }
                
            }
            console.log(response);
            //si la réponse contient au moins un trip, renvoyer la réponse
            if(response.length > 0) {
                res.json({ result: true, trips: response});
              }
            // si la réponse est vide, aucun voyage ne correspond à la recherche
              else {
                  res.json({ result: false, error: 'No trips corresponding to the filters' });
              }
        }) 
  });


  export default router;
