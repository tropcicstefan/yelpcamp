var express = require("express"),
app = express(),
mongoose = require("mongoose"),
bodyParser = require("body-parser"),
Campground = require("./models/campground"),
Comment = require("./models/comment"),
seedDB = require("./seeds");

mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});


seedDB();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); //protects us from future moving

app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/campgrounds", function(req, res) {
    Campground.find({}, function(err, allcampgrounds){
        if(err) {console.log(err);}
        else{
            res.render("campground/indexcamp",{campGrounds:allcampgrounds});
        }
    });
    
});

app.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name: name, image: image, description: description};
    //campGrounds.push(newCampground);
    Campground.create(newCampground, function(err, campground){
        if(err) {console.log(err);}
        else {res.redirect("/campgrounds");}
    });
});

app.get("/campgrounds/new", function(req, res){
    res.render("campground/new");
});


// SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campground/show", {campground: foundCampground});
        }
    });
});


// New Comment
app.get("/campgrounds/:id/comments/new", function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {campground: campground});
        }
    });
    
});

app.post("/campgrounds/:id/comments", function (req, res) {
   Campground.findById(req.params.id, function(err, campground) {
      if(err){
          console.log(err);
          res.redirect("/campgrounds");
      } else{
          Comment.create(req.body.comment, function(err, comment){
             if(err){
                 console.log(err);
             } else{
                 campground.comments.push(comment);
                 campground.save();
                 res.redirect("/campgrounds/" + campground._id);
             }
          });
      }
   });
});





app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started");
});