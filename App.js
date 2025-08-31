import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import atikerLogo from './atikerLogo.png';
import { cariService } from './api/cariService';
import { stokService } from './api/stokService';
import { kasaService } from './api/kasaService';
import { tcmbService } from './api/tcmbService';
import { bankaService } from './api/bankaService';

const ISLEM_TURLERI = [
  {
    id: 1,
    kod: 'Cari Tahsil',
    tablo: 'TBLCARISB',
    kodAlan: 'CARI_KODU',
    isimAlan: 'CARI_ADI',
    yon: 'giren',
  },
  {
    id: 2,
    kod: 'Cari Tediye',
    tablo: 'TBLCARISB',
    kodAlan: 'CARI_KODU',
    isimAlan: 'CARI_ADI',
    yon: 'cikan',
  },
  {
    id: 3,
    kod: 'Muhasebe Tahsil',
    tablo: null,
    kodAlan: '',
    isimAlan: '',
    yon: 'giren',
  },
  {
    id: 4,
    kod: 'Muhasebe Tediye',
    tablo: null,
    kodAlan: '',
    isimAlan: '',
    yon: 'cikan',
  },
  {
    id: 5,
    kod: 'Bankadan Gelen',
    tablo: 'TBLBANKASB',
    kodAlan: 'BANKA_HESAP_KODU',
    isimAlan: 'BANKA_HESAP_ISIM',
    yon: 'giren',
  },
  {
    id: 6,
    kod: 'Bankaya Çıkılan',
    tablo: 'TBLBANKASB',
    kodAlan: 'BANKA_HESAP_KODU',
    isimAlan: 'BANKA_HESAP_ISIM',
    yon: 'cikan',
  },
  {
    id: 18,
    kod: 'Kasa Virman Çıkış',
    tablo: 'TBLKASASB',
    kodAlan: 'KASA_KODU',
    isimAlan: 'KASA_TANIMI',
    yon: 'cikan',
  },
  {
    id: 21,
    kod: 'Kasa Açılış Giriş',
    tablo: null,
    kodAlan: '',
    isimAlan: '',
    yon: 'giren',
  },
  {
    id: 22,
    kod: 'Kasa Açılış Çıkış',
    tablo: null,
    kodAlan: '',
    isimAlan: '',
    yon: 'cikan',
  },
  {
    id: 51,
    kod: 'Şube Kasadan Çıkış',
    tablo: null,
    kodAlan: '',
    isimAlan: '',
    yon: 'cikan',
  },
];

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginAnimation, setShowLoginAnimation] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activePage, setActivePage] = useState('Ana Sayfa');
  const [selectedCari, setSelectedCari] = useState(null);
  const [selectedStok, setSelectedStok] = useState(null);
  const [selectedKasa, setSelectedKasa] = useState(null);
  const [selectedBanka, setSelectedBanka] = useState(null);
  const [cariData, setCariData] = useState([]);
  const [stokData, setStokData] = useState([]);
  const [kasaData, setKasaData] = useState([]);
  const [bankaData, setBankaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stokLoading, setStokLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stokError, setStokError] = useState(null);
  const [selectedIslemTuru, setSelectedIslemTuru] = useState('');
  const [selectedDynamicKod, setSelectedDynamicKod] = useState('');
  const [selectedDynamicIsim, setSelectedDynamicIsim] = useState('');
  const [dynamicData, setDynamicData] = useState([]);
  const [loadingDynamic, setLoadingDynamic] = useState(false);
  const [evrakNo, setEvrakNo] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [girenTutar, setGirenTutar] = useState('');
  const [cikanTutar, setCikanTutar] = useState('');
  const [belgeNo, setBelgeNo] = useState('');
  const [kasaHareketData, setKasaHareketData] = useState([]);
  const [loadingKasaHareket, setLoadingKasaHareket] = useState(false);

  // Kasa form state
  const [kasaKodu, setKasaKodu] = useState('');
  const [kasaTanimi, setKasaTanimi] = useState('');
  const [activeKasaSubPage, setActiveKasaSubPage] = useState('sabit');
  const [activeBankaSubPage, setActiveBankaSubPage] = useState('hesap-kayit');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  // Banka form state
  const [hesapKodu, setHesapKodu] = useState('');
  const [hesapAdi, setHesapAdi] = useState('');
  const [hesapTipi, setHesapTipi] = useState('');
  const [tcmbBankaKodu, setTcmbBankaKodu] = useState('');
  const [tcmbSubeKodu, setTcmbSubeKodu] = useState('');
  const [hesapNo, setHesapNo] = useState('');
  const [ibanNo, setIbanNo] = useState('');
  const [hesapDurumu, setHesapDurumu] = useState('Açık');
  const [yetkiliIsmi, setYetkiliIsmi] = useState('');
  const [belgeListesi, setBelgeListesi] = useState([]);
  const [seciliBelgeDetay, setSeciliBelgeDetay] = useState(null);
  const [loadingBelgeDetay, setLoadingBelgeDetay] = useState(false);

  // TCMB verileri state
  const [tcmbBankaKodlari, setTcmbBankaKodlari] = useState([]);
  const [tcmbSubeKodlari, setTcmbSubeKodlari] = useState([]);
  const [loadingBankaKodlari, setLoadingBankaKodlari] = useState(false);
  const [loadingSubeKodlari, setLoadingSubeKodlari] = useState(false);

  // Login sayfası için ayrı alert state
  const [loginAlert, setLoginAlert] = useState(false);
  const [loginAlertMessage, setLoginAlertMessage] = useState('');
  const [loginAlertType, setLoginAlertType] = useState('error');

  const loadBelgeListesi = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/belge-listesi');
      const result = await response.json();

      if (result.success) {
        setBelgeListesi(result.data);
      }
    } catch (err) {
      console.error('Belge listesi çekme hatası:', err);
    }
  }, []);

  // Yeni fonksiyon - Belge detaylarını çek
  const loadBelgeDetay = useCallback(async (belgeNo) => {
    if (!belgeNo) {
      setSeciliBelgeDetay(null);
      return;
    }

    setLoadingBelgeDetay(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/belge-detay/${belgeNo}`
      );
      const result = await response.json();

      if (result.success) {
        setSeciliBelgeDetay(result.data);
      } else {
        setSeciliBelgeDetay(null);
      }
    } catch (err) {
      console.error('Belge detay çekme hatası:', err);
      setSeciliBelgeDetay(null);
    } finally {
      setLoadingBelgeDetay(false);
    }
  }, []);

  // Son belge numarasını çek
  const getSonBelgeNo = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/son-belge-no');
      const result = await response.json();

      if (result.success) {
        let yeniBelgeNo;
        if (result.data) {
          // Son belge numarasını al ve 1 artır
          const numaraKismi = parseInt(result.data.substring(5)) + 1;
          yeniBelgeNo = `25AKS${numaraKismi.toString().padStart(12, '0')}`;
        } else {
          // İlk kayıt
          yeniBelgeNo = '25AKS00000000001';
        }
        setBelgeNo(yeniBelgeNo);
      }
    } catch (err) {
      console.error('Belge no çekme hatası:', err);
      setBelgeNo('25AKS00000000001');
    }
  }, []);
  // Kasa hareket verilerini yükle
  const loadKasaHareketData = useCallback(async () => {
    setLoadingKasaHareket(true);
    try {
      const response = await fetch('http://localhost:5000/api/kasa-hareket');
      const result = await response.json();

      if (result.success) {
        setKasaHareketData(result.data);
      }
    } catch (err) {
      console.error('Kasa hareket verileri yükleme hatası:', err);
    } finally {
      setLoadingKasaHareket(false);
    }
  }, []);

  // Dinamik verileri yükleme fonksiyonu
  const loadDynamicData = useCallback(async (tabloAdi, kodAlan, isimAlan) => {
    if (!tabloAdi) {
      setDynamicData([]);
      return;
    }

    setLoadingDynamic(true);
    try {
      let endpoint = '';
      if (tabloAdi === 'TBLBANKASB') {
        endpoint = '/api/banka';
      } else if (tabloAdi === 'TBLCARISB') {
        endpoint = '/api/cariler';
      } else if (tabloAdi === 'TBLKASASB') {
        endpoint = '/api/kasa';
      }

      if (endpoint) {
        const response = await fetch(`http://localhost:5000${endpoint}`);
        const result = await response.json();

        if (result.success) {
          // Verileri formatla
          const formattedData = result.data.map((item) => ({
            kod: item[kodAlan],
            isim: item[isimAlan],
          }));
          setDynamicData(formattedData);
        }
      }
    } catch (err) {
      console.error('Dinamik veri yükleme hatası:', err);
      showAlertMessage('Veriler yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingDynamic(false);
    }
  }, []);

  // Cari verilerini API'den yükle
  const loadCariData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cariService.getAllCari();
      setCariData(data);
    } catch (err) {
      setError('Cari verileri yüklenirken hata oluştu: ' + err.message);
      console.error('Cari veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Stok verilerini API'den yükle
  const loadStokData = useCallback(async () => {
    setStokLoading(true);
    setStokError(null);
    try {
      const data = await stokService.getAllStok();
      setStokData(data);
    } catch (err) {
      setStokError('Stok verileri yüklenirken hata oluştu: ' + err.message);
      console.error('Stok veri yükleme hatası:', err);
    } finally {
      setStokLoading(false);
    }
  }, []);

  // Kasa verilerini veritabanından yükle
  const loadKasaData = useCallback(async () => {
    try {
      const data = await kasaService.getAllKasa();
      setKasaData(data);
    } catch (err) {
      showAlertMessage(
        'Kasa verileri yüklenirken hata oluştu: ' + err.message,
        'error'
      );
      console.error('Kasa veri yükleme hatası:', err);
    }
  }, []);

  // TCMB Banka Kodlarını Yükle
  const loadTcmbBankaKodlari = useCallback(async () => {
    setLoadingBankaKodlari(true);
    try {
      console.log('Banka kodları yükleniyor (BITEK)...');
      const data = await tcmbService.getAllBankaKodlari();
      console.log('Banka kodları yüklendi:', data.length, 'kayıt');
      setTcmbBankaKodlari(data);
    } catch (err) {
      console.error('TCMB banka kodları yükleme hatası:', err);
      showAlertMessage('Banka kodları yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingBankaKodlari(false);
    }
  }, []);

  // TCMB Şube Kodlarını Yükle (BITEK veritabanından)
  const loadTcmbSubeKodlari = useCallback(async (bankaKodu = null) => {
    if (!bankaKodu) {
      setTcmbSubeKodlari([]);
      return;
    }

    setLoadingSubeKodlari(true);
    try {
      console.log('Şube kodları yükleniyor, banka kodu:', bankaKodu);
      const data = await tcmbService.getAllSubeKodlari(bankaKodu);
      console.log('Şube kodları yüklendi:', data.length, 'kayıt');
      setTcmbSubeKodlari(data);
    } catch (err) {
      console.error('TCMB şube kodları yükleme hatası:', err);
      setTcmbSubeKodlari([]);
    } finally {
      setLoadingSubeKodlari(false);
    }
  }, []);

  // Banka verilerini veritabanından yükle
  const loadBankaData = useCallback(async () => {
    try {
      console.log('Banka verileri yükleniyor (ATIKER25)...');
      const data = await bankaService.getAllBanka();
      console.log('Banka verileri yüklendi:', data.length, 'kayıt');
      setBankaData(data);
    } catch (err) {
      console.error('Banka verileri yükleme hatası:', err);
      showAlertMessage(
        'Banka verileri yüklenirken hata oluştu: ' + err.message,
        'error'
      );

      // Hata durumunda boş array set et ki uygulama çökmesin
      setBankaData([]);
    }
  }, []);

  // Kasa verilerini veritabanına kaydet
  const saveKasaToDatabase = async (kasaData) => {
    try {
      const result = await kasaService.addKasa(kasaData);
      return result;
    } catch (err) {
      showAlertMessage(
        'Kasa kaydedilirken hata oluştu: ' + err.message,
        'error'
      );
      console.error('Kasa kaydetme hatası:', err);
      throw err;
    }
  };

  // Kasa verilerini veritabanından sil
  const deleteKasaFromDatabase = async (kasaKodu) => {
    try {
      const result = await kasaService.deleteKasa(kasaKodu);
      return result;
    } catch (err) {
      showAlertMessage('Kasa silinirken hata oluştu: ' + err.message, 'error');
      console.error('Kasa silme hatası:', err);
      throw err;
    }
  };

  // Sayfa değiştiğinde ilgili verileri yükle
  useEffect(() => {
    if (activePage === 'cari' && isLoggedIn) {
      loadCariData();
    }

    if (activePage === 'stok' && isLoggedIn) {
      loadStokData();
    }

    if (activePage === 'kasa' && isLoggedIn) {
      loadKasaData();
    }

    if (activePage === 'banka' && isLoggedIn) {
      loadBankaData(); // ATIKER25'ten banka verileri
      // Banka sayfasına girince hemen banka kodlarını yükle
      if (tcmbBankaKodlari.length === 0 && !loadingBankaKodlari) {
        loadTcmbBankaKodlari();
      }
    }
  }, [
    activePage,
    isLoggedIn,
    loadCariData,
    loadStokData,
    loadKasaData,
    loadBankaData,
    loadTcmbBankaKodlari,
    tcmbBankaKodlari.length,
    loadingBankaKodlari,
  ]);

  // Banka kodu değiştiğinde şube kodlarını yeniden yükle
  useEffect(() => {
    if (tcmbBankaKodu) {
      loadTcmbSubeKodlari(tcmbBankaKodu);
    } else {
      setTcmbSubeKodlari([]);
      setTcmbSubeKodu('');
    }
  }, [tcmbBankaKodu, loadTcmbSubeKodlari]);

  // İşlem türü değiştiğinde verileri yükle
  useEffect(() => {
    if (selectedIslemTuru) {
      const islem = ISLEM_TURLERI.find((t) => t.kod === selectedIslemTuru);
      if (islem && islem.tablo) {
        loadDynamicData(islem.tablo, islem.kodAlan, islem.isimAlan);
      } else {
        setDynamicData([]);
        setSelectedDynamicKod('');
        setSelectedDynamicIsim('');
      }
    }
  }, [selectedIslemTuru, loadDynamicData]);

  // Component mount olduğunda ve kasa hareket sayfasına girildiğinde
  useEffect(() => {
    if (
      isLoggedIn &&
      activePage === 'kasa' &&
      activeKasaSubPage === 'hareket'
    ) {
      getSonBelgeNo();
      loadKasaHareketData();
      loadBelgeListesi();
    }
  }, [
    isLoggedIn,
    activePage,
    activeKasaSubPage,
    getSonBelgeNo,
    loadKasaHareketData,
    loadBelgeListesi,
  ]);

  // Alert göster
  const showAlertMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  // Login Alert göster
  const showLoginAlertMessage = (message, type = 'error') => {
    setLoginAlertMessage(message);
    setLoginAlertType(type);
    setLoginAlert(true);

    setTimeout(() => {
      setLoginAlert(false);
    }, 3000);
  };

  // Confirm dialog göster
  const showConfirmDialog = (message, callback) => {
    setConfirmMessage(message);
    setConfirmCallback(() => callback);
    setConfirmDialog(true);
  };

  // Form temizleme fonksiyonu
  const handleTemizle = () => {
    setSelectedIslemTuru('');
    setSelectedDynamicKod('');
    setSelectedDynamicIsim('');
    setEvrakNo('');
    setAciklama('');
    setGirenTutar('');
    setCikanTutar('');
    // Belge no'yu sıfırlama, yeni belge no al
    getSonBelgeNo();
  };

  // Kasa hareket kaydet
  const handleKasaHareketKaydet = async () => {
    if (!selectedKasa || !selectedIslemTuru) {
      showAlertMessage('Kasa ve İşlem türü seçimi zorunludur!', 'error');
      return;
    }

    try {
      const seciliIslem = ISLEM_TURLERI.find(
        (t) => t.kod === selectedIslemTuru
      );
      const islemNumarasi = seciliIslem ? seciliIslem.id : 0;

      const kasaHareketData = {
        BELGE_NO: belgeNo,
        BELGE_TIPI: islemNumarasi,
        CMBK_KODU: selectedDynamicKod,
        EVRAK_NO: evrakNo,
        GIREN_TUTAR: girenTutar || 0,
        CIKAN_TUTAR: cikanTutar || 0,
        KASA_ACIKLAMA: aciklama,
        MUHFISNUM: belgeNo,
        KASA_KODU: selectedKasa.KASA_KODU,
      };

      const response = await fetch('http://localhost:5000/api/kasa-hareket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kasaHareketData),
      });

      const result = await response.json();

      if (result.success) {
        showAlertMessage('Kasa hareketi başarıyla kaydedildi!');
        await loadKasaHareketData();
        await getSonBelgeNo();
        handleTemizle();
      } else {
        showAlertMessage(
          'Kasa hareketi kaydedilemedi: ' + result.message,
          'error'
        );
      }
    } catch (err) {
      console.error('Kasa hareket kaydetme hatası:', err);
      showAlertMessage('Kasa hareketi kaydedilemedi: ' + err.message, 'error');
    }
  };

  // Kasa işlemleri
  const handleKasaKaydet = async () => {
    if (!kasaKodu || !kasaTanimi) {
      showAlertMessage('Kasa Kodu ve Kasa Tanımı zorunlu alanlardır!', 'error');
      return;
    }

    try {
      const kasaData = {
        KASA_KODU: kasaKodu,
        KASA_TANIMI: kasaTanimi,
      };

      await saveKasaToDatabase(kasaData);

      // Verileri yeniden yükle
      await loadKasaData();

      showAlertMessage('Kasa kaydı başarıyla eklendi!');

      // Formu temizle
      setKasaKodu('');
      setKasaTanimi('');
      setSelectedKasa(null);
    } catch (err) {
      // Hata zaten showAlertMessage ile gösteriliyor
    }
  };

  const handleKasaSil = async () => {
    if (!selectedKasa) {
      showAlertMessage('Silmek için bir kasa seçin!', 'error');
      return;
    }

    showConfirmDialog(
      'Bu kasa kaydını silmek istediğinize emin misiniz?',
      async () => {
        try {
          await deleteKasaFromDatabase(selectedKasa.KASA_KODU);

          // Verileri yeniden yükle
          await loadKasaData();

          showAlertMessage('Kasa kaydı silindi!');
          setSelectedKasa(null);
          setKasaKodu('');
          setKasaTanimi('');
        } catch (err) {
          // Hata zaten showAlertMessage ile gösteriliyor
        } finally {
          setConfirmDialog(false);
        }
      }
    );
  };

  // Banka işlemleri
  const handleBankaKaydet = async () => {
    if (!hesapKodu || !hesapAdi) {
      showAlertMessage('Hesap Kodu ve Hesap Adı zorunlu alanlardır!', 'error');
      return;
    }

    try {
      // BANKA_HESAP_NO için sıradaki numarayı bul
      let nextHesapNo = 1;
      if (bankaData.length > 0) {
        const maxHesapNo = Math.max(
          ...bankaData.map((item) => item.BANKA_HESAP_NO || 0)
        );
        nextHesapNo = maxHesapNo + 1;
      }

      // Seçilen bankanın adını bul
      const selectedBankaObj = tcmbBankaKodlari.find(
        (banka) => banka.TCMB_BANKA_KODU === tcmbBankaKodu
      );
      const bankaSubeAdi = selectedBankaObj
        ? selectedBankaObj.TCMB_BANKA_KISA_ADI
        : '';

      const bankaDataToSave = {
        BANKA_HESAP_KODU: hesapKodu,
        BANKA_HESAP_ISIM: hesapAdi,
        BANKA_HESAP_TIPI: parseInt(hesapTipi) || 0,
        IBAN_NO: ibanNo,
        BANKA_HESAP_NO: nextHesapNo, // Otomatik artan numara
        BANKA_SUBE_ADI: bankaSubeAdi, // Banka adı
        TCMB_BANKA_KODU: tcmbBankaKodu,
        TCMB_BANKA_SUBEKODU: tcmbSubeKodu,
        BANKA_YETKILI: yetkiliIsmi,
        HESAP_DURUM: hesapDurumu, // HESAP_DURUM olarak değiştir
      };

      if (selectedBanka) {
        // Düzenleme modu - ATIKER25 veritabanına kaydet
        await bankaService.updateBanka(
          selectedBanka.BANKA_HESAP_KODU,
          bankaDataToSave
        );
        showAlertMessage('Banka kaydı güncellendi!');
      } else {
        // Yeni kayıt - ATIKER25 veritabanına kaydet
        await bankaService.addBanka(bankaDataToSave);
        showAlertMessage('Banka kaydı eklendi!');
      }

      // Verileri yeniden yükle (ATIKER25'ten)
      await loadBankaData();

      // Formu temizle
      handleYeniBanka();
    } catch (err) {
      showAlertMessage(
        'Banka işlemi sırasında hata oluştu: ' + err.message,
        'error'
      );
      console.error('Banka işlem hatası:', err);
    }
  };

  const handleBankaSil = async () => {
    if (!selectedBanka) {
      showAlertMessage('Silmek için bir banka seçin!', 'error');
      return;
    }

    showConfirmDialog(
      'Bu banka kaydını silmek istediğinize emin misiniz?',
      async () => {
        try {
          // ATIKER25 veritabanından sil
          await bankaService.deleteBanka(selectedBanka.BANKA_HESAP_KODU);

          // Verileri yeniden yükle (ATIKER25'ten)
          await loadBankaData();

          showAlertMessage('Banka kaydı silindi!');
          handleYeniBanka();
        } catch (err) {
          showAlertMessage(
            'Banka silinirken hata oluştu: ' + err.message,
            'error'
          );
          console.error('Banka silme hatası:', err);
        } finally {
          setConfirmDialog(false);
        }
      }
    );
  };

  const handleYeniBanka = () => {
    setSelectedBanka(null);
    setHesapKodu('');
    setHesapAdi('');
    setHesapTipi('');
    setTcmbBankaKodu('');
    setTcmbSubeKodu('');
    setHesapNo('');
    setIbanNo('');
    setHesapDurumu('Açık');
    setYetkiliIsmi('');
    // Şube listesini temizleme, çünkü useEffect zaten bunu halledecek
  };

  const handleBankaSelect = (banka) => {
    setSelectedBanka(banka);
    setHesapKodu(banka.BANKA_HESAP_KODU);
    setHesapAdi(banka.BANKA_HESAP_ISIM);
    setHesapTipi(banka.BANKA_HESAP_TIPI?.toString());
    setTcmbBankaKodu(banka.TCMB_BANKA_KODU);
    setTcmbSubeKodu(banka.TCMB_BANKA_SUBEKODU);
    setHesapNo(banka.BANKA_HESAP_NO);
    setIbanNo(banka.IBAN_NO);
    setHesapDurumu(banka.HESAP_DURUM); // HESAP_DURUM olarak değiştir
    setYetkiliIsmi(banka.BANKA_YETKILI);

    // Banka seçildiğinde şube kodlarını da yükle (BITEK'ten)
    if (banka.TCMB_BANKA_KODU) {
      loadTcmbSubeKodlari(banka.TCMB_BANKA_KODU);
    }
  };

  // Giriş işlemi
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'furkan' && password === '123') {
      setShowLoginAnimation(true);

      // 1.5 saniye sonra ana uygulamaya geç
      setTimeout(() => {
        setIsLoggedIn(true);
        setShowLoginAnimation(false);
      }, 1500);
    } else {
      showLoginAlertMessage('Kullanıcı adı veya şifre hatalı!', 'error');
    }
  };

  // Çıkış işlemi
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setActivePage('Ana Sayfa');
    setCariData([]);
    setStokData([]);
    setKasaData([]);
    setBankaData([]);
    setSelectedCari(null);
    setSelectedStok(null);
    setSelectedKasa(null);
    setSelectedBanka(null);
    setActiveKasaSubPage('sabit');
    setActiveBankaSubPage('hesap-kayit');
    setTcmbBankaKodlari([]);
    setTcmbSubeKodlari([]);
  };

  // Cari seçildiğinde formatla
  const handleCariSelect = (cari) => {
    const formattedCari = {
      id: cari.CARI_KODU,
      code: cari.CARI_KODU,
      name: cari.CARI_ADI,
      type: cari.CARI_TIPI,
      address: cari.CARI_ADRES,
      country: cari.CARI_ULKE,
      city: cari.CARI_IL,
      district: cari.CARI_ILCE,
      neighborhood: cari.CARI_SEMT,
      postalCode: cari.CARI_POSTAKODU,
      taxNumber: cari.VERGI_NO,
      identityNumber: cari.TC_NO,
      phone: cari.CARI_TELEFON,
    };
    setSelectedCari(formattedCari);
  };

  // Stok seçildiğinde formatla
  const handleStokSelect = (stok) => {
    const formattedStok = {
      id: stok.STOK_KODU,
      code: stok.STOK_KODU,
      name: stok.STOK_ADI,
      type: stok.STOK_TIPI,
      shortName: stok.STOK_KISA_ADI,
    };
    setSelectedStok(formattedStok);
  };

  // Kasa seçildiğinde
  const handleKasaSelect = (kasa) => {
    setSelectedKasa(kasa);
    setKasaKodu(kasa.KASA_KODU);
    setKasaTanimi(kasa.KASA_TANIMI);
  };

  // Yeni kasa butonu
  const handleYeniKasa = () => {
    setSelectedKasa(null);
    setKasaKodu('');
    setKasaTanimi('');
  };

  if (showLoginAnimation) {
    return <LoginAnimation />;
  }

  // Giriş yapılmamışsa login ekranını göster
  if (!isLoggedIn) {
    return (
      <LoginScreen
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        showAlert={loginAlert}
        alertMessage={loginAlertMessage}
        alertType={loginAlertType}
        setShowAlert={setLoginAlert}
      />
    );
  }

  // Giriş yapılmışsa ana uygulamayı göster
  return (
    <div className='app'>
      {/* Alert Mesajı */}
      {showAlert && (
        <div className={`custom-alert ${alertType}`}>
          <div className='alert-content'>
            <span className='alert-message'>{alertMessage}</span>
            <button className='alert-close' onClick={() => setShowAlert(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className='custom-confirm'>
          <div
            className='confirm-overlay'
            onClick={() => setConfirmDialog(false)}
          ></div>
          <div className='confirm-dialog'>
            <div className='confirm-header'>
              <h3>Onay</h3>
              <button
                className='confirm-close'
                onClick={() => setConfirmDialog(false)}
              >
                ×
              </button>
            </div>
            <div className='confirm-body'>
              <p>{confirmMessage}</p>
            </div>
            <div className='confirm-footer'>
              <button
                className='confirm-btn cancel'
                onClick={() => setConfirmDialog(false)}
              >
                İptal
              </button>
              <button
                className='confirm-btn confirm'
                onClick={() => confirmCallback()}
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        activeKasaSubPage={activeKasaSubPage}
        setActiveKasaSubPage={setActiveKasaSubPage}
        activeBankaSubPage={activeBankaSubPage}
        setActiveBankaSubPage={setActiveBankaSubPage}
        handleLogout={handleLogout}
      />
      <div className='main-content'>
        {activePage === 'Ana Sayfa' && <AnaSayfa />}
        {activePage === 'cari' && (
          <CariKartlari
            data={cariData}
            selectedItem={selectedCari}
            onSelectItem={handleCariSelect}
            loading={loading}
            error={error}
          />
        )}
        {activePage === 'stok' && (
          <StokKartlari
            data={stokData}
            selectedItem={selectedStok}
            onSelectItem={handleStokSelect}
            loading={stokLoading}
            error={stokError}
          />
        )}
        {activePage === 'kasa' && activeKasaSubPage === 'sabit' && (
          <KasaSabitIslemleri
            kasaKodu={kasaKodu}
            setKasaKodu={setKasaKodu}
            kasaTanimi={kasaTanimi}
            setKasaTanimi={setKasaTanimi}
            onKaydet={handleKasaKaydet}
            onSil={handleKasaSil}
            onYeni={handleYeniKasa}
            data={kasaData}
            selectedItem={selectedKasa}
            onSelectItem={handleKasaSelect}
          />
        )}
        {activePage === 'kasa' && activeKasaSubPage === 'hareket' && (
          <KasaHareketIslemleri
            kasaData={kasaData}
            selectedKasa={selectedKasa}
            onSelectKasa={handleKasaSelect}
            islemTurleri={ISLEM_TURLERI}
            selectedIslemTuru={selectedIslemTuru}
            setSelectedIslemTuru={setSelectedIslemTuru}
            selectedDynamicKod={selectedDynamicKod}
            setSelectedDynamicKod={setSelectedDynamicKod}
            selectedDynamicIsim={selectedDynamicIsim}
            setSelectedDynamicIsim={setSelectedDynamicIsim}
            dynamicData={dynamicData}
            loadingDynamic={loadingDynamic}
            evrakNo={evrakNo}
            setEvrakNo={setEvrakNo}
            aciklama={aciklama}
            setAciklama={setAciklama}
            girenTutar={girenTutar}
            setGirenTutar={setGirenTutar}
            cikanTutar={cikanTutar}
            setCikanTutar={setCikanTutar}
            belgeNo={belgeNo}
            handleKasaHareketKaydet={handleKasaHareketKaydet}
            kasaHareketData={kasaHareketData}
            loadingKasaHareket={loadingKasaHareket}
            handleTemizle={handleTemizle}
            belgeListesi={belgeListesi}
            seciliBelgeDetay={seciliBelgeDetay}
            loadingBelgeDetay={loadingBelgeDetay}
            onBelgeNoChange={(belgeNo) => {
              setBelgeNo(belgeNo);
              loadBelgeDetay(belgeNo);
            }}
          />
        )}
        {activePage === 'kasa' && activeKasaSubPage === 'detay' && (
          <KasaDetaylari
            data={kasaData}
            selectedItem={selectedKasa}
            onSelectItem={handleKasaSelect}
            onSil={handleKasaSil}
          />
        )}
        {activePage === 'banka' && activeBankaSubPage === 'hesap-kayit' && (
          <BankaHesapKayit
            hesapKodu={hesapKodu}
            setHesapKodu={setHesapKodu}
            hesapAdi={hesapAdi}
            setHesapAdi={setHesapAdi}
            hesapTipi={hesapTipi}
            setHesapTipi={setHesapTipi}
            tcmbBankaKodu={tcmbBankaKodu}
            setTcmbBankaKodu={setTcmbBankaKodu}
            tcmbSubeKodu={tcmbSubeKodu}
            setTcmbSubeKodu={setTcmbSubeKodu}
            hesapNo={hesapNo}
            setHesapNo={setHesapNo}
            ibanNo={ibanNo}
            setIbanNo={setIbanNo}
            hesapDurumu={hesapDurumu}
            setHesapDurumu={setHesapDurumu}
            yetkiliIsmi={yetkiliIsmi}
            setYetkiliIsmi={setYetkiliIsmi}
            onKaydet={handleBankaKaydet}
            onSil={handleBankaSil}
            onYeni={handleYeniBanka}
            data={bankaData}
            selectedItem={selectedBanka}
            onSelectItem={handleBankaSelect}
            tcmbBankaKodlari={tcmbBankaKodlari}
            tcmbSubeKodlari={tcmbSubeKodlari}
            setTcmbSubeKodlari={setTcmbSubeKodlari}
            loadingBankaKodlari={loadingBankaKodlari}
            loadingSubeKodlari={loadingSubeKodlari}
            loadTcmbSubeKodlari={loadTcmbSubeKodlari}
          />
        )}
        {activePage === 'Ayarlar' && (
          <div className='ayarlar-sayfasi'>
            <div className='settings-icon'>⚙️</div>
            <h2>Ayarlar</h2>
            <p>Bu sayfa geliştirme aşamasındadır.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// KasaHareketIslemleri bileşenini App component'inin dışına taşı
const KasaHareketIslemleri = ({
  kasaData,
  selectedKasa,
  onSelectKasa,
  islemTurleri,
  selectedIslemTuru,
  setSelectedIslemTuru,
  selectedDynamicKod,
  setSelectedDynamicKod,
  selectedDynamicIsim,
  setSelectedDynamicIsim,
  dynamicData,
  loadingDynamic,
  evrakNo,
  setEvrakNo,
  aciklama,
  setAciklama,
  girenTutar,
  setGirenTutar,
  cikanTutar,
  setCikanTutar,
  belgeNo,
  handleKasaHareketKaydet,
  kasaHareketData,
  loadingKasaHareket,
  handleTemizle,
  belgeListesi,
  seciliBelgeDetay,
  loadingBelgeDetay,
  onBelgeNoChange,
}) => {
  // Seçilen işlem türünü bul
  const seciliIslem = islemTurleri.find((t) => t.kod === selectedIslemTuru);

  // Dinamik alan başlıklarını belirle
  const getDynamicFieldLabels = () => {
    if (!seciliIslem) return { kodLabel: 'Kod', isimLabel: 'İsim' };

    if (seciliIslem.kod.includes('Banka')) {
      return { kodLabel: 'Banka Kod', isimLabel: 'Banka İsim' };
    } else if (seciliIslem.kod.includes('Cari')) {
      return { kodLabel: 'Cari Kod', isimLabel: 'Cari İsim' };
    } else if (seciliIslem.kod.includes('Kasa')) {
      return { kodLabel: 'Kasa Kod', isimLabel: 'Kasa İsim' };
    }
    return { kodLabel: 'Kod', isimLabel: 'İsim' };
  };

  const { kodLabel, isimLabel } = getDynamicFieldLabels();

  // Tutar alanlarının durumunu belirle
  const isGirenTutarEnabled = seciliIslem && seciliIslem.yon === 'giren';
  const isCikanTutarEnabled = seciliIslem && seciliIslem.yon === 'cikan';

  // Dinamik kod seçildiğinde ismi otomatik doldur
  const handleDynamicKodSelect = (kod) => {
    const selectedItem = dynamicData.find((item) => item.kod === kod);
    if (selectedItem) {
      setSelectedDynamicKod(kod);
      setSelectedDynamicIsim(selectedItem.isim);
    }
  };

  return (
    <div className='kasa-hareket-container'>
      {/* ÜST FORM PANELİ */}
      <div className='kasa-hareket-form'>
        <h2>Kasa Hareket İşlemleri</h2>

        {/* ÜST SATIR: Belge No, Kasa Kodu, Kasa Tanımı */}
        <div className='form-row'>
          <div className='form-group compact'>
            <label>Belge No</label>
            <input
              list='belge-listesi'
              type='text'
              value={belgeNo}
              onChange={(e) => {
                onBelgeNoChange(e.target.value);
              }}
              placeholder='Belge no seçin veya yazın'
              className='compact-input'
            />
            <datalist id='belge-listesi'>
              {belgeListesi.map((belge) => (
                <option key={belge} value={belge} />
              ))}
            </datalist>
          </div>
          <div className='form-group compact'>
            <label>Kasa Kodu</label>
            <select
              value={selectedKasa?.KASA_KODU || ''}
              onChange={(e) => {
                const selected = kasaData.find(
                  (k) => k.KASA_KODU === e.target.value
                );
                if (selected) onSelectKasa(selected);
              }}
              className='compact-input'
            >
              <option value=''>Kasa Seçiniz</option>
              {kasaData.map((kasa) => (
                <option key={kasa.KASA_KODU} value={kasa.KASA_KODU}>
                  {kasa.KASA_KODU}
                </option>
              ))}
            </select>
          </div>
          <div className='form-group compact'>
            <label>Kasa Tanımı</label>
            <input
              type='text'
              value={selectedKasa?.KASA_TANIMI || ''}
              className='compact-input'
              readOnly
            />
          </div>
        </div>

        {/* BELGE DETAY PANELİ */}
        {seciliBelgeDetay && (
          <div className='belge-detay-panel'>
            <h4>Belge Detayları</h4>
            <div className='belge-detay-content'>
              <div className='form-row'>
                <div className='form-group compact'>
                  <label>İşlem Türü</label>
                  <div className='value'>
                    {islemTurleri.find(
                      (t) => t.id === seciliBelgeDetay.BELGE_TIPI
                    )?.kod || seciliBelgeDetay.BELGE_TIPI}
                  </div>
                </div>
                <div className='form-group compact'>
                  <label>Evrak No</label>
                  <div className='value'>
                    {seciliBelgeDetay.EVRAK_NO || '-'}
                  </div>
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group compact'>
                  <label>Giren Tutar</label>
                  <div className='value'>
                    {seciliBelgeDetay.GIREN_TUTAR || '0.00'}
                  </div>
                </div>
                <div className='form-group compact'>
                  <label>Çıkan Tutar</label>
                  <div className='value'>
                    {seciliBelgeDetay.CIKAN_TUTAR || '0.00'}
                  </div>
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group compact' style={{ flex: 2 }}>
                  <label>Açıklama</label>
                  <div className='value'>
                    {seciliBelgeDetay.KASA_ACIKLAMA || '-'}
                  </div>
                </div>
              </div>

              <div className='form-row'>
                <div className='form-group compact'>
                  <label>Kasa Kodu</label>
                  <div className='value'>
                    {seciliBelgeDetay.KASA_KODU || '-'}
                  </div>
                </div>
                <div className='form-group compact'>
                  <label>İşlem Kodu</label>
                  <div className='value'>
                    {seciliBelgeDetay.CMBK_KODU || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loadingBelgeDetay && (
          <div className='loading'>Belge detayları yükleniyor...</div>
        )}

        {/* İKİNCİ SATIR: İşlem Türü, Evrak No */}
        <div className='form-row'>
          <div className='form-group compact'>
            <label>İşlem Türü</label>
            <select
              value={selectedIslemTuru}
              onChange={(e) => setSelectedIslemTuru(e.target.value)}
              className='compact-input'
            >
              <option value=''>İşlem Türü Seçiniz</option>
              {islemTurleri.map((islem) => (
                <option key={islem.id} value={islem.kod}>
                  {islem.id} - {islem.kod}
                </option>
              ))}
            </select>
          </div>
          <div className='form-group compact'>
            <label>Evrak No</label>
            <input
              type='text'
              value={evrakNo}
              onChange={(e) => setEvrakNo(e.target.value)}
              placeholder='Evrak numarası'
              className='compact-input'
            />
          </div>
        </div>

        {/* ÜÇÜNCÜ SATIR: Giren Tutar, Çıkan Tutar */}
        <div className='form-row'>
          <div className='form-group compact'>
            <label>Giren Tutar</label>
            <input
              type='number'
              value={girenTutar}
              onChange={(e) => setGirenTutar(e.target.value)}
              placeholder='0.00'
              className='compact-input'
              disabled={!isGirenTutarEnabled}
            />
          </div>
          <div className='form-group compact'>
            <label>Çıkan Tutar</label>
            <input
              type='number'
              value={cikanTutar}
              onChange={(e) => setCikanTutar(e.target.value)}
              placeholder='0.00'
              className='compact-input'
              disabled={!isCikanTutarEnabled}
            />
          </div>
        </div>

        {/* DÖRDÜNCÜ SATIR: Açıklama */}
        <div className='form-row'>
          <div className='form-group compact' style={{ flex: 2 }}>
            <label>Açıklama</label>
            <input
              type='text'
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder='İşlem açıklaması'
              className='compact-input'
            />
          </div>
        </div>

        {/* BEŞİNCİ SATIR: Dinamik Kod ve İsim (tüm işlem türleri için gösterilecek) */}
        <div className='form-row'>
          <div className='form-group compact'>
            <label>{kodLabel}</label>
            <select
              value={selectedDynamicKod}
              onChange={(e) => handleDynamicKodSelect(e.target.value)}
              className='compact-input'
              disabled={loadingDynamic || !seciliIslem?.tablo}
            >
              <option value=''>Seçiniz</option>
              {dynamicData.map((item) => (
                <option key={item.kod} value={item.kod}>
                  {item.kod}
                </option>
              ))}
            </select>
            {loadingDynamic && (
              <div className='loading-small'>Yükleniyor...</div>
            )}
          </div>
          <div className='form-group compact'>
            <label>{isimLabel}</label>
            <input
              type='text'
              value={selectedDynamicIsim}
              className='compact-input'
              readOnly
            />
          </div>
        </div>

        {/* ACTION BUTONLARI */}
        <div className='kasa-action-buttons'>
          <button
            className='kasa-btn primary'
            onClick={handleKasaHareketKaydet}
          >
            💾 Kaydet
          </button>
          <button className='kasa-btn secondary' onClick={handleTemizle}>
            🗑️ Temizle
          </button>
        </div>
      </div>

      {/* ALT TABLO PANELİ */}
      <div className='kasa-hareket-tablo'>
        <h3>Kasa Hareket Kayıtları</h3>
        <div className='data-table-container'>
          <table className='data-table compact'>
            <thead>
              <tr>
                <th>Belge No</th>
                <th>İşlem</th>
                <th>Kod</th>
                <th>Evrak No</th>
                <th>Giren Tutar</th>
                <th>Çıkan Tutar</th>
                <th>Açıklama</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {loadingKasaHareket ? (
                <tr>
                  <td colSpan='8' className='loading'>
                    Yükleniyor...
                  </td>
                </tr>
              ) : (
                kasaHareketData.map((item) => (
                  <tr key={item.BELGE_NO}>
                    <td>{item.BELGE_NO}</td>
                    <td>
                      {islemTurleri.find((t) => t.id === item.BELGE_TIPI)
                        ?.kod || item.BELGE_TIPI}
                    </td>
                    <td>{item.CMBK_KODU}</td>
                    <td>{item.EVRAK_NO}</td>
                    <td>{item.GIREN_TUTAR}</td>
                    <td>{item.CIKAN_TUTAR}</td>
                    <td>{item.KASA_ACIKLAMA}</td>
                    <td>{new Date(item.TARIH).toLocaleDateString('tr-TR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Giriş Animasyon Bileşeni
const LoginAnimation = () => {
  return (
    <div className='login-animation-container'>
      <div className='login-animation'>
        <img src={atikerLogo} alt='Atiker Logo' className='animated-logo' />
        <div className='welcome-text'>Hoşgeldiniz!</div>
      </div>
    </div>
  );
};

const LoginScreen = ({
  username,
  setUsername,
  password,
  setPassword,
  handleLogin,
  showAlert,
  alertMessage,
  alertType,
  setShowAlert,
}) => {
  return (
    <div className='login-container'>
      <div className='login-background'>
        <img src={atikerLogo} alt='Atiker Logo' className='login-bg-logo' />
      </div>

      {/* Login Alert Mesajı */}
      {showAlert && (
        <div
          className={`custom-alert ${alertType}`}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}
        >
          <div className='alert-content'>
            <span className='alert-message'>{alertMessage}</span>
            <button className='alert-close' onClick={() => setShowAlert(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      <div className='login-form-container'>
        <form className='login-form' onSubmit={handleLogin}>
          <div className='login-header'>
            <img src={atikerLogo} alt='Atiker Logo' className='login-logo' />
            <h1>ATİKER WEB ERP</h1>
            <p>Sisteme giriş yapınız</p>
          </div>

          <div className='form-group'>
            <label>Kullanıcı Adı</label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Kullanıcı adınızı giriniz'
              required
            />
          </div>

          <div className='form-group'>
            <label>Şifre</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Şifrenizi giriniz'
              required
            />
          </div>

          <button type='submit' className='login-btn'>
            🔐 Giriş Yap
          </button>

          <div className='login-info'>
            <p>Demo Giriş Bilgileri:</p>
            <p>
              Kullanıcı Adı: <strong>furkan</strong>
            </p>
            <p>
              Şifre: <strong>123</strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// AnaSayfa bileşeni
const AnaSayfa = () => {
  return (
    <div className='ana-sayfa'>
      <img src={atikerLogo} alt='Atiker Logo' className='ana-sayfa-logo' />
      <h1>ATİKER WEB ERP SİSTEMİNE HOŞGELDİNİZ</h1>
      <p>Soldaki menüden istediğiniz modüle erişebilirsiniz.</p>

      <a
        href='https://www.atikeryazilim.com.tr/'
        target='_blank'
        rel='noopener noreferrer'
        className='website-link-btn'
      >
        🌐 Atiker Yazılım Web Sitesine Gitmek İçin Tıkla
      </a>
    </div>
  );
};

// Sidebar bileşeni
const Sidebar = ({
  activePage,
  setActivePage,
  activeKasaSubPage,
  setActiveKasaSubPage,
  activeBankaSubPage,
  setActiveBankaSubPage,
  handleLogout,
}) => {
  return (
    <div className='sidebar'>
      <div className='logo' onClick={() => setActivePage('Ana Sayfa')}>
        <div className='logo-content'>
          <img src={atikerLogo} alt='Atiker Logo' className='logo-img' />
          <h2>ATİKER WEB ERP</h2>
        </div>
      </div>
      <ul className='menu'>
        <li
          className={activePage === 'Ana Sayfa' ? 'active' : ''}
          onClick={() => setActivePage('Ana Sayfa')}
        >
          <i className='icon'>🏠</i> Ana Sayfa
        </li>
        <li
          className={activePage === 'cari' ? 'active' : ''}
          onClick={() => setActivePage('cari')}
        >
          <i className='icon'>👥</i> Cari Kartları
        </li>
        <li
          className={activePage === 'stok' ? 'active' : ''}
          onClick={() => setActivePage('stok')}
        >
          <i className='icon'>📦</i> Stok Kartları
        </li>
        <li
          className={activePage === 'kasa' ? 'active' : ''}
          onClick={() => setActivePage('kasa')}
        >
          <i className='icon'>💰</i> Kasa İşlemleri
        </li>

        {/* Kasa Alt Menüleri */}
        {activePage === 'kasa' && (
          <ul className='sub-menu'>
            <li
              className={activeKasaSubPage === 'sabit' ? 'active' : ''}
              onClick={() => setActiveKasaSubPage('sabit')}
            >
              <i className='icon'>📝</i> Kasa Sabit İşlemleri
            </li>
            <li
              className={activeKasaSubPage === 'detay' ? 'active' : ''}
              onClick={() => setActiveKasaSubPage('detay')}
            >
              <i className='icon'>📊</i> Kasa Detayları
            </li>
            <li
              className={activeKasaSubPage === 'hareket' ? 'active' : ''}
              onClick={() => setActiveKasaSubPage('hareket')}
            >
              <i className='icon'>💸</i> Kasa Hareket İşlemleri
            </li>
          </ul>
        )}

        <li
          className={activePage === 'banka' ? 'active' : ''}
          onClick={() => {
            setActivePage('banka');
            setActiveBankaSubPage('hesap-kayit');
          }}
        >
          <i className='icon'>🏦</i> Banka İşlemleri
        </li>

        {/* Banka Alt Menüleri */}
        {activePage === 'banka' && (
          <ul className='sub-menu'>
            <li
              className={activeBankaSubPage === 'hesap-kayit' ? 'active' : ''}
              onClick={() => setActiveBankaSubPage('hesap-kayit')}
            >
              <i className='icon'>📝</i> Banka Hesapları Kayıt
            </li>
          </ul>
        )}

        <li
          className={activePage === 'Ayarlar' ? 'active' : ''}
          onClick={() => setActivePage('Ayarlar')}
        >
          <i className='icon'>⚙️</i> Ayarlar
        </li>
      </ul>

      <div className='logout-section'>
        <button onClick={handleLogout} className='logout-btn'>
          🚪 Çıkış Yap
        </button>
      </div>
    </div>
  );
};

// CariKartlari bileşeni
const CariKartlari = ({ data, selectedItem, onSelectItem, loading, error }) => {
  return (
    <div className='page-container'>
      <div className='detail-panel'>
        <h2>Cari Bilgileri</h2>
        {selectedItem ? (
          <div className='detail-content'>
            <div className='form-row'>
              <div className='form-group'>
                <label>Cari Kodu</label>
                <div className='value'>{selectedItem.code}</div>
              </div>
              <div className='form-group'>
                <label>Cari Tipi</label>
                <div className='value'>{selectedItem.type}</div>
              </div>
            </div>

            <div className='form-group'>
              <label>Cari Adı</label>
              <div className='value'>{selectedItem.name}</div>
            </div>

            <div className='form-group'>
              <label>Adres</label>
              <div className='value'>{selectedItem.address}</div>
            </div>

            <div className='form-row'>
              <div className='form-group'>
                <label>Ülke</label>
                <div className='value'>{selectedItem.country}</div>
              </div>
              <div className='form-group'>
                <label>İl</label>
                <div className='value'>{selectedItem.city}</div>
              </div>
            </div>

            <div className='form-row'>
              <div className='form-group'>
                <label>İlçe</label>
                <div className='value'>{selectedItem.district}</div>
              </div>
              <div className='form-group'>
                <label>Semt</label>
                <div className='value'>{selectedItem.neighborhood}</div>
              </div>
            </div>

            <div className='form-row'>
              <div className='form-group'>
                <label>Posta Kodu</label>
                <div className='value'>{selectedItem.postalCode}</div>
              </div>
              <div className='form-group'>
                <label>Vergi No</label>
                <div className='value'>{selectedItem.taxNumber}</div>
              </div>
            </div>

            <div className='form-row'>
              <div className='form-group'>
                <label>TC Kimlik No</label>
                <div className='value'>{selectedItem.identityNumber}</div>
              </div>
              <div className='form-group'>
                <label>Telefon No</label>
                <div className='value'>{selectedItem.phone}</div>
              </div>
            </div>

            <div className='action-buttons'>
              <button className='btn primary'>YENİ KAYIT</button>
              <button className='btn secondary'>DÜZENLE</button>
              <button className='btn danger'>SİL</button>
            </div>
          </div>
        ) : (
          <div className='no-selection'>
            <p>Listeden bir cari seçin veya yeni kayıt okuşturun.</p>
          </div>
        )}
      </div>

      <div className='list-panel'>
        <div className='search-box'>
          <input type='text' placeholder='Cari ara...' />
        </div>
        {loading && <div className='loading'>Yükleniyor...</div>}
        {error && <div className='error'>{error}</div>}
        <div className='data-table-container'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Cari Kodu</th>
                <th>Cari Adı</th>
                <th>Cari Tipi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.CARI_KODU}
                  className={
                    selectedItem?.code === item.CARI_KODU ? 'selected' : ''
                  }
                  onClick={() => onSelectItem(item)}
                >
                  <td>
                    <strong>{item.CARI_KODU}</strong>
                  </td>
                  <td>{item.CARI_ADI}</td>
                  <td>{item.CARI_TIPI}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// StokKartlari bileşeni
const StokKartlari = ({ data, selectedItem, onSelectItem, loading, error }) => {
  return (
    <div className='page-container'>
      <div className='detail-panel'>
        <h2>Stok Bilgileri</h2>
        {selectedItem ? (
          <div className='detail-content'>
            <div className='form-row'>
              <div className='form-group'>
                <label>Stok Kodu</label>
                <div className='value'>{selectedItem.code}</div>
              </div>
              <div className='form-group'>
                <label>Stok Tipi</label>
                <div className='value'>{selectedItem.type}</div>
              </div>
            </div>

            <div className='form-group'>
              <label>Stok Adı</label>
              <div className='value'>{selectedItem.name}</div>
            </div>

            <div className='form-group'>
              <label>Kısa Stok Adı</label>
              <div className='value'>{selectedItem.shortName}</div>
            </div>

            <div className='action-buttons'>
              <button className='btn primary'>YENİ KAYIT</button>
              <button className='btn secondary'>DÜZENLE</button>
              <button className='btn danger'>SİL</button>
            </div>
          </div>
        ) : (
          <div className='no-selection'>
            <p>Listeden bir stok seçin veya yeni kayıt oluşturun.</p>
          </div>
        )}
      </div>

      <div className='list-panel'>
        <div className='search-box'>
          <input type='text' placeholder='Stok ara...' />
        </div>
        {loading && <div className='loading'>Yükleniyor...</div>}
        {error && <div className='error'>{error}</div>}
        <div className='data-table-container'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Stok Kodu</th>
                <th>Stok Adı</th>
                <th>Stok Tipi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.STOK_KODU}
                  className={
                    selectedItem?.code === item.STOK_KODU ? 'selected' : ''
                  }
                  onClick={() => onSelectItem(item)}
                >
                  <td>
                    <strong>{item.STOK_KODU}</strong>
                  </td>
                  <td>{item.STOK_ADI}</td>
                  <td>{item.STOK_TIPI}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// KasaSabitIslemleri bileşeni
const KasaSabitIslemleri = ({
  kasaKodu,
  setKasaKodu,
  kasaTanimi,
  setKasaTanimi,
  onKaydet,
  onSil,
  onYeni,
  data,
  selectedItem,
  onSelectItem,
}) => {
  return (
    <div className='kasa-sabit-container'>
      <div className='kasa-form-container'>
        <h2>Kasa Sabit İşlemleri</h2>
        <div className='kasa-form'>
          <div className='form-row'>
            <div className='form-group compact'>
              <label>Kasa Kodu</label>
              <input
                type='text'
                value={kasaKodu}
                onChange={(e) => setKasaKodu(e.target.value)}
                placeholder='Kasa kodu'
                className='compact-input'
              />
            </div>
            <div className='form-group compact'>
              <label>Kasa Tanımı</label>
              <input
                type='text'
                value={kasaTanimi}
                onChange={(e) => setKasaTanimi(e.target.value)}
                placeholder='Kasa tanımı'
                className='compact-input'
              />
            </div>
          </div>

          <div className='kasa-action-buttons'>
            <button className='kasa-btn primary' onClick={onKaydet}>
              💾 {selectedItem ? 'Güncelle' : 'Kaydet'}
            </button>
            <button
              className='kasa-btn danger'
              onClick={onSil}
              disabled={!selectedItem}
            >
              🗑️ Sil
            </button>
            <button className='kasa-btn secondary' onClick={onYeni}>
              ➕ Yeni
            </button>
          </div>
        </div>
      </div>

      {/* Kasa Listesi Panelini Ekliyoruz */}
      <div className='kasa-list-panel'>
        <h3>Kasa Listesi</h3>
        <div className='search-box'>
          <input type='text' placeholder='Kasa ara...' />
        </div>
        <div className='data-table-container'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Kasa Kodu</th>
                <th>Kasa Tanımı</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.KASA_KODU}
                  className={
                    selectedItem?.KASA_KODU === item.KASA_KODU ? 'selected' : ''
                  }
                  onClick={() => onSelectItem(item)}
                >
                  <td>
                    <strong>{item.KASA_KODU}</strong>
                  </td>
                  <td>{item.KASA_TANIMI}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// KasaDetaylari bileşeni
const KasaDetaylari = ({ data, selectedItem, onSelectItem, onSil }) => {
  return (
    <div className='kasa-detay-container'>
      <div className='list-panel-full'>
        <h2>Kasa Detayları</h2>
        <div className='search-box'>
          <input type='text' placeholder='Kasa ara...' />
        </div>
        <div className='data-table-container'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>Kasa Kodu</th>
                <th>Kasa Tanımı</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.KASA_KODU}
                  className={
                    selectedItem?.KASA_KODU === item.KASA_KODU ? 'selected' : ''
                  }
                  onClick={() => onSelectItem(item)}
                >
                  <td>
                    <strong>{item.KASA_KODU}</strong>
                  </td>
                  <td>{item.KASA_TANIMI}</td>
                  <td>
                    <button
                      className='kasa-btn danger small'
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                        onSil();
                      }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// BankaHesapKayit bileşeni (düzeltilmiş)
const BankaHesapKayit = ({
  hesapKodu,
  setHesapKodu,
  hesapAdi,
  setHesapAdi,
  hesapTipi,
  setHesapTipi,
  tcmbBankaKodu,
  setTcmbBankaKodu,
  tcmbSubeKodu,
  setTcmbSubeKodu,
  hesapNo,
  setHesapNo,
  ibanNo,
  setIbanNo,
  hesapDurumu,
  setHesapDurumu,
  yetkiliIsmi,
  setYetkiliIsmi,
  onKaydet,
  onSil,
  onYeni,
  data,
  selectedItem,
  onSelectItem,
  tcmbBankaKodlari,
  tcmbSubeKodlari,
  setTcmbSubeKodlari,
  loadingBankaKodlari,
  loadingSubeKodlari,
  loadTcmbSubeKodlari,
}) => {
  return (
    <div className='banka-hesap-kayit-container'>
      <div className='banka-form-container'>
        <h2>Banka Hesap Kayıt</h2>
        <div className='banka-form'>
          <div className='form-row'>
            <div className='form-group compact'>
              <label>Hesap Kodu *</label>
              <input
                type='text'
                value={hesapKodu}
                onChange={(e) => setHesapKodu(e.target.value)}
                placeholder='Hesap Kodu'
                className='compact-input'
              />
            </div>
            <div className='form-group compact'>
              <label>Hesap Adı *</label>
              <input
                type='text'
                value={hesapAdi}
                onChange={(e) => setHesapAdi(e.target.value)}
                placeholder='Hesap Adı'
                className='compact-input'
              />
            </div>
          </div>

          <div className='form-group compact'>
            <label>Hesap Tipi</label>
            <select
              value={hesapTipi}
              onChange={(e) => setHesapTipi(e.target.value)}
              className='compact-input'
            >
              <option value=''>Seçiniz</option>
              <option value='1'>Vadesiz Mevduat Hesabı</option>
              <option value='2'>Vadeli Mevduat Hesabı</option>
              <option value='3'>Teminat Çekleri</option>
              <option value='4'>Teminat Senetleri</option>
              <option value='5'>Tahsil Çekleri</option>
              <option value='6'>Tahsil Senetleri</option>
              <option value='7'>Borç Çekleri</option>
              <option value='10'>Personel Maaş Hesapları</option>
            </select>
          </div>

          <div className='form-row'>
            <div className='form-group compact'>
              <label>TCMB Banka Kodu</label>
              <select
                value={tcmbBankaKodu}
                onChange={(e) => {
                  const selectedBankaKodu = e.target.value;
                  setTcmbBankaKodu(selectedBankaKodu);
                  setTcmbSubeKodu(''); // Banka değişince şubeyi temizle

                  if (selectedBankaKodu) {
                    loadTcmbSubeKodlari(selectedBankaKodu);
                  } else {
                    setTcmbSubeKodlari([]);
                  }
                }}
                onFocus={() => {
                  // Combobox'a tıklandığında bankaları yükle (eğer yüklenmediyse)
                  if (tcmbBankaKodlari.length === 0 && !loadingBankaKodlari) {
                    // loadTcmbBankaKodlari fonksiyonunu burada çağıramıyoruz
                    // Bu yüzden bir callback ile App.js'teki fonksiyonu tetikleyelim
                    console.log(
                      'Banka comboboxına tıklandı, bankalar yükleniyor...'
                    );
                  }
                }}
                className='compact-input'
                disabled={loadingBankaKodlari}
              >
                <option value=''>Seçiniz</option>
                {tcmbBankaKodlari.map((banka) => (
                  <option
                    key={banka.TCMB_BANKA_KODU}
                    value={banka.TCMB_BANKA_KODU}
                  >
                    {banka.TCMB_BANKA_KODU} - {banka.TCMB_BANKA_KISA_ADI}
                  </option>
                ))}
              </select>
              {loadingBankaKodlari && (
                <div className='loading-small'>Banka kodları yükleniyor...</div>
              )}
              {!loadingBankaKodlari && tcmbBankaKodlari.length === 0 && (
                <div className='loading-small'>Banka kodları bulunamadı</div>
              )}
            </div>

            <div className='form-group compact'>
              <label>TCMB Şube Kodu</label>
              <select
                value={tcmbSubeKodu}
                onChange={(e) => setTcmbSubeKodu(e.target.value)}
                className='compact-input'
                disabled={loadingSubeKodlari || !tcmbBankaKodu}
              >
                <option value=''>Seçiniz</option>
                {tcmbSubeKodlari.map((sube) => (
                  <option
                    key={sube.TCMB_BANKA_SUBE_KODU}
                    value={sube.TCMB_BANKA_SUBE_KODU}
                  >
                    {sube.TCMB_BANKA_SUBE_KODU} - {sube.TCMB_BANKA_SUBE_ISIM}
                  </option>
                ))}
              </select>
              {loadingSubeKodlari && (
                <div className='loading-small'>Şube kodları yükleniyor...</div>
              )}
              {!tcmbBankaKodu && !loadingSubeKodlari && (
                <div className='loading-small'>Önce banka seçiniz</div>
              )}
              {tcmbBankaKodu &&
                tcmbSubeKodlari.length === 0 &&
                !loadingSubeKodlari && (
                  <div className='loading-small'>
                    Bu bankaya ait şube bulunamadı
                  </div>
                )}
            </div>
          </div>

          <div className='form-row'>
            <div className='form-group compact'>
              <label>Hesap No</label>
              <input
                type='text'
                value={hesapNo}
                onChange={(e) => setHesapNo(e.target.value)}
                placeholder='Hesap No'
                className='compact-input'
              />
            </div>
            <div className='form-group compact'>
              <label>IBAN No</label>
              <input
                type='text'
                value={ibanNo}
                onChange={(e) => setIbanNo(e.target.value)}
                placeholder='IBAN No'
                className='compact-input'
              />
            </div>
          </div>

          <div className='form-row'>
            <div className='form-group compact'>
              <label>Hesap Durumu</label>
              <select
                value={hesapDurumu}
                onChange={(e) => setHesapDurumu(e.target.value)}
                className='compact-input'
              >
                <option value='Açık'>Açık</option>
                <option value='Kapalı'>Kapalı</option>
              </select>
            </div>
            <div className='form-group compact'>
              <label>Yetkili İsmi</label>
              <input
                type='text'
                value={yetkiliIsmi}
                onChange={(e) => setYetkiliIsmi(e.target.value)}
                placeholder='Yetkili İsmi'
                className='compact-input'
              />
            </div>
          </div>

          <div className='banka-action-buttons'>
            <button className='banka-btn primary' onClick={onKaydet}>
              💾 {selectedItem ? 'Güncelle' : 'Kaydet'}
            </button>
            <button
              className='banka-btn danger'
              onClick={onSil}
              disabled={!selectedItem}
            >
              🗑️ Sil
            </button>
            <button className='banka-btn secondary' onClick={onYeni}>
              ➕ Yeni
            </button>
          </div>
        </div>
      </div>

      <div className='banka-list-panel compact'>
        <h3>Banka Listesi (ATIKER25 - TBLBANKASB)</h3>
        <div className='search-box'>
          <input type='text' placeholder='Banka ara...' />
        </div>
        <div className='data-table-container compact'>
          <table className='data-table compact'>
            <thead>
              <tr>
                <th>Hesap Kodu</th>
                <th>Hesap Adı</th>
                <th>Tip</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.BANKA_HESAP_KODU}
                  className={
                    selectedItem?.BANKA_HESAP_KODU === item.BANKA_HESAP_KODU
                      ? 'selected'
                      : ''
                  }
                  onClick={() => onSelectItem(item)}
                >
                  <td>
                    <strong>{item.BANKA_HESAP_KODU}</strong>
                  </td>
                  <td>{item.BANKA_HESAP_ISIM}</td>
                  <td>{item.BANKA_HESAP_TIPI}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
