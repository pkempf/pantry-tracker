import React, { useContext, useEffect, useCallback, useState } from "react";
import { Redirect, useParams } from "react-router-dom";
import UserContext from "../UserContext";
import PantryApi from "../api";
import AlertContext from "../AlertContext";
import { LinkContainer } from "react-router-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const EditRecipeAttributesForm = () => {
  const user = useContext(UserContext);
  const { id } = useParams();
  const { setMessage } = useContext(AlertContext);
  const [recipe, setRecipe] = useState({});
  const [needsInitialFormUpdate, setNeedsInitialFormUpdate] = useState(false);

  const FIELD_INITIAL_VALUES = {
    name: "",
    instructions: "",
    category: "",
    area: "",
  };

  const [formData, setFormData] = useState(FIELD_INITIAL_VALUES);

  useEffect(() => {
    let isRendered = true;

    async function getRecipe(recipeId) {
      try {
        if (isRendered && user.username) {
          let recipeRes = await PantryApi.getRecipe(recipeId);
          setRecipe({ ...recipeRes });
          setNeedsInitialFormUpdate(true);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getRecipe(id);

    return () => {
      isRendered = false;
    };
  }, [user.username, id]);

  useEffect(() => {
    if (needsInitialFormUpdate) {
      setFormData({
        name: recipe.name,
        instructions: recipe.instructions,
        category: recipe.category,
        area: recipe.area,
      });
      setNeedsInitialFormUpdate(false);
    }
  }, [needsInitialFormUpdate, recipe]);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  const edit = useCallback(
    async (rcp) => {
      try {
        await PantryApi.editRecipe(id, rcp);
        setMessage({
          text: `Edited recipe ${id} (${rcp.name})!`,
          variant: "success",
        });
        setRecipe(rcp);
      } catch (err) {
        setMessage({
          text: `Error editing recipe ${id} (${rcp.name}).`,
          variant: "danger",
        });
      }
    },
    [setMessage, id]
  );

  const getInput = (evt) => {
    evt.preventDefault();
    edit(formData);
  };

  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <Row className="EditRecipeAttributesForm justify-content-center">
      <Col sm={10} md={8}>
        <Card>
          <Card.Header as="h4">
            {`Edit recipe with id ${id}`}
            <LinkContainer to={`/recipes/${id}/editingredients`}>
              <Button variant="primary" className="btn-sm ml-2 mb-2">
                Edit Ingredients
              </Button>
            </LinkContainer>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={getInput}>
              <Form.Group key="name" controlId="name">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required={true}
                  placeholder="Enter instructions here."
                />
              </Form.Group>
              <Form.Group key="instructions" controlId="instructions">
                <Form.Label>Instructions:</Form.Label>
                <Form.Control
                  type="text"
                  name="instructions"
                  value={formData.instructions || ""}
                  onChange={handleChange}
                  required={true}
                  placeholder="Enter instructions here."
                  style={{ height: "100px" }}
                  as="textarea"
                />
              </Form.Group>
              <Form.Group key="category" controlId="category">
                <Form.Label>Category:</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  required={false}
                  placeholder="Enter a category here."
                />
              </Form.Group>
              <Form.Group key="area" controlId="area">
                <Form.Label>Area:</Form.Label>
                <Form.Control
                  type="text"
                  name="area"
                  value={formData.area || ""}
                  onChange={handleChange}
                  required={false}
                  placeholder="Enter an area here."
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mr-2">
                Edit Recipe
              </Button>
              <LinkContainer to="/admin">
                <Button variant="secondary">Back</Button>
              </LinkContainer>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default EditRecipeAttributesForm;
