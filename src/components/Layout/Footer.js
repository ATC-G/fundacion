import { Col, Container, Row } from "reactstrap"

function Footer(){
    return (
      <>
        <footer className="footer">
          <Container fluid={true}>
            <Row>
              <Col md={6}>{new Date().getFullYear()} © Fundación Mier y Pesado.</Col>
              <Col md={6}>
                <div className="text-sm-end d-none d-sm-block">
                  Creado por ATC-G 
                </div>
              </Col>
            </Row>
          </Container>
        </footer>
      </>
    )
  }
  
  export default Footer