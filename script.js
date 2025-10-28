// *******************************************************************
// ********* UÇUCU EKİP HESAPLAYICILARI - script.js *********
// *******************************************************************

// **********************************************
// ********* 1. SABİTLER VE VERİ YAPILARI *********
// **********************************************

// --- HARCIRAH VERİ TABANI ---
const harcirahVerileri = {
    // III. GRUP DEĞERLERİ
    "ABD": { deger: 60, birim: "USD", dovizAdi: "$" },
    "AVUSTURYA": { deger: 55, birim: "EUR", dovizAdi: "€" },
    "ALMANYA": { deger: 54, birim: "EUR", dovizAdi: "€" },
    "BELÇİKA": { deger: 53, birim: "EUR", dovizAdi: "€" },
    "LÜKSEMBURG": { deger: 54, birim: "EUR", dovizAdi: "€" },
    "FİNLANDİYA": { deger: 48, birim: "EUR", dovizAdi: "€" },
    "FRANSA": { deger: 53, birim: "EUR", dovizAdi: "€" },
    "HOLLANDA": { deger: 52, birim: "EUR", dovizAdi: "€" },
    "İTALYA": { deger: 50, birim: "EUR", dovizAdi: "€" },
    "PORTEKİZ": { deger: 51, birim: "EUR", dovizAdi: "€" },
    "YUNANİSTAN": { deger: 52, birim: "EUR", dovizAdi: "€" },
    "İRLANDA": { deger: 52, birim: "EUR", dovizAdi: "€" },
    "İSPANYA": { deger: 52, birim: "EUR", dovizAdi: "€" },
    "DİĞER AB ÜLKELERİ": { deger: 42, birim: "EUR", dovizAdi: "€" },
    "AVUSTRALYA": { deger: 93, birim: "AUD", dovizAdi: "A$" },
    "DANİMARKA": { deger: 408, birim: "DKK", dovizAdi: "kr" },
    "İSVEÇ": { deger: 447, birim: "SEK", dovizAdi: "kr" },
    "İSVİÇRE": { deger: 60, birim: "CHF", dovizAdi: "CHF" },
    "JAPONYA": { deger: 7000, birim: "JPY", dovizAdi: "¥" },
    "KANADA": { deger: 81, birim: "CAD", dovizAdi: "C$" },
    "KUVEYT": { deger: 16, birim: "KWD", dovizAdi: "KD" },
    "NORVEÇ": { deger: 393, birim: "NOK", dovizAdi: "kr" },
    "İNGİLTERE": { deger: 38, birim: "GBP", dovizAdi: "£" },
    "S.ARABİSTAN": { deger: 204, birim: "SAR", dovizAdi: "﷼" },
    "DİĞER ÜLKELER": { deger: 52, birim: "USD", dovizAdi: "$" },
};

// --- DÖVİZ KURU API SABİTLERİ VE YEDEKLERİ ---
const KUR_API_KEY = '87e420cb67c7d1e9f4f2aa5c';  // Lütfen Kendi Anahtarınızı Kullanın
const KUR_BASE_URL = `https://v6.exchangerate-api.com/v6/${KUR_API_KEY}/latest/TRY`;

let kurVerileri = {
    "USD": 0, "EUR": 0, "JPY": 0, "AUD": 0, "DKK": 0,  
    "SEK": 0, "CHF": 0, "CAD": 0, "KWD": 0, "NOK": 0, "GBP": 0, "SAR": 0,
    "DEFAULT_USD": 42.00, "DEFAULT_EUR": 49.00, "DEFAULT_JPY": 0.28,  
    "DEFAULT_AUD": 27.50, "DEFAULT_DKK": 6.50, "DEFAULT_SEK": 4.48,  
    "DEFAULT_CHF": 52.80, "DEFAULT_CAD": 30.00, "DEFAULT_KWD": 137.00,  
    "DEFAULT_NOK": 4.20, "DEFAULT_GBP": 56.00, "DEFAULT_SAR": 11.20
};

// --- AKARYAKIT API SABİTLERİ VE YEDEKLERİ ---
const AKARYAKIT_API_URL = "https://hasanadiguzel.com.tr/api/akaryakit/sehir=ISTANBUL";
const YEDEK_BENZIN_FIYATI = 52.00; // API hatası durumunda kullanılacak sabit fiyat

// Yol Ücreti hesaplaması için gerekli sabitler
const YOL_VERILERI = {
    "AVRUPA": {
        litre_hakkı: 3.25 
    },
    "ANADOLU": {
        litre_hakkı: 6.5 
    }
};

let benzinFiyatlari = {
    AVRUPA: 0,
    ANADOLU: 0
};

// **********************************************
// ********* 2. YARDIMCI VE API FONKSİYONLARI *********
// **********************************************

// DÖVİZ KURU API ENTEGRASYONU
async function kurlariGetir() {
    try {
        const response = await fetch(KUR_BASE_URL);
        const data = await response.json();

        if (data.result === 'error') {
            throw new Error(`API Hatası: ${data['error-type']}`);
        }

        const rates = data.conversion_rates;
        for (const birim in kurVerileri) {
            if (birim.length === 3 && rates[birim]) {  
                kurVerileri[birim] = 1 / rates[birim];
            }
        }
    } catch (error) {
        console.error("Döviz Kuru API Hatası (Yedek Kurlar Kullanılıyor):", error);
        for (const birim in kurVerileri) {
            if (birim.length === 3 && kurVerileri[`DEFAULT_${birim}`]) {
                kurVerileri[birim] = kurVerileri[`DEFAULT_${birim}`];
            }
        }
    }
}

function ulkeSecimleriniDoldur(selectElement) {
    if (!selectElement) return;
    
    let html = '<option value="">-- Ülke Seçiniz --</option>';

    Object.keys(harcirahVerileri).sort().forEach(ulke => {
        html += `<option value="${ulke}">${ulke} (${harcirahVerileri[ulke].birim})</option>`;
    });

    selectElement.innerHTML = html;
}

let satirId = 0;
function ekleGirisAlani(canDelete = false) {
    const konteyner = document.getElementById('harcirahGirisleri');
    if (!konteyner) return;

    satirId++;

    const div = document.createElement('div');
    div.classList.add('dinamik-giris-satiri');
    div.dataset.id = satirId;

    let html = `
        <div class="input-wrapper select-wrapper">
            <label for="ulke_${satirId}">Gidilen Ülke:</label>
            <select class="ulke-secimi" id="ulke_${satirId}" required></select>
        </div>
        <div class="input-wrapper">
            <label for="sayi_${satirId}">Harcırah Sayısı:</label>
            <input type="number" class="harcirah-sayisi" id="sayi_${satirId}" min="1" required value="1">
        </div>
    `;

    if (canDelete) {
        html += `<button type="button" class="sil-btn" onclick="this.parentNode.remove()">X</button>`;
    } else {
        html += `<div style="width: 40px; flex-shrink: 0;"></div>`;  
    }

    div.innerHTML = html;
    konteyner.appendChild(div);

    const selectElement = div.querySelector('.ulke-secimi');
    ulkeSecimleriniDoldur(selectElement);
}


// --- AKARYAKIT FİYATI YÜKLEME FONKSİYONU ---
async function yukleYolUcretiVerilerini() {
    const yolUcretiSonucDiv = document.getElementById('yolUcretiSonuc');
    const hesaplaYolUcretiBtn = document.getElementById('hesaplaYolUcretiBtn');

    if (!yolUcretiSonucDiv || benzinFiyatlari.AVRUPA > 0) return; // Fiyat zaten çekilmişse tekrar çekme

    yolUcretiSonucDiv.innerHTML = "Güncel Akaryakıt fiyatı yükleniyor...";
    yolUcretiSonucDiv.classList.remove('error');
    yolUcretiSonucDiv.classList.remove('warning');

    try {
        const response = await fetch(AKARYAKIT_API_URL);
        const data = await response.json(); 

        if (!data || data.status === false || !data.data) {
             throw new Error("Güncel veri alınamadı.");
        }
        
        const dataObj = data.data; 
        const firstKey = Object.keys(dataObj)[0]; 
        
        if (!firstKey) {
             throw new Error("Güncel benzin fiyatı alınamadı");
        }
        
        const fiyatData = dataObj[firstKey]; 
        
        // API Hedef Anahtarı
        const hedefAnahtar = "Kursunsuz_95(Excellium95)_TL/lt";
        
        let fiyatString = fiyatData?.[hedefAnahtar] || YEDEK_BENZIN_FIYATI.toString();
        
        fiyatString = fiyatString.trim(); 
        const benzinFiyati = parseFloat(fiyatString.replace(',', '.')); 

        if (isNaN(benzinFiyati) || benzinFiyati <= 0 || benzinFiyati === YEDEK_BENZIN_FIYATI) {
             throw new Error(`Güncel değer çekilemedi ${fiyatString}`);
        }

        // Fiyatı kaydet ve sonucu güncelle
        benzinFiyatlari.AVRUPA = benzinFiyati; 
        benzinFiyatlari.ANADOLU = benzinFiyati; 
        
        const suankiTarih = new Date().toLocaleString('tr-TR', { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
        
        const fiyatStr = benzinFiyati.toFixed(2).replace('.', ',');
        
        yolUcretiSonucDiv.innerHTML = `
            Güncel Benzin Fiyatı:
            <strong style="color: #004d99; font-size: 1.2em;">${fiyatStr} TL/Litre</strong>
            <span style="font-size: 0.8em; color: #666; display: block;">Güncelleme: ${suankiTarih}</span><br>
            Lütfen ikamet yakanızı ve kullanım sayısını giriniz.
        `;
        
        hesaplaYolUcretiBtn.disabled = false;

    } catch (error) {
        console.error("Akaryakıt API Hatası:", error);
        
        // Hata durumunda yedek fiyatı kullanma
        benzinFiyatlari.AVRUPA = YEDEK_BENZIN_FIYATI; 
        benzinFiyatlari.ANADOLU = YEDEK_BENZIN_FIYATI; 
        hesaplaYolUcretiBtn.disabled = false; 
        
        const yedekFiyatStr = YEDEK_BENZIN_FIYATI.toFixed(2).replace('.', ',');
        yolUcretiSonucDiv.className = 'sonuc-kutusu warning';
        yolUcretiSonucDiv.innerHTML = `Hata: Fiyat yüklenemedi. (${error.message})`;
        yolUcretiSonucDiv.innerHTML += `<br> <span style='color:green;'>**Geçici olarak ${yedekFiyatStr} TL/Litre sabit fiyatı kullanılıyor.**</span>`;
    }
}


// **********************************************
// ********* 3. HESAPLAMA MANTIKLARI *********
// **********************************************

// --- 3.1. BOŞ GÜN HESAPLAYICISI MANTIĞI ---
const bosGunTablosu = {  
    31: 8, 30: 8, 29: 8, 28: 7, 27: 7, 26: 7, 25: 7,  
    24: 6, 23: 6, 22: 6, 21: 6, 20: 5, 19: 5,  
    18: 5, 17: 5, 16: 4, 15: 4, 14: 4, 13: 3,  
    12: 3, 11: 3, 10: 3, 9: 2, 8: 2, 7: 2,  
    6: 2, 5: 1, 4: 1, 3: 1, 2: 1, 1: 0, 0: 0  
};

const ayGunleri = {
    Ocak: 31, Subat: 29, Mart: 31, Nisan: 30, Mayis: 31, Haziran: 30,
    Temmuz: 31, Agustos: 31, Eylul: 30, Ekim: 31, Kasim: 30, Aralik: 31
};

function hesaplaBoşGün() {
    const aySecimiSelect = document.getElementById('aySecimi');
    const izinGunInput = document.getElementById('izinGunSayisi');
    const sonucDiv = document.getElementById('sonuc');

    if (!aySecimiSelect || !izinGunInput || !sonucDiv) return;

    const ayAdi = aySecimiSelect.value;
    const izinGunSayisi = parseInt(izinGunInput.value);

    if (!ayAdi || isNaN(izinGunSayisi) || izinGunSayisi < 0) {
        sonucDiv.innerHTML = "Lütfen geçerli bir ay seçin ve izin gün sayısını girin.";
        sonucDiv.className = 'sonuc-kutusu error';
        return;
    }

    const ayGunSayisi = ayGunleri[ayAdi];
    const standartBosGun = bosGunTablosu[30];

    let fiiliCalismaGunu = ayGunSayisi - izinGunSayisi;
    fiiliCalismaGunu = Math.min(31, Math.max(0, fiiliCalismaGunu));

    const hakEdilenBosGun = bosGunTablosu[fiiliCalismaGunu];
    
    if (hakEdilenBosGun === undefined) {
        sonucDiv.innerHTML = "Hata: Hesaplama aralığı dışında bir fiili çalışma günü oluştu.";
        sonucDiv.className = 'sonuc-kutusu error';
        return;
    }

    const dusenBosGunSayisi = standartBosGun - hakEdilenBosGun;
    
    sonucDiv.innerHTML = `
        <p>Seçilen Ay: <strong>${ayAdi} (${ayGunSayisi} gün)</strong></p>
        <p>Toplam İzin: <strong>${izinGunSayisi} Gün</strong></p>
        <p>Tabloya Esas Fiili Çalışma Günü: <strong>${fiiliCalismaGunu} Gün</strong></p>
        <hr style="border-top: 1px solid #ccc; width: 60%; margin: 15px auto;">
        
        <p style="font-size: 1.5em; color: #cc0000;">Hak Edilen Kullanılabilir Boş Gün: <strong>${hakEdilenBosGun}</strong></p>
        
        <hr style="border-top: 1px solid #ccc; width: 60%; margin: 15px auto;">
        <p style="font-size: 1.2em; color: #004d99;">
            ${dusenBosGunSayisi} Boş Gününüz Planlama Tarafından Alınabilir
            <span style="font-size:0.8em; display:block; color:#666;">(Standart ${standartBosGun} - Hak Edilen ${hakEdilenBosGun})</span>
        </p>
    `;
    sonucDiv.className = 'sonuc-kutusu';
}


// --- 3.2. HARCIRAH PLANLAYICISI MANTIĞI ---
function planlaHaricrah() {
    const motorKapamaZamaniInput = document.getElementById('motorKapamaZamani');
    const haricrahSonucDiv = document.getElementById('haricrahSonuc');

    if (!motorKapamaZamaniInput || !haricrahSonucDiv) return;

    const motorKapamaZamaniStr = motorKapamaZamaniInput.value.trim();

    if (!motorKapamaZamaniStr) {
        haricrahSonucDiv.innerHTML = "Lütfen Motor Kapama Zamanını (UTC) giriniz.";
        haricrahSonucDiv.className = 'sonuc-kutusu error';
        return;
    }
    
    let motorKapamaDate;
    try {
        const [tarihKismi, saatKismi] = motorKapamaZamaniStr.split(' ');
        const [gun, ay, yil] = tarihKismi.split('.');
        const [saat, dakika] = saatKismi.split(':');
        
        const msTimestamp = Date.UTC(yil, ay - 1, gun, saat, dakika);
        motorKapamaDate = new Date(msTimestamp);
        
        if (isNaN(motorKapamaDate.getTime())) {
            throw new Error("Geçersiz Tarih Oluşumu.");
        }
    } catch (e) {
        haricrahSonucDiv.innerHTML = "Hata: Tarih formatı okunamadı. Lütfen **GG.AA.YYYY SS:DD** formatını kontrol edin.";
        haricrahSonucDiv.className = 'sonuc-kutusu error';
        return;
    }
    
    // Motor Kapamadan 30 dakika sonrası başlangıç alınır
    let baslangicSuresiMs = motorKapamaDate.getTime() + (30 * 60 * 1000); 

    let tabloHTML = `
        <h2>Minimum Harcırah Hak Ediş Saatleri</h2>
        <table style="width:100%; border-collapse: collapse; text-align: center; margin-top: 10px;">
            <tr>
                <th style="border-bottom: 2px solid #004d99; padding: 8px;">Harcırah</th>
                <th style="border-bottom: 2px solid #004d99; padding: 8px;">Pushback Eşiği (UTC)</th>
            </tr>
    `;

    for (let N = 1; N <= 5; N++) {
        let pushbackMs;
        let zamanAciklamasi;

        if (N === 1) {
            const yirmiDortSaatMs = 24 * 60 * 60 * 1000;
            const birSaatMs = 1 * 60 * 60 * 1000;
            pushbackMs = baslangicSuresiMs + yirmiDortSaatMs + birSaatMs;
            zamanAciklamasi = "ve öncesi";

        } else {
            const gunMs = (N - 1) * 24 * 60 * 60 * 1000;
            const birDakikaMs = 1 * 60 * 1000;
            const birSaatMs = 1 * 60 * 60 * 1000;
            const minBitisSuresiMs = baslangicSuresiMs + gunMs + birDakikaMs;
            pushbackMs = minBitisSuresiMs + birSaatMs;
            zamanAciklamasi = "ve sonrası";
        }

        const pushbackDate = new Date(pushbackMs);

        const tarihSecenekleri = { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', 
            hourCycle: 'h23', timeZone: 'UTC' 
        };
        const pushbackZamaniStr = pushbackDate.toLocaleString('tr-TR', tarihSecenekleri);

        tabloHTML += `
            <tr>
                <td style="border-bottom: 1px solid #ddd; padding: 8px;">${N} Harcırah</td>
                <td style="border-bottom: 1px solid #ddd; padding: 8px; font-weight: bold;">
                    ${pushbackZamaniStr} UTC ${zamanAciklamasi}
                </td>
            </tr>
        `;
    }
    
    tabloHTML += `</table>`;
    haricrahSonucDiv.innerHTML = tabloHTML;
    haricrahSonucDiv.classList.remove('error');
}

// --- 3.4. YOL ÜCRETİ HESAPLAYICISI MANTIĞI ---
function hesaplaYolUcreti() {
    const ikametYeriSelect = document.getElementById('ikametYeri');
    const yolKullanimInput = document.getElementById('yolKullanimSayisi');
    const yolUcretiSonucDiv = document.getElementById('yolUcretiSonuc');

    if (!ikametYeriSelect || !yolKullanimInput || !yolUcretiSonucDiv) return;

    const ikametYeri = ikametYeriSelect.value;
    const yolKullanimSayisi = parseInt(yolKullanimInput.value);

    if (!ikametYeri || isNaN(yolKullanimSayisi) || yolKullanimSayisi < 0) {
        yolUcretiSonucDiv.innerHTML = "Lütfen ikamet ettiğiniz yakayı seçin ve geçerli bir kullanım sayısı girin.";
        yolUcretiSonucDiv.className = 'sonuc-kutusu error';
        return;
    }
    
    // Fiyat çekilemediyse veya sıfırsa hata verip tekrar çekmeyi dene
    const benzinFiyati = benzinFiyatlari.AVRUPA;
    if (benzinFiyati <= 0) {
         yolUcretiSonucDiv.innerHTML = "Benzin fiyatı henüz çekilemedi. Lütfen tekrar deneyin.";
         yolUcretiSonucDiv.className = 'sonuc-kutusu warning';
         yukleYolUcretiVerilerini(); 
         return;
    }

    const veri = YOL_VERILERI[ikametYeri];
    const litreHakkıTekYon = veri.litre_hakkı;
    const toplamLitreHakkı = litreHakkıTekYon * yolKullanimSayisi;
    const toplamYolUcreti = toplamLitreHakkı * benzinFiyati;

    const toplamLitreHakkıStr = toplamLitreHakkı.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const toplamYolUcretiStr = toplamYolUcreti.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const litreHakkıTekYonStr = litreHakkıTekYon.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const benzinFiyatiStr = benzinFiyati.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    yolUcretiSonucDiv.innerHTML = `
        <h3>YOL ÜCRETİ HESAP SONUCU</h3>
        <p>İkamet Yakanız: <strong>${ikametYeri === 'AVRUPA' ? 'AVRUPA (3.25 L/Yol)' : 'ANADOLU (6.5 L/Yol)'}</strong></p>
        <p>Kullanım Sayısı (Tek Yön): <strong>${yolKullanimSayisi}</strong></p>
        <p>Güncel Benzin Fiyatı: <strong>${benzinFiyatiStr} TL/L</strong></p>
        <hr style="border-top: 1px solid #ccc; width: 60%; margin: 15px auto;">
        
        <p style="font-size: 1.2em; color: #004d99; margin-top: 5px; margin-bottom: 5px;">
            Toplam Hak Edilen Litre: <strong>${toplamLitreHakkıStr} L</strong>
            <span style="font-size:0.8em; display:block; color:#666;">(${litreHakkıTekYonStr} L/Yol x ${yolKullanimSayisi} Yol)</span>
        </p>
        <p style="font-size: 1.5em; color: #cc0000; font-weight: bold;">
            Hak Edilen Toplam Yol Ücreti: ${toplamYolUcretiStr} TL
        </p>
    `;
    yolUcretiSonucDiv.className = 'sonuc-kutusu';
}


// **********************************************
// ********* 4. SAYFA YÜKLENDİĞİNDE *********
// **********************************************

document.addEventListener('DOMContentLoaded', () => {
    // API verilerini yükle
    kurlariGetir();
    yukleYolUcretiVerilerini();
    ekleGirisAlani(false); // İlk Harcırah giriş satırını ekle

    // --- DOM ELEMENTLERİ ---
    const tabCalismaBtn = document.getElementById('tabCalismaBtn');
    const tabHaricrahBtn = document.getElementById('tabHaricrahBtn');
    const tabDegerBtn = document.getElementById('tabDegerBtn');  
    const tabYolUcretiBtn = document.getElementById('tabYolUcretiBtn');
    
    const calismaGunTab = document.getElementById('calismaGunTab');
    const haricrahTab = document.getElementById('haricrahTab');
    const degerHesaplayiciTab = document.getElementById('degerHesaplayiciTab');
    const yolUcretiTab = document.getElementById('yolUcretiTab');
    
    const hesaplaBtn = document.getElementById('hesaplaBtn'); // Boş Gün
    const planlaHaricrahBtn = document.getElementById('planlaHaricrahBtn'); // Harcırah Planlayıcı
    const ekleBtn = document.getElementById('ekleBtn'); // Harcırah Değer
    const hesaplaDegerBtn = document.getElementById('hesaplaDegerBtn'); // Harcırah Değer
    const hesaplaYolUcretiBtn = document.getElementById('hesaplaYolUcretiBtn'); // Yol Ücreti


    // --- SEKMELER ARASI GEÇİŞ MANTIĞI ---
    if (tabCalismaBtn && tabYolUcretiBtn) {
        const allTabs = [calismaGunTab, haricrahTab, degerHesaplayiciTab, yolUcretiTab];
        const allBtns = [tabCalismaBtn, tabHaricrahBtn, tabDegerBtn, tabYolUcretiBtn];
        
        const changeTab = (activeTab, activeBtn) => {
            allTabs.forEach(tab => tab.classList.add('hidden'));
            allBtns.forEach(btn => btn.classList.remove('active'));
            
            activeTab.classList.remove('hidden');
            activeBtn.classList.add('active');
            
            // Yol Ücreti sekmesine geçiş yapıldığında fiyatı kontrol et
            if (activeTab === yolUcretiTab) {
                yukleYolUcretiVerilerini();
            }
        };

        tabCalismaBtn.addEventListener('click', () => changeTab(calismaGunTab, tabCalismaBtn));
        tabHaricrahBtn.addEventListener('click', () => changeTab(haricrahTab, tabHaricrahBtn));
        tabDegerBtn.addEventListener('click', () => changeTab(degerHesaplayiciTab, tabDegerBtn));
        tabYolUcretiBtn.addEventListener('click', () => changeTab(yolUcretiTab, tabYolUcretiBtn));
    }

    // --- EVENT LİSTENER'LAR ---
    if (hesaplaBtn) {
        hesaplaBtn.addEventListener('click', hesaplaBoşGün);
    }

    if (planlaHaricrahBtn) {
        planlaHaricrahBtn.addEventListener('click', planlaHaricrah);
    }

    if (ekleBtn) {
        ekleBtn.addEventListener('click', () => ekleGirisAlani(true));
    }

    if (hesaplaDegerBtn) {
        hesaplaDegerBtn.addEventListener('click', hesaplaHaricrahDeger);
    }
    
    if (hesaplaYolUcretiBtn) {
        hesaplaYolUcretiBtn.addEventListener('click', hesaplaYolUcreti);
    }
});
