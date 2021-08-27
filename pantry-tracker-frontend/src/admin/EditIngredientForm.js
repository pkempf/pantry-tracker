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

const EditIngredientForm = () => {
  const user = useContext(UserContext);
  const { name } = useParams();
  const { setMessage } = useContext(AlertContext);
  const [ingredient, setIngredient] = useState({});
  const [needsInitialFormUpdate, setNeedsInitialFormUpdate] = useState(false);

  const FIELD_INITIAL_VALUES = {
    name: name,
    description: "",
    type: "",
  };

  const [formData, setFormData] = useState(FIELD_INITIAL_VALUES);

  useEffect(() => {
    let isRendered = true;

    async function getIngredient(ingredientName) {
      try {
        if (isRendered && user.username) {
          let ingredientRes = await PantryApi.getIngredient(ingredientName);
          setIngredient({ ...ingredientRes });
          setNeedsInitialFormUpdate(true);
        }
      } catch (e) {
        console.log(e);
      }
    }
    getIngredient(name);

    return () => {
      isRendered = false;
    };
  }, [user.username, name]);

  useEffect(() => {
    if (needsInitialFormUpdate) {
      setFormData({
        name: name,
        description: ingredient.description,
        type: ingredient.type,
      });
      setNeedsInitialFormUpdate(false);
    }
  }, [needsInitialFormUpdate, ingredient, name]);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  const edit = useCallback(
    async (ingr) => {
      try {
        await PantryApi.editIngredient(ingr);
        setMessage({
          text: `Edited ingredient ${ingr.name}!`,
          variant: "success",
        });
        setIngredient(ingr);
      } catch (err) {
        setMessage({
          text: `Error editing ingredient ${ingr.name}`,
          variant: "danger",
        });
      }
    },
    [setMessage]
  );

  const getInput = (evt) => {
    evt.preventDefault();
    edit(formData);
  };

  if (!user.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <Row className="EditIngredientForm justify-content-center">
      <Col sm={10} md={8}>
        <Card>
          <Card.Header as="h4">{`Edit ingredient: ${name}`}</Card.Header>
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
                  readOnly={true}
                  style={{
                    backgroundColor: "#eeeeee",
                    borderRadius: "5px",
                    paddingLeft: "10px",
                  }}
                />
              </Form.Group>
              <Form.Group key="description" controlId="description">
                <Form.Label>Description:</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  required={false}
                  placeholder="Enter a description here."
                  style={{ height: "100px" }}
                  as="textarea"
                />
              </Form.Group>
              <Form.Group key="type" controlId="type">
                <Form.Label>Type:</Form.Label>
                <Form.Control
                  type="text"
                  name="type"
                  value={formData.type || ""}
                  onChange={handleChange}
                  required={false}
                  placeholder="Enter a type here."
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mr-2">
                Edit Ingredient
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

export default EditIngredientForm;
