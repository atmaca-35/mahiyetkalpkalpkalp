document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('searchBox');
    const resultDiv = document.getElementById('result');
    const ghostText = document.getElementById('ghostText');
    const searchContainer = document.querySelector('.search-box');
    const wordCountElement = document.getElementById('wordCount');

    let dictionaryData = {};
    let lastQuery = '';

    // Sözlük verilerini yükleme
    try {
        const response = await fetch('semantic.json');
        dictionaryData = await response.json();
        
        // Kelime sayısını gösterme
        const wordCount = Object.keys(dictionaryData).length;
        wordCountElement.innerHTML = `There are currently <span class="highlight">${wordCount}</span> words available.`;
    } catch (error) {
        console.error('Sözlük yüklenirken bir hata oluştu:', error);
        resultDiv.innerHTML = '<h3 class="error">Sözlük yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</h3>';
    }

    // Arama Fonksiyonu
    function searchWord(query) {
        if (query === lastQuery) {
            return;
        }
        lastQuery = query;

        resultDiv.innerHTML = '';

        if (query.length === 0) {
            ghostText.textContent = ""; // Boş sorgu durumunda hayalet metni temizle
            searchContainer.classList.remove('error');
            return;
        }

        // Türkçe karakter normalizasyonu
        const normalizedQuery = query.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
        
        const filteredWords = Object.keys(dictionaryData)
            .filter(word => {
                // Türkçe karakter normalizasyonu
                const normalizedWord = word.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
                return normalizedWord.startsWith(normalizedQuery);
            })
            .sort();

        if (filteredWords.length === 0) {
            ghostText.textContent = ""; // Kelime bulunamadığında hayalet metni temizle
            searchContainer.classList.add('error');
            return;
        }

        filteredWords.forEach(word => {
            const wordDetails = dictionaryData[word];
            const description = wordDetails.description.replace(/<br>/g, "");
            resultDiv.innerHTML += `
                <p class="description">${highlightWords(sanitizeHTML(description))}</p>
            `;
        });

        resultDiv.style.animation = 'none';
        resultDiv.offsetHeight; // Reflow'u tetikle
        resultDiv.style.animation = 'fadeIn 1s ease-in-out';
        searchContainer.classList.remove('error');
    }

    // HTML İçeriğini Temizleme
    function sanitizeHTML(htmlString) {
        return DOMPurify.sanitize(htmlString, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
            ALLOWED_ATTR: ['href', 'class'],
        });
    }

    // Özel Kelimeleri Vurgulama
    function highlightWords(text) {
        const specialWords = {
            '01': 'Ön Türkçe',
            '02': 'Moğolca',
            '03': 'Eski Anadolu Türkçesi',
            '04': 'Osmanlı Türkçesi',
            '05': 'Türkiye Türkçesi',
            '06': 'Azerbaycan Türkçesi',
            '07': 'Kırgız Türkçesi',
            '08': 'Başkurt Türkçesi',
            '09': 'Kazak Türkçesi',
            '10': 'Kırgız Türkçesi',
            '11': 'Özbek Türkçesi',
            '12': 'Tatar Türkçesi',
            '13': 'Türkmen Türkçesi',
            '14': 'Uygur Türkçesi',
            '15': 'Çuvaş Türkçesi'
        };

        for (const [key, value] of Object.entries(specialWords)) {
            const regex = new RegExp(`\\b${key}\\b(\\s+\\w+)`, 'gi');
            text = text.replace(regex, `<b>${value}</b> <i>$1</i>`);
        }

        return text;
    }

    // Eksik Harfleri Hayalet Olarak Gösterme (Placeholder Güncelleme)
    function updateSearchBoxPlaceholder(query) {
        const queryLower = query.toLowerCase();
        const matchingWord = Object.keys(dictionaryData)
            .find(word => {
                const normalizedWord = word.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
                return normalizedWord.startsWith(queryLower);
            });

        if (matchingWord) {
            const remainingPart = matchingWord.substring(query.length);
            ghostText.textContent = remainingPart;

            // Hayalet metni konumlandırma
            const inputRect = searchBox.getBoundingClientRect();
            const inputStyle = window.getComputedStyle(searchBox);
            const paddingLeft = parseFloat(inputStyle.paddingLeft);
            const fontSize = parseFloat(inputStyle.fontSize);

            // İlk harfin sağında başlamak için
            const firstCharWidth = getTextWidth(query, fontSize);
            ghostText.style.left = `${paddingLeft + firstCharWidth}px`;
        } else {
            ghostText.textContent = "";
        }
    }

    // Metin genişliğini hesaplama
    function getTextWidth(text, fontSize) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `${fontSize}px 'Arial', sans-serif`;
        return context.measureText(text).width;
    }

    // Arama Kutusu Etkinlik Dinleyicisi
    searchBox.addEventListener('input', () => {
        const query = searchBox.value.trim();
        updateSearchBoxPlaceholder(query);
        searchWord(query);
    });
});
