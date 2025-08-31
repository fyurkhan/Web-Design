import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const cariService = {
  getAllCari: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cariler`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        'Cari verileri yüklenirken hata oluştu: ' + error.message
      );
    }
  },

  getCariByKodu: async (cariKodu) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cariler/${cariKodu}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Cari verisi yüklenirken hata oluştu: ' + error.message);
    }
  },
};
