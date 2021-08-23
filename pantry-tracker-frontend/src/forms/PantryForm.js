import React, { useState } from "react";
import { LinkContainer } from "react-router-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const PantryForm = ({
  formTitle,
  fields,
  submitButtonText,
  processData,
  backButtonTo = "",
}) => {
  const getInitialState = (fields) => {
    let res = {};
    for (let i = 0; i < fields.length; i++) {
      res[fields[i].name] = fields[i].initialValue;
    }
    return res;
  };

  const [formData, setFormData] = useState(getInitialState(fields));

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  const getInput = (evt) => {
    evt.preventDefault();
    processData(formData);
  };

  return (
    <Row className="PantryForm justify-content-center">
      <Col sm={10} md={8}>
        <Card>
          <Card.Header as="h4">{formTitle}</Card.Header>
          <Card.Body>
            <Form onSubmit={getInput}>
              {fields.map((field) => {
                return (
                  <Form.Group key={field.name} controlId={field.name}>
                    <Form.Label>{field.label}</Form.Label>
                    <Form.Control
                      type={field.inputType}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      required={field.required}
                      placeholder={field.placeholder || ""}
                      readOnly={field.readOnly}
                      style={field.styleOverride || {}}
                    />
                  </Form.Group>
                );
              })}
              <Button variant="primary" type="submit" className="mr-2">
                {submitButtonText}
              </Button>
              {backButtonTo !== "" ? (
                <LinkContainer to={backButtonTo}>
                  <Button variant="secondary">Back</Button>
                </LinkContainer>
              ) : null}
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default PantryForm;
