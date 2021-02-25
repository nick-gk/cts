const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require('express-validator');
const User = require("../../models/User");
const auth = require('../../middleware/auth');

router.get('/', auth.isLoggedIn, async(req, res) => {
   try {
      const user = await User.findOne({ where: {uuid: req.user.uuid} });
      user.password = null;
      return res.json(user);
   } catch (error) {
      res.status(400).json(error);
   }
})

router.post(
   '/register',
   [
      check('email', 'Campul email e obligatoriu').not().isEmpty(),
      check('password', 'Campul password e obligatoriu sau nu are cel putin 6 caractere').isLength({ min:6 }),
      check('nume', 'Campul nume este obligatoriu').not().isEmpty(),
      check('prenume', 'Campul prenume este obligatoriu').not().isEmpty(),
      check('role', 'Campul role este obligatoriu').not().isEmpty(),
   ],
   async (req, res) => {
      const errors = validationResult(req);

      if(!errors.isEmpty()) {
         return res.status(400).json({errors: errors.errors});
      }

      const { email, password, nume, prenume, role } = req.body;

      try {
         let userExists = await User.findOne({ where: {email: email}});
         if(userExists) {
            return res.status(400).json({errors: [{msg: "Userul este deja inregistrat"}]});
         }

         userPayload = {
            email: email,
            password: password,
            nume: nume,
            prenume: prenume,
            role: role
         }

         // Password Hashing
         const salt = await bcrypt.genSalt(10);
         userPayload.password = await bcrypt.hash(password, salt);
         await User.create(userPayload);

         let user = null;

         try {
            await User.findOne({ where: { email: email } })
               .then(response => user = response)
               .catch(err => console.log(err));
         } catch (error) {
            console.log(error);
            return res.status(500).json(error);
         }

         const payload = {
            user: {
               id: user.id,
               uuid: user.uuid,
               role: user.role
            }
         };

         jwt.sign(
            payload,
            config.get("secret"),
            { expiresIn: 36000 },
            (err, token) => {
               if(err) throw err;
               res.json({token});
            }
         )
      } catch(err) {
         console.log(err.message);
         res.status(500).send("Server Error");
      }
   }
)

router.post(
   '/login', 
   [
      check('email', 'Email is not valid').isEmail(),
      check('password', 'Password is required').exists()
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
         return res.status(401).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
         const user = await User.findOne({ where: {email: email} });

         if(!user) {
            return res.status(401).json({ errors: [{ msg: "Userul nu este inregistrat" }]});
         }

         bcrypt.compare(password, user.password).then((result) => {
            if(result) {
               const payload = {
                  user: {
                     id: user.id,
                     uuid: user.uuid,
                     role: user.role
                  }
               };
      
               jwt.sign(payload, config.get("secret"),
               { expiresIn: 36000 },
               function(err, token) {
                  if(err) throw err;
                  res.json({token});
               })
            } else {
               res.status(400).send({ errors: [{ msg: "Parola este Gresita" }] });
            }
         });        
      } catch (error) {
         console.log("err.message");
         res.status(500).send("Server Error");
      }
   }
);

router.get('/users', auth.isMP, async (req, res) => {
   try {
      await User.findAll().then(els => {
         res.status(200).json(els);
      }).catch(err => console.log(err));
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
});

module.exports = router;