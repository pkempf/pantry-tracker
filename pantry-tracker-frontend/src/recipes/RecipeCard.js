import React from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import "./RecipeCard.css";

const RecipeCard = ({ recipe, add, remove }) => {
  return (
    <Card className="mb-2 RecipeCard">
      <Card.Body>
        <Link to={`/recipes/${recipe.id}`}>
          <Card.Title>
            <b>{recipe.name}</b>
          </Card.Title>
        </Link>
        <Card.Subtitle className="mb-2 text-muted">
          {recipe.category}
        </Card.Subtitle>
        <Row>
          <Col sm={9}>
            <span className="font-weight-light">{recipe.area}</span>
          </Col>
          <Col sm={3}>
            <div className="d-flex justify-content-end m-0 p-0">
              {recipe.isFavorite ? (
                <Button variant="text" onClick={remove}>
                  <i className="fa fa-heart" aria-label="Remove favorite"></i>
                </Button>
              ) : (
                <Button onClick={add} variant="text">
                  <i className="fa fa-heart-o" aria-label="Add favorite"></i>
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RecipeCard;
