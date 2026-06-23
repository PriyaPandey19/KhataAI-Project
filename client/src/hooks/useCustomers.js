//customers daat fetch karne ka resulabe hook
//customer page aur Dashboard dono mein use hota hai

import { useState, useEffect } from "react";
import {customerAPI} from '../services/api';
import toast from 'react-hot-toast';

const useCustomers = (filters = {}) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const[total, setTotal] = useState(0);

    //customers fetch karo jab bhi filters change hon
    useEffect(() => {
        fetchCustomer();
    },[filters.search, filters.risk, filters.page]);

    const fetchCustomer = async() => {
        try{
            setLoading(true);
            const {data} = await customerAPI.getAll(filters);
            setCustomers(data.customers);
            setTotal(data.pagination?.total || 0);
        }catch(err){
            toast.err('Customers load nahi hue');
        }finally{
            setLoading(false);
        }
    };


    //nayacustomer add karo
    const adCustomer = async(customerData) => {
        try{
           const {data} = await customerAPI.add(customerData);
           //list mein turant add karo - page relad nhi chahiye
           setCustomers(prev => [data.customer, ...prev]);
           toast.success('Customer add ho gaya!');
           return{success: true};
        }catch(err){
           toast.error(err.response?.data?.message || 'Customer add nhi hua');
           return {success: false};
        }
    };


    //customer deleted karo
    const deleteCustomer = async(id) => {
        try{
            await customerAPI.delete(id);
            setCustomers(prev => prev.filter(c => c._id !== id));
            toast.success('Customer delete ho gaya');
        }catch(err){
            toast.err('Delete nahi hua');
        }
    };


    //customer update karo
    const updateCustomer = async(id, updatedData) => {
        try{
            const{data} = await customerAPI.update(id, updatedData);
            setCustomers(prev =>
                prev.map(c => c._id === id ? data.customer : c)
            );
            toast.success('Customer update ho gaya');
            return{success: true};
        }catch(err){
            toast.error('Update nhi hua');
            return{success: false};
        }
    };


    return{
        customers,
        loading,
        total,
        adCustomer,
        deleteCustomer,
        updateCustomer,
        refetch: fetchCustomers
    };
};
export default useCustomers