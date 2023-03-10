import { Field, FieldArray, FormikProvider, useFormik } from "formik";
import { useEffect, useState } from "react"
import { Button, Col, Form, Label, Row } from "reactstrap";
import * as Yup from "yup";
import SimpleDate from "../DatePicker/SimpleDate";
import Select from 'react-select';
import { CAMPO_MAYOR_CERO, CAMPO_MENOR_CIEN, FIELD_NUMERIC, FIELD_REQUIRED, SELECT_OPTION } from "../../constants/messages";
import { getColegiosList } from "../../helpers/colegios";
import SubmitingForm from "../Loader/SubmitingForm";
import { getCiclosByColegio } from "../../helpers/ciclos";

export default function FormCicloEscolar(){
    const [fecha, setFecha] = useState()
    const [colegio, setColegio] = useState(null)
    const [colegiosOpt, setColegiosOpt] = useState([])
    const [showLoad, setShowLoad] = useState(false)

    const fetchColegios = async () => {
        try {
            const response = await getColegiosList();
            setColegiosOpt(response.map(r=>({value: r.id, label: r.nombre})))
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchColegios();
    }, [])

    const formik = useFormik({
        initialValues: {
            colegioId: '',
            fechaInicio:'',
            fechaFin: '',
            fechaPagos:[{
                fechaLimite: '',
                interes: ''
            }],
        },
        validationSchema: Yup.object({
            colegioId: Yup.string().required(FIELD_REQUIRED),
            fechaInicio: Yup.string().required(FIELD_REQUIRED),
            fechaFin: Yup.string().required(FIELD_REQUIRED),
            fechaPagos: Yup.array().of(
                Yup.object().shape({
                    fechaLimite: Yup.string().required(FIELD_REQUIRED),
                    interes: Yup.number().typeError(FIELD_NUMERIC).required(FIELD_REQUIRED).min(1, CAMPO_MAYOR_CERO).max(100, CAMPO_MENOR_CIEN),
                })
            ),  
        }),
        onSubmit: (values) => {
            //validaciones antes de enviarlo
            console.log(values)
           
            //service here
            // try {
            //     async function savePartnerApi() {
            //         let response = await savePartner(values)
            //         if(response.state){
            //             toast.success("Actualizado correctamente");
            //             setReloadPartner(true)
            //             setShowForm(false)
            //         }else{
            //             toast.error(ERROR_SERVER);
            //         }
            //     }
            //     savePartnerApi()
            // }catch(error) {
            //     toast.error(ERROR_SERVER); 
            // }
        }
    })
    
    const fetchCiclosByColegio = async (value) => {
        console.log(value)
        setShowLoad(true)
        try {
            const q = `${value.value}?PageNumber=1&PageSize=100`
            const response = await getCiclosByColegio(q)
            console.log(response)
            if(response.data.length > 0){

            }
            setShowLoad(false)
        } catch (error) {
            console.log(error)
        }
    }

    const handleChange = value => {
        setColegio(value);
        if(value){
            formik.setFieldValue('colegioId', value.value)
            fetchCiclosByColegio(value);
        }else{
            formik.setFieldValue('colegioId', '')
        }        
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
            {showLoad && <SubmitingForm />}
            <Row>
                <Col xs="12" md="4">
                    <Label htmlFor="razonSocialId" className="mb-0">Colegio</Label>
                    <Select 
                        classNamePrefix="select2-selection"
                        placeholder={SELECT_OPTION}
                        options={colegiosOpt} 
                        value={colegio}
                        onChange={handleChange}
                        isClearable
                    />             
                    {
                        formik.errors.colegioId &&
                        <div className="invalid-tooltip d-block">{formik.errors.colegioId}</div>
                    }     
                </Col>
                <Col xs="12" md="4">
                    <Label className="mb-0">Fecha inicio a Fecha fin</Label>
                    <SimpleDate 
                        date={fecha}
                        setDate={value=>setFecha(value)}
                        options={{
                            mode: "range"
                        }}
                        placeholder="dd-MM-YYYY a dd-MM-YYYY"
                    />
                    {
                        (formik.errors.fechaInicio || formik.errors.fechaFin) &&
                        <div className="invalid-tooltip d-block">{FIELD_REQUIRED}</div>
                    } 
                </Col>                                     
            </Row>
            <Row>
                <Col>
                    <FormikProvider value={formik}>
                    <FieldArray
                        name="fechaPagos"
                        render={arrayHelper=>(
                            <div className="border bg-light p-2 mt-2">
                                {
                                    (formik.values.fechaPagos && formik.values.fechaPagos.length > 0) &&
                                    formik.values.fechaPagos.map((item, index) => (
                                        <div key={index} className="mb-2">
                                            <Row>
                                                <Col xs="12" md="3">
                                                    {index === 0 && <Label className="mb-0">Fecha límite de pago:</Label>}
                                                    <SimpleDate 
                                                        date={formik.values.fechaPagos[index].fechaLimite}
                                                        setDate={value=>{ 
                                                          if(value.length > 0){
                                                            formik.setFieldValue(`fechaPagos.${index}.fechaLimite`, value[0])
                                                          }else{
                                                            formik.setFieldValue(`fechaPagos.${index}.fechaLimite`, '')
                                                          }                                                          
                                                        }}
                                                    />
                                                    {
                                                        formik.errors?.fechaPagos?.length > 0 && formik.errors.fechaPagos[index]?.fechaLimite &&
                                                        <div className="invalid-tooltip d-block">{formik.errors.fechaPagos[index]?.fechaLimite}</div>
                                                    } 
                                                </Col>
                                                <Col xs="12" md="3">
                                                    {index === 0 && <Label className="mb-0">Interés:</Label>}
                                                    <Field
                                                        className={`form-control`}
                                                        name={`fechaPagos.${index}.interes`} 
                                                    />
                                                    {
                                                        formik.errors?.fechaPagos?.length > 0 && formik.errors.fechaPagos[index]?.interes &&
                                                        <div className="invalid-tooltip d-block">{formik.errors.fechaPagos[index]?.interes}</div>
                                                    } 
                                                </Col>  
                                                {index > 0 && 
                                                <Col xs="12" md="1" className="d-flex align-items-center">
                                                    {index===0 && <Label className="mb-0 opacity-0 d-block">O</Label>}
                                                    <Button color="danger" size="sm" onClick={() => arrayHelper.remove(index)}>Eliminar</Button>
                                                </Col>}                                             
                                            </Row>
                                        </div>
                                    ))
                                }
                                <Button type="button" color="link" className="btn btn-link" onClick={() => arrayHelper.push({
                                    fechaPagos: {
                                        fechaLimite: '',
                                        interes: '',
                                    },
                                })}>
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
                        onClick={() => {}}  
                    >
                        Cancelar                    
                    </Button>}
                </div>
        </Form>
        
    )
}