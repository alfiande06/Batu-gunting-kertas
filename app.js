const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk menguraikan body dari request HTTP
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk penyediaan file statis dari folder 'assets'
app.use('/assets', express.static(__dirname + '/assets'));

// Middleware untuk penyediaan file statis dari folder 'views'
app.use('/views', express.static(__dirname + '/views'));

// Middleware untuk penyediaan file statis dari folder 'controller'
app.use('/controllers', express.static(__dirname + '/controllers'));

// Set view engine ke EJS
app.set('view engine', 'ejs');

// Routes
app.get('/index.html', function (req, res){
    res.sendFile(__dirname + '/views/index.html');
});

// Port binding
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});