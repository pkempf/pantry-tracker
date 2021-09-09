# Pantry Tracker
Capstone 2 for Springboard

This project is deployed [here](https://pkempf-pantry-tracker.surge.sh/), using Heroku and Surge.sh.

## Description

The Pantry Tracker is used to keep track of what ingredients an end user has or does not have in their pantry, to keep track of their favorite recipes, and to keep track of for which recipes they do or do not have all the ingredients on hand.

## Features

Currently implemented features include:
- Account creation and login with Bcrypt hashed passwords
- Ingredient collection, including saving and deleting ingredients from a user's pantry
- Recipe collection, including favoriting and unfavoriting recipes
- Recipe-ingredient associations, including identifying which ingredients are and are not on hand
- An admin console for adding and removing recipes and ingredients, and for associating ingredients with recipes

These features were what I considered the minimum viable product. More will be added in time.

## Tests

The backend can be tested by navigating to the /pantry-tracker-backend/ folder and running `jest -i`. The frontend can be tested (after running `npm install`) using `npm test`.

## Example user flow

A typical user would navigate to the site then either sign up for a new account or log in if they already have one. From there, they might navigate to the Ingredients page and search for the ingredients they bought at the store today, then mark those ingredients as on hand; they might also search for the ingredients they cooked with yesterday and mark them as not on hand. From there, they might go to the Recipes section and search for a good pasta recipe, then add it to their favorites. From there, they might keep the recipe page open while they cook dinner, using it as a reference.

## API 

Originally, this project was intended to use the TheMealDB/TheCocktailDB free APIs, but ultimately I opted to create my own API using Express.js. I started by designing the database schema, then by implementing basic models for each of the main types of object (ingredients, recipes, and users). At first I simply implented basic "CRUD" functionality for each model, and I then added the more complex interactions between them. I then finished by coding routes for each model, corresponding to the functions I had implemented on them.

## Technology stack

The front end was built using Node.js, and specifically using React.js. I used libraries including react-router-dom, react-bootstrap, bootswatch, font-awesome, and axios.

The back end was also built using Node.js, and in this case with Express.js. The database is PostgreSQL, with node-pg used as a library to link the database and the Express server.
