import { Link, withRouter } from "react-router-dom"
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardBody, Col, Container, Form, Label, Row, Input, FormFeedback, Alert } from "reactstrap";

import profile from "../../assets/images/profile-img2.png"
import logo from "../../assets/images/logo-sm.png";
import logoPrincipal from "../../assets/images/uilogo.png";
import { postJwtLogin } from "../../helpers/auth";
import useHandleErrors from "../../hooks/useHandleErrors";


function Login(){
    const [error, errors, checkError] = useHandleErrors()
    const validation = useFormik({
        enableReinitialize: true,
    
        initialValues: {
          userName: "santiago.figueroa94@gmail.com" || '',
          password: 'P4ssw0rd12145',
        },
        validationSchema: Yup.object({
          userName: Yup.string().required("Username required"),
          password: Yup.string().required("Password required"),
        }),
        onSubmit: async (values) => {
          try{
            const response = await postJwtLogin(values)
            if(response){
              localStorage.setItem("fundacionauth", JSON.stringify({"token":response}));
              window.location.href="/alumnos";
            }            
          }catch(error){
            console.log('error')
            console.log(error)
            if(error.response){
              checkError(error.response)
            }
          }
        }
      });
    
    return (
        <div className="account-pages my-2">
            <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
              <div className="text-center mb-4">
                  <img
                    src={logoPrincipal}
                    alt=""
                    className="rounded-circle"
                    height="150"
                  />
                </div>
                <Card className="overflow-hidden">
                  <div className="bg-primary bg-soft">
                    <Row>
                      <Col lg="12">
                        <div className="position-relative">
                          <div className="position-absolute mt-2 ms-2 zIndex-1">
                            <h3 className="text-white">Fundación Mier y Pesado</h3>
                            <h6 className="text-white d-none d-md-block">Sistema de control y administracion de colegiaturas</h6>
                          </div>
                        </div>
                        <div className="overlay-login"></div>
                        <img src={profile} alt="" className="img-fluid" />
                      </Col>
                    </Row>                    
                  </div>
                  <CardBody className="pt-0">
                    <div>
                      <Link to="/" className="auth-logo-light">
                        <div className="avatar-md profile-user-wid mb-4 position-absolute">
                          <span className="avatar-title rounded-circle bg-light">
                            <img
                              src={logo}
                              alt=""
                              className="rounded-circle"
                              height="72"
                            />
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="p-2 py-5">
                      <Form
                        className="form-horizontal"
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                      >         

                        {error && <Alert color="danger">{error}</Alert>}
                        {errors.length > 0 && 
                        <Alert color="danger">
                          {
                            errors.map((item, index)=>(
                              <div key={index}>{item.param} - {item.msg}</div>
                            ))
                          }
                        </Alert> }              
  
                        <div className="mb-3">
                          <Label className="form-label">Correo electrónico</Label>
                          <Input
                            name="userName"
                            className="form-control"
                            placeholder="Enter email"
                            type="text"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.userName || ""}
                            invalid={
                              validation.touched.userName && validation.errors.userName ? true : false
                            }
                          />
                          {validation.errors.userName ? (
                            <FormFeedback type="invalid">{validation.errors.userName}</FormFeedback>
                          ) : null}
                        </div>

                        <div className="mb-3">
                          <Label className="form-label">Contraseña</Label>
                          <Input
                            name="password"
                            value={validation.values.password || ""}
                            type="password"
                            placeholder="Enter Password"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={
                              validation.touched.password && validation.errors.password ? true : false
                            }
                          />
                          {validation.errors.password ? (
                            <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                          ) : null}
                        </div>
  
                        <div className="mt-3 d-grid">
                          {
                            validation.isSubmitting ?
                            <span
                              className="btn btn-primary btn-block disabled"
                            >
                              <i className="bx bx-loader bx-spin font-size-16 align-middle me-2"></i>
                            </span> : 
                            <button
                              className="btn btn-primary btn-block"
                              type="submit"
                            >
                              Ingresar
                            </button>
                          }                          
                        </div>
                      </Form>
                    </div>
                  </CardBody>
                </Card>
                <div className="mt-5 text-center">
                  <p>
                    © {new Date().getFullYear()} Fundación Mier y Pesado. Creado con {" "}
                    <i className="mdi mdi-heart text-danger" /> por ATC-G
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
    )
}

export default withRouter(Login)