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

//get age thanks to date birth
getAge = (dateString) => {
    let today = new Date();
    let birthDates = new Date(dateString);
    let age = today.getFullYear() - birthDates.getFullYear();
    let m = today.getMonth() - birthDates.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDates.getDate())) {
        age--;
    }
    return age;
}

// GET ----------

//Show users' list
app.get('/users', (req, res) => {
    res.json(readUsers());
});

// POST ----------

app.post('/users', ({body}, res) => {

    // Récupère la liste des users
    const users = readUsers();
    /*
    const schema = joi.object({
        lastName: joi.string().required(),
        firstName: joi.string().required(),
        email: joi.string().email().required(),
        birthDate: joi.date().required(),
        pic: joi.string().uri().required(),
        gender: body.gender,
        age: getAge(body.birthDate)
    });
     */
    const newUser = {
        id: Math.max(...users.map((user) => user.id)) + 1,
        lastName: body.lastName.toUpperCase(),
        firstName: body.firstName,
        email: body.email,
        birthDate: body.birthDate,
        pic: body.pic,
        gender: body.gender,
        age: getAge(body.birthDate)
    };

    users.push(newUser);

    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
    console.log(JSON.stringify(users));
    res.json(users);
});

// PUT --------
//Adding new user or edit existing user
app.put('/users/:id', (req, res) => {
    const body = req.body;

    //Get the users' list
    const users = readUsers();

    //Create new user
    const id = Number(req.params.id);
    const newUser = {
        id: id,
        lastName: body.lastName.toUpperCase(),
        firstName: body.firstName,
        email: body.email,
        birthDate: body.birthDate,
        pic: body.pic,
        gender: body.gender,
        age: getAge(body.birthDate)
    };

    //Add new user in users' list
    const newUsers = [...users.filter((user) => user.id !== id), newUser];

    //Write in JSON file to insert the new user to the users' list
    fs.writeFileSync("./users.json", JSON.stringify(newUsers, null, 4));
    res.json(newUser);
});

//Show only one user
app.get("/users/:id", (req, res) => {
    const body = req.body;

    // Get the user from the list by ID
    const users = readUsers();
    const user = users.find((user) => user.id === Number(req.params.id));

    //Show the user
    res.json(user);
});

//Used port
app.listen(port, () => {
    console.log(`le port est lancé sur le port ${port} sur url http://localhost:${port}`)
})