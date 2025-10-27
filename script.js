document.addEventListener('DOMContentLoaded', () => {
    // ********* GENEL AYARLAR VE SEKMELER *********
    
    // Sekme Elementleri
    const tabCalismaBtn = document.getElementById('tabCalismaBtn');
    const tabHaricrahBtn = document.getElementById('tabHaricrahBtn');
    const calismaGunTab = document.getElementById('calismaGunTab');
    const haricrahTab = document.getElementById('haricrahTab');

    // Sekme Değiştirme Fonksiyonu
    function changeTab(activeTab, inactiveTab, activeBtn, inactiveBtn) {
        activeTab.classList.remove('hidden');
        inactiveTab.classList.add('hidden');
        activeBtn.classList.add('active');
        inactiveBtn.classList.remove('active');
    }

    tabCalismaBtn.addEventListener('click', () => {
        changeTab(calismaGunTab, haricrahTab, tabCalismaBtn, tabHaricrahBtn);
    });

    tabHaricrahBtn.addEventListener('click', () => {
        changeTab(haricrahTab, calismaGunTab, tabHaricrahBtn, tabCalismaBtn);
    });


    // ********* 1. BOŞ GÜN HESAPLAYICISI MANTIĞI *********

    const bosGunTablosu = { /* ... (Önceki Cevaptaki Tablo) ... */
        31: 8,  
        30: 8, 29: 8, 28: 7, 27: 7, 26: 7, 25: 7, 
        24: 6, 23: 6, 22: 6, 21: 6, 20: 5, 19: 5, 
        18: 5, 17: 5, 16: 4, 15: 4, 14: 4, 13: 3, 
        12: 3, 11: 3, 10: 3, 9: 2, 8: 2, 7: 2, 
        6: 2, 5: 1, 4: 1, 3: 1, 2: 1, 1: 0, 0: 0 
    };

    const ayGunleri = {
        Ocak: 31, Subat: 29, Mart: 31, Nisan: 30, Mayis: 31, Haziran: 30,
        Temmuz: 31, Agustos: 31, Eylul: 30, Ekim: 31, Kasim: 30, Aralik: 31
    };
    
    const standartBosGun = bosGunTablosu[30]; // 8 gün

    const aySecimiSelect = document.getElementById('aySecimi');
    const izinGunInput = document.getElementById('izinGunSayisi');
    const hesaplaBtn = document.getElementById('hesaplaBtn');
    const sonucDiv = document.getElementById('sonuc');

    hesaplaBtn.addEventListener('click', hesaplaBoşGün);

    function hesaplaBoşGün() {
        // ... (Önceki cevaptaki hesaplaBoşGün fonksiyonunun TAMAMI buraya gelecek) ...
        const ayAdi = aySecimiSelect.value;
        const izinGunSayisi = parseInt(izinGunInput.value);

        // Geçerlilik Kontrolü
        if (!ayAdi || isNaN(izinGunSayisi) || izinGunSayisi < 0) {
            sonucDiv.innerHTML = "Lütfen geçerli bir ay seçin ve izin gün sayısını girin.";
            sonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        const ayGunSayisi = ayGunleri[ayAdi];

        let fiiliCalismaGunu = ayGunSayisi - izinGunSayisi;
        
        if (fiiliCalismaGunu > 31) {
            fiiliCalismaGunu = 31;
        } else if (fiiliCalismaGunu < 1) {
            fiiliCalismaGunu = 0;
        }

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
                <span style="font-size:0.8em; display:block; color:#666;">(Standart 8 - Hak Edilen ${hakEdilenBosGun})</span>
            </p>
        `;
        sonucDiv.className = 'sonuc-kutusu';
    }


    // ********* 2. HARCIRAH PLANLAYICISI MANTIĞI *********

    const motorKapamaZamaniInput = document.getElementById('motorKapamaZamani');
    const planlaHaricrahBtn = document.getElementById('planlaHaricrahBtn');
    const haricrahSonucDiv = document.getElementById('haricrahSonuc');

    planlaHaricrahBtn.addEventListener('click', planlaHaricrah);

    function planlaHaricrah() {
        const motorKapamaZamaniStr = motorKapamaZamaniInput.value;

        if (!motorKapamaZamaniStr) {
            haricrahSonucDiv.innerHTML = "Lütfen Motor Kapama Zamanını (UTC) giriniz.";
            haricrahSonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        // motorKapamaZamaniStr formatı 'YYYY-MM-DDTHH:MM' şeklindedir.
        // Bunu Date objesine çeviriyoruz. 'Z' ekleyerek UTC olduğunu varsayıyoruz.
        const motorKapamaDate = new Date(motorKapamaZamaniStr + ':00Z');

        if (isNaN(motorKapamaDate.getTime())) {
            haricrahSonucDiv.innerHTML = "Geçersiz tarih veya saat formatı.";
            haricrahSonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        // 1. Başlangıç Süresini (BS) Hesaplama: Motor Kapama + 30 Dakika
        // getTime() milisaniye cinsinden zamanı verir.
        let baslangicSuresiMs = motorKapamaDate.getTime() + (30 * 60 * 1000); // 30 dakika ekle

        let tabloHTML = `
            <h2>Minimum Harcırah Hak Ediş Saatleri</h2>
            <table style="width:100%; border-collapse: collapse; text-align: center; margin-top: 10px;">
                <tr>
                    <th style="border-bottom: 2px solid #004d99; padding: 8px;">Harcırah</th>
                    <th style="border-bottom: 2px solid #004d99; padding: 8px;">Minimum Pushback Zamanı (UTC)</th>
                </tr>
        `;

        // 2. 1 Harcırahtan 5 Harcıraha Kadar Hesaplama
        for (let N = 1; N <= 5; N++) {
            // N harcırahı hak etmek için gereken minimum geçen süre (N-1) * 24 saat + 1 dakika
            const minGecenSureMs = ((N - 1) * 24 * 60 * 60 * 1000) + (1 * 60 * 1000);

            // Minimum Bitiş Süresi (BTS)
            const minBitisSuresiMs = baslangicSuresiMs + minGecenSureMs;

            // Minimum Pushback Zamanı: BTS + 1 Saat
            const minPushbackMs = minBitisSuresiMs + (1 * 60 * 60 * 1000);

            const pushbackDate = new Date(minPushbackMs);

            // Tarih formatını daha okunaklı hale getirme (Örn: 05 Kas 10:31)
            const tarihSecenekleri = { 
                year: 'numeric', month: 'short', day: 'numeric', 
                hour: '2-digit', minute: '2-digit', 
                hourCycle: 'h23', timeZone: 'UTC' 
            };
            const pushbackZamaniStr = pushbackDate.toLocaleString('tr-TR', tarihSecenekleri) + ' UTC';

            tabloHTML += `
                <tr>
                    <td style="border-bottom: 1px solid #ddd; padding: 8px;">${N} Harcırah</td>
                    <td style="border-bottom: 1px solid #ddd; padding: 8px; font-weight: bold;">${pushbackZamaniStr}</td>
                </tr>
            `;
        }
        
        tabloHTML += `</table>`;
        haricrahSonucDiv.innerHTML = tabloHTML;
        haricrahSonucDiv.classList.remove('error');
    }
});
