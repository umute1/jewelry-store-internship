const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Express sunucusunu olustur
const app = express();
const PORT = process.env.PORT || 5000;

// Ayarlar
app.use(cors()); // Frontend baglantisi icin
app.use(express.json()); // JSON verilerini okumak icin

// Altin fiyati saklama (basit cache)
let goldPrice = 2600; // USD/ounce
let lastUpdate = Date.now();

// Urunleri oku
const getProducts = () => {
  try {
    const filePath = path.join(__dirname, 'products.json');
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (error) {
    console.log('Urun dosyasi okunamadi:', error);
    return [];
  }
};

// Altin fiyatini internetten al
const getGoldPrice = async () => {
  try {
    // Eger 10 dakika gecmemisse cache'den al
    if (Date.now() - lastUpdate < 10 * 60 * 1000) {
      console.log('Altin fiyati cache\'den alindi:', goldPrice);
      return goldPrice;
    }

    console.log('Altin fiyati guncelleniyor...');
    
    // Tek API kullan - basit yontem
    const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
    if (response.ok) {
      const data = await response.json();
      // Bitcoin fiyatindan altin fiyatini tahmin et
      const bitcoinPrice = data.bpi.USD.rate_float;
      goldPrice = Math.round(bitcoinPrice / 30); // Yaklasik hesap
      lastUpdate = Date.now();
      
      console.log('Altin fiyati guncellendi:', goldPrice, 'USD');
      return goldPrice;
    }
  } catch (error) {
    console.log('API baglanti hatasi:', error.message);
  }
  
  // Hata olursa eski fiyati kullan
  console.log('Eski altin fiyati kullaniliyor:', goldPrice);
  return goldPrice;
};

// Fiyat hesapla
const calculatePrice = async (popularity, weight) => {
  try {
    const currentGoldPrice = await getGoldPrice();
    
    // Basit formul: populerlik ve agirlik ile altin fiyatini carp
    const pricePerGram = currentGoldPrice / 31; // 1 ounce = 31 gram yaklasik
    const popularityPrice = popularity * pricePerGram * 0.1;
    const weightPrice = weight * pricePerGram;
    
    const totalPrice = popularityPrice + weightPrice;
    
    return Math.round(totalPrice * 100) / 100; // 2 ondalik
  } catch (error) {
    console.log('Fiyat hesaplama hatasi:', error);
    // Basit yedek hesap
    return (popularity * 1000) + (weight * 200);
  }
};

// Ana sayfa
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kuyumcu API calisiyor',
    time: new Date().toLocaleString('tr-TR')
  });
});

// Altin fiyati 
app.get('/api/gold-price', async (req, res) => {
  try {
    const price = await getGoldPrice();
    res.json({ 
      goldPrice: price,
      unit: 'USD/ounce',
      time: new Date().toLocaleString('tr-TR')
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Altin fiyati alinamadi',
      time: new Date().toLocaleString('tr-TR')
    });
  }
});

// Tum urunler
app.get('/api/products', async (req, res) => {
  try {
    const products = getProducts();
    
    console.log(products.length + ' urun icin fiyat hesaplaniyor...');
    
    // Her urun icin fiyat hesapla
    const productsWithPrices = await Promise.all(
      products.map(async (product) => {
        const price = await calculatePrice(product.popularityScore, product.weight);
        console.log(product.name + ' fiyati: ' + price + ' USD');
        
        return {
          ...product,
          price: price,
          selectedColor: 'yellow' // Varsayilan renk
        };
      })
    );
    
    console.log('Tum urun fiyatlari hesaplandi');
    res.json(productsWithPrices);
    
  } catch (error) {
    console.log('Urun listesi hatasi:', error);
    res.status(500).json({ 
      error: 'Urunler alinamadi',
      time: new Date().toLocaleString('tr-TR')
    });
  }
});

// Sunucuyu baslat
app.listen(PORT, () => {
  console.log('Sunucu calisiyor: http://localhost:' + PORT);
  console.log('Altin fiyat sistemi aktif');
}); 