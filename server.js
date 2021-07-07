// dependencies
const express = require('express');
const fs = require('fs');
const path = require('path');

// define the port
const PORT = process.env.PORT || 3001;

// create app
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { animals } = require('./data/animals');


// function to filter search queries by diet, species, personality traits, and name
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        personalityTraitsArray.forEach(trait => {
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

// function to find animal by id
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

// function to create new animal
function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
    return animal;
}

// function to validate the new animal and make sure it doesn't already exist
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

// route to fetch animals based on query
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

// route to fetch specific animals based on their id. if the id doesn't exist, throw a 404 error.
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if(result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

// route to add a new animal to the database via POST request
app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, throw 400 error
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
    
    // add animal to json file and animals array in the createNewAnimal function
        const animal = createNewAnimal(req.body, animals);

        res.json(animal);
    }
});

// sets the app to listen on either 3001 or default port
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});