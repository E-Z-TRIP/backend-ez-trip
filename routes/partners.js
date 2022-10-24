import express from 'express';
import bcrypt from 'bcrypt';
import uid2 from 'uid2';
import { validateReqBody, validateEmail } from '../lib/helpers.js';
import Partner from '../db/models/Partner.js';
import Trip from '../db/models/Trip.js';
const router = express.Router();

const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//*ROUTE ADD A PARTNER

router.post('/', async (req, res) => {
  if (
    validateReqBody({
      body: req.body,
      expectedPropertys: ['name', 'email', 'password', 'address', 'country'],
    }) 
    && validateEmail(req.body.email)
  ) {
    const { name, email, password, address, country } = req.body;
    if (await Partner.findOne({ name })) return res.json({ result: false, error: 'Partner already exists' }); //vérifiée et fonctionne
    new Partner({
    token: uid2(35),
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      address,
      country,
      inscriptionDate : new Date(), // ici new Date, donc pas besoin de créer un champ pour que les partners rentrent eux même leur date d'inscription
    }).save().then(data => {
        res.json({ result: true, newPartner: data }); // vérifiée et fonctionne
    })
  } else {
    res.json({ result: false, error: 'Invalid partner data' }); //vérifiée et fonctionne
  }
});

//* DELETE A PARTNER

//* ADD A TRIP

router.post('/trips', async (req, res) => {
    if (
      validateReqBody({
        body: req.body,
        expectedPropertys: ['name', 'country', 'partnerID', 'addressDeparture', 'minDurationDay', 
        'maxDurationDay', 'start', 'end', 'description', 'included', 'nonIncluded', 'photos', 'background', 'tags'],
      })
    ) {
      const { name, country, partnerID, addressDeparture, minDurationDay, maxDurationDay, travelPeriod, description, included, 
        nonIncluded, photos, background, tags,   } = req.body;
      if (await Trip.findOne({ name })) return res.json({ result: false, error: 'Partner already exists' }); //? à vérifier
      new Trip({
        name,
        country,
        partnerID, //* clé étrangère, string de l'ID 
        addressDeparture,
        minDurationDay,
        maxDurationDay,
        travelPeriod, //* le front envoie un tableau d'objets
        description,
        included, //* le front envoie un tableau de strings
        nonIncluded, //* le front envoie un tableau de strings
        // photos, //* le front envoie un tableau de strings
        background,
        tags, //* le front envoie un tableau de strings
        // program :[  {
        //   nbDay,
        //   detailedProgram: [{day, activities}],
        //   price
        // } ]
      }).save().then(data => {
          res.json({ result: true, newTrip: data }); //? a verifier
      })
    } else {
      res.json({ result: false, error: 'Invalid trip data' }); //? a verifier
    }
  });

//* add program

//* add photos


export default router;
