import jwtDecode from "jwt-decode"
import { useEffect, useState } from "react"

export default function useLoguedUser(){
    const [userLogued, setUserLogued] = useState(null)

    useEffect(() => {
        if(localStorage.getItem("fundacionauth")){
            const obj = JSON.parse(localStorage.getItem("fundacionauth"))
            const decode = jwtDecode(obj.token)
            setUserLogued(decode)
        }
    }, [])


    return userLogued;
}