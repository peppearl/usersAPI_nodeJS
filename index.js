const express = require('express');
const app = express();
const fs = require('fs');
const port = 12346;
let cors = require('cors');
const fileUpload = require('express-fileupload');
const path = __dirname + '/views';
let history = require('connect-history-api-fallback');

app.use(express.static('images'))
app.use(express.static(path));
app.use(express.json());
app.use(cors())
app.use(fileUpload({
    createParentPath: true
}));
app.use(history({
    rewrites: [
        { from: /\/users/, to: '/users'}
    ]
}));

const readUsers = () => JSON.parse(fs.readFileSync("./users.json").toString());

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
    res.sendFile(path + "index.html");
    res.json(readUsers());
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

// POST ----------

//Create new user
app.post('/users', (req, res) => {

    // Récupère la liste des users
    const users = readUsers();
    const body = req.body

    if (!req.files) {
        return res.status(400).send('Photo manquante !');
    } else {
        let pic = req.files.pic;
        pic.mv('./images/' + pic.name);
        res.json(pic)

        const newUser = {
            id: Math.max(...users.map((user) => user.id)) + 1,
            lastName: body.lastName.toUpperCase(),
            firstName: body.firstName,
            email: body.email,
            birthDate: body.birthDate,
            pic: `http://localhost:${port}/` + pic.name,
            gender: body.gender,
            age: getAge(body.birthDate)
        };
        if (users.some((user) => user.email === newUser.email)) {
            return res.status(405).send('Email déjà pris !');
        } else {
            users.push(newUser);

            fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
            console.log(JSON.stringify(users));
            res.json(users);
        }
    }
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

    if (users.filter((user) => user.id !== newUser.id).some((user) => user.email === newUser.email)) {
        return res.status(405).send('Email déjà pris !');
    } else {
        //Add new user in users' list
        const newUsers = [...users.filter((user) => user.id !== id), newUser];

        //Write in JSON file to insert the new user to the users' list
        fs.writeFileSync("./users.json", JSON.stringify(newUsers, null, 4));
        res.json(newUser);
    }
});

// DELETE ---------

app.delete('/users/:id', (req, res) => {

    // Reading id from the URL
    const users = readUsers();
    const id = Number(req.params.id);

    // Remove user from the users' list
    let usersList = users.filter(i => {
        return i.id !== id;
    });

    //Delete user in json file
    fs.writeFileSync("./users.json", JSON.stringify(usersList, null, 4));
    res.json(usersList);

    res.send('User is deleted');

});

//Used port
app.listen(port, () => {
    console.log(`le port est lancé sur le port ${port} sur url http://localhost:${port}`)
})