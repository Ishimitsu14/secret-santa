const express = require('express');
const router = express.Router();
const fs = require('fs');

const findRandomChild = (playerId) => {
  const db = JSON.parse(fs.readFileSync(`${__dirname}/../db.json`));
  const playerIndex = db.players.findIndex(({ id, isSanta }) => id === Number(playerId) && !isSanta);
  const player = db.players[playerIndex];

  if (player) {

    const loop = () => {
      const secondPlayerIndex = Math.floor(Math.random() * db.players.length);
      const secondPlayer = db.players[secondPlayerIndex]
      if (secondPlayer.id !== player.id && !secondPlayer.isChild) {
        db.players[secondPlayerIndex].isChild = true;
        db.matches.push({ from: player.id, to: secondPlayer.id  })
      } else {
        loop();
      }
    }

    loop();

    db.players[playerIndex].isSanta = true;

    fs.writeFileSync(`${__dirname}/../db.json`, JSON.stringify(db), 'utf-8')

    return true;
  }

  return false;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  const db = JSON.parse(fs.readFileSync(`${__dirname}/../db.json`));

  const playerId = req.cookies.playerId;
  if (playerId) {
    res.redirect('/your-child')
  }

  res.render('index', { players: db.players.filter(({ isSanta }) => !isSanta) });
});

router.get('/become-santa', (req, res, next) => {
  const { playerId } = req.query;
  
  if (playerId) {
    findRandomChild(playerId)

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
    const match = db.matches.find(({ from }) => from === Number(playerId))
    const secondPlayer = db.players.find(({ id }) => match?.to === id)

    if (secondPlayer?.isChild) {
      res.render('your-child', { child: secondPlayer })
    } else {
      res.clearCookie('playerId')
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }
})


module.exports = router;
