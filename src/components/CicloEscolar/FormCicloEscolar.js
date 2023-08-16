import { Field, FieldArray, FormikProvider, useFormik } from "formik";
import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Input, Label, Row } from "reactstrap";
import * as Yup from "yup";
import SimpleDate from "../DatePicker/SimpleDate";
import Select from "react-select";
import {
  CAMPO_MAYOR_CERO,
  CAMPO_MENOR_CIEN,
  ERROR_SERVER,
  FIELD_NUMERIC,
  FIELD_REQUIRED,
  SAVE_SUCCESS,
  SELECT_OPTION,
  UPDATE_SUCCESS,
} from "../../constants/messages";
import { getColegiosList } from "../../helpers/colegios";
import SubmitingForm from "../Loader/SubmitingForm";
import {
  getCiclosByColegio,
  saveCiclos,
  updateCiclos,
} from "../../helpers/ciclos";
import moment from "moment/moment";
import { toast } from "react-toastify";
import extractMeaningfulMessage from "../../utils/extractMeaningfulMessage";
import { mesesOpt } from "../../constants/utils";
import BasicDialog from "../Common/BasicDialog";

export default function FormCicloEscolar() {
  const [fecha, setFecha] = useState();
  const [colegio, setColegio] = useState(null);
  const [colegiosOpt, setColegiosOpt] = useState([]);
  const [showLoad, setShowLoad] = useState(false);
  const [item, setItem] = useState({
    id: "",
    nombre: "",
    colegioId: "",
    fechaInicio: "",
    fechaFin: "",
    generaReferencia: true,
    fechaPagos: [
      {
        year: "",
        mes: "",
        fechaLimite: "",
        interes: "",
        anual: false,
        repetir: false,
      },
    ],
  });
  const [isCreating, setCreating] = useState(true);
  const [ciclosNameOpt, setCiclosNameOpt] = useState([]);
  const [showDialogCiclos, setShowDialogCiclos] = useState(false);
  const [cicloNameObj, setCicloNameObj] = useState(null);

  const fetchColegios = async () => {
    try {
      const response = await getColegiosList();
      setColegiosOpt(response.map((r) => ({ value: r.id, label: r.nombre })));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchColegios();
  }, []);

  Yup.addMethod(
    Yup.array,
    "uniqueAnual",
    function (message, mapper = (a) => a) {
      return this.test("uniqueAnual", message, function (list) {
        return list.filter((l) => l.anual).length === 1;
      });
    }
  );
  Yup.addMethod(
    Yup.array,
    "uniqueRepetir",
    function (message, mapper = (a) => a) {
      return this.test("uniqueRepetir", message, function (list) {
        return list.filter((l) => l.repetir).length === 1;
      });
    }
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: item,
    validationSchema: Yup.object({
      nombre: Yup.string().required(FIELD_REQUIRED),
      colegioId: Yup.string().required(FIELD_REQUIRED),
      fechaInicio: Yup.string().required(FIELD_REQUIRED),
      fechaFin: Yup.string().required(FIELD_REQUIRED),
      fechaPagos: Yup.array()
        .of(
          Yup.object().shape({
            year: Yup.number()
              .typeError(FIELD_NUMERIC)
              .required(FIELD_REQUIRED)
              .min(2000, "Campo debe estar en el rango 2000 - 2050")
              .max(2050, "Campo debe estar en el rango 2000 - 2050"),
            mes: Yup.string().required(FIELD_REQUIRED),
            fechaLimite: Yup.string().required(FIELD_REQUIRED),
            interes: Yup.number()
              .typeError(FIELD_NUMERIC)
              .required(FIELD_REQUIRED)
              .min(0, CAMPO_MAYOR_CERO)
              .max(100, CAMPO_MENOR_CIEN),
          })
        )
        .uniqueAnual(
          "Solo se puede seleccionar una fila como anual",
          (a) => a.anual
        ),
    }),
    onSubmit: async (values) => {
      //validaciones antes de enviarlo
      console.log(values);
      setShowLoad(true);
      if (values.id) {
        //update
        try {
          let response = await updateCiclos(values, values.id);
          if (response) {
            toast.success(UPDATE_SUCCESS);
          } else {
            toast.error(ERROR_SERVER);
          }
          setShowLoad(false);
        } catch (error) {
          let message = ERROR_SERVER;
          message = extractMeaningfulMessage(error, message);
          toast.error(message);
          setShowLoad(false);
        }
      } else {
        //save
        try {
          let response = await saveCiclos(values);
          if (response) {
            toast.success(SAVE_SUCCESS);
            formik.setFieldValue("id", response.id);
          } else {
            toast.error(ERROR_SERVER);
          }
          setShowLoad(false);
        } catch (error) {
          let message = ERROR_SERVER;
          message = extractMeaningfulMessage(error, message);
          toast.error(message);
          setShowLoad(false);
        }
      }
    },
  });

  const fetchCiclosByColegio = async (value) => {
    setShowLoad(true);
    try {
      const q = `${value.value}?PageNumber=1&PageSize=100`;
      const response = await getCiclosByColegio(q);
      if (response.data.length > 0) {
        setCiclosNameOpt(response.data);
        setShowDialogCiclos(true);
        // const result = response.data[0]
        // setItem({
        //     id: result.id,
        //     nombre: result.nombre,
        //     colegioId: result.colegioId,
        //     fechaInicio:moment(result.fechaInicio, 'YYYY-MM-DD').toDate(),
        //     fechaFin: moment(result.fechaFin, 'YYYY-MM-DD').toDate(),
        //     generaReferencia: result.generaReferencia ?? true,
        //     fechaPagos:result.fechaPagos.map((fp) => ({
        //         id: fp.id,
        //         interes: fp.interes,
        //         year: fp.year,
        //         mes: fp.mes,
        //         fechaLimite: moment(fp.fechaLimite, 'YYYY-MM-DD').toDate(),
        //         anual: fp.anual,
        //         repetir: fp.repetir
        //     })),
        // })
        // setFecha([result.fechaInicio, result.fechaFin])
      } else {
        setItem({
          id: "",
          nombre: "",
          colegioId: "",
          fechaInicio: "",
          fechaFin: "",
          fechaPagos: [
            {
              year: "",
              mes: "",
              fechaLimite: "",
              interes: "",
              anual: false,
              repetir: false,
            },
          ],
        });
        setFecha();
      }
      setShowLoad(false);
    } catch (error) {
      console.log(error);
    }
  };
  //console.log(formik.values)

  const handleChange = (value) => {
    setColegio(value);
    if (value) {
      formik.setFieldValue("colegioId", value.value);
      fetchCiclosByColegio(value);
    } else {
      formik.setFieldValue("colegioId", "");
      reset();
    }
  };

  const reset = () => {
    setFecha();
    setColegio(null);
    formik.resetForm({
      values: {
        id: "",
        nombre: "",
        colegioId: "",
        fechaInicio: "",
        fechaFin: "",
        generaReferencia: true,
        fechaPagos: [
          {
            year: "",
            mes: "",
            fechaLimite: "",
            interes: "",
            anual: false,
            repetir: false,
          },
        ],
      },
    });
  };

  const fillData = (creating) => {
    if (!creating) {
      const result = ciclosNameOpt.find((it) => it.id === cicloNameObj.value);
      setItem({
        id: result.id,
        nombre: result.nombre,
        colegioId: result.colegioId,
        fechaInicio: moment(result.fechaInicio, "YYYY-MM-DD").toDate(),
        fechaFin: moment(result.fechaFin, "YYYY-MM-DD").toDate(),
        generaReferencia: result.generaReferencia ?? true,
        fechaPagos: result.fechaPagos.map((fp) => ({
          id: fp.id,
          interes: fp.interes,
          year: fp.year,
          mes: fp.mes,
          fechaLimite: moment(fp.fechaLimite, "YYYY-MM-DD").toDate(),
          anual: fp.anual,
          repetir: fp.repetir,
        })),
      });
      setFecha([result.fechaInicio, result.fechaFin]);
    } else {
      setItem({
        id: "",
        nombre: "",
        colegioId: "",
        fechaInicio: "",
        fechaFin: "",
        generaReferencia: true,
        fechaPagos: [
          {
            year: "",
            mes: "",
            fechaLimite: "",
            interes: "",
            anual: false,
            repetir: false,
          },
        ],
      });
      setFecha();
    }
    setShowDialogCiclos(false);
    setCicloNameObj(null);
    setCreating(creating);
  };

  const ChildrenCiclos = () => {
    return (
      <>
        <Row>
          <Col xs="12" md="12" className="mb-2">
            <Label htmlFor="colegio" className="mb-0">
              Seleccionar ciclo
            </Label>
            <Select
              classNamePrefix="select2-selection"
              placeholder={SELECT_OPTION}
              options={ciclosNameOpt.map((item) => ({
                value: item.id,
                label: item.nombre,
              }))}
              value={cicloNameObj}
              onChange={(value) => setCicloNameObj(value)}
            />
          </Col>
          <Col xs="12" md="12" className="mb-2">
            <Button
              color="primary"
              type="button"
              onClick={() => fillData(false)}
            >
              Aceptar
            </Button>
          </Col>
          <hr />
          <Col xs="12" md="12">
            <Button
              color="secondary"
              type="button"
              onClick={() => fillData(true)}
            >
              Crear nuevo ciclo
            </Button>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <>
      <Form
        className="needs-validation"
        id="tooltipForm"
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit();
          return false;
        }}
      >
        {showLoad && <SubmitingForm />}
        <Row>
          <Col xs="12" md="4">
            <Label htmlFor="razonSocialId" className="mb-0">
              Colegio
            </Label>
            <Select
              classNamePrefix="select2-selection"
              placeholder={SELECT_OPTION}
              options={colegiosOpt}
              value={colegio}
              onChange={handleChange}
              isClearable
            />
            {formik.errors.colegioId && (
              <div className="invalid-tooltip d-block">
                {formik.errors.colegioId}
              </div>
            )}
          </Col>
          <Col xs="12" md="4">
            <Label className="mb-0">Fecha inicio a Fecha fin</Label>
            <SimpleDate
              date={fecha}
              setDate={(value) => {
                if (value.length > 0) {
                  formik.setFieldValue("fechaInicio", value[0]);
                  if (value.length > 1) {
                    formik.setFieldValue("fechaFin", value[1]);
                  }
                } else {
                  formik.setFieldValue("fechaInicio", "");
                  formik.setFieldValue("fechaFin", "");
                }
                setFecha(value);
              }}
              options={{
                mode: "range",
              }}
              placeholder="dd-MM-YYYY a dd-MM-YYYY"
            />
            {(formik.errors.fechaInicio || formik.errors.fechaFin) && (
              <div className="invalid-tooltip d-block">{FIELD_REQUIRED}</div>
            )}
          </Col>
          <Col xs="12" md="2">
            <Label htmlFor="nombre" className="mb-0">
              Nombre
            </Label>
            <Input
              id="nombre"
              name="nombre"
              className={`form-control ${
                formik.errors.nombre ? "is-invalid" : ""
              }`}
              onChange={formik.handleChange}
              value={formik.values.nombre}
            />
            {formik.errors.nombre && (
              <div className="invalid-tooltip d-block">
                {formik.errors.nombre}
              </div>
            )}
          </Col>
          <Col xs="12" md="2">
            <Label htmlFor="generaReferencia" className="mb-0 d-block">
              Genera referencia
            </Label>
            <Input
              id="generaReferencia"
              type="checkbox"
              name="generaReferencia"
              onChange={(e) =>
                formik.setFieldValue("generaReferencia", e.target.checked)
              }
              checked={formik.values.generaReferencia}
            />
          </Col>
        </Row>
        {formik.errors.fechaPagos &&
          !Array.isArray(formik.errors.fechaPagos) && (
            <Alert color="danger" className="p-2 mt-2">
              {formik.errors.fechaPagos}
            </Alert>
          )}
        <Row>
          <Col>
            <FormikProvider value={formik}>
              <FieldArray
                name="fechaPagos"
                render={(arrayHelper) => (
                  <div className="border bg-light p-2 mt-1">
                    {formik.values.fechaPagos &&
                      formik.values.fechaPagos.length > 0 &&
                      formik.values.fechaPagos.map((item, index) => (
                        <div key={index} className="mb-2">
                          <Row>
                            <Col xs="12" md="3">
                              {index === 0 && (
                                <Label className="mb-0">
                                  Fecha límite de pago
                                </Label>
                              )}
                              <SimpleDate
                                date={
                                  formik.values.fechaPagos[index].fechaLimite
                                }
                                setDate={(value) => {
                                  if (value.length > 0) {
                                    formik.setFieldValue(
                                      `fechaPagos.${index}.fechaLimite`,
                                      value[0]
                                    );
                                  } else {
                                    formik.setFieldValue(
                                      `fechaPagos.${index}.fechaLimite`,
                                      ""
                                    );
                                  }
                                }}
                              />
                              {formik.errors?.fechaPagos?.length > 0 &&
                                formik.errors.fechaPagos[index]
                                  ?.fechaLimite && (
                                  <div className="invalid-tooltip d-block">
                                    {
                                      formik.errors.fechaPagos[index]
                                        ?.fechaLimite
                                    }
                                  </div>
                                )}
                            </Col>
                            <Col xs="12" md="2">
                              {index === 0 && (
                                <Label className="mb-0">Interés</Label>
                              )}
                              <Field
                                className={`form-control`}
                                name={`fechaPagos.${index}.interes`}
                              />
                              {formik.errors?.fechaPagos?.length > 0 &&
                                formik.errors.fechaPagos[index]?.interes && (
                                  <div className="invalid-tooltip d-block">
                                    {formik.errors.fechaPagos[index]?.interes}
                                  </div>
                                )}
                            </Col>
                            <Col xs="12" md="2">
                              {index === 0 && (
                                <Label className="mb-0">Año</Label>
                              )}
                              <Field
                                className={`form-control`}
                                name={`fechaPagos.${index}.year`}
                              />
                              {formik.errors?.fechaPagos?.length > 0 &&
                                formik.errors.fechaPagos[index]?.year && (
                                  <div className="invalid-tooltip d-block">
                                    {formik.errors.fechaPagos[index]?.year}
                                  </div>
                                )}
                            </Col>
                            <Col xs="12" md="2">
                              {index === 0 && (
                                <Label className="mb-0">Mes</Label>
                              )}
                              <Field
                                className={`form-control`}
                                name={`fechaPagos.${index}.mes`}
                                as="select"
                              >
                                <option value="">{SELECT_OPTION}</option>
                                <option value="N/A">N/A</option>
                                {mesesOpt.map((mes) => (
                                  <option key={mes.value} value={mes.label}>
                                    {mes.label}
                                  </option>
                                ))}
                              </Field>
                              {formik.errors?.fechaPagos?.length > 0 &&
                                formik.errors.fechaPagos[index]?.mes && (
                                  <div className="invalid-tooltip d-block">
                                    {formik.errors.fechaPagos[index]?.mes}
                                  </div>
                                )}
                            </Col>
                            <Col xs="12" md="1">
                              {index === 0 && (
                                <Label className="mb-0">Es anual</Label>
                              )}
                              <Field
                                className={`d-block mt-1`}
                                name={`fechaPagos.${index}.anual`}
                                type="checkbox"
                              />
                              {formik.errors?.fechaPagos?.length > 0 &&
                                formik.errors.fechaPagos[index]?.anual && (
                                  <div className="invalid-tooltip d-block">
                                    {formik.errors.fechaPagos[index]?.anual}
                                  </div>
                                )}
                            </Col>
                            <Col xs="12" md="1">
                              {index === 0 && (
                                <Label className="mb-0">Es repetitivo</Label>
                              )}
                              <Field
                                className={`d-block mt-1`}
                                name={`fechaPagos.${index}.repetir`}
                                type="checkbox"
                              />
                              {formik.errors?.fechaPagos?.length > 0 &&
                                formik.errors.fechaPagos[index]?.repetir && (
                                  <div className="invalid-tooltip d-block">
                                    {formik.errors.fechaPagos[index]?.repetir}
                                  </div>
                                )}
                            </Col>
                            {index > 0 && (
                              <Col
                                xs="12"
                                md="1"
                                className="d-flex align-items-center"
                              >
                                {index === 0 && (
                                  <Label className="mb-0 opacity-0 d-block">
                                    O
                                  </Label>
                                )}
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => arrayHelper.remove(index)}
                                >
                                  Eliminar
                                </Button>
                              </Col>
                            )}
                          </Row>
                        </div>
                      ))}
                    <Button
                      type="button"
                      color="link"
                      className="btn btn-link"
                      onClick={() =>
                        arrayHelper.push({
                          fechaLimite: "",
                          interes: "",
                        })
                      }
                    >
                      <i className="mdi mdi-notebook-plus-outline me-1"></i>
                      Agregar
                    </Button>
                  </div>
                )}
              />
            </FormikProvider>
          </Col>
        </Row>
        <hr />
        <div className="d-flex justify-content-end">
          <Button color="success" className="btn btn-success" type="submit">
            {formik.values.id ? "Actualizar" : "Guardar"}
          </Button>
          {formik.values.id && (
            <Button
              color="link"
              type="button"
              className="text-danger"
              onClick={reset}
            >
              Cancelar
            </Button>
          )}
        </div>
      </Form>

      <BasicDialog
        open={showDialogCiclos}
        setOpen={setShowDialogCiclos}
        title={"Crear o seleccionar ciclo"}
        size="md"
        children={<ChildrenCiclos />}
      />
    </>
  );
}
