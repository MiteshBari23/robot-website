import { Container, Form, Button, Row, Col } from "react-bootstrap";

export default function Contact() {
  return (
    <section id="contact" className="py-5" style={{ backgroundColor: "#0f172a", color: "#f8fafc" }}>
      <Container>
        <h2 className="text-center mb-5">Contact Us</h2>
        <Row>
          <Col md={6} className="mb-4">
            <h4>Get in Touch</h4>
            <p>
              Have a question about one of our robots? Want to know more before purchasing?
              Drop us a message and we’ll get back to you within 24 hours!
            </p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><strong>📧 Email:</strong> support@robostore.com</li>
              <li><strong>📞 Phone:</strong> +91 98765 43210</li>
              <li><strong>📍 Address:</strong> Mumbai, Maharashtra, India</li>
            </ul>
          </Col>

          <Col md={6}>
            <Form>
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter your name" />
              </Form.Group>

              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" />
              </Form.Group>

              <Form.Group controlId="formMessage" className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control as="textarea" rows={4} placeholder="Your message" />
              </Form.Group>

              <Button variant="info" type="submit">
                Send Message
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
