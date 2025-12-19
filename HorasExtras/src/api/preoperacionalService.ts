import { api } from "./api"; 
import type { Preoperacional } from "../types/preoperacional";

export const preoperacionalApi ={
    getAll: async (): Promise<Preoperacional[]> =>{
        const response = await api.get<Preoperacional[]>('/preoperacional');
        return response.data;
    },

    getById: async(id: string, diaSemana: string): Promise<Preoperacional> =>{
        const response = await api.get<Preoperacional>(`/preoperacional/${id}/${diaSemana}`);
        return response.data;
    },

    downloadPDF: async (id: string, diaSemana: string): Promise<Blob> =>{
        const response = await api.get(`/preoperacional/${id}/${diaSemana}/pdf`,{
            responseType: 'blob'
        });
        return response.data;
    }
}