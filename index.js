var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var pokeDataUtil = require("./poke-data-util");
var _ = require("underscore");
var app = express();
var PORT = 3002;

// Restore original data into poke.json. 
// Leave this here if you want to restore the original dataset 
// and reverse the edits you made. 
// For example, if you add certain weaknesses to Squirtle, this
// will make sure Squirtle is reset back to its original state 
// after you restard your server. 
pokeDataUtil.restoreOriginalData();

// Load contents of poke.json into global variable. 
var _DATA = pokeDataUtil.loadData().pokemon;

/// Setup body-parser. No need to touch this.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//**********************************************************/
app.get("/", function(req, res) {
    // HINT: 
    // var contents = "";
    // _.each(_DATA, function(i) {
    //     contents += `<tr><td>1</td><td><a href="/pokemon/1">Nelson</a></td></tr>\n`;
    // })
    // var html = `<html>\n<body>\n<table>CONTENTS</table>\n</body>\n</html>`;
    // res.send(html);
    //res.send("UNIMPLEMENTED ENDPOINT");
    var contents = "";
    _.each(_DATA, function(i) {
        var id = i.id;
        var name = i.name;
        //contents += `<tr><td>1</td><td>` + id + `</a></td></tr>\n`
         contents += `<tr><td>` + id + `</td><td><a href= "/pokemon/`+ id + `">` + name + `</a></td></tr>\n`;
     })
     var html = `<html>\n<body>\n<table>` + contents + `</table>\n</body>\n</html>`;
     res.send(html);
});
//******************************************* */
app.get("/pokemon/:pokemon_id", function(req, res) {
    // HINT : 
    // <tr><td>${i}</td><td>${JSON.stringify(result[i])}</td></tr>\n`;
    var _id = parseInt(req.params.pokemon_id);
    var contents = "";
    var _result = _.findWhere(_DATA, { id: _id })
    //console.log(_result)
    //console.log("done");
   _.each(_result, function(value,key) {
    contents += `<tr><td>` + key + `</td><td>` + JSON.stringify(value) + `</td></tr>`;
     // contents += `<tr><td>` + key + `</td><td>` + JSON.stringify(value) + `</td></tr>`
       // console.log(key);
        //console.log(value);
        //console.log(contents);
    })
    var html =`<html>\n<body>\n<table>` + contents + `</table>\n</body>\n</html>`;
    res.send(html); 
   // res.send("UNIMPLEMENTED ENDPOINT");
});
//********************************************************************* */
app.get("/pokemon/image/:pokemon_id", function(req, res) {
    var _id = parseInt(req.params.pokemon_id);
    var contents = "";
    var _result = _.findWhere(_DATA, { id: _id })
    var value = _result.img;
    var html =`<html>\n<body>\n<img src= ` + value + `>\n</body>\n</html>`;
     res.send(html);
});
//********************************************* */
app.get("/api/id/:pokemon_id", function(req, res) {
    // This endpoint has been completed for you.  
    var _id = parseInt(req.params.pokemon_id);
    console.log(_id);
    var result = _.findWhere(_DATA, { id: _id })
   // console.log(result);
    if (!result) return res.json({});
    res.json(result);
});


//***************************************** */
app.get("/api/evochain/:pokemon_name", function(req, res) {
    var _name = req.params.pokemon_name;
   // console.log(name);
    var result = _.findWhere(_DATA, { name: _name })
    // var result = _.findWhere(_DATA, { name: _name }); 
    //console.log(result);

    if (!result) return res.json([]);
    var answer = [];
    answer.push(_name);
    
    var temp = result.prev_evolution;
   // console.log(temp);
    _.each(temp, function(i){
        //console.log(i);
        answer.push(i.name);
    })
    var temp = result.next_evolution;
    //console.log(temp);
    _.each(temp, function(i){
        //console.log(i);
        answer.push(i.name);
    })
    /*temp.forEach(function(item){
        answer.push(item.name);
    });
    temp = result.next_evolution;
    temp.forEach(function(item){
        answer.push(item.name);
    });
    */
    answer.sort();
    console.log(answer);
    res.json(answer); 
   // res.send("UNIMPLEMENTED ENDPOINT");

});

//************************************* */
app.get("/api/type/:type", function(req, res) {
    var _type = req.params.type;
    //console.log(_type);
    var contents = [];
    _.each(_DATA, function(i) {
        //console.log(i.type);
        
        var poke_type  = i.type;
        if(poke_type.includes(_type)){
        
            contents.push(i.name);
        }
        
        //contents += `<tr><td>1</td><td>` + id + `</a></td></tr>\n`
        // contents += `<tr><td>` + id + `</td><td><a href= "/pokemon/`+ id + `">` + name + `</a></td></tr>\n`;
     })
     console.log(contents);
     //var html = `<html>\n<body>\n<table>` + contents + `</table>\n</body>\n</html>`;
     res.send(contents);


    //res.send("UNIMPLEMENTED ENDPOINT");
});

app.get("/api/type/:type/heaviest", function(req, res) {
    var _type = req.params.type;
    
    var contents = {};
    var weights = [];
    _.each(_DATA, function(i) {
        var poke_type  = i.type;
        if(poke_type.includes(_type)){
            var name = i.name;
            var wt = i.weight;
            contents[parseFloat(wt)] = name;
           // contents.push({ Name : name, Weight: wt });
            weights.push(parseFloat(wt));
        }
     })

     if (weights.length === 0) return res.json({});
    console.log(contents);
    //console.log(weights);
    //contents has names of pokemon of given type
   // console.log(weights);
    weights.sort(function(a,b){return b-a});
    //weights.reverse();
   // console.log(weights);
   var answer_wt = weights[0];
   var answer_name = contents[answer_wt];
   var response = {name : answer_name, weight: answer_wt.toString()}
     console.log(response);
    res.send(response);
     
    
    
    
    
    //res.send("UNIMPLEMENTED ENDPOINT");
});

app.post("/api/weakness/:pokemon_name/add/:weakness_name", function(req, res) {
    // HINT: 
    // Use `pokeDataUtil.saveData(_DATA);`
    //res.send("UNIMPLEMENTED ENDPOINT");
    
    var _name = req.params.pokemon_name;
    var _weak = req.params.weakness_name;
    var result = _.findWhere(_DATA, { name: _name });
    if (!result) return res.json({});
    console.log(result);
    var arr = result.weaknesses;
    if(!arr.includes(_weak)){
        arr.push(_weak);
    }
    console.log(arr);
    pokeDataUtil.saveData(_DATA);
    var response = {name : _name, weaknesses: arr}
    res.send(response);
});

app.delete("/api/weakness/:pokemon_name/remove/:weakness_name", function(req, res) {
    var _name = req.params.pokemon_name;
    var _weak = req.params.weakness_name;
    var result = _.findWhere(_DATA, { name: _name });
    if (!result) return res.json({});
    var arr = result.weaknesses;
   // console.log("original = " )
    //console.log(arr);
    if(arr.includes(_weak)){
        var a = arr.indexOf(_weak);
        arr.splice(a,1);
    }
    //console.log("new = " )
    //console.log(arr);
    pokeDataUtil.saveData(_DATA);
    var response = {name : _name, weaknesses: arr}
    res.send(response);
    //res.send("HOOOOOOO");
    //res.send("UNIMPLEMENTED ENDPOINT");
});


// Start listening on port PORT
app.listen(PORT, function() {
    console.log('Server listening on port:', PORT);
});

// DO NOT REMOVE (for testing purposes)
exports.PORT = PORT
