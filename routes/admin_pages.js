var mongoose = require('mongoose')
var express = require('express')
var router = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator()); 
editpage = require('../controller/adminpage')
var Page = require('../models/page')
var ObjectId = require('mongodb').ObjectID;
const { json } = require('body-parser');
require('../db/database')
// Get pages index
router.get('/',(req,res)=>{
    Page.find({}).sort({sorting:1}).exec(function(err,pages){
        res.render('admin/pages',{
            pages:pages
        });
    });
});

// Get add page

router.get('/add-page', (req,res)=>{
    var title = ""
    var slug = ""
    var content = ""

    res.render('admin/add-page',{
        title: title,
        slug:slug,
        content:content
    })
})

// Post add page

router.post('/add-page',(req,res)=>{
    req.checkBody('title', "Title must have a value").notEmpty();
    req.checkBody('content',"Content must have a value").notEmpty();
    
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g,'-').toLowerCase();
    var content= req.body.content;

    var errors = req.validationErrors();
        if(errors){
            console.log(errors)
            res.render('admin/add-page',{
                errors: errors,
                title: title,
                slug:slug,
                content:content
            });

        } else{
            Page.findOne({slug:slug}, function(err,page){
                if(page){
                    req.flash('danger',"Page Slug Exists, Choose another");
                    res.render("/admin/add-page",{
                        title:title,
                        slug:slug,
                        content:content
                    });
                } else {
                    var page = new Page({
                        title:title,
                        slug:slug,
                        content:content,
                        sorting:100
                    });
                    page.save(function(err){
                        if(err)return console.log(err)
                        req.flash('success',"Page succesfully added");
                        res.redirect('/admin')
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