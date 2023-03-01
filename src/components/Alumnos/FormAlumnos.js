import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Col, Form, Input, Label, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import * as Yup from "yup";
import { CAMPO_MAYOR_CERO, CAMPO_MENOR_CIEN, ERROR_SERVER, FIELD_EMAIL, FIELD_NUMERIC, FIELD_REQUIRED, SAVE_SUCCESS, UPDATE_SUCCESS } from "../../constants/messages";
import { saveAlumnos, updateAlumnos } from "../../helpers/alumnos";
import extractMeaningfulMessage from "../../utils/extractMeaningfulMessage";
import SubmitingForm from "../Loader/SubmitingForm";
import AsyncSelect from 'react-select/async';
import { getRazonSocialQuery } from "../../helpers/razonsocial";
import FormRazonSocial from "../RazonSocial/FormRazonSocial";

export default function FormAlumnos({item, setItem, setReloadList}){
    const [isSubmit, setIsSubmit] = useState(false)
    const [razonSocial, setRazonSocial] = useState(null)
    const [openDialogRazon, setOpenDialogRazon] = useState(false)
    
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: item?.id ?? '',
            nombre: item?.nombre ?? '',
            curp: item?.curp ?? '',
            colegio: item?.colegio ?? '',
            familia: item?.familia ?? '',
            email: item?.email ?? '',
            telefono: item?.telefono ?? '',
            grado: item?.grado ?? '',
            mensualidad: item?.mensualidad ?? '',
            beca: item?.beca ?? '',
            matricula: item?.matricula ?? '',
            razonesSociales: item?.razonesSociales ?? [],  
        },
        validationSchema: Yup.object({
            nombre: Yup.string().required(FIELD_REQUIRED),   
            curp: Yup.string().required(FIELD_REQUIRED),
            colegio: Yup.string().required(FIELD_REQUIRED),
            familia: Yup.string().required(FIELD_REQUIRED),
            email: Yup.string().required(FIELD_REQUIRED).email(FIELD_EMAIL),
            telefono: Yup.string().required(FIELD_REQUIRED),
            grado: Yup.string().required(FIELD_REQUIRED),
            mensualidad: Yup.number().typeError(FIELD_NUMERIC).required(FIELD_REQUIRED).min(1, CAMPO_MAYOR_CERO),
            beca: Yup.number().typeError(FIELD_NUMERIC).required(FIELD_REQUIRED).min(1, CAMPO_MAYOR_CERO).max(100, CAMPO_MENOR_CIEN),
            matricula: Yup.string().required(FIELD_REQUIRED),
            razonesSociales: Yup.array().of(Yup.string()).min(1, FIELD_REQUIRED)
        }),
        onSubmit: async (values) => {
            setIsSubmit(true)
            //validaciones antes de enviarlo
            if(values.id){
                //update
                try {
                    let response = await updateAlumnos(values)
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
                    let response = await saveAlumnos(values)
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
    console.log(formik.errors)
    console.log(formik)

    const resetForm = () => {
        setItem(null)
        formik.resetForm();
    }

    const handleChange = value => {
        setRazonSocial(value);
    }

    const fetchRazonOptions = async (inputValue) => {  
        if (!inputValue?.length || inputValue.length < 3) return [];   
        try {
            let query = `?parameter=${inputValue}&PageNumber=1&PageSize=10`
            const response = await getRazonSocialQuery(query)
            console.log(response)
            return response.map(item=>({label: item.nombre, value: item.id}))
        } catch (error) {
            let message  = ERROR_SERVER;
            message = extractMeaningfulMessage(error, message)
            toast.error(message);
        }        
    };
    const onCloseClick = () => {
        setOpenDialogRazon(false)
    }
    const handleAfterSubmit = (result) => {
        setRazonSocial({
            value: result.id,
            label: result.nombre
        })
        formik.setFieldValue('razonesSociales',  [result.id])        
        setOpenDialogRazon(false)
    }
    
    return(
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
                {isSubmit && <SubmitingForm />}
                <Row>
                    <Col xs="12" md="4">
                        <Label htmlFor="razonSocialId" className="mb-0">Razón social</Label>
                        <div className="d-flex">
                            <div className="flex-grow-1 pe-2">
                                <AsyncSelect 
                                    classNamePrefix="select2-selection"
                                    placeholder="Buscar"
                                    cacheOptions 
                                    defaultOptions 
                                    loadOptions={fetchRazonOptions} 
                                    value={razonSocial}
                                    onChange={handleChange}
                                    isClearable
                                />
                            </div>
                            <div>
                                <Button type="button" color="light" 
                                    onClick={!razonSocial ? () => setOpenDialogRazon(true) : ()=>{}}
                                    disabled={!razonSocial ? false : true}
                                ><i className="fas fa-plus text-primary" />
                                </Button>
                            </div>                        
                        </div> 
                        {
                            formik.errors.razonesSociales &&
                            <div className="invalid-tooltip d-block">{formik.errors.razonesSociales}</div>
                        }                   
                    </Col>
                </Row>
                
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
                        <Label htmlFor="email" className="mb-0">Correo</Label>
                        <Input
                            id="email"
                            name="email"
                            className={`form-control ${formik.errors.email ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            value={formik.values.email}  
                        />
                        {
                            formik.errors.email &&
                            <div className="invalid-tooltip">{formik.errors.email}</div>
                        }
                    </Col>
                    <Col xs="12" md="2">
                        <Label htmlFor="telefono" className="mb-0">Teléfono</Label>
                        <Input
                            id="telefono"
                            name="telefono"
                            className={`form-control ${formik.errors.telefono ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            value={formik.values.telefono}  
                        />
                        {
                            formik.errors.telefono &&
                            <div className="invalid-tooltip">{formik.errors.telefono}</div>
                        }
                    </Col>
                    <Col xs="12" md="2">
                        <Label htmlFor="familia" className="mb-0">Familia</Label>
                        <Input
                            id="familia"
                            name="familia"
                            className={`form-control ${formik.errors.familia ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            value={formik.values.familia}  
                        />
                        {
                            formik.errors.familia &&
                            <div className="invalid-tooltip">{formik.errors.familia}</div>
                        }
                    </Col>
                    <Col xs="12" md="2">
                        <Label htmlFor="colegio" className="mb-0">Colegio</Label>
                        <Input
                            id="colegio"
                            name="colegio"
                            className={`form-control ${formik.errors.colegio ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            value={formik.values.colegio}  
                        />
                        {
                            formik.errors.colegio &&
                            <div className="invalid-tooltip">{formik.errors.colegio}</div>
                        }
                    </Col>
                    <Col xs="12" md="2">
                        <Label htmlFor="grado" className="mb-0">Grado</Label>
                        <Input
                            id="grado"
                            name="grado"
                            className={`form-control ${formik.errors.grado ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            value={formik.values.grado}  
                        />
                        {
                            formik.errors.grado &&
                            <div className="invalid-tooltip">{formik.errors.grado}</div>
                        }
                    </Col>
                    <Col xs="12" md="2">
                        <Label htmlFor="mensualidad" className="mb-0">Mensualidad</Label>
                        <Input
                            id="mensualidad"
                            name="mensualidad"
                            className={`form-control ${formik.errors.mensualidad ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            value={formik.values.mensualidad}  
                        />
                        {
                            formik.errors.mensualidad &&
                            <div className="invalid-tooltip">{formik.errors.mensualidad}</div>
                        }
                    </Col>
                    <Col xs="12" md="2">
                        <Label htmlFor="matricula" className="mb-0">Matrícula</Label>
                        <Input
                            id="matricula"
                            name="matricula"
                            className={`form-control ${formik.errors.matricula ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            value={formik.values.matricula}  
                        />
                        {
                            formik.errors.matricula &&
                            <div className="invalid-tooltip">{formik.errors.matricula}</div>
                        }
                    </Col>
                    <Col xs="12" md="2">
                        <Label htmlFor="curp" className="mb-0">CURP</Label>
                        <Input
                            id="curp"
                            name="curp"
                            className={`form-control ${formik.errors.curp ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            value={formik.values.curp}  
                        />
                        {
                            formik.errors.curp &&
                            <div className="invalid-tooltip">{formik.errors.curp}</div>
                        }
                    </Col>
                    <Col xs="12" md="2">
                        <Label htmlFor="beca" className="mb-0">Beca</Label>
                        <Input
                            id="beca"
                            name="beca"
                            className={`form-control ${formik.errors.beca ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            value={formik.values.beca}  
                        />
                        {
                            formik.errors.beca &&
                            <div className="invalid-tooltip">{formik.errors.beca}</div>
                        }
                    </Col>
                </Row>
                <hr />
                <div className="d-flex justify-content-end">
                    <Button
                        color="secondary"
                        type="button"
                        className="me-2"
                    >Expediente
                    </Button>
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

            <Modal isOpen={openDialogRazon} toggle={onCloseClick} size="lg" centered={true} 
                    backdrop={'static'} keyboard={false} 
                    className="overflow-hidden"
            >            
                <ModalHeader toggle={onCloseClick} />
                <ModalBody className="py-3 px-5">
                    <FormRazonSocial 
                        handleAfterSubmit={handleAfterSubmit}
                    />                
                </ModalBody>
            </Modal>

        </>        
    )
}