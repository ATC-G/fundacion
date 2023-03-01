import { useState, useMemo } from "react";
import { withRouter } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import FormCicloEscolar from "../../components/CicloEscolar/FormCicloEscolar";
import Breadcrumbs from "../../components/Common/Breadcrumbs";
import CardBasic from "../../components/Common/CardBasic";
import SimpleLoad from "../../components/Loader/SimpleLoad";
import SimpleTable from "../../components/Tables/SimpleTable";

function CicloEscolar(){  
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState([]);
    const [openAccordion, setOpenAccordion] = useState(false)

    const columns = useMemo(
        () => [
          {
            Header: 'Mes calendario',
            accessor: 'mes', // accessor is the "key" in the data
          },
          {
            Header: 'Fecha Límite de pago',
            accessor: 'fechaLimitePago',
          },
          {
            Header: '% interes',
            accessor: 'interes',
          },
        ],
        []
    );

    const cardHandleList = (
        loading ?
        <Row>
            <Col xs="12" xl="12">
                <SimpleLoad />
            </Col>
        </Row> :
        <Row>
            <Col xl="12">                                    
                <SimpleTable
                    columns={columns}
                    data={items} 
                />
            </Col>            
        </Row>
    )
  
    const cardChildren = (
        <>
            <Row>
                <Col xs="12" md="12">
                    <FormCicloEscolar />
                </Col>
            </Row>
        </>
    );

    
    
    return (
        <>
          <div className="page-content">
            <Container fluid>
              {/* Render Breadcrumb */}
              <Breadcrumbs
                title={'Ciclo escolar'}
                breadcrumbItem={"Ciclo escolar"}
              />

              <Row>
                <Col xs="12" lg="12">
                    <CardBasic 
                        title="Ciclo Escolar"
                        children={cardChildren}
                        openAccordion={openAccordion}
                        setOpenAccordion={setOpenAccordion}
                    />                    
                </Col>
              </Row>

              <Row className="pb-5">
                  <Col lg="12">
                    {cardHandleList}                      
                  </Col>
              </Row>        
            </Container>
          </div>
        </>
      );
  }
  
  export default withRouter(CicloEscolar)