var http = require('http'),
	fs = require('fs');
	
exports.module = http.createServer(function(req, res) {	
	var path = __dirname + (req.url == '/' ? '/index.html' : req.url);
	fs.stat(path, function(err, stat) {
	    if (!err) {
			res.writeHead(200, {'Content-Type': path.match(/js$/)?'text/javascript':'text/html'});
			fs.createReadStream(path).pipe(res);
	    }else {
	        res.writeHead(404);
	        res.end();
	    }
	});
});