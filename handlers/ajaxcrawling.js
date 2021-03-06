/**
 * AJAX Crawling handler
 * 
 * Only slides are AJAX Crawable
 *
 * @author Petr Mikota <bubersson> URL: https://github.com/bubersson 
 */


var fs   = require('fs');
var path = require('path');
var CRAWL_FILE = (path.join(path.dirname(__filename), '../public/pages/slidecrawl.html')).toString();
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var jquery = fs.readFileSync('./public/lib/jquery-1.7.min.js').toString();
var jsdom = require('jsdom');


/** Make slides AJAX Crawable
 *  -  get one slide HTML
 *
 *
 * TODO: přidávat do slajdů i linky na obrázky, zdrojáky a další věci z pluginů
 * TODO: Doplnit ty vlastnosti o přednáškách  - ty meta tagy
 **/
app.get('/data/slides/:course/:lecture', function(req, res, next) {                
    if(req.query.hasOwnProperty('_escaped_fragment_')) {  //TODO: odchytávat ten escaped fragment rovnou v parametru getu?
        //vstup: #!/1/v1
        var fragment = req.query['_escaped_fragment_'].split("/",2)[1]; // first thing between "/"
        var p = req.params;             
       
        jsdom.env({
            html: SLIDES_DIRECTORY+"/"+p.course+"/"+p.lecture,
            src: [
            jquery
            ],
            done: function(errors, window) {
                if(errors){
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    res.write('Error while parsing document by jsdom');
                    res.end();   
                }else{
                    try{
                        var $ = window.$;                                                                
                                
                        $('title').text("Nadpis");
                        
                        //get all slides
                        var fr = parseInt(fragment);
                        //check aliases 
                        var $slide = fr? $(".slide")[parseInt(fragment)] : $("#"+fragment).get(0);
                        
                                           
                        jsdom.env({
                            html: CRAWL_FILE,
                            src: [
                            jquery
                            ], 
                            done: function(errors, crawlwindow) {
                                if(errors){
                                    res.writeHead(500, {
                                        'Content-Type': 'text/plain'
                                    });
                                    res.write('Error while parsing document by jsdom');
                                    res.end();   
                                }else{
                                    var $2 = crawlwindow.$;  
                                    $2("#slide").html($slide.innerHTML);
                                    
                                    res.writeHead(200, {
                                        'Content-Type': 'text/html',
                                        "Content-Encoding" : "utf-8"
                                    });
                                    var textdata = "<html>"+$2("html").html()+"</html>";
                                    res.write(textdata);
                                    res.end();   
                                    
                                }
                            }
                        });
                    }
                    catch(err){
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.write('Error while parsing document: '+err);
                        res.end();
                    }
                }
            }
        }); 
        
    } else {
        next();
    }
    
    
});