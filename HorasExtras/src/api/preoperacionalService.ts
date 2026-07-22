import { api } from "./api"; 
import type { Preoperacional } from "../types/preoperacional";

export const preoperacionalApi ={
    getAll: async (): Promise<Preoperacional[]> =>{
        const response = await api.get<Preoperacional[]>('/preoperacional');
        return response.data;
    }
}