//Require all dependencies
const express = require('express');
// For uploading images
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const app = express();
// Require the fs module for deleting the image
const fs = require('fs');

//Connect to the db
mongoose.connect('mongodb://localhost:27017/formidable', { useUnifiedTopology: true ,  useNewUrlParser: true  })

//Set up the view engine
app.set('view engine', 'pug');
app.set('views', './views');

//We initialize the middlewares
app.use(fileUpload());
app.use('/uploads' , express.static('uploads'));
app.use(express.urlencoded({extended: true}))

//Create a Schema for our data
const uploadSchema = mongoose.Schema({
    fileName: String,
    filePath: String
})
//Create a model then for the data
const Upload = mongoose.model('UploadTwo', uploadSchema);

//Route serving our default page
app.get('/', (req, res)=>{
    //We query the db for the data in the db and display on page
    Upload.find((err, uploads)=>{
        if(err) console.log(err);
        res.render('home', {title: "Home page", uploads: uploads})
    })
})

//Route to handle the upload of the client
app.post('/', async (req, res)=>{
    //We access all the image metadata on the req.files.filePath
    let imageFile = req.files.filePath;
    // Then define the storage path by prepending the upload folder on the imageFile.name property
    let uploadPath = './uploads/' + imageFile.name;
    // console.log(imageFile.name)
    // console.log(uploadPath)

    //Create and instance of the Upload model
    const upload = new Upload();
    upload.fileName = req.body.fileName;
    upload.filePath = uploadPath; //We assign the upload path to be stored in DB

    try {
        // We move the image using the mv(move) to the directory specified
        await imageFile.mv(uploadPath);
        // Then after we store the document in DB and redirect to home page
        await upload.save((err, result)=>{
            if(err) console.log(err);
            res.redirect('/')
        })  
    } catch(error){
        console.log(error)
    }
})

// Deleting the document with the image
app.get('/delete/:id', (req, res)=>{
    // Store the params id in a query variabel
    let query = req.params.id;
    // Find document by id and delete it, parse the filePath to the delete function
    Upload.findByIdAndDelete(query, (err, upload)=>{
        if (err) throw err;
        // Follow the path and delete the image
        fs.unlink(upload.filePath, (err)=>{
            if(err) throw err;
            // Then redirect to homepage
            res.redirect('/');
        })
    })
})

// Listen on 3000
app.listen(3000, ()=> console.log('Server started on 3000'));

