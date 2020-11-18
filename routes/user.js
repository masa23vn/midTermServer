const express = require("express");
require('express-async-errors');

const router = express.Router();
const model = require('../utils/sql_command');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');


/* GET users listing. */
router.get('/', async (req, res) => {
  const user = await model.getUserByID(req.user.user[0].ID);
  res.send(user);
});

router.post('/changeinfo/', async (req, res) => {
  const user = req.user.user[0];
  const input = req.user.input;
  // check same gmail
  if (user.email !== input.newEmail) {
    const check1 = await model.getUserByEmail(input.newEmail);
    if (check1.length > 0) {
      return res.status(400).send({
        message: 'Email đã tồn tại!'
      });
    }
  }

  // check same username
  if (user.username !== input.newUsername) {
    const check2 = await model.getUserByUsername(input.newUsername);
    if (check2.length > 0) {
      return res.status(400).send({
        message: 'Username đã tồn tại!'
      });
    }
  }

  user.username = input.newUsername;
  user.fullname = input.newFullname;
  user.email = input.newEmail;

  await model.updateUser(user);
  res.sendStatus(200)
});

router.post('/changepass/', async (req, res) => {
  const user = req.user.user[0];
  const input = req.user.input;
  // check same old password
  if (bcrypt.compareSync(input.oldPass, user.password)) {
    const hash = bcrypt.hashSync(input.newPass, 10);
    user.password = hash;
    await model.updateUser(user);
    res.sendStatus(200)
  }
  else {
    res.status(401).send({
      message: 'Old password is wrong!'
    });
  }
});

// list of board
router.get("/board/", async (req, res) => {
  data = await model.getBoardByUser(req.user.user[0].ID);
  res.send(data);
});

router.post("/board/create/", async (req, res) => {
  const user = req.user.user[0];
  const input = req.user.input;

  const boardID = uuidv4();
  await model.createBoard([boardID, input.name, user.ID]);

  await model.createColumn(["Went well", boardID]);
  await model.createColumn(["To improve", boardID]);
  await model.createColumn(["Action items", boardID]);
  res.status(200).send({
    ID: boardID,
  });

});

router.post("/board/delete/", async (req, res) => {
  const input = req.user.input;
  await Promise.all([
    model.deleteColumn(input.ID),
    model.deleteBoard(input.ID),
  ]);
  res.sendStatus(200);
});

module.exports = router;
