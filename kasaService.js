import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const kasaService = {
  getAllKasa: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kasa`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        'Kasa verileri yüklenirken hata oluştu: ' + error.message
      );
    }
  },

  addKasa: async (kasaData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/kasa`, kasaData);
      return response.data;
    } catch (error) {
      throw new Error('Kasa kaydedilirken hata oluştu: ' + error.message);
    }
  },

  deleteKasa: async (kasaKodu) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/kasa/${kasaKodu}`);
      return response.data;
    } catch (error) {
      throw new Error('Kasa silinirken hata oluştu: ' + error.message);
    }
  },
};
