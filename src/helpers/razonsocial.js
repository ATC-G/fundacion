import { get, post, put } from "./api";
import * as url from "./url";

//get user logued
const getRazonSocialQuery = query => get(`${url.RAZON_SOCIAL_QUERY}${query}`)
const saveAlumnos = (data) => post(url.ALUMNOS_SAVE, data)
const updateAlumnos = (data) => put(url.ALUMNOS_SAVE, data)

export {
    getRazonSocialQuery,
    saveAlumnos,
    updateAlumnos
}