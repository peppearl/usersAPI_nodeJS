const express = require('express');
const app = express();
const fs = require('fs');
const port = 12346;
const bodyparser = require('body-parser');
const joi = require('joi');
var cors = require('cors');

app.use(express.json());
app.use(cors())

const readUsers = () => JSON.parse(fs.readFileSync("./users.json").toString());
/*
const getAge = birthDates => new Date(
    (Date.now() - Date.parse(birthDates))
).getFullYear() - 1970
*/
// GET ----------

app.get('/users', (req, res) => {
    res.json(readUsers());
});

// POST ----------

app.post('/users', ({body}, res) => {

    // Récupère la liste des users
    const users = readUsers();
    const schema = joi.object({
        lastName: joi.string().required(),
        firstName: joi.string().required(),
        email: joi.string().email().required(),
        birthDate: joi.date().required(),
        avatarUrl: joi.string().uri().required(),
        gender: body.gender
    });
    const newUser = {
        id: Math.max(...users.map((user) => user.id)) + 1,
        lastName: body.lastName.toUpperCase(),
        firstName: body.firstName,
        email: body.email,
        birthDate: body.birthDate,
        avatarUrl: body.avatarUrl,
        gender: body.gender,
        //age: getAge(body.birthDates)
    };

    readUsers.push(newUser);

    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
    //console.log(JSON.stringify(users));
    res.json(users);

});

// PUT --------

app.put('/user/:id', (req, res) => {
    const body = req.body;

    //Recupère la liste des users
    const users = readUsers();

    //Création nouvel utilisateur
    const newUser = {
        id: id,
        lastName: body.lastName.toUpperCase(),
        firstName: body.firstName,
        email: body.email,
        birthDate: body.birthDate,
        avatarUrl: body.avatarUrl,
        gender: body.gender,
        //age: getAge(body.birthDates)
    };

    // Ajoute le nouveau user dans le tableau d'users
    const newUsers = [...users.filter((user) => user.id !== id), newUser];
    // Ecris dans le fichier pour insérer la liste des users
    fs.writeFileSync("./users.json", JSON.stringify(newUsers, null, 4));
    res.json(newUser);
});

app.get("/users/:id", (req, res) => {
    const body = req.body;

    // Récupère la liste des users
    const users = readUsers();
    const user = users.find((user) => user.id === Number(req.params.id));

    res.json(user);
});

app.listen(port, () => {
    console.log(`le port est lancé sur le port ${port} sur url http://localhost:${port}`)
})