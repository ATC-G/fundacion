import { get, post, put } from "./api";
import * as url from "./url";

//get user logued
const getCiclosByColegio = (colegioId) => get(`${url.CICLOS_BY_COLEGIOS}/${colegioId}`)
const saveCiclos = (data) => post(url.ALUMNOS_SAVE, data)
const updateCiclos = (data, id) => put(`${url.ALUMNOS_SAVE}/${id}`, data)

export {
    getCiclosByColegio,
    saveCiclos  ,
    updateCiclos
}