import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const stokService = {
  getAllStok: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stoklar`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        'Stok verileri yüklenirken hata oluştu: ' + error.message
      );
    }
  },

  getStokByKodu: async (stokKodu) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stoklar/${stokKodu}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Stok verisi yüklenirken hata oluştu: ' + error.message);
    }
  },
};
