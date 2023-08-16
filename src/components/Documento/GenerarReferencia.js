import { useEffect, useState } from "react";
import { Button, Col, Form, Label, Row } from "reactstrap";
import Select from "react-select";
import {
  ERROR_SERVER,
  FIELD_REQUIRED,
  SAVE_SUCCESS,
  SELECT_OPTION,
} from "../../constants/messages";
import * as Yup from "yup";
import { useFormik } from "formik";
import { generateReferencia } from "../../helpers/referencia";
import { toast } from "react-toastify";
import extractMeaningfulMessage from "../../utils/extractMeaningfulMessage";
import { getColegiosList } from "../../helpers/colegios";
import { getCiclosByColegio } from "../../helpers/ciclos";
import SubmitingForm from "../Loader/SubmitingForm";
import { getRazonSocialQuery } from "../../helpers/razonsocial";

export default function GenerarReferencia({
  setItems,
  setSearchF,
  buscar,
  setPdfData,
  setColegioId,
  setCicloId,
}) {
  const [familiaOBj, setFamiliaObj] = useState(null);
  const [familiaAllOpt, setFamiliaAllOpt] = useState([]);
  const [familiaOpt, setFamiliaOpt] = useState([]);
  const [colegioOBj, setColegioObj] = useState(null);
  const [colegioOpt, setColegioOpt] = useState([]);
  const [showLoad, setShowLoad] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [textColegio, setTextColegio] = useState(FIELD_REQUIRED);
  const [cicloObj, setCicloObj] = useState(null);
  const [cicloOpt, setCicloOpt] = useState([]);

  const fetchColegios = async () => {
    try {
      const response = await getColegiosList();
      setColegioOpt(
        response.map((r) => ({
          value: r.id,
          label: r.nombre,
          convenio: r.convenio,
          extraInfo: r.extraInfo,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFamiliasRSApi = async () => {
    try {
      const response = await getRazonSocialQuery(`?PageNumber=0&PageSize=1000`);
      if (response.data.length > 0) {
        setFamiliaAllOpt(response.data);
      } else {
        setFamiliaAllOpt([]);
      }
    } catch (error) {
      let message = ERROR_SERVER;
      message = extractMeaningfulMessage(error, message);
      toast.error(message);
      setFamiliaAllOpt([]);
    }
  };

  useEffect(() => {
    fetchFamiliasRSApi();
    fetchColegios();
  }, []);

  const formik = useFormik({
    initialValues: {
      colegio: "",
      familia: "",
      ciclo: "",
    },
    validationSchema: Yup.object({
      familia: Yup.string().required(FIELD_REQUIRED),
      colegio: Yup.string().required(FIELD_REQUIRED),
      ciclo: Yup.string().required(textColegio),
    }),
    onSubmit: (values) => {
      //console.log(values)
      setItems([]);
      setIsSubmit(true);
      //service here
      const urlPlus = `/${values.ciclo}/${values.familia}`;
      async function callApi() {
        try {
          let response = await generateReferencia(urlPlus);
          if (response) {
            toast.success(SAVE_SUCCESS);
          } else {
            toast.error(ERROR_SERVER);
          }
          setIsSubmit(false);
        } catch (error) {
          let message = ERROR_SERVER;
          message = extractMeaningfulMessage(error, message);
          toast.error(message);
          setIsSubmit(false);
        }
      }
      callApi();
    },
  });

  const handleChangeFamilia = (value) => {
    setFamiliaObj(value);
    setSearchF(value);
    if (value) {
      formik.setFieldValue("familia", value.value);
      setPdfData((prev) => ({
        ...prev,
        familia: value.apellido,
        codigoFamilia: value.codigoFamilia,
      }));
    } else {
      formik.setFieldValue("familia", "");
      setPdfData((prev) => ({
        ...prev,
        familia: "",
      }));
    }
  };

  const fetchCiclosByColegio = async (value) => {
    setTextColegio("Procesando información");
    setShowLoad(true);
    try {
      const q = `${value.value}?PageNumber=1&PageSize=100`;
      const response = await getCiclosByColegio(q);
      if (response.data.length > 0) {
        //console.log(response.data)
        setCicloOpt(
          response.data.map((it) => ({ value: it.id, label: it.nombre }))
        );
        setTextColegio(FIELD_REQUIRED);
      } else {
        formik.setFieldValue("ciclo", "");
        setTextColegio(FIELD_REQUIRED);
      }
      setShowLoad(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (value) => {
    setColegioObj(value);
    if (value) {
      formik.setFieldValue("colegio", value.value);
      fetchCiclosByColegio(value);
      setFamiliaOpt(
        familiaAllOpt
          .filter((it) => it.colegioId === value.value)
          .map((rz) => ({
            label: `${rz.familia} - ${rz.apellido}`,
            value: rz.id,
            codigo: rz.rfc,
            apellido: rz.apellido,
            codigoFamilia: rz.familia,
          }))
      );
      setPdfData((prev) => ({
        ...prev,
        convenio: value.convenio,
        colegio: value.label,
        extraInfo: value.extraInfo,
      }));
      setColegioId(value.value);
    } else {
      formik.setFieldValue("colegio", "");
      formik.setFieldValue("ciclo", "");
      formik.setFieldValue("familia", "");
      setFamiliaObj(null);
      setCicloObj(null);
      setFamiliaOpt([]);
      setPdfData((prev) => ({
        ...prev,
        convenio: "",
        colegio: "",
      }));
      setColegioId(null);
    }
  };
  return (
    <Form
      className="needs-validation"
      id="tooltipForm"
      onSubmit={(e) => {
        e.preventDefault();
        formik.handleSubmit();
        return false;
      }}
    >
      {isSubmit && <SubmitingForm />}
      <Row>
        <Col xs="12" md="3">
          <Label htmlFor="colegio" className="mb-0">
            Colegio
          </Label>
          <Select
            classNamePrefix="select2-selection"
            placeholder={SELECT_OPTION}
            options={colegioOpt}
            value={colegioOBj}
            onChange={handleChange}
            isClearable
          />
          {formik.errors.colegio && (
            <div className="invalid-tooltip d-block">{textColegio}</div>
          )}
        </Col>
        <Col xs="12" md="6">
          <Label htmlFor={`familia`} className="mb-0">
            Familia
          </Label>
          <Select
            classNamePrefix="select2-selection"
            placeholder={SELECT_OPTION}
            options={familiaOpt}
            value={familiaOBj}
            onChange={handleChangeFamilia}
            isClearable
          />
          {formik.errors.familia && (
            <div className="invalid-tooltip d-block">
              {formik.errors.familia}
            </div>
          )}
        </Col>
        <Col xs="12" md="3">
          <Label htmlFor="ciclo" className="mb-0">
            Ciclo
          </Label>
          <Select
            classNamePrefix="select2-selection"
            placeholder={SELECT_OPTION}
            options={cicloOpt}
            value={cicloObj}
            onChange={(value) => {
              setCicloObj(value);
              if (value) {
                formik.setFieldValue("ciclo", value.value);
                setCicloId(value.value);
                setPdfData((prev) => ({
                  ...prev,
                  ciclo: value.label,
                }));
              } else {
                formik.setFieldValue("ciclo", "");
                setCicloId(null);
                setPdfData((prev) => ({
                  ...prev,
                  ciclo: "",
                }));
              }
            }}
            isClearable
          />
          {formik.errors.ciclo && (
            <div className="invalid-tooltip d-block">{formik.errors.ciclo}</div>
          )}
        </Col>
      </Row>
      <hr />
      <div className="d-flex justify-content-end">
        <Button
          color="primary"
          type="button"
          disabled={!formik.values.familia}
          onClick={buscar}
          className="me-2"
        >
          Buscar
        </Button>
        {formik.values.familia && formik.values.ciclo ? (
          <Button color="success" className="btn btn-success" type="submit">
            Generar referencia
          </Button>
        ) : (
          <Button
            color="success"
            className="btn btn-success"
            type="button"
            disabled
          >
            Generar referencia
          </Button>
        )}
      </div>
    </Form>
  );
}
