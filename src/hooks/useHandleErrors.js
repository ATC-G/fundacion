import { useState } from "react";
import { BAD_REQUEST, ERROR_SERVER } from "../constants/messages";

export default function useHandleErrors(){
    const [error, setError]  =useState(null);
    const [errors, setErrors] = useState([])

    function checkError(respError){
        switch(respError.status){
            case 404:
                setError(BAD_REQUEST)
                break;
            case 500:
                setError(ERROR_SERVER)
                break;
            default:
                setErrors([])
                setError(null)
        }
    }

    return [error, errors, checkError]
}