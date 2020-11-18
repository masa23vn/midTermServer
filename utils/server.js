const model = require('../utils/sql_command');
require('express-async-errors');

module.exports = function (io) {
  io.on("connection", socket => {

    // get board
    socket.on("alert_board", async (boardID) => {
      const [board, columnList, cardList] = await Promise.all([
        model.getBoardByID(boardID),
        model.getAllColumnByBoardID(boardID),
        model.getAllCardByBoardID(boardID),
      ]);
      if (board) {
        // mapping
        for (const column of columnList) {
          const id = column.ID;
          column.card = [];
          for (const card of cardList) {
            if (card.idColumnBoard === id) {
              column.card.push(card);
            }
          }
        }
        board[0].column = columnList;
        const getAddress = "get_board_" + boardID;
        socket.emit(getAddress, board);
      }
    });

    socket.on("change_name", async (data) => {
      const board = await model.getBoardByID(data.ID);
      board[0].name = data.newName;
      const check = await model.editBoard(board[0]);

      const changeAddress = "change_board_" + data.ID;
      socket.broadcast.emit(changeAddress);
    });

    socket.on("add_card", async (data, cb) => {
      const formatDate = new Date(data.date);

      // create new card
      const [column, maxPos] = await Promise.all([
        model.getColumnByID(data.columnID, data.boardID),
        model.getMaxPosByIDColumn(data.columnID, data.boardID),
      ]);
      if (column && column !== undefined && column.length != 0) {
        let pos = 1;
        if (maxPos && maxPos !== undefined && maxPos.length != 0) {
          pos = maxPos[0].max + 1;
        }
        const newID = await model.createCard([data.des, formatDate, data.columnID, null, pos]);      // need user

        const changeAddress = "change_board_" + data.boardID;
        socket.broadcast.emit(changeAddress);

        // callback function
        cb(newID.insertId);
      }
    });

    socket.on("delete_card", async (data) => {
      const [card, maxPos] = await Promise.all([
        model.getCardByID(data.cardID, data.columnID, data.boardID),
        model.getMaxPosByIDColumn(data.columnID, data.boardID),
      ]);

      if (card && card !== undefined && card.length != 0) {
        await model.deleteCard(card[0].ID);
        model.moveCardUp(card[0].pos, maxPos[0].max + 1, card[0].idColumnBoard);

        const changeAddress = "change_board_" + data.boardID;
        socket.broadcast.emit(changeAddress);
      }
    });

    socket.on("edit_card", async (data) => {
      const card = await model.getCardByID(data.cardID, data.columnID, data.boardID);
      if (card && card !== undefined && card.length != 0) {
        card[0].description = data.des;
        card[0].dateCreate = new Date();
        await model.editCard(card[0])

        const changeAddress = "change_board_" + data.boardID;
        socket.broadcast.emit(changeAddress);
      }
    });

    socket.on("move_card", async (data) => {
      const card = await model.getCardByID(data.cardID, data.columnID, data.boardID);
      if (card && card !== undefined && card.length != 0) {
        if (data.from > data.to) {
          await model.moveCardDown(data.to, data.from, data.columnID);    // move all cards have pos between "to" and "from" down 1 
          await model.editCardPos(data.to, data.cardID)
        }
        else {
          await model.moveCardUp(data.from, data.to, data.columnID);      // move all cards have pos between "from" and "to" up 1 
          await model.editCardPos(data.to, data.cardID)
        }

        const changeAddress = "change_board_" + data.boardID;
        socket.broadcast.emit(changeAddress);
      }
    });

    socket.on("move_card_2_col", async (data) => {
      const [card, maxPosStart, maxPosDes] = await Promise.all([
        model.getCardByID(data.cardID, data.startColumnID, data.boardID),
        model.getMaxPosByIDColumn(data.startColumnID, data.boardID),
        model.getMaxPosByIDColumn(data.desColumnID, data.boardID),
      ]);
      if (card && card !== undefined && card.length != 0) {
        // des col
        await model.moveCardDown(data.to, maxPosDes[0].max + 1, data.desColumnID);

        // change card
        const newCard = card.slice();
        newCard[0].idColumnBoard = data.desColumnID;
        newCard[0].pos = data.to;
        await model.editCard(newCard[0]);

        // start col
        await model.moveCardUp(data.from, maxPosStart[0].max + 1, data.startColumnID);



        const changeAddress = "change_board_" + data.boardID;
        socket.broadcast.emit(changeAddress);
      }

    });

    // disconnect is fired when a client leaves the server
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}
