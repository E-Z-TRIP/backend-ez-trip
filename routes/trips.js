import express from 'express';
import { validateReqBody } from '../lib/helpers.js';
import Trip from '../db/models/Trip.js';
const router = express.Router();

/////GET ALL TRIPS

router.get('/', (req, res) => {
  Trip.find().then((data) => {
    if (data) {
      res.json({ result: true, trips: data });
    } else {
      res.json({ result: false, error: 'No trips to show' });
    }
  });
});

/////GET TRIP BY ID

router.get('/tripById/:id', (req, res) => {
  console.log(req.params);
  if (validateReqBody({ body: req.params, expectedPropertys: ['id'] })) {
    Trip.findOne({ _id: req.params.id }).then((data) => {
      if (data) {
        console.log(data);
        res.json({ result: true, trip: data });
      } else {
        res.json({ result: false, error: 'Trip not found' });
      }
    });
  } else {
    res.json({ result: false, error: 'Invalid request parameters' });
  }
});

///GET TRIPS BY PARTNER

router.get('/byPartner/:partner', (req, res) => {
  if (validateReqBody({ body: req.params, expectedPropertys: ['partner'] })) {
    Trip.find({ name: req.params.partner }).then((data) => {
      if (data && data.length > 0) {
        res.json({ result: true, trips: data.trips });
      } else {
        res.json({ result: false, error: 'This partner has not listed trips yet' });
      }
    });
  } else {
    res.json({ result: false, error: 'Invalid request parameters' });
  }
});

/////GET TRIPS FILTERED BY PARAMS

router.get('/filter', (req, res) => {
  const filters = req.query;
  //Array de réponse où push les résultats du filtre
  const response = [];
  //définition des constantes de mois pour comparer à l'intervale
  let minDay = filters.minDurationDay ? filters.minDurationDay : 1;
  let maxDay = filters.maxDurationDay ? filters.maxDurationDay : 365;
  let startMonth = filters.startMonth ? filters.startMonth : 1;
  let endMonth = filters.endMonth ? filters.endMonth : 12;
  let minBudget = filters.minBudget ? filters.minBudget : 0;
  let maxBudget = filters.maxBudget ? filters.maxBudget : 30000;

  Trip.find().then((data) => {
    for (let key in filters) {
      //Si les filtres concernent des nombres (et donc des intervales, type date, prix...)
      if (typeof Number(filters[key]) === 'number') {
        data.map((trip, i) => {
          let minPriceTrip = trip.program[0].price; //prix du plus court programme = "à partir de...€"

          if (
            minPriceTrip >= minBudget &&
            minPriceTrip <= maxBudget &&
            trip.minDurationDay >= minDay &&
            trip.maxDurationDay <= maxDay &&
            trip.travelPeriod[0].start >= startMonth &&
            trip.travelPeriod[0].end <= endMonth &&
            response.filter((e) => e.id === trip.id).length === 0
          ) {
            response.push(trip);
          }
        });
      }
      //Si les filtres sont des arrays de strings
      else if ((key === 'tags', key === 'included')) {
        data.map((trip) => {
          trip[key].indexOf(filters[key]) != -1 && response.filter((e) => e.id === trip.id).length === 0
            ? response.push(trip)
            : false;
        });
      }
      //pour tous les autres query parameters :
      else {
        data.map((trip) => {
          trip[key] == filters[key] && response.filter((e) => e.id === trip.id).length === 0
            ? response.push(trip)
            : false;
        });
      }
    }
    //si la réponse contient au moins un trip, renvoyer la réponse
    if (response.length > 0) {
      res.json({ result: true, trips: response });
    }
    // si la réponse est vide, aucun voyage ne correspond à la recherche
    else {
      res.json({ result: false, error: 'No trips corresponding to the filters' });
    }
  });
});

export default router;
