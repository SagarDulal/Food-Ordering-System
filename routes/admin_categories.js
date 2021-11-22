
var express = require('express')
var router = express.Router();

var expressValidator = require('express-validator');
router.use(expressValidator()); 

// Get  category Model
var Category = require('../models/category')



// Get pages index. Working fine 
router.get('/',(req,res)=>{
    Category.find((err,categories)=>{
        if(err){console.log(err)}
        res.render('admin/categories',{
            categories:categories
    }); 
        });
    });





// Get add category .. Working fine 
router.get('/add-category', (req,res)=>{
    var title = "";

    res.render('admin/add-category',{
        title: title
    })
})




// Post add page .. Posting  new category in the database .. Working fine
router.post('/add-category',(req,res)=>{
    req.checkBody('title', "Title must have a value").notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();

    var errors = req.validationErrors();
        if(errors){
            console.log(errors)
            res.render('admin/add-category',{
                errors: errors,
                title: title,
            
            });

        } else{
            Category.findOne({slug:slug}, function(err,category){
                if(category){
                    req.flash('danger',"Category Title Exists , Choose another");
                    res.render("/admin/add-category",{
                        title:title,
                        
                    });
                } else {
                    var category = new Category({
                        title:title,
                        slug:slug
                        
                    });
                    category.save(function(err){
                        if(err)return console.log(err)
                        req.flash('success',"Category succesfully added");
                        res.redirect('/admin/categories')
                    });
                }
            });
        }
});



// Get Edit Category . Getting the edit category pages
router.get('/edit-category/:id', (req, res) => {

    Category.findById(req.params.id).then((category) => {
      if(!category) { //if page not exist in db
        return res.status(404).send('Category not By found');
      }
      res.render('admin/edit-category', { //page  exist
        title: category.title,
        id: category._id
      });
    }).catch((e) => {//bad request 
      res.status(400).send(e);
    });
  });
  





//  Post edit page  Working fine 
router.post('/edit-category/:id', (req,res)=>{
    req.checkBody('title', "Title must have a value").notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();
    var id = req.params.id

    var errors = req.validationErrors();
        if(errors){
            console.log(errors)
            res.render('admin/edit-category',{
                errors: errors,
                title: title,
                id: id
            });
        } else{
            Category.findOne({slug:slug, "id":{'$ne':id}}, function(err,category){
                if(category){
                    req.flash('danger',"Category Title  Already Exists, Choose another");
                    res.render("admin/edit-category",{
                        title:title,
                        id:id
                    });
                } else {
                    Category.findById(id, function(err,category){
                        console.log(id)
                        if(err){ return console.log(err);}
                        else{
                            
                            category.title = title;
                            category.slug = slug;
                            console.log(title)
                            console.log(slug)
                           console.log(category)
                           category.save(function(err,page){
                            if(err){console.log(err)}
                            req.flash("success", "Category Edited")
                            res.redirect('/admin/categories')
                        })
                        
                        }
                    })
                }
            });
        }
});





// Get Delete Category  . Working fine 

router.get('/delete-category/:id', (req,res)=>{
    Category.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            console.log(err)
        }
        else{
            req.flash('success', "Category Deleted")
            res.redirect('/admin/categories')
        }
    });
});



module.exports = router