import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const tcmbService = {
  // TCMB Banka Kodlarını Getir
  getAllBankaKodlari: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tcmb-bankalar`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        'TCMB banka kodları yüklenirken hata oluştu: ' + error.message
      );
    }
  },

  // TCMB Şube Kodlarını Getir (sadece belirli bir banka için)
  getAllSubeKodlari: async (bankaKodu = null) => {
    try {
      // Eğer bankaKodu null veya boşsa, boş array döndür
      if (!bankaKodu) {
        return [];
      }

      const response = await axios.get(`${API_BASE_URL}/tcmb-subeler`, {
        params: { bankaKodu },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(
        'TCMB şube kodları yüklenirken hata oluştu: ' + error.message
      );
    }
  },
};
