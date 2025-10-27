document.addEventListener('DOMContentLoaded', () => {
    // **********************************************
    // ********* SEKMELER ARASI GEÇİŞ MANTIĞI *********
    // **********************************************
    
    const tabCalismaBtn = document.getElementById('tabCalismaBtn');
    const tabHaricrahBtn = document.getElementById('tabHaricrahBtn');
    const calismaGunTab = document.getElementById('calismaGunTab');
    const haricrahTab = document.getElementById('haricrahTab');

    // Güvenlik Kontrolü: Sekme elementleri bulunamazsa, bu bölümü atla.
    if (tabCalismaBtn && tabHaricrahBtn && calismaGunTab && haricrahTab) {
        const changeTab = (activeTab, inactiveTab, activeBtn, inactiveBtn) => {
            activeTab.classList.remove('hidden');
            inactiveTab.classList.add('hidden');
            activeBtn.classList.add('active');
            inactiveBtn.classList.remove('active');
        };

        tabCalismaBtn.addEventListener('click', () => {
            changeTab(calismaGunTab, haricrahTab, tabCalismaBtn, tabHaricrahBtn);
        });

        tabHaricrahBtn.addEventListener('click', () => {
            changeTab(haricrahTab, calismaGunTab, tabHaricrahBtn, tabCalismaBtn);
        });
    }


    // ***************************************************
    // ********* 1. BOŞ GÜN HESAPLAYICISI MANTIĞI *********
    // ***************************************************

    // Tablo ve Ay Tanımlamaları
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
    
    const standartBosGun = bosGunTablosu[30]; 

    // Elementler
    const aySecimiSelect = document.getElementById('aySecimi');
    const izinGunInput = document.getElementById('izinGunSayisi');
    const hesaplaBtn = document.getElementById('hesaplaBtn');
    const sonucDiv = document.getElementById('sonuc');
    
    // Güvenlik Kontrolü: Buton varsa dinleyiciyi ekle
    if (hesaplaBtn) {
        hesaplaBtn.addEventListener('click', hesaplaBoşGün);
    }

    function hesaplaBoşGün() {
        // Eksik element kontrolü
        if (!aySecimiSelect || !izinGunInput || !sonucDiv) return;

        const ayAdi = aySecimiSelect.value;
        const izinGunSayisi = parseInt(izinGunInput.value);

        if (!ayAdi || isNaN(izinGunSayisi) || izinGunSayisi < 0) {
            sonucDiv.innerHTML = "Lütfen geçerli bir ay seçin ve izin gün sayısını girin.";
            sonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        const ayGunSayisi = ayGunleri[ayAdi];
        
        let fiiliCalismaGunu = ayGunSayisi - izinGunSayisi;
        
        // Tablo Sınır Kontrolleri
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
        
        // Sonuç Çıktısı
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


    // ***************************************************
    // ********* 2. HARCIRAH PLANLAYICISI MANTIĞI *********
    // ***************************************************

    const motorKapamaZamaniInput = document.getElementById('motorKapamaZamani');
    const planlaHaricrahBtn = document.getElementById('planlaHaricrahBtn');
    const haricrahSonucDiv = document.getElementById('haricrahSonuc');

    // Güvenlik Kontrolü: Buton varsa dinleyiciyi ekle
    if (planlaHaricrahBtn) {
        planlaHaricrahBtn.addEventListener('click', planlaHaricrah);
    }

    function planlaHaricrah() {
        // Eksik element kontrolü
        if (!motorKapamaZamaniInput || !haricrahSonucDiv) return;

        const motorKapamaZamaniStr = motorKapamaZamaniInput.value;

        if (!motorKapamaZamaniStr) {
            haricrahSonucDiv.innerHTML = "Lütfen Motor Kapama Zamanını (UTC) giriniz.";
            haricrahSonucDiv.className = 'sonuc-kutusu error';
            return;
        }
        
        const motorKapamaDate = new Date(motorKapamaZamaniStr);
        
        // KONTROL DÜZELTMESİ: Kullanıcının girdiği yerel değerleri UTC olarak kabul et
        const year = motorKapamaDate.getFullYear();
        const month = motorKapamaDate.getMonth();
        const day = motorKapamaDate.getDate();
        const hours = motorKapamaDate.getHours();
        const minutes = motorKapamaDate.getMinutes();
        
        // Başlangıç Süresi (BS) milisaniye cinsinden UTC: MKZ + 30 dakika
        let baslangicSuresiMs = Date.UTC(year, month, day, hours, minutes) + (30 * 60 * 1000); 

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
            
            // TS = (N-1) tam gün + 1 dakika
            const gunMs = (N - 1) * 24 * 60 * 60 * 1000;
            const birDakikaMs = 1 * 60 * 1000;
            
            // Minimum Bitiş Süresi (BTS) = BS + TS
            const minBitisSuresiMs = baslangicSuresiMs + gunMs + birDakikaMs;
            
            // Minimum Pushback Zamanı (PBZ) = Min BTS + 1 Saat
            const minPushbackMs = minBitisSuresiMs + (1 * 60 * 60 * 1000);

            const pushbackDate = new Date(minPushbackMs);

            // Tarih formatlama (UTC olarak)
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
