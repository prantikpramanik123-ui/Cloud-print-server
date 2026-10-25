const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// সার্ভার চালু আছে কিনা তা চেক করার রুট (Test Route)
app.get('/', (req, res) => {
    sendResponse = {
        status: "success",
        message: "Cloud Print Server is running successfully!"
    };
    res.json(sendResponse);
});

// প্রিন্ট রিকোয়েস্ট রিসিভ করার এন্ডপয়েন্ট
app.post('/print', (req, res) => {
    const printData = req.body;
    console.log("Received print data:", printData);
    
    // এখানে প্রিন্ট লজিক বা ক্লায়েন্ট ডিভাইসে ডেটা পাঠানোর কোড থাকবে
    
    res.json({
        status: "success",
        message: "Print request received successfully!",
        data: printData
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
