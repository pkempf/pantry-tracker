-- both test users have the password 'password'

INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'test@testuser.com',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'admin@testuser.com',
        TRUE);

INSERT INTO recipes (name, instructions, category, area)
VALUES ('Pizza', 'Put all the toppings onto the dough then bake for 12 minutes at 425 F', 'Miscellaneous', 'Italian'),
       ('Caprese Salad', 'Chop the tomatoes and mozzarella into chunks no larger than an inch on a side; mix with basil and drizzle with balsamic',
       'Salad', 'Italian'),
       ('BLT Sandwich', 'Toast the bread and spread with mayonnaise. Add sliced tomatoes, strips of cooked bacon, and lettuce in any order.',
       'Sandwich', 'American'),
       ('Pop Tart', 'Put the Pop-Tart in the toaster, or just eat it raw, you filthy animal.', 'Dessert', 'Violently American');

INSERT INTO ingredients (name, description, type)
VALUES ('Pizza dough', 'Flat pre-cooked wheat dough', null),
       ('Tomato sauce', 'Made from pureed tomatoes and spices', 'sauce'),
       ('Mozzarella cheese', 'A soft, rubbery cheese made from buffalo or cow milk', 'cheese'),
       ('Basil', 'A somewhat anise-like herb from the mint family', 'herb'),
       ('Tomato', 'A tart red fruit (or vegetable, depending on who you ask) from the nightshade family', 'vegetable'),
       ('Balsamic vinegar', 'A strong and dark vinegar made from grape must', 'sauce'),
       ('Mayonnaise', 'A thick off-white condiment, based on egg whites and vinegar.', 'sauce'),
       ('Bread', 'It''s bread. It''s made of flour and some other stuff.', null),
       ('Lettuce', 'A leafy green vegetable', 'vegetable'),
       ('Bacon', 'Salted & cured fatty pork flesh, typically served cut into strips and pan-fried', 'meat'),
       ('Pop Tart', 'A horribly sweet so-called toaster pastry. It has frosting and some kind of unidentifiable filling.', null);

INSERT INTO recipe_ingredients (recipe_id, ingredient_name, ingredient_amount)
VALUES (1, 'Pizza dough', '1 whole'),
       (1, 'Tomato sauce', '1 cup'),
       (1, 'Mozzarella cheese', '2 cups, shredded'),
       (2, 'Mozzarella cheese', '2 cups, solid'),
       (2, 'Tomato', '2 whole'),
       (2, 'Basil', '1/2 cup'),
       (2, 'Balsamic vinegar', '1/4 cup'),
       (3, 'Bread', '2 slices'),
       (3, 'Lettuce', 'at least 2 large leaves'),
       (3, 'Tomato', 'at least 2 thick slices'),
       (3, 'Mayonnaise', '2 tbsp'),
       (3, 'Bacon', 'at least 2 strips'),
       (4, 'Pop Tart', '1, if you must');

INSERT INTO users_ingredients (username, ingredient_name)
VALUES ('testuser', 'Mozzarella cheese'),
       ('testuser', 'Tomato'),
       ('testuser', 'Bread'),
       ('testuser', 'Basil'),
       ('testuser', 'Balsamic vinegar'),
       ('testuser', 'Bacon'),
       ('testuser', 'Pop Tart');

INSERT INTO users_recipes (username, recipe_id)
VALUES ('testuser', 2),
       ('testuser', 3);
