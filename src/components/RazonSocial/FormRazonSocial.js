import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Col, Form, Input, Label, Row } from "reactstrap";
import * as Yup from "yup";
import { ERROR_SERVER, FIELD_REQUIRED, SAVE_SUCCESS, UPDATE_SUCCESS } from "../../constants/messages";
import { saveRazonSocial, updateRazonSocial } from "../../helpers/razonsocial";
import extractMeaningfulMessage from "../../utils/extractMeaningfulMessage";
import SubmitingForm from "../Loader/SubmitingForm";

export default function FormRazonSocial({item, setItem, setReloadList,handleAfterSubmit=null}){
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
            tipo: item?.tipo ?? 'Fisica',
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
                    let response = await updateRazonSocial(values.id, values)
                    if(response){
                        if(handleAfterSubmit){
                            handleAfterSubmit(response)
                        }else{
                            toast.success(UPDATE_SUCCESS);
                            setReloadList(true)                            
                        }
                        setItem(null)
                        formik.resetForm();
                        
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
                    let response = await saveRazonSocial(values)
                    if(response){
                        if(handleAfterSubmit){
                            handleAfterSubmit(response)
                        }else{
                            toast.success(SAVE_SUCCESS);
                            setReloadList(true)                            
                        }
                        //setItem(null)
                        //formik.resetForm();                     
                    }else{
                        toast.error(ERROR_SERVER);
                    }
                    setIsSubmit(false)
                }catch(error){
                    console.log('entro aqui-2')
                    let message  = ERROR_SERVER;
                    message = extractMeaningfulMessage(error, message)
                    toast.error(message); 
                    setIsSubmit(false)
                }
            }
        }
    })
    
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
                        id="cardCode"
                        name="cardCode"
                        className={`form-control ${formik.errors.cardCode ? 'is-invalid' : ''}`}
                        onChange={formik.handleChange}
                        value={formik.values.cardCode}  
                    />
                    {
                        formik.errors.cardCode &&
                        <div className="invalid-tooltip">{formik.errors.cardCode}</div>
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
                        formik.resetForm()
                    }}
                >
                    Cancelar                    
                </Button>}
            </div>
        </Form>
        
    )
}