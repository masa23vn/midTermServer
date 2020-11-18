const db = require("./database");

module.exports = {
    getBoardByUser: (userID) =>
        db.loadSafe(`SELECT b.ID, b.name
                FROM board as b
                WHERE b.idUser = ?
                ORDER BY b.dateCreate ASC`, [userID]),

    getBoardByID: (boardID) =>
        db.loadSafe(`SELECT b.*
                FROM board as b
                WHERE b.ID = ?`, [boardID]),

    getAllColumnByBoardID: (boardID) =>
        db.loadSafe(`SELECT c.*
                FROM columnboard as c JOIN board as b ON c.idBoard = b.ID
                WHERE c.idBoard = ?`, [boardID]),

    getColumnByID: (columnID, boardID) =>
        db.loadSafe(`SELECT c.*
                    FROM columnboard as c JOIN board as b ON c.idBoard = b.ID
                    WHERE c.ID = ? AND c.idBoard = ?`, [columnID, boardID]),

    getAllCardByBoardID: (boardID) =>
        db.loadSafe(`SELECT ca.*
                    FROM card as ca JOIN columnboard as c ON ca.idColumnBoard = c.ID
                                        JOIN board as b ON c.idBoard = b.ID
                    WHERE c.idBoard = ?
                    ORDER BY ca.pos ASC`, [boardID]),

    getMaxPosByIDColumn: (columnID, boardID) =>
        db.loadSafe(`SELECT MAX(ca.pos) as max
                    FROM card as ca JOIN columnboard as c ON ca.idColumnBoard = c.ID
                                        JOIN board as b ON c.idBoard = b.ID
                    WHERE c.ID = ? AND c.idBoard = ?`, [columnID, boardID]),

    getCardByID: (cardID, columnID, boardID) =>
        db.loadSafe(`SELECT ca.*
                    FROM card as ca JOIN columnboard as c ON ca.idColumnBoard = c.ID
                                        JOIN board as b ON c.idBoard = b.ID
                    WHERE ca.ID = ? AND c.ID = ? AND c.idBoard = ?`, [cardID, columnID, boardID]),


    getUserByID: (ID) =>
        db.loadSafe(`SELECT *
                FROM user
                WHERE ID = ? `, [ID]),

    getUserByUsername: (username) =>
        db.loadSafe(`SELECT *
                FROM user
                WHERE username = ? `, [username]),

    getUserByEmail: (email) =>
        db.loadSafe(`SELECT *
                FROM user
                WHERE email = ? `, [email]),

    getUserByNameOrEmail: ({ username, email }) =>
        db.loadSafe(`SELECT *
            FROM user
            WHERE username = ? OR email = ?`, [username, email]),

    login: ({ username, password }) =>
        db.loadSafe(`SELECT *
                FROM user
                WHERE username = ? AND password = ? `, [username, password]),

    updateUser: (entity) => {
        const condition = { ID: entity.ID };
        delete entity.ID;
        return db.patch(`user`, entity, condition);
    },

    register: ([username, password, email, fullname]) => {
        const newUser = {
            username: username,
            password: password,
            email: email,
            fullname: fullname,
            status: 1,
        }
        return db.add(`user`, newUser)
    },

    createBoard: ([boardID, name, ID]) => {
        const dateCreate = new Date();
        const newBoard = {
            ID: boardID,
            name: name,
            description: null,
            dateCreate: dateCreate,
            status: 1,
            idUser: ID
        }
        return db.add(`board`, newBoard)
    },

    deleteBoard: (ID) => {
        const condition = { ID: ID };
        return db.delete(`board`, condition);
    },

    editBoard: (entity) => {
        const condition = { ID: entity.ID };
        delete entity.ID;
        return db.patch(`board`, entity, condition);
    },

    createColumn: ([name, ID]) => {
        const newColumn = {
            name: name,
            status: 1,
            idBoard: ID
        }
        return db.add(`columnboard`, newColumn)
    },

    deleteColumn: (idBoard) => {
        const condition = { idBoard: idBoard };
        return db.delete(`columnboard`, condition);
    },

    createCard: ([des, date, idColumn, idUser, pos]) => {
        const newCard = {
            description: des,
            dateCreate: date,
            status: 1,
            idColumnBoard: idColumn,
            idUser: idUser,
            pos: pos
        }
        return db.add(`card`, newCard)
    },

    deleteCard: (idCard) => {
        const condition = { ID: idCard };
        return db.delete(`card`, condition);
    },
    editCard: (entity) => {
        const condition = { ID: entity.ID };
        delete entity.ID;
        return db.patch(`card`, entity, condition);
    },

    editCardPos: (pos, cardID) =>
        db.loadSafe(`UPDATE card
                SET pos = ?
                WHERE ID = ?`, [pos, cardID]),


    moveCardUp: (from, to, columnID) =>
        db.loadSafe(`UPDATE card
                    SET pos = (pos - 1)
                    WHERE pos > ? AND pos <= ?
                    AND idColumnBoard = ?`, [from, to, columnID]),

    moveCardDown: (from, to, columnID) =>
        db.loadSafe(`UPDATE card
                    SET pos = (pos + 1)
                    WHERE pos >= ? AND pos < ?
                    AND idColumnBoard = ?`, [from, to, columnID]),

};