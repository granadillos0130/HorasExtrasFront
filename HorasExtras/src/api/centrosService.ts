import { api } from "./api";
import type { Centro } from "../types/centros";

export const centrosService = {
  async getAll(): Promise<Centro[]> {
    const res = await api.get<Centro[]>("/centros");
    return res.data;
  },
};