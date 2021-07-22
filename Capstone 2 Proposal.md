# Capstone 2

### Tech Stack

- I'll be using React and Node.js with Express, for this project. I'll use PostgreSQL for the database.

### Focus

- This will be a full-stack application, but primary focus will be on the front-end, as the API I'm using provides much of the back-end functionality. More on that later.

### Form factor

- This will be a website, but I'll use react-bootstrap in such a way that it will be perfectly functional when used on mobile browsers. Perhaps in the future I might port it to React Native.

### Goal

- The idea of this project is to make a bar/kitchen/recipe tracker, with which users will track their on-hand ingredients, receive a selection of what meals or drinks can be made using those ingredients, save their favorite recipes, and quickly see what ingredients are missing to make those favorite recipes.

### Demographics

- This app is intended for home consumer usage - amateur chefs and mixologists who want to make nice things at home, not professional restauranteurs or bartenders.

### Data

- This app will use the CocktailDB and MealDB APIs, which are run jointly by one company. This API provides the functionality of identifying which meals can be made with which ingredients.

### Approach

- Database schema:
  - My plan is to have a users table, an ingredients table, a recipes table, a table connecting users to their on-hand ingredients, and a table connecting users to their favorite recipes.
- Potential API issue:
  - One possible issue with the API is that there may be a cap on number of submissible ingredients to the "what meals/drinks can I make with these" API call. If so I'll have to work around that.
- Sensitive information:
  - The only sensitive information I'll need to secure is my API key and users' emails (?) and passwords.
- Included functionality:
  - Login/logout
  - Save/remove ingredients
  - View currently obtainable recipes
  - Search recipes
  - Save favorite recipes
  - View saved recipes & check ingredient status
  - Possible share/print function?
  - Possible rating function?
- User flow:
  - On reaching the site, users will log in and be greeted with a homepage containing a quick view of their on-hand ingredients and their saved recipes. From there they can view the recipes which can be made with what they've got, they can search for more recipes, they can add or remove ingredients, and they can click their saved recipes to check whether everything necessary to make them is on hand. There will also be a user preferences/account edit page.
  - I'll also likely require users to enter their DOB to prove they're over 21 if they want to access cocktail recipes.
- What makes this app worthwhile:
  - The saving/rating functionality, the recipe search, and the missing ingredient identifier all raise this app above CRUD-only level. 
  - Stretch goals include adding recipes (difficult with using the API) and a share function.