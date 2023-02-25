import { useHistory, withRouter } from "react-router-dom"

function Logout() {
    const history = useHistory();
    localStorage.removeItem("fundacionauth");
    history.push("/login");
    return <></>
}

export default withRouter(Logout)