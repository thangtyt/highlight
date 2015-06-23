/**
 * Created by thangnv on 6/22/15.
 */
"use strict";
const http = require('http');
const fs = require('fs');
const url = require('url');
//const highlights = require('highlights'),
//        highligher = new highlights();
const nodeSH = require('node-syntaxhighlighter'),
        html_lang = nodeSH.getLanguage('html'),
        js_lang = nodeSH.getLanguage('js');

function serveFile(res, path) {
    let extension =  path.split('.').pop();
    var contentType='';
    var flag = false;
    //console.log(extension+'----path full--'+path);
    switch (extension) {
        case 'js':
            contentType = 'text/html';
            flag = true;
            break;
        case 'html':
            contentType = 'text/html';
            flag = true ;
            break;
        case 'css':
            contentType = 'text/css';
            break;
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        case 'jpg':
            contentType = 'image/jpg';
            break;
        case 'png':
            contentType = 'image/png';
            break;
        case 'md':
            contentType = 'text/x-markdown';
            break;
        case 'json':
            contentType = 'application/json';
            //console.log(contentType);
            break;
        default:
            contentType = 'unknown';
            res.end();
            return;
    }
    res.writeHead(200, {'Content-Type': contentType});
    let stream = fs.createReadStream('.' + path);
    var temp ='';
    //if (extension == 'json'){
    //    console.log('json into');
    //    var i = 0;
    //    fs.readFile('.' + path, function (err, data) {
    //        if (err) throw err;
    //        temp = data.toString();
    //        console.log(temp);
    //    });
    //
    //    //res.setHeader('Content-Type', 'application/json');
    //    //res.writeHead(200, 'json content');
    //    //res.write('{"characters": ["Tom", "Jerry"]}');
    //    //res.end();
    //}

    stream.on('data',function (chuck) {
        //if(flag)
        temp = temp+chuck;
        //console.log('ddddd'+temp);
    });
    stream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        if (!flag)
        stream.pipe(res);
    });

    // This catches any errors that happen while creating the readable stream (usually invalid names)
    stream.on('error', function(err) {
        console.log('Error at: .' + path);
        res.end(err.message);
    });
    stream.on('end',function(){
        //console.log(typeof temp);
        var lang;
        if (extension == 'html') {
            lang = html_lang;
        }else {
            lang = js_lang;
        }
        if (flag)
        res.end('<link rel="stylesheet" href="/style.css">'+nodeSH.highlight(temp,lang));
    });

}


//Hàm này xử lý các route
let handleGETRequest = function(res, url_parsed) {
    let path = url_parsed.pathname;
    //console.log(url_parsed.pathname);
    if (path.match(/^\/{0,1}$/)) {
        //console.log('home');
        res.writeHead(200, {'Content-Type': 'text/html'});
                fs.readdir('.', function(err, files){
                    for (var i=0; i < files.length; i++){
                        res.write('<a href="/' + files[i] + '">' + files[i] + '</a></br>');
                    }
                    res.end();
                });
    }else if (path.match(/^[\/0-9a-z_-]+$/ig)){
        //console.log('folder');
        res.writeHead(200, {'Content-Type': 'text/html'});
                fs.readdir('.'+path, function(err, files){
                    console.log('subfolder : '+path);
                    for (var i=0; i < files.length; i++){
                        res.write('<a href="'+path+'/' + files[i] + '">' + files[i] + '</a></br>');
                    }
                    res.end();
                });
    }else if (path.match(/[.]+/ig)){
        //console.log('file');
        serveFile(res,path);
    }
};

const server = http.createServer();
server.on('request', function(req, res) {
    if (req.method === 'GET') {
        handleGETRequest(res, url.parse(req.url, true));
    }
});
var port = 3000;
server.listen(port);
console.log('Server running at http://127.0.0.1:' + port);
