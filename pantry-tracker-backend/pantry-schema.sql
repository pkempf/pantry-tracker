CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE ingredients (
    name TEXT PRIMARY KEY,
    description TEXT,
    type TEXT
);

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    instructions TEXT NOT NULL,
    category TEXT,
    area TEXT
);

CREATE TABLE recipe_ingredients (
    recipe_id INTEGER
        REFERENCES recipes ON DELETE CASCADE,
    ingredient_name TEXT
        REFERENCES ingredients ON DELETE CASCADE,
    ingredient_amount TEXT NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_name)
);

CREATE TABLE users_ingredients (
    username VARCHAR(25)
        REFERENCES users ON DELETE CASCADE,
    ingredient_name TEXT
        REFERENCES ingredients ON DELETE CASCADE,
    PRIMARY KEY (username, ingredient_name)
);

CREATE TABLE users_recipes (
    username VARCHAR(25)
        REFERENCES users ON DELETE CASCADE,
    recipe_id INTEGER
        REFERENCES recipes ON DELETE CASCADE,
    PRIMARY KEY (username, recipe_id)
);