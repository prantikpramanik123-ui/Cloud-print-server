const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ফোল্ডার তৈরি নিশ্চিত করা
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// মেমরিতে শপ এবং প্রিন্ট রিকোয়েস্ট জমানোর ডেটাবেজ
let shops = []; // { shopId, shopName, password }
let printRequests = []; // { id, shopId, filename, storedName, printType, copies, time }

// Multer ফাইল স্টোরেজ সেটআপ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ১. দোকান রেজিস্ট্রেশন API
app.post('/api/register', (req, res) => {
    const { shopName, password } = req.body;
    if (!shopName || !password) {
        return res.status(400).json({ status: "error", message: "দোকানের নাম এবং পাসওয়ার্ড আবশ্যক!" });
    }

    const shopId = 'shop_' + Date.now();
    shops.push({ shopId, shopName, password });

    res.json({
        status: "success",
        message: "দোকান সফলভাবে রেজিস্টার হয়েছে!",
        shopId: shopId,
        shopLink: `/shop.html?id=${shopId}`
    });
});

// ২. দোকানদার লগইন API
app.post('/api/login', (req, res) => {
    const { shopId, password } = req.body;
    const shop = shops.find(s => s.shopId === shopId && s.password === password);

    if (!shop) {
        return res.status(400).json({ status: "error", message: "ভুল শপ আইডি অথবা পাসওয়ার্ড!" });
    }

    res.json({ status: "success", message: "লগইন সফল হয়েছে!", shopName: shop.shopName });
});

// ৩. নির্দিষ্ট দোকানের প্রিন্ট রিকোয়েস্ট জমা নেওয়া (কাস্টমার আপলোড)
app.post('/api/upload/:shopId', upload.single('printFile'), (req, res) => {
    const shopId = req.params.shopId;
    const shop = shops.find(s => s.shopId === shopId);

    if (!shop) {
        return res.status(404).json({ status: "error", message: "দোকানটি খুঁজে পাওয়া যায়নি!" });
    }

    if (!req.file) {
        return res.status(400).json({ status: "error", message: "কোনো ফাইল সিলেক্ট করা হয়নি!" });
    }

    const newRequest = {
        id: Date.now(),
        shopId: shopId,
        filename: req.file.originalname,
        storedName: req.file.filename,
        printType: req.body.printType === 'color' ? 'কালার প্রিন্ট' : 'ব্ল্যাক অ্যান্ড হোয়াইট',
        copies: req.body.copies || 1,
        time: new Date().toLocaleString()
    };

    printRequests.unshift(newRequest);

    res.json({
        status: "success",
        message: "ফাইল সফলভাবে প্রিন্টের জন্য পাঠানো হয়েছে!"
    });
});

// ৪. নির্দিষ্ট দোকানের রিকোয়েস্টগুলো অ্যাডমিন প্যানেলে দেখানোর API
app.get('/api/requests/:shopId', (req, res) => {
    const shopId = req.params.shopId;
    const shopRequests = printRequests.filter(r => r.shopId === shopId);
    res.json(shopRequests);
});

// ৫. ফাইল ডাউনলোড করার রাউট
app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    res.download(file);
});

app.listen(PORT, () => {
    console.log(`Cloud Print Server is running on port ${PORT}`);
});
