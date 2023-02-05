const router = require('express').Router();
const Admin = require('../models/adminlogin')
const Banner = require('../models/banner')
const Query = require('../models/query')
const nodemailer = require('nodemailer')
const Testi = require('../models/testi')
const multer = require('multer')
const Services = require('../models/services')
const Reg = require('../models/registration')
const Parking = require('../models/parking')



const storage =  multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,'./public/upload')
    },
    filename: function (req, file, cb) {
       cb(null, Date.now()+file.originalname)
   }         
})

const upload =  multer({
    storage: storage,
    limits:{fileSize:1024*1024*4}
})

function handlelogin(req, res, next){
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect('/admin/')
    }
}




router.get('/',(req, res)=> {
    res.render('admin/adminlogin.ejs')
})

router.post('/loginrouter',async(req, res)=> {
    // console.log(req.body);
    const { username, password } = req.body;
    const d = await Admin.findOne({ username: username });
    // console.log(d);
    if (d !== null) {
        if (d.password == password) {
            req.session.isAuth = true;
            res.redirect('/admin/dashboard');
        }
        else {
            res.redirect('/admin/');           
        }
 }
    else {
        res.redirect('/admin/'); 
    }
})

router.get('/dashboard',handlelogin,(req, res) => {
    res.render('admin/admindashboard.ejs')
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/');
})

router.get('/banner', async (req, res) => {
    const bannerRecord = await Banner.findOne();
    res.render('admin/banner.ejs',{bannerRecord})
})

router.get('/bannerupdate/:abc',async (req, res) => {
    // console.log(req.params.abc);
    const id = req.params.abc;
    const bannerRecord= await Banner.findById(id)
    res.render('admin/bannerupdate.ejs',{bannerRecord})
})

router.post('/bannerform/:xyz', upload.single('img'), async (req, res) => {
    // console.log(req.file)
    const id = req.params.xyz
    const { bt, bd, bl } = req.body
    if (req.file){
    await Banner.findByIdAndUpdate(id, { title: bt, desc: bd, longdesc: bl,bannerImage:req.file.filename });
    }
    else {
    await Banner.findByIdAndUpdate(id, { title: bt, desc: bd, longdesc: bl});      
    }
    res.redirect('/admin/banner');
})

router.get('/query', async(req, res) => {
    const queryRecord = await Query.find().sort({postedDate:-1});
    res.render('admin/query.ejs',{queryRecord})
})

router.get('/query/:abc', async (req, res) => {
    const id = req.params.abc;
    const queryRecord = await Query.findById(id);
    console.log(queryRecord);
    let newstatus = null;
    if (queryRecord.status == 'unread') {
        newstatus='read'
    } else {
        newstatus='unread'        
    }
    await Query.findByIdAndUpdate(id, { status: newstatus })
    res.redirect('/admin/query');
})

router.get('/email/:abc', (req, res) => {
    const id = req.params.abc
    res.render('admin/email.ejs',{id})
})

router.post('/emailrecord/:abc',async (req, res) => {
    
    const id = req.params.abc
    const useremail = await Query.findById(req.params.abc)
    
    const { emailto, subject, body } = req.body;
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'xy958781@gmail.com', // generated ethereal user
          pass: 'mvdbgvlpxhruaivs', // generated ethereal password
      },
    });
    let info = await transporter.sendMail({
        from: 'xy958781@gmail.com', // sender address
        to: useremail.email, // list of receivers
        subject: subject, // Subject line
        text: body, // plain text body
        //   html: "<b>Hello world?</b>", // html body
        attachments: [{
            path: 'public/media/build1.jpg'
        }]
    });
    await Query.findByIdAndUpdate(id,{status:'read'});
    res.redirect('/admin/query')
      
})
  
router.get('/querydelete/:abc', async (req, res) => {
    const id = req.params.abc;
    await Testi.findByIdAndDelete(id);
    res.redirect('/admin/query');
})

router.get('/testi', async (req, res) => {
    const testirecords = await Testi.find().sort({postedDate:-1});
    const totaltesti = await Testi.count();
    const totalpublished = await Testi.count({ status: 'published' });
    const totalunpublished = await Testi.count({ status: 'unpublished' });
    // console.log(totaltesti);
    // console.log(totalpublished);
    // console.log(totalunpublished);
     res.render('admin/testi.ejs',{testirecords,totaltesti,totalpublished,totalunpublished})
})
 
router.get('/testiupdate/:abc',async (req, res) => {
    const id = req.params.abc
    const testirecord = await Testi.findById(id)
    let newStatus = null
    if (testirecord.status == 'unpublished') {
        newStatus='published'
    }
    else {
        newStatus='unpublished'      
    }
    await Testi.findByIdAndUpdate(id, { status: newStatus })
    res.redirect('/admin/testi')

})

router.get('/testidelete/:abc', async (req, res) => {
    const id = req.params.abc;
    await Testi.findByIdAndDelete(id);
    res.redirect('/admin/testi');
})

router.get('/services',async (req, res) => {
    const servicerecord = await Services.find().sort({ postedDate: -1 });
    res.render('admin/services.ejs',{servicerecord})
})

router.get('/serviceadd', (req, res) => {
    res.render('admin/serviceform.ejs')
})

router.post('/servicerecords',upload.single('simage') ,async(req, res) => {
    const imagename=  req.file.filename
    const { sname, desc, ld } = req.body
  const servicerecord=  new Services({image:imagename,serviceName:sname,serviceDesc:desc,serviceLongDesc:ld, status:'unpublished',postedDate:new Date() })
    await servicerecord.save();
   // console.log(servicerecord);
    res.redirect('/admin/services')
})

router.get('/serviceupdate/:abc', async (req, res) => {
    const id = req.params.abc
    const servicerecord = await Services.findById(id)
    let newStatus = null
    if (servicerecord.status == 'unpublished') {
        newStatus='published'
    }
    else {
        newStatus='unpublished'      
    }
    await Services.findByIdAndUpdate(id, { status: newStatus })
    res.redirect('/admin/services')
})

router.get('/servicedelete/:abc', async (req, res) => {
    const id = req.params.abc;
    await Testi.findByIdAndDelete(id);
    res.redirect('/admin/service');
})

router.get('/user',async (req, res) => {
    const records = await Reg.find()
  const usercount=  await Reg.count()
  const useractive=  await Reg.count({status:'active'})
  const userpvt=  await Reg.count({roles:'pvt'})
  const userpublic=  await Reg.count({roles:'public'})
    res.render('admin/user.ejs',{records,usercount,useractive,userpvt,userpublic})
})

router.get('/userupdate/:abc', async (req, res) => {
    const id = req.params.abc
    const userrecord = await Reg.findById(id)
    let newStatus = null
    if (userrecord.status == 'suspended') {
        newStatus='active'
    }
    else {
        newStatus='suspended'      
    }
    await Reg.findByIdAndUpdate(id, { status: newStatus })
    res.redirect('/admin/user')
})

router.get('/rolesupdate/:abc',async (req, res) => {
    const id = req.params.abc;
    const regrecord = await Reg.findById(id)
    let newrole = null
    if (regrecord.roles == 'public') {
     newrole='pvt'   
    } else {
        newrole='public'
    }
    await Reg.findByIdAndUpdate(id, { roles: newrole })
    res.redirect('/admin/user')
})

router.get('/userdelete/:abc', async (req, res) => {
    const id = req.params.abc;
    await Reg.findByIdAndDelete(id);
    res.redirect('/admin/user');
})

router.post('/profileupdate/:abc', (req, res) => {
    console.log(req.params.abc)
    console.log(req.body)
})



router.get('/parking', async (req, res) => {
    const parkingrecord = await Parking.find()
    const parkingstatus = await Parking.count({ status: 'IN' })
    console.log(parkingstatus)
    let ParkingLot = 100;
    let VaccantSpot = (100 - parkingstatus);
   // console.log(VaccantSpot)
    res.render('admin/parking.ejs',{parkingrecord,parkingstatus,VaccantSpot})
    
})

router.get('/parkingadd', (req, res) => {
    res.render('admin/parkingform.ejs')
    
})


router.post('/parkingrecord', async (req, res) => {
    let nowdate= new Date()
    const { vno, vtype } = req.body
    const parkingrecord = new Parking({ vnumber: vno, vtype: vtype, vintime: nowdate, vouttime: '', amountcharged: '' ,status:'IN'})
    await parkingrecord.save()
    //console.log(parkingrecord)
    res.redirect('/admin/parking')
})

router.get('/parkingupdate/:abc', (req, res) => {
    const id = req.params.abc;
    res.render('admin/parkingupdate.ejs',{id})
})

router.get('/parkingout/:abc', async(req, res) => {
const id = req.params.abc
let nowdate=new Date()
    const parkingrecord = await Parking.findById(id)
   // console.log(parkingrecord)
    let totalTime = (new Date(nowdate) - new Date(parkingrecord.vintime))/(1000*60*60)
   console.log(totalTime)
    let amount = null 
    if (parkingrecord.vtype == '2w') {
        amount=Math.round(totalTime*30)
    }
    
    else if (parkingrecord.vtype == '4w') {
        amount= Math.round(totalTime*50)
    }
    else if (parkingrecord.vtype == 'lv') {
        amount= Math.round(totalTime*90)
    }
    else if (parkingrecord.vtype == 'hv') {
        amount= Math.round(totalTime*110)
    }

    await Parking.findByIdAndUpdate(id, { vouttime: nowdate, amountcharged: amount, status: 'OUT' })
    res.redirect('/admin/parking')
})

router.get('/parkingprint/:abc',async (req, res) => {
   const id = req.params.abc
   const parkingrecord=  await Parking.findById(id)
    
    res.render('admin/parkingprint.ejs',{parkingrecord})
})






//-------------------------------test url-------------------------//

router.get('/test', (req, res) => {
    // res.send("testing")

    const x = new Banner({title : 'banner title', desc: 'banner desc',longdesc:'long desc banner' });
    x.save();
})





module.exports = router;