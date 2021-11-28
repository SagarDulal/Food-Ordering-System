const multer = require('multer')
var express = require('express')
var router = express.Router();
var fs = require('fs-extra')
var mkdirp = require('mkdirp')
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload')
// var resizeImg = require('resize-img')
var expressValidator = require('express-validator');
require('../app.js')
const upload = require('../multer/multer')
const path = require('path')

router.use(expressValidator()); 
// Get Product Model
var Product = require('../models/product')

router.use(fileUpload());
// Get category Model
var Category = require('../models/category')




// Get products index
router.get('/', (req,res)=>{
    var count; 
     Product.count((err,c)=>{
        count = c; 
     
    });
  Product.find((err,products)=>{
        res.render('admin/products',{
            products : products,
            count: count
        });
    });
});

// Get add products

router.get('/add-product', (req,res)=>{
    var title = ""
    var desc = ""
    var price = ""

    Category.find((err,categories)=>{
        res.render('admin/add-product',{    
            title: title, 
            desc: desc,
            categories:categories,
            price: price,
    });
});
});


// Post add Category
router.post('/add-product', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});




// Get Edit Page
router.get('/edit-page/:slug', (req, res) => {
var slug = req.params.slug
    Page.findOne({slug : req.params.slug}).then((page) => {
      if(!page) { //if page not exist in db
        return res.status(404).send('Page not found');
      }
      res.render('admin/edit-page', { //page  exist
        title: page.title,
        slug: page.slug,
        content: page.content,
        id: page._id
      });
    }).catch((e) => {//bad request 
      res.status(400).send(e);
    });
  });
  

//  Post edit page
router.post('/edit-page/:id', (req,res)=>{
    req.checkBody('title', "Title must have a value").notEmpty();
    req.checkBody('content',"Content must have a value").notEmpty();
    
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g,'-').toLowerCase();
    var content= req.body.content;
    var id = req.body.id

    var errors = req.validationErrors();
        if(errors){
            console.log(errors)
            res.render('admin/edit-page',{
                errors: errors,
                title: title,
                slug:slug,
                content:content,
                id: id
            });
        } else{
            Page.findOne({slug:slug, "id":{'$ne':id}}, function(err,page){
                if(page){
                    req.flash('danger',"Page Slug Exists, Choose another");
                    res.render("admin/edit-page",{
                        title:title,
                        slug:slug,
                        content:content,
                        id:id
                    });
                } else {
                    Page.findById(id, function(err,page){
                        console.log(id)
                        
                        if(err){ return console.log(err);}
                        else{
                            
                            page.title = title;
                            page.slug = slug;
                            page.content = content;
                           page.save(function(err,page){
                            if(err){console.log(err)}
                            req.flash("success", "Page Edited")
                            res.redirect('/admin/')
                        })
                        
                        }
                    })
                }
            });
        }
});



// Get Delete page

router.get('/delete-page/:id', (req,res)=>{
    Page.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            console.log(err)
        }
        else{
            req.flash('success', "Page Deleted")
            res.redirect('/admin')
        }
    });
});


module.exports = router