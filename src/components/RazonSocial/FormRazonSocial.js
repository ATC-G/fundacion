import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Col, Form, Input, Label, Row } from "reactstrap";
import * as Yup from "yup";
import { ERROR_SERVER, FIELD_REQUIRED, SAVE_SUCCESS, UPDATE_SUCCESS } from "../../constants/messages";
import extractMeaningfulMessage from "../../utils/extractMeaningfulMessage";
import SubmitingForm from "../Loader/SubmitingForm";

export default function FormRazonSocial({item, setItem, setReloadList}){
    const [isSubmit, setIsSubmit] = useState(false)
    
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: item?.id ?? '',
            nombre: item?.nombre ?? '',
            cardCode: item?.cardCode ?? '',
            rfc: item?.rfc ?? '',
            regimen: item?.regimen ?? '',
            codigoPostal: item?.codigoPostal ?? '',
            tipo: item?.tipo ?? '',
        },
        validationSchema: Yup.object({
            nombre: Yup.string().required(FIELD_REQUIRED),   
            cardCode: Yup.string().required(FIELD_REQUIRED),
            rfc: Yup.string().required(FIELD_REQUIRED),
            regimen: Yup.string().required(FIELD_REQUIRED),
            codigoPostal: Yup.string().required(FIELD_REQUIRED),
            tipo: Yup.string().required(FIELD_REQUIRED),     
        }),
        onSubmit: async (values) => {
            setIsSubmit(true)
            //validaciones antes de enviarlo
            if(values.id){
                //update
                try {
                    let response = 0//request await updateAlumnos(values)
                    if(response){
                        toast.success(UPDATE_SUCCESS);
                        setReloadList(true)
                        resetForm();
                    }else{
                        toast.error(ERROR_SERVER);
                    }
                    setIsSubmit(false)
                } catch (error) {
                    let message  = ERROR_SERVER;
                    message = extractMeaningfulMessage(error, message)
                    toast.error(message); 
                    setIsSubmit(false)
                }
            }else{
                //save
                try{
                    let response = 0//request await saveAlumnos(values)
                    if(response){
                        toast.success(SAVE_SUCCESS);
                        setReloadList(true)
                        resetForm();
                    }else{
                        toast.error(ERROR_SERVER);
                    }
                    setIsSubmit(false)
                }catch(error){
                    let message  = ERROR_SERVER;
                    message = extractMeaningfulMessage(error, message)
                    toast.error(message); 
                    setIsSubmit(false)
                }
            }
        }
    })

    const resetForm = () => {
        setItem(null)
        formik.resetForm();
    }
    
    return(
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
            <Row className="py-4">
                <Col xs="12" md="4">
                    <Label htmlFor="nombre" className="mb-0">Nombre:</Label>
                    <Input
                        id="nombre"
                        name="nombre"
                        className={`form-control ${formik.errors.nombre ? 'is-invalid' : ''}`}
                        onChange={formik.handleChange}
                        value={formik.values.nombre}  
                    />
                    {
                        formik.errors.nombre &&
                        <div className="invalid-tooltip">{formik.errors.nombre}</div>
                    }
                </Col>
                <Col xs="12" md="4">
                    <Label htmlFor="cardCode" className="mb-0">Código Tarjeta</Label>
                    <Input
                        id="tipo"
                        name="tipo"
                        className={`form-control ${formik.errors.tipo ? 'is-invalid' : ''}`}
                        onChange={formik.handleChange}
                        value={formik.values.tipo}  
                    />
                    {
                        formik.errors.tipo &&
                        <div className="invalid-tooltip">{formik.errors.tipo}</div>
                    }
                </Col>
                <Col xs="12" md="4">
                    <Label htmlFor="rfc" className="mb-0">RFC</Label>
                    <Input
                        id="rfc"
                        name="rfc"
                        className={`form-control ${formik.errors.rfc ? 'is-invalid' : ''}`}
                        onChange={formik.handleChange}
                        value={formik.values.rfc}  
                    />
                    {
                        formik.errors.rfc &&
                        <div className="invalid-tooltip">{formik.errors.rfc}</div>
                    }
                </Col>
                <Col xs="12" md="4">
                    <Label htmlFor="regimen" className="mb-0">Régimen</Label>
                    <Input
                        id="regimen"
                        name="regimen"
                        className={`form-control ${formik.errors.regimen ? 'is-invalid' : ''}`}
                        onChange={formik.handleChange}
                        value={formik.values.regimen}  
                    />
                    {
                        formik.errors.regimen &&
                        <div className="invalid-tooltip">{formik.errors.regimen}</div>
                    }
                </Col>
                <Col xs="12" md="4">
                    <Label htmlFor="codigoPostal" className="mb-0">Código Postal</Label>
                    <Input
                        id="codigoPostal"
                        name="codigoPostal"
                        className={`form-control ${formik.errors.codigoPostal ? 'is-invalid' : ''}`}
                        onChange={formik.handleChange}
                        value={formik.values.codigoPostal}  
                    />
                    {
                        formik.errors.codigoPostal &&
                        <div className="invalid-tooltip">{formik.errors.codigoPostal}</div>
                    }
                </Col>
                <Col xs="12" md="4">
                    <Label htmlFor="tipo" className="mb-0">Tipo</Label>
                    <Input
                        id="tipo"
                        name="tipo"
                        className={`form-control ${formik.errors.tipo ? 'is-invalid' : ''}`}
                        onChange={formik.handleChange}
                        value={formik.values.tipo}  
                    />
                    {
                        formik.errors.tipo &&
                        <div className="invalid-tooltip">{formik.errors.tipo}</div>
                    }
                </Col>
            </Row>
            <hr />
            <div className="d-flex justify-content-end">               
                <Button
                    color="success"
                    className="btn btn-success"
                    type="submit"
                >
                    {
                        formik.values.id ? 'Actualizar' : 'Guardar'
                    }                    
                </Button>
                {formik.values.id && <Button
                    color="link"
                    type="button"
                    className="text-danger"
                    onClick={() => {
                        setItem(null)
                        resetForm()
                    }}
                >
                    Cancelar                    
                </Button>}
            </div>
        </Form>
        
    )
}