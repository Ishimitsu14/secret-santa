const express = require('express');
const router = express.Router();
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  const db = JSON.parse(fs.readFileSync(`${__dirname}/../db.json`));

  const playerId = req.cookies.playerId;
  if (playerId) {
    res.redirect('/your-child')
  }

  res.render('index', { players: db.players });
});

router.get('/become-santa', (req, res, next) => {
  const db = JSON.parse(fs.readFileSync(`${__dirname}/../db.json`));
  const { playerId } = req.query;
  
  if (playerId) {
    const playerIndex = db.players.findIndex(({ id }) => id === Number(playerId));
    const player = db.players[playerIndex];
    db.players.splice(playerIndex, 1);

    const childIndex = Math.floor(Math.random() * db.players.length) 
    db.matches.push({ from: player, to: db.players[childIndex]  })
    db.players.splice(childIndex, 1);

    fs.writeFileSync(`${__dirname}/../db.json`, JSON.stringify(db), 'utf-8')

    res.cookie('playerId', playerId, { httpOnly: true });
    res.redirect('/your-child')
  } {
    res.redirect('/')
  }
})

router.get('/your-child', (req, res) => {
  const db = JSON.parse(fs.readFileSync(`${__dirname}/../db.json`));

  const playerId = req.cookies.playerId;

  if (playerId) {
    const match = db.matches.find(({ from: { id } }) => id === Number(playerId))

    res.render('your-child', { child: match.to })
  } else {
    res.redirect('/');
  }
})


module.exports = router;
