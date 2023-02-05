const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
const frontendRouter = require('./routers/frontend');
const mongoose = require('mongoose');
const session = require('express-session')
const adminRouter = require('./routers/admin')

mongoose.connect('mongodb://127.0.0.1:27017/expressproject',()=> {
    console.log("connected to DBnodejs");
})




app.use(session({
    secret: 'rashmi',
    saveUninitialized: false,
    resave:false
}))
app.use('/admin',adminRouter)
app.use(frontendRouter);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.listen(7000, () => {
    console.log("servsr is running on port 7000");
})