var mongoose = require("mongoose"); 
var FacetRecord = mongoose.model("FacetRecord");
var Slideid = mongoose.model("Slideid");

var typePrefix =require("../facetengine_ext.js").prefix;
var thisType = "Algorithm";

exports.type = thisType;

exports.parse = function(mapping, course, lecture, data){ 
    var toProcess =[];
    for(var j=0;j<data.items.length;j++){
        if(typeof data.items[j].type!="undefined"){// should be always true since microdataparser returns only typed items
            for(var i=0; i< data.items[j].type.length;i++){
                if(data.items[j].type[i] === typePrefix+thisType){
                    try{
                        toProcess.push(data.items[j]);
                    }catch(e){
                        console.error("Problem parsing CodeSnippet_Language type "+e);
                    }
                }                   
            }
        }
    }
     parseAlgorithmBigOType(mapping, toProcess, course ,lecture);     
     parseAlgorithmTypeType(mapping, toProcess, course ,lecture);     
}


function parseAlgorithmTypeType(mapping, items, course, lecture){
      // only one call total (aka all slides and codesnippets at once)
    var arr = [];
    for(var a in mapping){
        arr.push(mapping[a]);
    }
    // array toInsert - contains all microdata - idealne assoc dle ugly ID
    
    var toInsert = {};
    for(var j=0;j<items.length;j++){
        toInsert[mapping[items[j].slideid]] = items[j];
    }

    if(items.length<1){
        // no items in html => delete all records
        
        var query = FacetRecord.remove({  // remove all existing records for Gbooks for given presentation
            type: typePrefix+thisType+"_Type"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err)
                console.error(err);
        });
        
        
        
    }
    
    var query = FacetRecord.find({  // remove all existing records for Gbooks for given presentation
        type: typePrefix+thisType+"_Type"
    });
    query.where('slideid').in(arr);  
    query.exec(function(err,data){
        if(err){
            console.error(err);
        }else{
            if(data.length>0){
                var data_toDelete= [];
                if(items.length>0){
                    for(var i=0;i<data.length;i++){   
                        var foundMatch = false;
                        for(var j=0;j<items.length;j++){   
                            if(data[i].slideid+'' === mapping[items[j].slideid]+'' && typeof items[j].properties.type!="undefined" && items[j].properties.type.length>0 &&
                                data[i].value === items[j].properties.type[0] && typeof items[j].properties.used=="undefined"){ // keep the untouched
                                items[j].properties.used = 1; // mark already processed microdata
                                delete toInsert[mapping[items[j].slideid]];
                                foundMatch = true;
                            }
                        }
                        if(!foundMatch){
                            data_toDelete.push(data[i]);
                        }
                    }
                
                    for(var a in toInsert){ // insert new records
                        if(typeof toInsert[a]!="undefined"){
                            var tmp = new FacetRecord();
                            tmp.type =typePrefix+thisType+"_Type";
                            tmp.value = toInsert[a].properties.type[0];
                            tmp.slideid = mapping[toInsert[a].slideid];
                            tmp.save(function(err){
                                if(err)
                                    throw "Problem saving FacetRecord "+": "+err;
                            });
                        }
                    }
                
                    for(var j=0;j<data_toDelete.length;j++){
                        data_toDelete[j].remove(function(err){
                            if(err)
                                console.error("Problem removing old FacetRecord Snippet");
                        });
                    }
                }else{ // nothing in HTML => delete all existing FR 
                    for(var j=0;j<data.length;j++){
                        data[j].remove(function(err){
                            if(err)
                                console.error("Problem removing old FacetRecord Snippet");
                        });
                    }
                }
            }else{ //insert all new record (no existing )
                for(var j=0;j<items.length;j++){   
                    if(typeof items[j].properties.language!="undefined" && items[j].properties.language.length>0){
                        var tmp = new FacetRecord();
                        tmp.type =typePrefix+thisType+"_Type";
                        tmp.value = items[j].properties.type[0];
                        tmp.slideid = mapping[items[j].slideid];
                        tmp.save(function(err){
                            if(err)
                                throw "Problem saving FacetRecord "+": "+err;
                        });
                    }    
                }
            }
        }
    });
}


function parseAlgorithmBigOType(mapping, items, course, lecture){
      // only one call total (aka all slides and codesnippets at once)
    var arr = [];
    for(var a in mapping){
        arr.push(mapping[a]);
    }
    // array toInsert - contains all microdata - idealne assoc dle ugly ID
    
    var toInsert = {};
    for(var j=0;j<items.length;j++){
        toInsert[mapping[items[j].slideid]] = items[j];
    }

    if(items.length<1){
        // no items in html => delete all records
        
        var query = FacetRecord.remove({  // remove all existing records for Gbooks for given presentation
            type: typePrefix+thisType+"_BigO"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err)
                console.error(err);
        });
        
        
        
    }
    
    var query = FacetRecord.find({  // remove all existing records for Gbooks for given presentation
        type: typePrefix+thisType+"_BigO"
    });
    query.where('slideid').in(arr);  
    query.exec(function(err,data){
        if(err){
            console.error(err);
        }else{
            if(data.length>0){
                var data_toDelete= [];
                if(items.length>0){
                    for(var i=0;i<data.length;i++){   
                        var foundMatch = false;
                        for(var j=0;j<items.length;j++){   
                            if(data[i].slideid+'' === mapping[items[j].slideid]+'' && typeof items[j].properties.bigO!="undefined" && items[j].properties.bigO.length>0 &&
                                data[i].value === items[j].properties.bigO[0] && typeof items[j].properties.used=="undefined"){ // keep the untouched
                                items[j].properties.used = 1; // mark already processed microdata
                                delete toInsert[mapping[items[j].slideid]];
                                foundMatch = true;
                            }
                        }
                        if(!foundMatch){
                            data_toDelete.push(data[i]);
                        }
                    }
                
                    for(var a in toInsert){ // insert new records
                        if(typeof toInsert[a]!="undefined"){
                            var tmp = new FacetRecord();
                            tmp.type =typePrefix+thisType+"_BigO";
                            tmp.value = toInsert[a].properties.bigO[0];
                            tmp.slideid = mapping[toInsert[a].slideid];
                            tmp.save(function(err){
                                if(err)
                                    throw "Problem saving FacetRecord "+": "+err;
                            });
                        }
                    }
                
                    for(var j=0;j<data_toDelete.length;j++){
                        data_toDelete[j].remove(function(err){
                            if(err)
                                console.error("Problem removing old FacetRecord Snippet");
                        });
                    }
                }else{ // nothing in HTML => delete all existing FR 
                    for(var j=0;j<data.length;j++){
                        data[j].remove(function(err){
                            if(err)
                                console.error("Problem removing old FacetRecord Snippet");
                        });
                    }
                }
            }else{ //insert all new record (no existing )
                for(var j=0;j<items.length;j++){   
                    if(typeof items[j].properties.language!="undefined" && items[j].properties.language.length>0){
                        var tmp = new FacetRecord();
                        tmp.type =typePrefix+thisType+"_BigO";
                        tmp.value = items[j].properties.bigO[0];
                        tmp.slideid = mapping[items[j].slideid];
                        tmp.save(function(err){
                            if(err)
                                throw "Problem saving FacetRecord "+": "+err;
                        });
                    }    
                }
            }
        }
    });
}