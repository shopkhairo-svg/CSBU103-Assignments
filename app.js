var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// 💡 THÊM MONGODB & MODEL
var mongoose = require('mongoose');
var User = require('./models/User'); // Import User model

// **KẾT NỐI MONGODB**
const DB_URL = 'mongodb+srv://week7_user:XCNO013uvuedGhqG@cluster0.rkecsxv.mongodb.net/?appName=Cluster0'; 

mongoose.connect(DB_URL)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error. Hãy kiểm tra chuỗi kết nối:', err));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 💡 THÊM ROUTES ĐĂNG KÝ
app.get('/register', (req, res) => {
    res.render('register'); // Render views/register.pug
});

app.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    // Regex Validation Backend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRuleRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;

    // 1. Backend Validation
    if (!username || !password || !confirmPassword) {
        return res.status(400).send('Lỗi: Vui lòng điền đủ các trường.');
    }
    if (password !== confirmPassword) {
        return res.status(400).send('Lỗi: Mật khẩu xác nhận không khớp.');
    }
    if (!emailRegex.test(username)) {
        return res.status(400).send('Lỗi: Email không hợp lệ.');
    }
    if (!passwordRuleRegex.test(password)) {
        return res.status(400).send('Lỗi: Mật khẩu phải dài >= 6 ký tự, có 1 số, 1 ký tự đặc biệt.');
    }

    try {
        // 2. Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).send('Lỗi: Email này đã được đăng ký.');
        }

        // 3. Tạo User và Lưu Database
        const newUser = new User({ username, password }); 
        await newUser.save();

        res.status(201).send('Đăng ký thành công! User đã được lưu vào MongoDB.');

    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).send('Lỗi máy chủ.');
    }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;