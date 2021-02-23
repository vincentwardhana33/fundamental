var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = require('express-fileupload');
app.use(upload())

const uniqid = require('uniqid');
const fs = require('fs');

let products = [];

app.get('/', function(req, res){
    let response = {
        nama: "Vincent",
        usia: 25
    }

    res.json(response);
})

app.get('/product/:product_id?', function(req, res){
    if (req.params.product_id){
        for (var i=0; i<products.length; i++){
            if (products[i].id == req.params.product_id) {
                res.json(products[i]);
                return;
            }
        }
    }

    res.json(products);
})

app.get('/search', function(req, res){
    const keyword = req.query.keyword;
    const category = req.query.category;
    const location = req.query.location;

    console.log(req.query);
    
    res.json(products);
})

app.get('/satu', function(req, res){
    res.render('satu', {
        products
    });
})

app.get('/dua/:product_id', function(req, res){
    let product = {};
    for (var i=0; i<products.length; i++){
        if (products[i].id == req.params.product_id) product = products[i];
    }

    res.render('dua', {
        product
    });
})

app.post('/product/add', function(req, res){
    let product_id;
    if (products.length > 0) product_id = (products[products.length - 1].id + 1);
    else product_id = 1;

    let data = {
        id: product_id,
        name: req.body.name,
        price: parseInt(req.body.price),
        description: req.body.description
    };

    if(req.files){
        let file = req.files.product_image;
        let extension = file.name.split('.');
        extension = extension[extension.length - 1];
        let filename = `${uniqid()}.${extension}`;

        file.mv(`./assets/images/${filename}`, function(err){
            if (err) console.log(err);
        })

        data.image_filename = filename;
    }

    products.push(data);
    
    res.json({
        success: true,
        return: data
    })
})

app.patch('/product/edit/:product_id', function(req, res){
    let image_filename;
    if(req.files){
        let file = req.files.product_image;
        let extension = file.name.split('.');
        extension = extension[extension.length - 1];
        let filename = `${uniqid()}.${extension}`;

        file.mv(`./assets/images/${filename}`, function(err){
            if (err) console.log(err);
        })

        image_filename = filename;
    }

    for (var i=0; i<products.length; i++){
        if (products[i].id == req.params.product_id){
            products[i].name = req.body.name;
            products[i].price = req.body.price;
            products[i].description = req.body.description;
            if (image_filename){
                fs.unlinkSync(`./assets/images/${products[i].image_filename}`);
                products[i].image_filename = image_filename;
            }
        }
    }
    
    res.json({
        success: true,
        return: products
    })
})

app.delete('/product/delete/:product_id', function(req, res){
    for (var i=0; i<products.length; i++){
        if (products[i].id == req.params.product_id){
            fs.unlinkSync(`./assets/images/${products[i].image_filename}`);
            products.splice(i, 1);
        }
    }
    
    res.json({
        success: true,
        products
    })
})

app.get('/*', function(req, res){
    res.send('<h1>404 Not Found</h1>');
})

app.listen(3001);
