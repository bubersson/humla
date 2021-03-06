var fs = require("fs");
var path = require("path");
var RAW_SLIDES_DIRECTORY = config.server.slides_raw_path;
var SLIDES_DIRECTORY =config.server.slides_relative_path;
var SLIDE_TEMPLATE = config.server.templates_relative_path;
var facet_use_fs = 1;
var mongoose = require("mongoose"); 
var Course = mongoose.model("Course");
var Lecture = mongoose.model("Lecture");


// TODO: make those methods accessible via Humla as a Framework
exports.getAllCoursesList = function (callback){
    Course.find({
        isActive:true        
    }, function(err,crs){   
        if(!err && crs.length > 0) {
            var courses = [];
            crs.forEach(function(course){
                var c = {};
                c.courseID = course.courseID;
                c.longName = course.longName;
                c.lecturesURLPreffix = course.lecturesURLPreffix;
                c.url=course.url;
                c.owner = course.owner;
                c.isActive = course.isActive;
                courses.push(c);
            });
            callback(courses);
        } else {
            getCoursesFromFS(req, res);
        }             
    });
    
}

/**
 * Returns all courses
 */
app.get('/api/info/courses', function(req, res){
    Course.find({
        isActive:true
        
    }, function(err,crs){   
        //        if(false){
        if(!err && crs.length > 0) {
            var courses = [];
            crs.forEach(function(course){
                var c = {};
                c.courseID = course.courseID;
                c.longName = course.longName;
                c.lecturesURLPreffix = course.lecturesURLPreffix;
                c.url=course.url;
                c.owner = course.owner;
                c.isActive = course.isActive;
                courses.push(c);
            });
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.write(JSON.stringify(courses, null, 4));
            res.end();  
        } else {
            getCoursesFromFS(req, res);
        }             
    });
}
);
    
    
/**
 * Returns all lectures for given course
 */
app.get('/api/info/:course/lectures', function(req, res){
    var course = req.params.course;
    Lecture.find({
        isActive:true,
        courseID: course
        
    }, function(err,lectures){
        if(!err && lectures.length > 0) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            for(var j=0;j<lectures.length;j++){
                lectures[j].authorID = null; // TODO check is hidden
                lectures[j].coauthors = null;
            }
            
            res.write(JSON.stringify(lectures, null, 4));
            res.end();  
        } else {
            getLecturesFromFS(req, res, course);
        }             
    });
});
    

function getCoursesFromFS(req, res){
    fs.readdir(SLIDES_DIRECTORY, function(err, list) {
        
        if(err){
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.write('404 Not found');
            res.end();
        }else{  
            var list2 = [];
            for(var a in list){
                if(list[a].indexOf(".xml")<0){
                    list2.push(list[a]);
                }
            }
        
        
            saveCoursesToDB(req,list);
        
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify(list, null, 4));
            res.end();
        }
    });
}

function saveCoursesToDB(req,courses){
    courses.forEach(function(course){
        
        var c = new Course();
        c.longName = course; // fallback, this way courses are not supposed to be created => UI needed for it
        c.isActive = true;
        c.url = '';
        c.lecturesURLPreffix = req.headers.host+RAW_SLIDES_DIRECTORY+course;
        c.courseID = course;
        c.owner = "";
        c.save(function(err) {
            if(err) {
                console.log("ERR "+err);
            }
        });
    });
}

function saveLecturesToDB(req, lectures, course){
    lectures.forEach(function(lec){
        var c = new Lecture();
        c.courseID = course;
        c.title = lec;// fallback, this way lectures are not supposed to be created => UI needed for it
        c.lectureID = lec; 
        c.url = ''; 
        c.isActive = true;
        c.presentationURL = req.headers.host+ RAW_SLIDES_DIRECTORY+course+"/"+lec;
        c.save(function(err) {
            if(err) {
                console.log("ERR "+err);
            }
        });
    });
}

function getLecturesFromFS(req, res, course){
    var files2 = new Array();
    fs.readdir(SLIDES_DIRECTORY+course, function(err, list) {
        
        if(err){
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.write('404 Not found '+err);
            res.end();
        }else{
            
            list.forEach(function(file){              
                if(endsWith(file, ".html")){
                    files2.push(file);
                }
            });
            saveLecturesToDB(req, files2, course);
            var files = JSON.stringify(files2, null, 4);
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.write(files);
            res.end(); 
        }
    });
}

/**
 * Tests if string ends with given suffix
 */
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}