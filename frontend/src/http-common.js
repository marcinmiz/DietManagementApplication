import axios from "axios";
axios.defaults.withCredentials = true;
export default axios.create({
    baseURL: "http://localhost:8097",
    headers: {
        "Content-type": "application/json"
    }
});