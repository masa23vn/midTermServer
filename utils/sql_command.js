const db = require("./database");

module.exports = {
    getBoardByUser: (ID) =>
        db.loadSafe(`SELECT *
                FROM board
                WHERE idUser = ? `, [ID]),

    getBoardByID: (boardID, userID) =>
        db.loadSafe(`SELECT b.*
                FROM board as b JOIN user as u ON b.idUser = u.ID
                WHERE b.ID = ? AND u.ID = ?`, [boardID, userID]),

    getAllColumnByBoardID: (boardID, userID) =>
        db.loadSafe(`SELECT c.*
                FROM columnboard as c JOIN board as b ON c.idBoard = b.ID
                                    JOIN user as u ON b.idUser = u.ID
                WHERE c.idBoard = ? AND u.ID = ?`, [boardID, userID]),

    getColumnByID: (columnID, boardID, userID) =>
        db.loadSafe(`SELECT c.*
                    FROM columnboard as c JOIN board as b ON c.idBoard = b.ID
                                        JOIN user as u ON b.idUser = u.ID
                    WHERE c.ID = ? AND c.idBoard = ? AND u.ID = ?`, [columnID, boardID, userID]),

    getAllCardByColumnID: (columnID, boardID, userID) =>
        db.loadSafe(`SELECT ca.*
                    FROM card as ca JOIN columnboard as c ON ca.idColumnBoard = c.ID
                                        JOIN board as b ON c.idBoard = b.ID
                                        JOIN user as u ON b.idUser = u.ID
                    WHERE c.ID = ? AND c.idBoard = ? AND u.ID = ?`, [columnID, boardID, userID]),

    getCardByID: (cardID, columnID, boardID, userID) =>
        db.loadSafe(`SELECT ca.*
                    FROM card as ca JOIN columnboard as c ON ca.idColumnBoard = c.ID
                                        JOIN board as b ON c.idBoard = b.ID
                                        JOIN user as u ON b.idUser = u.ID
                    WHERE ca.ID = ? AND c.ID = ? AND c.idBoard = ? AND u.ID = ?`, [cardID, columnID, boardID, userID]),


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

    createBoard: ([name, ID]) => {
        const dateCreate = new Date();
        const newBoard = {
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

    createCard: ([des, idColumn, idUser]) => {
        const dateCreate = new Date();
        const newCard = {
            description: des,
            dateCreate: dateCreate,
            status: 1,
            idColumnBoard: idColumn,
            idUser: idUser
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

};