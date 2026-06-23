
//global auth state - poori app mein user info available hoti hai
//login/logout/register functions yahan hain

import { createContext, useState, useEffect, Children } from "react";
import{authAPI} from "../services/api";
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const[user, setUser] = useState(null);
    const[loading, setLoading] = useState(true);

    //app load pe check karo koi phele se logged in hai kya
    //localStorage mein token aur user saved hoga
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if(token && savedUser){
            //serialization json.parse string ko object mein convert karta hai
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    },[]);



    //naya shopkeeper register karo
    const register = async(formData) => {
        try{
          const {data} = await authAPI.register(formData);
          
          //localStorage sirf strings kar sakta hai
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          setUser(data.user);
          toast.success(`Welcome ${data.user.shopName}!`);
          return {success: true};
        }catch(err){
            const message = err.response?.data?.message || 'Registration failed';
            toast.error(message);
            return {success: false, message};
        }
    };


    //existing shopkeeper login
    const login = async(formData) => {
        try{
            const {data} = await authAPI.login(formData);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user',JSON.stringify(data.user));

            setUser(data.user);
            toast.success(`Welcome backk ${data.user.shopName}!`);
            return {success: true};


        }catch(err){
            const message = err.response?.data?.message || 'Login failed';
            toast.error(message);
            return{success: false, message};

        }
    };



    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        toast.success('Logged out Successfully');
    };
    return(
        <AuthContext.Provider value={{user, loading, login, register, logout}}>
        {children}
        </AuthContext.Provider>

    )
}