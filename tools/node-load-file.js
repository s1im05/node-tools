const http = require('http'),
	path = require('path'),
	request = require('request'),
	fs = require('fs'),
	url = require('url'),
	delay = 2,
	tryCount = 5,
	parseParams = (input) => {
		const query = url.parse(input).query,
			params = {};
		if (query) {
			query.split('&').forEach(param => {
				const keyVal = param.split('=');
				params[keyVal[0]] = keyVal[1];
			});
		}
		return params;
	},
	server = http.createServer((req, res) => {
		const params = parseParams(req.url);
		if (+params.id) {
			console.log('Copy ID:', params.id);
			console.log('Src:', params.src);
			console.log('Destination:', params.to);
			console.log('------------------------------------');
			
			const dirToFull = params.to + '/' + params.id;
			try {
				fs.accessSync(dirToFull);
			} catch (err) {
				fs.mkdirSync(dirToFull);
			}
			const file = path.basename(params.src),
			load = (src, cnt = 0) => {
				const req = request(src, (error, response, body) => {
					if (error) {
						if (cnt === tryCount) {
							res.end();
						}
						setTimeout(() => {
							console.log('Error for', src, 'try:', cnt + 1);
							load(src, cnt + 1);
						}, delay * 1000);
					} else {
						console.log('Done!', src);
						console.log('------------------------------------');
						res.end();
					}                  
				}).pipe(fs.createWriteStream(dirToFull + '/' + file));
			};
			load(params.src);	
		} else {
            res.end();
		}
	}),
    port = 8383;
	
server.on('clientError', (err, socket) => {
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(port);
console.log('We are live on http://localhost:' + port);
console.log('====================================');
