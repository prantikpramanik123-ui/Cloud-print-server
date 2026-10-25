const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

let shops = []; 
let printRequests = []; 

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

// শপ রেজিস্টার ও কিউআর জেনারেশন API
app.post('/api/register', (req, res) => {
    const { shopName } = req.body;
    if (!shopName) {
        return res.status(400).json({ status: "error", message: "দোকানের নাম আবশ্যক!" });
    }

    const shopId = 'shop_' + Date.now();
    shops.push({ shopId, shopName });

    res.json({
        status: "success",
        shopId: shopId,
        shopName: shopName
    });
});

// কাস্টমার ফাইল আপলোড API
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

// দোকানের রিকোয়েস্ট লিস্ট
app.get('/api/requests/:shopId', (req, res) => {
    const shopId = req.params.shopId;
    const shopRequests = printRequests.filter(r => r.shopId === shopId);
    res.json(shopRequests);
});

// ফাইল ডাউনলোড
app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    res.download(file);
});

app.listen(PORT, () => {
    console.log(`Cloud Print Server is running on port ${PORT}`);
});
