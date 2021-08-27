import React from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const IngredientCard = ({ ingredient, add, remove }) => {
  return (
    <Card className="IngredientCard mb-2">
      <Card.Body>
        <Card.Title>
          <b>{ingredient.name}</b>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {ingredient.type}
        </Card.Subtitle>
        <Row>
          <Col sm={8}>
            <span className="font-weight-light">
              {ingredient.description || ""}
            </span>
            <span>
              {ingredient.amount ? `Amount: ${ingredient.amount}` : ""}
            </span>
          </Col>
          <Col sm={4}>
            <div className="d-flex justify-content-end m-0 p-0">
              {ingredient.onHand ? (
                <div className="mt-2">
                  <Button variant="dark" disabled>
                    <b>In stock!</b>
                  </Button>
                  <Button variant="danger" className="ml-1" onClick={remove}>
                    (Click to remove)
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <Button variant="secondary" disabled>
                    <b>Out of stock</b>
                  </Button>
                  <Button onClick={add} className="ml-1" variant="success">
                    (Click to add)
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default IngredientCard;
