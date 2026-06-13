import { setError, setLoading, setUser } from "../state/auth.slice";
import { register } from "../service/auth.api"
import { useDispatch } from "react-redux";
import { login } from "../service/auth.api";
import { getMe } from "../service/auth.api";


export const useAuth = () => {

    const dispatch = useDispatch();

    async function handleRegister({ email, contact, password, fullname, isSeller = false }) {

        const data = await register({ email, contact, password, fullname, isSeller })
        console.log(data)
        dispatch(setUser(data.user))
        return data.user
    }

    async function handleLogin({ email, password }) {

        const data = await login({ email, password })
        console.log(data.user.fullname)
        dispatch(setUser(data.user))
        return data.user

    }

    async function handleGetMe() {

        try {
            dispatch(setLoading(true))
            const data = await getMe()
            // console.log(data.user.fullname)
            dispatch(setUser(data.user))
        }
        catch (err) {
            console.log(err)
        }
        finally {   
            dispatch(setLoading(false))
        }

    }



    return {
        handleRegister,
        handleLogin,
        handleGetMe
    }
}