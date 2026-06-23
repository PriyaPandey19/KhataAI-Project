
//AuthContext use karne ka shortcut hook
//sirf useAuth() callkaro aur user, login,logout mil jata hai

import { useContext} from "react";
import {AuthContext} from "../context/AuthContext";

const useAuth = () => {
const context = useContext(AuthContext);

if(!context){
    throw new Error('useAuth must be used inside AuthProvider');
}
return context;

};

export default useAuth;