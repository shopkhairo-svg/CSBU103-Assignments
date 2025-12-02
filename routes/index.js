var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { 
        title: 'UIT Web Development Lab',
        message: 'Welcome to UIT!'
    });
});

router.get('/hello', function(req, res) {
    res.send('Hi');
});

router.get('/', function(req, res) {
  res.render('index', { title: 'My app', name: 'Khai' });
});

router.get('/form', function(req, res) {
  res.render('form');
});

router.get('/result', function(req, res) {
  res.render('result', {
    name: req.query.name,
    age: req.query.age
  });
});


router.get('/greeting', function(req, res) {
  res.render('greeting');
});


router.get('/greeting-result', function(req, res) {

    let name = req.query.name;

    // Lấy dữ liệu ngày/tháng/năm từ form
    let day = parseInt(req.query.day);
    let month = parseInt(req.query.month) - 1; // Tháng trong JS bắt đầu từ 0
    let year = parseInt(req.query.year);

    let dob = new Date(year, month, day);
    let today = new Date();

    // Greeting theo giờ hiện tại
    let hour = today.getHours();
    let greeting = "Hello";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    // Tính tuổi (năm hiện tại - năm sinh)
    let age = today.getFullYear() - dob.getFullYear();

    // Sinh nhật năm nay
    let nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

    // Nếu sinh nhật năm nay đã qua → tính năm sau
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
        age++;  // tuổi ở kỳ sinh nhật tiếp theo
    }

    // Số ngày còn lại
    let diffTime = nextBirthday - today;
    let daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    res.render('greeting-result', {
        name: name,
        greeting: greeting,
        nextAge: age,
        daysLeft: daysLeft
    });
});






module.exports = router;
