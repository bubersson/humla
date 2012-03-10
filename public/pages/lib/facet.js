var toLoad =     [
{
    property: "Slide: Importance",
    shortName: "Slide_Importance",
    type: "value",
    url_simple: "/api/facets/Slide_Importance"
},
{
    property: "Slide: Keyword",
    type: "value",
    shortName: "Slide_Keyword",
    url_simple: "/api/facets/Slide_Keyword"
},
{
    property: "Slide: Type",
    type: "value",
    shortName: "Slide_Type",
    url_simple: "/api/facets/Slide_Type"
},
{
    property: "Google Books: Author",
    type: "value",
    shortName: "Slideindex_Gbook_Author",
    url_simple: "/api/facets/Slideindex_Gbook_Author"
},
{
    property: "Google Books: Category",
    type: "value",
    shortName: "Slideindex_Gbook_Category",
    url_simple: "/api/facets/Slideindex_Gbook_Category"
},
{
    property: "Google Drawing",
    type: "boolean",
    shortName: "Slideindex_Gdrawing",
    url_simple: "/api/facets/Slideindex_Gdrawing"
},
{
    property: "Github Code Snippet",
    type: "boolean",
    shortName: "Slideindex_Github",
    url_simple: "/api/facets/Slideindex_Github"
}
];
var container = new FacetedContainer();

window.onload = function(){
    for(var i=0;i<toLoad.length;i++){
        if(toLoad[i].type==="boolean"){
            loadBooleanInit(toLoad[i],i);
        }
            
        else
            loadValueInit(toLoad[i],i);
    }
};

function FacetedContainer(){
    this.criteria = [];
    
    this.addCriteria = function(key, value, type){
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].schemaproperty == key)
            {
                if(type==="boolean"){
                    this.criteria[i].value = (value.toLowerCase()==="yes")?true:false;    
                }else{
                    this.criteria[i].value = value;
                }
                return;
            }
        }
        
        
        if(type==="boolean"){
            this.criteria.push({
                schemaproperty: key, 
                value:  (value.toLowerCase()==="yes")?true:false, 
                type: type
            });
            
        }else{
            this.criteria.push({
                schemaproperty: key, 
                value: value, 
                type: type
            });
        }
    };
    
    this.removeCriteria = function(key, value, type){
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].schemaproperty == key)
            {
                this.criteria.splice(i,1);
                return;
            }
        }
    };
    
    this.performQuery = function(){
      
        var q = {};
        q.booleanQueries = [];
        q.valueQueries = [];
        
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].type === "boolean"){
                q.booleanQueries.push({
                    type: this.criteria[i].schemaproperty,
                    value: this.criteria[i].value
                });
            }else{
                q.valueQueries.push({
                    type: this.criteria[i].schemaproperty,
                    value: this.criteria[i].value
                });
            }   
        }
        
        var request = new XMLHttpRequest();
        request.open("POST", '/api/complexQuery/facets', true);
        request.setRequestHeader("Content-type", "application/json");
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                    var object = eval('(' + request.responseText + ')');
                    console.log(request.responseText);
                    $('#facet_results').empty();//= '';
                    var content = "<ul>";
                    for(var j=0;j<object.results.length;j++){
                        var _a = object.results[j].slideid.split("_");
                        var link = _a[0]+"/"+_a[1]+".html#/"+_a[2]+"/v1";
                        content+="<li><a href=\"http://127.0.0.1:1338/data/slides/"+link+"\">"+_a[0].toUpperCase()+" - "+_a[1].toUpperCase()+": "+object.results[j].title+"</a></li>";    
                }
                content+="</ul>"
                    $('#facet_results').append(content);
                }else{
                    document.getElementById('msg').innerHTML=request.status+": "+request.statusText;    
                }
            }
        };
        console.log(JSON.stringify(q));
        request.send(JSON.stringify(q));
    };
    
    this.contains =function(shortname){
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].schemaproperty == shortname)
                return true;
        }
        return false;
    };
    
    
}
function loadBooleanInit(object, index){
   
    var element = document.createElement('div'); 
    var content = "<span class=\"facet_title\">"+object.property+"</span>";
    content+="<ul class=\"facet_menu\"><li onClick=\"toggleFilter("+index+", this);\" >Yes</li>";
    content+="<li onClick=\"toggleFilter("+index+", this);\" >No</li></ul>";
    element.innerHTML = content;
    document.getElementById("facet_section").appendChild(element);
}
function loadValueInit(object, index){
    var request = new XMLHttpRequest();
    request.open("GET", "/api/facets/top/"+encodeURIComponent(object.shortName), true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                var resp = eval('(' + request.responseText + ')');
                
                var element = "<div><span class=\"facet_title\">"+object.property+"</span><ul class=\"facet_menu\">";
                for(var a in resp){
                 
                    element+="<li onClick=\"toggleFilter("+index+", this);\" >"+resp[a]._id+"</li>";    
                }
                
                element+="</ul></div>";
                $("#facet_section").append(element);
                
            }else{
                document.getElementById('msg').innerHTML='Cannot load '+course;
            }  
        }
    }
    request.send(null);     
}

function toggleFilter(index, element){
    var property = toLoad[index].shortName;
    if($(element).attr("class")!== "facet_selected"){
        container.addCriteria(property, $(element).text() ,toLoad[index].type);
        $(element).attr("class", "facet_selected");
        //    $(element).toggleClass("facet_selected");
        var parent = $(element).parent();
        $(parent).find('li').each(function(index,el){
            if(el!==element){
                $(el).attr("class","facet_notselected");
            }
        });
    }else{
        $(element).attr("class", "");
        var parent = $(element).parent();
        $(parent).find('li').each(function(index,el){
            $(el).attr("class","");
        });
        container.removeCriteria(property, $(element).text() ,toLoad[index].type);
    }
    
    container.performQuery();
}