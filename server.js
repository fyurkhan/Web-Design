const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Windows Authentication için MSSQL bağlantı konfigürasyonu
const atikerConfig = {
  server: 'FURKAN\\ATIKER',
  port: 1433,
  database: 'ATIKER25',
  user: 'sa',
  password: '1',
  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};

// BITEK veritabanı için konfigürasyon
const bitekConfig = {
  server: 'FURKAN\\ATIKER',
  port: 1433,
  database: 'BITEK',
  user: 'sa',
  password: '1',
  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};

// TCMB Banka Kodlarını Getir (BITEK veritabanından)
app.get('/api/tcmb-bankalar', async (req, res) => {
  let pool;
  try {
    console.log('BITEK veritabanına bağlanılıyor (TCMB Banka Kodları)...');

    pool = await sql.connect(bitekConfig);
    console.log('BITEK veritabanına bağlantı başarılı');

    const query = `
      SELECT
        TCMB_BANKA_KODU,
        TCMB_BANKA_KISA_ADI
      FROM TBLBANKATCMBSB
      ORDER BY TCMB_BANKA_KODU
    `;

    const result = await pool.request().query(query);
    console.log(
      'TCMB banka sorgusu başarılı,',
      result.recordset.length,
      'kayıt bulundu'
    );

    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'TCMB banka verileri çekilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// TCMB Şube Kodlarını Getir (BITEK veritabanından)
app.get('/api/tcmb-subeler', async (req, res) => {
  let pool;
  try {
    const { bankaKodu } = req.query;
    console.log('BITEK veritabanına bağlanılıyor (TCMB Şube Kodları)...');

    pool = await sql.connect(bitekConfig);
    console.log('BITEK veritabanına bağlantı başarılı');

    let query = `
      SELECT
        TCMB_BANKA_SUBE_KODU,
        TCMB_BANKA_SUBE_ISIM,
        TCMB_BANKA_KODU
      FROM TBLBANKATCMBSUBE
    `; // Eğer banka kodu query parametresi olarak belirtilmişse filtrele

    if (bankaKodu && bankaKodu !== '') {
      query += ` WHERE TCMB_BANKA_KODU = @bankaKodu`;
    }

    query += ' ORDER BY TCMB_BANKA_SUBE_KODU';

    const request = pool.request();

    if (bankaKodu && bankaKodu !== '') {
      request.input('bankaKodu', sql.VarChar, bankaKodu);
    }

    const result = await request.query(query);
    console.log(
      'TCMB şube sorgusu başarılı,',
      result.recordset.length,
      'kayıt bulundu'
    );

    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'TCMB şube verileri çekilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Tüm banka kayıtlarını getir (ATIKER25 veritabanından)
// Tüm banka kayıtlarını getir (ATIKER25 veritabanından)
// Tüm banka kayıtlarını getir (ATIKER25 veritabanından)
// Tüm banka kayıtlarını getir (ATIKER25 veritabanından)
app.get('/api/banka', async (req, res) => {
  let pool;
  try {
    console.log('ATIKER25 veritabanına bağlanılıyor (Banka)...');

    pool = await sql.connect(atikerConfig);
    console.log('ATIKER25 veritabanına bağlantı başarılı'); // Önce basit bir sorgu ile test edelim

    const testQuery = `SELECT COUNT(*) as count FROM TBLBANKASB`;
    const testResult = await pool.request().query(testQuery);
    console.log('Tablo satır sayısı:', testResult.recordset[0].count);

    const query = `
      SELECT
        BANKA_HESAP_KODU,
        BANKA_HESAP_ISIM,
        BANKA_HESAP_TIPI,
        IBAN_NO,
        BANKA_HESAP_NO,
        BANKA_SUBE_ADI,
        TCMB_BANKA_KODU,
        TCMB_BANKA_SUBEKODU,
        BANKA_YETKILI,
        CASE WHEN HESAP_DURUM = 1 THEN 'Açık' ELSE 'Kapalı' END as HESAP_DURUM  -- HESAP_DURUM olarak değiştir
      FROM TBLBANKASB
      ORDER BY BANKA_HESAP_NO
    `;

    const result = await pool.request().query(query);
    console.log(
      'Banka sorgusu başarılı,',
      result.recordset.length,
      'kayıt bulundu'
    );

    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    console.error('HATA:', error.message);
    console.error('Hata detayları:', error); // Daha detaylı hata mesajı döndür

    res.status(500).json({
      success: false,
      message: 'Banka verileri çekilemedi: ' + error.message,
      errorDetails: error.toString(),
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Yeni banka kaydı ekle (ATIKER25 veritabanına)
// Yeni banka kaydı ekle (ATIKER25 veritabanına)
app.post('/api/banka', async (req, res) => {
  let pool;
  try {
    const {
      BANKA_HESAP_KODU,
      BANKA_HESAP_ISIM,
      BANKA_HESAP_TIPI,
      IBAN_NO,
      BANKA_HESAP_NO,
      BANKA_SUBE_ADI,
      TCMB_BANKA_KODU,
      TCMB_BANKA_SUBEKODU,
      BANKA_YETKILI,
      HESAP_DURUM, // HESAP_DURUM olarak değiştir
    } = req.body;

    console.log('Yeni banka kaydı ekleniyor:', {
      BANKA_HESAP_KODU,
      BANKA_HESAP_ISIM,
      BANKA_HESAP_NO,
      BANKA_SUBE_ADI,
    }); // Gerekli alanları kontrol et

    if (!BANKA_HESAP_KODU || !BANKA_HESAP_ISIM) {
      return res.status(400).json({
        success: false,
        message: 'Banka hesap kodu ve hesap ismi zorunludur',
      });
    }

    pool = await sql.connect(atikerConfig); // Önce aynı banka hesap kodunun olup olmadığını kontrol et

    const checkQuery = `
      SELECT COUNT(*) as count FROM TBLBANKASB WHERE BANKA_HESAP_KODU = @BANKA_HESAP_KODU
    `;

    const checkResult = await pool
      .request()
      .input('BANKA_HESAP_KODU', sql.VarChar, BANKA_HESAP_KODU)
      .query(checkQuery);

    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu banka hesap kodu zaten mevcut',
      });
    } // Hesap durumunu integer'a çevir

    const hesapDurumuInt = HESAP_DURUM === 'Açık' ? 1 : 0; // Yeni kaydı ekle

    const insertQuery = `
      INSERT INTO TBLBANKASB (
        BANKA_HESAP_KODU,
        BANKA_HESAP_ISIM,
        BANKA_HESAP_TIPI,
        IBAN_NO,
        BANKA_HESAP_NO,
        BANKA_SUBE_ADI,
        TCMB_BANKA_KODU,
        TCMB_BANKA_SUBEKODU,
        BANKA_YETKILI,
        HESAP_DURUM  -- HESAP_DURUM olarak değiştir
      ) VALUES (
        @BANKA_HESAP_KODU,
        @BANKA_HESAP_ISIM,
        @BANKA_HESAP_TIPI,
        @IBAN_NO,
        @BANKA_HESAP_NO,
        @BANKA_SUBE_ADI,
        @TCMB_BANKA_KODU,
        @TCMB_BANKA_SUBEKODU,
        @BANKA_YETKILI,
        @HESAP_DURUM  -- HESAP_DURUM olarak değiştir
      )
    `;

    await pool
      .request()
      .input('BANKA_HESAP_KODU', sql.VarChar, BANKA_HESAP_KODU)
      .input('BANKA_HESAP_ISIM', sql.VarChar, BANKA_HESAP_ISIM)
      .input('BANKA_HESAP_TIPI', sql.Int, BANKA_HESAP_TIPI)
      .input('IBAN_NO', sql.VarChar, IBAN_NO)
      .input('BANKA_HESAP_NO', sql.Int, BANKA_HESAP_NO)
      .input('BANKA_SUBE_ADI', sql.VarChar, BANKA_SUBE_ADI)
      .input('TCMB_BANKA_KODU', sql.VarChar, TCMB_BANKA_KODU)
      .input('TCMB_BANKA_SUBEKODU', sql.VarChar, TCMB_BANKA_SUBEKODU)
      .input('BANKA_YETKILI', sql.VarChar, BANKA_YETKILI)
      .input('HESAP_DURUM', sql.Int, hesapDurumuInt) // HESAP_DURUM olarak değiştir
      .query(insertQuery);

    console.log('Banka kaydı başarıyla eklendi');

    res.json({
      success: true,
      message: 'Banka kaydı başarıyla eklendi',
      data: {
        BANKA_HESAP_KODU,
        BANKA_HESAP_ISIM,
        BANKA_HESAP_NO,
        BANKA_SUBE_ADI,
      },
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Banka kaydı eklenemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Banka kaydı güncelle (ATIKER25 veritabanında)
app.put('/api/banka/:hesapKodu', async (req, res) => {
  let pool;
  try {
    const { hesapKodu } = req.params;
    const {
      BANKA_HESAP_ISIM,
      BANKA_HESAP_TIPI,
      IBAN_NO,
      BANKA_HESAP_NO,
      BANKA_SUBE_ADI,
      TCMB_BANKA_KODU,
      TCMB_BANKA_SUBEKODU,
      BANKA_YETKILI,
      HESAP_DURUM, // HESAP_DURUM olarak değiştir
    } = req.body;

    console.log('Banka kaydı güncelleniyor:', hesapKodu);

    pool = await sql.connect(atikerConfig); // Kaydın var olup olmadığını kontrol et

    const checkQuery = `
      SELECT COUNT(*) as count FROM TBLBANKASB WHERE BANKA_HESAP_KODU = @BANKA_HESAP_KODU
    `;

    const checkResult = await pool
      .request()
      .input('BANKA_HESAP_KODU', sql.VarChar, hesapKodu)
      .query(checkQuery);

    if (checkResult.recordset[0].count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Banka kaydı bulunamadı',
      });
    } // Hesap durumunu integer'a çevir

    const hesapDurumuInt = HESAP_DURUM === 'Açık' ? 1 : 0; // Kaydı güncelle

    const updateQuery = `
      UPDATE TBLBANKASB SET
        BANKA_HESAP_ISIM = @BANKA_HESAP_ISIM,
        BANKA_HESAP_TIPI = @BANKA_HESAP_TIPI,
        IBAN_NO = @IBAN_NO,
        BANKA_HESAP_NO = @BANKA_HESAP_NO,
        BANKA_SUBE_ADI = @BANKA_SUBE_ADI,
        TCMB_BANKA_KODU = @TCMB_BANKA_KODU,
        TCMB_BANKA_SUBEKODU = @TCMB_BANKA_SUBEKODU,
        BANKA_YETKILI = @BANKA_YETKILI,
        HESAP_DURUM = @HESAP_DURUM
      WHERE BANKA_HESAP_KODU = @BANKA_HESAP_KODU
    `;

    await pool
      .request()
      .input('BANKA_HESAP_KODU', sql.VarChar, hesapKodu)
      .input('BANKA_HESAP_ISIM', sql.VarChar, BANKA_HESAP_ISIM)
      .input('BANKA_HESAP_TIPI', sql.Int, BANKA_HESAP_TIPI)
      .input('IBAN_NO', sql.VarChar, IBAN_NO)
      .input('BANKA_HESAP_NO', sql.Int, BANKA_HESAP_NO)
      .input('BANKA_SUBE_ADI', sql.VarChar, BANKA_SUBE_ADI)
      .input('TCMB_BANKA_KODU', sql.VarChar, TCMB_BANKA_KODU)
      .input('TCMB_BANKA_SUBEKODU', sql.VarChar, TCMB_BANKA_SUBEKODU)
      .input('BANKA_YETKILI', sql.VarChar, BANKA_YETKILI)
      .input('HESAP_DURUM', sql.Int, hesapDurumuInt) // HESAP_DURUM olarak değiştir
      .query(updateQuery);

    console.log('Banka kaydı başarıyla güncellendi');

    res.json({
      success: true,
      message: 'Banka kaydı başarıyla güncellendi',
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Banka kaydı güncellenemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Banka kaydı sil (ATIKER25 veritabanından)
app.delete('/api/banka/:hesapKodu', async (req, res) => {
  let pool;
  try {
    const { hesapKodu } = req.params;

    console.log('Banka kaydı siliniyor:', hesapKodu);

    pool = await sql.connect(atikerConfig); // Kaydın var olup olmadığını kontrol et

    const checkQuery = `
      SELECT COUNT(*) as count FROM TBLBANKASB WHERE BANKA_HESAP_KODU = @BANKA_HESAP_KODU
    `;

    const checkResult = await pool
      .request()
      .input('BANKA_HESAP_KODU', sql.VarChar, hesapKodu)
      .query(checkQuery);

    if (checkResult.recordset[0].count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Banka kaydı bulunamadı',
      });
    } // Kaydı sil

    const deleteQuery = `
      DELETE FROM TBLBANKASB WHERE BANKA_HESAP_KODU = @BANKA_HESAP_KODU
    `;

    await pool
      .request()
      .input('BANKA_HESAP_KODU', sql.VarChar, hesapKodu)
      .query(deleteQuery);

    console.log('Banka kaydı başarıyla silindi');

    res.json({
      success: true,
      message: 'Banka kaydı başarıyla silindi',
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Banka kaydı silinemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

app.get('/api/son-belge-no', async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(atikerConfig);

    const query = `
      SELECT TOP 1 BELGE_NO 
      FROM TBLKASAHR 
      WHERE BELGE_NO LIKE '25AKS%' 
      ORDER BY BELGE_NO DESC
    `;

    const result = await pool.request().query(query);

    if (result.recordset.length > 0) {
      res.json({
        success: true,
        data: result.recordset[0].BELGE_NO,
      });
    } else {
      res.json({
        success: true,
        data: null,
      });
    }
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Son belge no çekilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Belge listesini getir
app.get('/api/belge-listesi', async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(atikerConfig);

    const query = `
      SELECT DISTINCT BELGE_NO 
      FROM TBLKASAHR 
      WHERE BELGE_NO LIKE '25AKS%' 
      ORDER BY BELGE_NO DESC
    `;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: result.recordset.map((item) => item.BELGE_NO),
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Belge listesi çekilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Belge detaylarını getir
app.get('/api/belge-detay/:belgeNo', async (req, res) => {
  let pool;
  try {
    const { belgeNo } = req.params;

    pool = await sql.connect(atikerConfig);

    const query = `
      SELECT TOP 1 * 
      FROM TBLKASAHR 
      WHERE BELGE_NO = @belgeNo
    `;

    const result = await pool
      .request()
      .input('belgeNo', sql.VarChar, belgeNo)
      .query(query);

    if (result.recordset.length > 0) {
      res.json({
        success: true,
        data: result.recordset[0],
      });
    } else {
      res.json({
        success: false,
        message: 'Belge bulunamadı',
      });
    }
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Belge detayları çekilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Kasa hareket kaydı ekle
app.post('/api/kasa-hareket', async (req, res) => {
  let pool;
  try {
    const {
      BELGE_NO,
      BELGE_TIPI,
      CMBK_KODU,
      EVRAK_NO,
      GIREN_TUTAR,
      CIKAN_TUTAR,
      KASA_ACIKLAMA,
      MUHFISNUM,
      KASA_KODU,
    } = req.body;

    pool = await sql.connect(atikerConfig);

    const insertQuery = `
      INSERT INTO TBLKASAHR (
        BELGE_NO, BELGE_TIPI, CMBK_KODU, EVRAK_NO, 
        GIREN_TUTAR, CIKAN_TUTAR, KASA_ACIKLAMA, 
        MUHFISNUM, KASA_KODU, TARIH
      ) VALUES (
        @BELGE_NO, @BELGE_TIPI, @CMBK_KODU, @EVRAK_NO,
        @GIREN_TUTAR, @CIKAN_TUTAR, @KASA_ACIKLAMA,
        @MUHFISNUM, @KASA_KODU, GETDATE()
      )
    `;

    await pool
      .request()
      .input('BELGE_NO', sql.VarChar, BELGE_NO)
      .input('BELGE_TIPI', sql.Int, BELGE_TIPI)
      .input('CMBK_KODU', sql.VarChar, CMBK_KODU)
      .input('EVRAK_NO', sql.VarChar, EVRAK_NO)
      .input('GIREN_TUTAR', sql.Decimal(18, 2), GIREN_TUTAR)
      .input('CIKAN_TUTAR', sql.Decimal(18, 2), CIKAN_TUTAR)
      .input('KASA_ACIKLAMA', sql.VarChar, KASA_ACIKLAMA)
      .input('MUHFISNUM', sql.VarChar, MUHFISNUM)
      .input('KASA_KODU', sql.VarChar, KASA_KODU)
      .query(insertQuery);

    res.json({
      success: true,
      message: 'Kasa hareketi başarıyla kaydedildi',
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Kasa hareketi kaydedilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Tüm kasa hareketlerini getir
app.get('/api/kasa-hareket', async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(atikerConfig);

    const query = `
      SELECT 
        BELGE_NO, BELGE_TIPI, CMBK_KODU, EVRAK_NO,
        GIREN_TUTAR, CIKAN_TUTAR, KASA_ACIKLAMA,
        MUHFISNUM, KASA_KODU, TARIH
      FROM TBLKASAHR 
      ORDER BY TARIH DESC, BELGE_NO DESC
    `;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Kasa hareketleri çekilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Tüm kasa kayıtlarını getir (ATIKER25 veritabanından)
app.get('/api/kasa', async (req, res) => {
  let pool;
  try {
    console.log('ATIKER25 veritabanına bağlanılıyor (Kasa)...');

    pool = await sql.connect(atikerConfig);
    console.log('ATIKER25 veritabanına bağlantı başarılı');

    const query = `
      SELECT
        KASA_KODU, KASA_TANIMI, SUBE_KODU
      FROM TBLKASASB
      ORDER BY KASA_KODU
    `;

    const result = await pool.request().query(query);
    console.log(
      'Kasa sorgusu başarılı,',
      result.recordset.length,
      'kayıt bulundu'
    );

    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Kasa verileri çekilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Yeni kasa kaydı ekle (ATIKER25 veritabanına)
app.post('/api/kasa', async (req, res) => {
  let pool;
  try {
    const { KASA_KODU, KASA_TANIMI } = req.body;

    console.log('Yeni kasa kaydı ekleniyor:', { KASA_KODU, KASA_TANIMI });

    if (!KASA_KODU || !KASA_TANIMI) {
      return res.status(400).json({
        success: false,
        message: 'Kasa kodu ve kasa tanımı zorunludur',
      });
    }

    pool = await sql.connect(atikerConfig);

    const checkQuery = `
      SELECT COUNT(*) as count FROM TBLKASASB WHERE KASA_KODU = @KASA_KODU
    `;

    const checkResult = await pool
      .request()
      .input('KASA_KODU', sql.VarChar, KASA_KODU)
      .query(checkQuery);

    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kasa kodu zaten mevcut',
      });
    }

    const insertQuery = `
      INSERT INTO TBLKASASB (KASA_KODU, KASA_TANIMI, SUBE_KODU)
      VALUES (@KASA_KODU, @KASA_TANIMI, 0)
    `;

    await pool
      .request()
      .input('KASA_KODU', sql.VarChar, KASA_KODU)
      .input('KASA_TANIMI', sql.VarChar, KASA_TANIMI)
      .query(insertQuery);

    console.log('Kasa kaydı başarıyla eklendi');

    res.json({
      success: true,
      message: 'Kasa kaydı başarıyla eklendi',
      data: { KASA_KODU, KASA_TANIMI },
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Kasa kaydı eklenemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Kasa kaydı sil (ATIKER25 veritabanından)
app.delete('/api/kasa/:kasaKodu', async (req, res) => {
  let pool;
  try {
    const { kasaKodu } = req.params;

    console.log('Kasa kaydı siliniyor:', kasaKodu);

    pool = await sql.connect(atikerConfig);

    const checkQuery = `
      SELECT COUNT(*) as count FROM TBLKASASB WHERE KASA_KODU = @KASA_KODU
    `;

    const checkResult = await pool
      .request()
      .input('KASA_KODU', sql.VarChar, kasaKodu)
      .query(checkQuery);

    if (checkResult.recordset[0].count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kasa kaydı bulunamadı',
      });
    }

    const deleteQuery = `
      DELETE FROM TBLKASASB WHERE KASA_KODU = @KASA_KODU
    `;

    await pool
      .request()
      .input('KASA_KODU', sql.VarChar, kasaKodu)
      .query(deleteQuery);

    console.log('Kasa kaydı başarıyla silindi');

    res.json({
      success: true,
      message: 'Kasa kaydı başarıyla silindi',
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Kasa kaydı silinemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Tüm cari kayıtlarını getir (ATIKER25 veritabanından)
app.get('/api/cariler', async (req, res) => {
  let pool;
  try {
    console.log('ATIKER25 veritabanına bağlanılıyor (Cari)...');

    pool = await sql.connect(atikerConfig);
    console.log('ATIKER25 veritabanına bağlantı başarılı');

    const query = `
      SELECT
        CARI_KODU, CARI_ADI, CARI_TIPI, CARI_ADRES, CARI_ULKE,
        CARI_IL, CARI_ILCE, CARI_SEMT, CARI_POSTAKODU,
        VERGI_NO, TC_NO, CARI_TELEFON
      FROM TBLCARISB
    `;

    const result = await pool.request().query(query);
    console.log(
      'Cari sorgusu başarılı,',
      result.recordset.length,
      'kayıt bulundu'
    );

    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Cari verileri çekilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

// Tüm stok kayıtlarını getir (ATIKER25 veritabanından)
app.get('/api/stoklar', async (req, res) => {
  let pool;
  try {
    console.log('ATIKER25 veritabanına bağlanılıyor (Stok)...');

    pool = await sql.connect(atikerConfig);
    console.log('ATIKER25 veritabanına bağlantı başarılı');

    const query = `
      SELECT
        STOK_KODU, STOK_ADI, STOK_TIPI, STOK_KISA_ADI
      FROM TBLSTOKSB
    `;

    const result = await pool.request().query(query);
    console.log(
      'Stok sorgusu başarılı,',
      result.recordset.length,
      'kayıt bulundu'
    );

    res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset,
    });
  } catch (error) {
    console.error('HATA:', error.message);
    res.status(500).json({
      success: false,
      message: 'Stok verileri çekilemedi: ' + error.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ API http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`📊 Kasa Endpoint: http://localhost:${PORT}/api/kasa`);
  console.log(`👥 Cari Endpoint: http://localhost:${PORT}/api/cariler`);
  console.log(`📦 Stok Endpoint: http://localhost:${PORT}/api/stoklar`);
  console.log(`🏦 Banka Endpoint: http://localhost:${PORT}/api/banka`);
  console.log(
    `🏦 TCMB Banka Endpoint: http://localhost:${PORT}/api/tcmb-bankalar`
  );
  console.log(
    `🏢 TCMB Şube Endpoint: http://localhost:${PORT}/api/tcmb-subeler`
  );
});
