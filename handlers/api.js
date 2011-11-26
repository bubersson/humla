/**
 * REST handlers
 * - Standard api handler 
 * - backend for main page
 * TODO: loading from FS universal
 * 
 * 
 * TODO: !!!!!!!!!!!!!!!!!! merge with admin.js !!!! return whole structure of courses:lectures:slide(url, abstract)
 * 
 * 
 */

var fs = require("fs");
var path = require("path");
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var facet_use_fs = 1;
var mongoose = require("mongoose"); 
var Course = mongoose.model("Course");
var Lecture = mongoose.model("Lecture");


/**
 * Returns all courses with all lectures (with names and abstract)
 */
app.get('/api/data/courses', function(request, response){ // TODO database timeout
    Course.find({
        isActive:true
        
    }, function(err,crs){   
        if(!err && crs.length > 0) {
            var courses = new Array();
            
            crs.forEach(function(course){
                
                Lecture.find({ /// TODO: Tohle by mělo bejt v jednom findu --- sypat tam do db už celý data
                    isActive:true,
                    courseID: course
        
                }, function(err,lectures){
                    if(!err && lectures.length > 0) {
                        response.writeHead(200, {
                            "Content-Type": "application/json"
                        });
                        response.write(JSON.stringify(lectures, null, 4));
                        response.end();  
                    } else {
                        getLecturesFromFS(request, response, course);
                    }             
                });
                
                
                var c = {};
                c.courseID = course.courseID;
                c.longName = course.longName;
                c.lecturesURLPreffix = course.lecturesURLPreffix;
                c.url=course.url;
                c.owner = course.owner;
                c.isActive = course.isActive;
                courses.push(c);
            });
            response.writeHead(200, {
                "Content-Type": "application/json"
            });
            response.write(JSON.stringify(courses, null, 4));
            response.end();             
        } else {
            getCoursesFromFS(request, response);
        }             
    });
}
);


function getCoursesFromFS(request, response){
    fs.readdir(SLIDES_DIRECTORY, function(err, list) {
        
        if(err){
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not found');
            response.end();
        }else{  
            saveCoursesToDB(request,list);
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.write(JSON.stringify(list, null, 4));
            response.end();
        }
    });
}
function getLecturesFromFS(request, response, course){
    var files2 = new Array();
    fs.readdir(SLIDES_DIRECTORY+'/'+course, function(err, list) {
        
        if(err){
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not found '+err);
            response.end();
        }else{
            
            list.forEach(function(file){              
                if(endsWith(file, ".html")){
                    files2.push(file);
                }
            });
            saveLecturesToDB(request, files2, course);
            var files = JSON.stringify(files2, null, 4);
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.write(files);
            response.end(); 
        }
    });
}

/**
 * Tests if string ends with given suffix
 */
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}