import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class PantryApi {
  // the token for interacting with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${PantryApi.token}` };
    const params = method === "get" ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  static setToken(newToken) {
    this.token = newToken;
  }

  static _setDevTestingToken() {
    this.setToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZ" +
        "SI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTU5ODE1OTI1OX0." +
        "FtrMwBQwe6Ue-glIFgz_Nf8XxRT2YecFCiSpYL0fCXc"
    );
  }

  // Individual API routes

  // INGREDIENTS -------------------------------------

  /** Get details on an ingredient by name. */

  static async getIngredient(name) {
    let res = await this.request(`ingredients/${name}`);
    return res.ingredient;
  }

  /** Get a list of ingredients, optionally filtering by
   * nameLike, descriptionLike, or typeLike. */

  static async getIngredients(
    nameLike = "",
    descriptionLike = "",
    typeLike = ""
  ) {
    let data = {};
    if (nameLike !== "") data.nameLike = nameLike;
    if (descriptionLike !== "") data.descriptionLike = descriptionLike;
    if (typeLike !== "") data.typeLike = typeLike;

    let res = await this.request(`ingredients/`, data);
    return res.ingredients;
  }

  /** Given list of ingredients and username, add boolean "onHand" to
   *  each ingredient to indicate whether user possesses ingredient */

  static async indicateOnHandIngredients(listOfIngredients, username) {
    let user = await this.getUser(username);
    return listOfIngredients.map((i) => {
      return { ...i, onHand: user.ingredients.includes(i.name) };
    });
  }

  // RECIPES -------------------------------------

  /** Get details on a recipe by id. */

  static async getRecipe(id) {
    let res = await this.request(`recipes/${id}`);
    return res.recipe;
  }

  /** Get a list of recipes, optionally filtering by
   * nameLike, instructionsLike, categoryLike, or areaLike. */

  static async getRecipes(
    nameLike = "",
    instructionsLike = "",
    categoryLike = "",
    areaLike = ""
  ) {
    let data = {};
    if (nameLike !== "") data.nameLike = nameLike;
    if (instructionsLike !== "") data.instructionsLike = instructionsLike;
    if (categoryLike !== "") data.typeLike = categoryLike;
    if (areaLike !== "") data.areaLike = areaLike;

    let res = await this.request(`recipes/`, data);
    return res.recipes;
  }

  /** Given list of recipes and username, add boolean "isFavorite" to
   *  each recipe to indicate whether recipe is user's favorite */

  static async indicateFavoriteRecipes(listOfRecipes, username) {
    let user = await this.getUser(username);
    return listOfRecipes.map((r) => {
      return { ...r, isFavorite: user.recipes.includes(r.id) };
    });
  }

  // USERS -----------------------------------------

  /** Get details on a user by username. */

  static async getUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  /** Get a token with username and password */

  static async doLogin(username, password) {
    try {
      let res = await this.request(
        "auth/token",
        { username, password },
        "post"
      );

      this.setToken(res.token);
      return res.token;
    } catch (e) {
      console.log(e);
    }
  }

  /** Update a user's information. */

  static async updateUser(username, firstName, lastName, email, password) {
    try {
      try {
        await this.doLogin(username, password);
      } catch (e) {
        throw e;
      }
      let updatedUser = await this.request(
        `users/${username}`,
        { firstName, lastName, password, email },
        "patch"
      );

      return updatedUser;
    } catch (e) {
      console.log(e);
    }
  }

  /** Make a new user. */

  static async createUser(username, password, firstName, lastName, email) {
    try {
      let res = await this.request(
        "auth/register",
        { username, password, firstName, lastName, email },
        "post"
      );
      this.setToken(res.token);
      let createdUser = await this.getUser(username);
      return { user: createdUser, token: res.token };
    } catch (e) {
      console.log(e);
    }
  }

  /** Given username and ingredient name, add ingredient to user's store.  */

  static async addIngredientToUser(username, ingredientName) {
    try {
      let res = await this.request(
        `users/${username}/ingredients/${ingredientName}`,
        {},
        "post"
      );
      return res;
    } catch (e) {
      console.log(
        `Couldn't add ingredient ${ingredientName} to user ${username}.`
      );
    }
  }

  /** Given username and ingredient name, remove ingredient from user's store.  */

  static async removeIngredientFromUser(username, ingredientName) {
    try {
      let res = await this.request(
        `users/${username}/ingredients/${ingredientName}`,
        {},
        "delete"
      );
      return res;
    } catch (e) {
      console.log(
        `Couldn't remove ingredient ${ingredientName} from user ${username}.`
      );
    }
  }

  /** Given username and recipe id, add recipe to user's favorites.  */

  static async addRecipeToUser(username, recipeId) {
    try {
      let res = await this.request(
        `users/${username}/recipes/${recipeId}`,
        {},
        "post"
      );
      return res;
    } catch (e) {
      console.log(
        `Couldn't add recipe ${recipeId} to user ${username}'s favorites.`
      );
    }
  }

  /** Given username and ingredient name, remove recipe from user's favorites.  */

  static async removeRecipeFromUser(username, recipeId) {
    try {
      let res = await this.request(
        `users/${username}/recipes/${recipeId}`,
        {},
        "delete"
      );
      return res;
    } catch (e) {
      console.log(
        `Couldn't remove recipe ${recipeId} from user ${username}'s favorites.`
      );
    }
  }
}

export default PantryApi;
