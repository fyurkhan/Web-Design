import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const bankaService = {
  // Tüm banka kayıtlarını getir
  getAllBanka: async () => {
    try {
      console.log('Banka verileri çekiliyor...');
      const response = await axios.get(`${API_BASE_URL}/banka`);
      console.log(
        'Banka verileri başarıyla alındı:',
        response.data.data.length,
        'kayıt'
      );
      return response.data.data;
    } catch (error) {
      console.error(
        'Banka veri çekme hatası:',
        error.response?.data || error.message
      );
      throw new Error(
        'Banka verileri yüklenirken hata oluştu: ' +
          (error.response?.data?.message || error.message)
      );
    }
  },

  // Yeni banka kaydı ekle
  addBanka: async (bankaData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/banka`, bankaData);
      return response.data;
    } catch (error) {
      console.error(
        'Banka ekleme hatası:',
        error.response?.data || error.message
      );
      throw new Error('Banka kaydedilirken hata oluştu: ' + error.message);
    }
  },

  // Banka kaydı güncelle
  updateBanka: async (hesapKodu, bankaData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/banka/${hesapKodu}`,
        bankaData
      );
      return response.data;
    } catch (error) {
      console.error(
        'Banka güncelleme hatası:',
        error.response?.data || error.message
      );
      throw new Error('Banka güncellenirken hata oluştu: ' + error.message);
    }
  },

  // Banka kaydı sil
  deleteBanka: async (hesapKodu) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/banka/${hesapKodu}`);
      return response.data;
    } catch (error) {
      console.error(
        'Banka silme hatası:',
        error.response?.data || error.message
      );
      throw new Error('Banka silinirken hata oluştu: ' + error.message);
    }
  },
};
