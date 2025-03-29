import axios from 'axios'
import { backendUrl } from '../config/urls'

export const fetchAll=async()=>{
    try {
        const response=await axios.get(`${backendUrl}/fetch`)
        return response
    } catch (error) {
       throw error        
    }
}

export const uploadRestaurant = async (formData: FormData) => {
    try {
        const response = await axios.post(`${backendUrl}/add-restaurant`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',  
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateRestaurant = async (resId: string, formData: FormData) => {
    try {
        const response = await axios.put(`${backendUrl}/update/${resId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response;
    } catch (error) {
        throw error;
    }
};
export const deleteRestaurant=async(resId:string)=>{
    try {
        const response=await axios.delete(`${backendUrl}/delete/${resId}`)
        return response
    } catch (error) {
       throw error        
    }
}