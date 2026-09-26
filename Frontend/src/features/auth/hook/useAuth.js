import { setError, setLoading, setUser } from "../state/auth.slice.js";
import { register, login, getMe, becomeSeller, logout } from "../service/auth.api.js";
import { useDispatch } from "react-redux";

export const useAuth = () =>{

    const dispatch = useDispatch();

    async function handleRegister({email, contact, password, fullname, isSeller= false}){ 
        const data = await register({email, contact, password, fullname, isSeller});

        dispatch(setUser(data.user));

        return data.user
    }

    async function handleLogin({email, password}){
        const data = await login({email, password});

        dispatch(setUser(data.user));

        return data.user
    }

    async function handleGetMe() {
        try{
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch(err){
            console.log(err);
            dispatch(setUser(null))
        } finally{
            dispatch(setLoading(false))
        }
    }

    async function handleBecomeSeller() {
        dispatch(setLoading(true))
        try {
            const data = await becomeSeller()
            dispatch(setUser(data.user))
            return data.user
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            await logout()
        } catch (err) {
            console.error("Logout request failed:", err)
        } finally {
            dispatch(setUser(null))
        }
    }

    return{ handleRegister, handleLogin, handleGetMe, handleBecomeSeller, handleLogout }

}