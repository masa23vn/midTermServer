const express = require("express");
require('express-async-errors');

const router = express.Router();
const model = require('../utils/sql_command');

router.get("/", async (req, res) => {
  data = await model.getBoardByUser(req.user.user[0].ID);
  res.send(data);
});

router.get("/:id", async (req, res) => {
  const user = req.user.user[0];
  const boardID = +req.params.id;
  const [board, column] = await Promise.all([
    model.getBoardByID(boardID, user.ID),
    model.getAllColumnByBoardID(boardID, user.ID),
  ]);
  if (board) {
    board[0].column = column;
    res.send(board);
  }
  else {
    res.status(400).send({
      message: 'Page not found!'
    });
  }
});

router.post("/create", async (req, res) => {
  const user = req.user.user[0];
  const input = req.user.input;

  const newID = await model.createBoard([input.name, user.ID])
    .then((newID) => {
      model.createColumn(["Went well", newID.insertId]);
      model.createColumn(["To improve", newID.insertId]);
      model.createColumn(["Action items", newID.insertId]);
    });
  res.sendStatus(200)
});

router.post('/:id/edit', async (req, res) => {
  const user = req.user.user[0];
  const boardID = +req.params.id;
  const input = req.user.input;

  const board = await model.getBoardByID(boardID, user.ID);
  board[0].name = input.name;
  model.editBoard(board[0]);

  res.sendStatus(200)
});


router.post("/delete", async (req, res) => {
  const input = req.user.input;
  const [res1, res2] = await Promise.all([
    model.deleteColumn(input.ID),
    model.deleteBoard(input.ID),
  ]);

  res.sendStatus(200);
});

router.get("/:id/:idColumn/card/", async (req, res) => {
  const user = req.user.user[0];
  const input = req.user.input;
  const boardID = +req.params.id;
  const columnID = +req.params.idColumn;

  const [card] = await Promise.all([
    model.getAllCardByColumnID(columnID, boardID, user.ID),
  ]);
  if (card) {
    res.send(card);
  }
  else {
    res.status(400).send({
      message: 'Page not found!'
    });
  }
});


router.post("/:id/:idColumn/card/create", async (req, res) => {
  const user = req.user.user[0];
  const input = req.user.input;
  const boardID = +req.params.id;
  const columnID = +req.params.idColumn;

  const [column] = await Promise.all([
    model.getColumnByID(columnID, boardID, user.ID),
  ]);

  if (column) {
    const data = await model.createCard([input.des, columnID, user.ID]).then(
      () => {
        res.sendStatus(200)
      },
      (error) => {
        res.status(500).send({
          message: error,
        });
      });
  }
  else {
    res.status(400).send({
      message: 'Page not found!'
    });
  }
});

router.post("/:id/:idColumn/card/delete", async (req, res) => {
  const user = req.user.user[0];
  const input = req.user.input;
  const boardID = +req.params.id;
  const columnID = +req.params.idColumn;


  const card = await model.getCardByID(input.idCard, columnID, boardID, user.ID);

  if (card) {
    await model.deleteCard(card[0].ID)
      .then(() => {
        res.sendStatus(200)
      },
      (error) => {
        res.status(500).send({
          message: error,
        });
      });
  }
  else {
    res.status(400).send({
      message: 'Page not found!'
    });
  }
});

router.post('/:id/:idColumn/card/edit', async (req, res) => {
  const user = req.user.user[0];
  const input = req.user.input;
  const boardID = +req.params.id;
  const columnID = +req.params.idColumn;

  const card = await model.getCardByID(input.idCard, columnID, boardID, user.ID);
  if (card) {
    card[0].description = input.content;
    card[0].dateCreate = new Date();

    await model.editCard(card[0])
      .then(() => {
        res.status(200).send(card[0]);
      },
      (error) => {
        res.status(500).send({
          message: error,
        });
      });
  }
  else {
    res.status(400).send({
      message: 'Page not found!'
    });
  }
});

module.exports = router;