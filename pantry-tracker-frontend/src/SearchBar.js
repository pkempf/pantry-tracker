import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const SearchBar = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ searchTerm: "" });

  const handleChange = (evt) => {
    const { value } = evt.target;
    setFormData({ searchTerm: value });
  };

  const getInput = (evt) => {
    evt.preventDefault();
    onSubmit(formData.searchTerm);
    setFormData({ searchTerm: "" });
  };

  return (
    <Form className="SearchBar" onSubmit={getInput}>
      <Form.Row className="align-items-center">
        <Col xs={9} md={10} className="mr-auto">
          <Form.Label htmlFor="searchTerm" srOnly>
            Search Term
          </Form.Label>
          <Form.Control
            className="mb-3"
            id="searchTerm"
            name="searchTerm"
            value={formData.searchTerm}
            placeholder="Enter search term..."
            onChange={handleChange}
          />
        </Col>
        <Col xs="auto" md={2} className="d-flex justify-content-end">
          <Button type="submit" variant="primary" className="mb-3">
            Search
          </Button>
        </Col>
      </Form.Row>
    </Form>
  );
};

export default SearchBar;
