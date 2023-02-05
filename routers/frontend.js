const router = require('express').Router();
const Banner = require('../models/banner')
const Query = require('../models/query')
const Testi = require('../models/testi')
const multer = require('multer')
const Services = require('../models/services')
const Reg = require('../models/registration')
const bcrypt = require('bcrypt')
let sess = null;

function handlerole(req, res, next) {
    if (sess.roles == 'pvt') {
        next()
    } else {
        res.send('You don t have rights to this page')
    }
}

function handlelogin(req, res, next) {
    if (req.session.isAuth) {
        next()
    } else {
        res.redirect('/login')
    }
}

let storage =  multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,'./public/upload')
    },
    filename: function (req, file, cb) {
       cb(null, Date.now()+file.originalname)
   }         
})

let upload =  multer({
    storage: storage,
    limits:{fileSize:1024*1024*4}
})



router.get('/',handlelogin,async (req, res) => {
    const bannerRecord = await Banner.findOne();
    const testirecords = await Testi.find({status:'published'});
    const servicerecords = await Services.find({status:'published'});
    // console.log(bannerRecord)
   console.log(sess.username)
    res.render('index.ejs',{bannerRecord,testirecords,servicerecords,loginuser:sess.username});
})

router.get('/banner', async(req, res) => {
    const bannerRecord = await Banner.findOne()
    if (sess !== null){
    res.render('banner.ejs',{bannerRecord, loginuser:sess.username})    
    } else {
    res.render('banner.ejs',{bannerRecord, loginuser:'USER'})    
        
    }
})

router.post('/queryform', (req, res) => {
    // console.log(req.body);
    let postedDate = new Date();
    const { email, username, query } = req.body
   const queryrecord= new Query({ email: email, username: username, query: query ,status:'unread',postedDate:postedDate });
    queryrecord.save()
    res.redirect('/')
})

router.get('/testi',handlerole, (req, res) => {
    if (sess !== null) {   
        res.render('testi.ejs', { loginuser: sess.username })
   }
    else {
        res.render('testi.ejs', { loginuser:'USER' })        
        }
})

router.post('/testirecords',upload.single('img'), async (req, res) => {
    // console.log(req.file)
    const { post, cname } = req.body
    const testirecords = new Testi({ post: post, cname: cname, status: 'unpublished',userImage:req.file.filename,postedDate:new Date()})
    await testirecords.save()
    // console.log(testirecords)
})

router.get('/services/:abc', async (req, res) => {
    const id = req.params.abc
   const servicerecord= await Services.findById(id)
    res.render('services.ejs',{servicerecord})
})

router.get('/reg', (req, res) => {
    if (sess !== null) {   
        res.render('reg.ejs', { loginuser: sess.username })
   }
    else {
        res.render('reg.ejs', { loginuser:'USER' })        
        }
    
})
router.post('/regrecord', async(req, res) => {
    const { username, password } = req.body;
  const convertedPassword =  await bcrypt.hash(password,10)
    const regrecord = new Reg({ username: username, password: convertedPassword, status:'suspended',roles:'public',firstname:'',lastname:'',email:'',image:''})
    await regrecord.save()
    res.redirect('/login')
    //  console.log(regrecord)
})

router.get('/login', (req, res) => {
    if (sess !== null) {   
        res.render('login.ejs', { loginuser: sess.username })
   }
    else {
        res.render('login.ejs', { loginuser:'USER' })        
        }
})

router.post('/loginrecord', async (req, res) => {
    const { user, pass } = req.body
    const record = await Reg.findOne({ username: user })
    console.log(record)
    if (record !== null) {
        const comparedpass= await bcrypt.compare(pass,record.password)
        if (comparedpass) {
            if (record.status =='active') {
                req.session.isAuth = true
                sess = req.session   //session call
                sess.username = user
                sess.roles=record.roles
                res.redirect('/')
            } else {
                res.send("Your account is suspended")
            }    
        } else {
            res.redirect('/login')
        }
    }
    else {
        res.redirect('/login')
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    sess = null;
    res.redirect('/login');

})

router.get('/profile',handlelogin,async (req, res) => {
    if (sess !== null) {
      const profilerecord=  await Reg.findOne({username:sess.username})
       console.log(profilerecord)
        res.render('profile.ejs', { profilerecord, loginuser: sess.username });     
    } else {
        res.render('profile.ejs', { loginuser: 'USER' });
    }
})

module.exports = router;