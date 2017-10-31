const dirFrom = 'c:/TEMP/a',
	dirTo = 'c:/TEMP/b',
	mask = '.txt';


const http = require('http'),
	fs = require('fs'),
	url = require('url'),
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
			const dirToFull = dirTo + '/' + params.id;

			fs.readdir(dirFrom, (err, files) => {
				if (!files) {
					console.log('Files not found');
					console.log('------------------------------------');
				} else {
					const filtered = files.filter((file) => file.substr(-4) === mask);
					if (filtered && filtered.length) {
						console.log('Moving', filtered.length, 'files');
						console.log('------------------------------------');
						fs.mkdirSync(dirToFull);
						filtered.forEach(file => {
							const readStream = fs.createReadStream(dirFrom + '/' + file);
							readStream.on('close', () => {
								fs.unlink(dirFrom + '/' + file, () => {});
							});
							readStream.pipe(fs.createWriteStream(dirToFull + '/' + file));
						});
					} else {
						console.log('Files not found');
						console.log('------------------------------------');
					}
				}
			});
		}
		res.end();
	}),
    port = 8383;
	
server.on('clientError', (err, socket) => {
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(port);
console.log('We are live on http://localhost:' + port);
console.log('====================================');