// This server is only for the Game. use a different server for the lobby. and a different server for the rest of the game. another server for the website.

function requestHandler (req, res) {

	if (req.method == "GET") {
		switch (req.url) {
			case '/':
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.write(fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8'));
				break;
			case '/master.css':
				res.writeHead(200, { 'Content-type': 'text/css' });
				res.write(fs.readFileSync(path.join(__dirname, 'public/master.css'), 'utf8'));
				break;
			case '/index.js':
				res.writeHead(200, {'Content-type': 'text/javascript' });
				res.write(fs.readFileSync(path.join(__dirname, 'public/index.js'), 'utf8'));
				break;
			case '/socket.io.js':
				res.writeHead(200, {'Content-type': 'text/javascript' });
				res.write(fs.readFileSync(path.join(__dirname, 'public/socket.io.js'), 'utf8'));
				break;
			case '/jquery.js':
				res.writeHead(200, {'Content-type': 'text/javascript' });
				res.write(fs.readFileSync(path.join(__dirname, 'public/jquery.js'), 'utf8'));
				break;
			case '/favicon.ico':
				res.writeHead(200, { 'Content-type': 'image/png' })
				let file = fs.readFileSync(path.join(__dirname, 'public/icon.png'))
				console.log(file.byteLength)
				res.write(file);
			default:
				res.writeHead(404)
				res.write('The requested resource is unavailable');
		}
		res.end();

	} else if (req.method == "POST") {
		switch (req.url) {
			default:
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('Error 404: Resource not found.');
		}
	}
	console.log(`${req.method.toUpperCase()}: ${req.url}`);
}
const http = require('http')
const fs = require('fs');
const path = require('path');
const server = http.createServer(requestHandler)
const io = require('socket.io')(server);

io.socketPort = 5050;

server.listen(io.socketPort, (err) => {
	if (err) return console.log('something bad happened', err)
	console.log(`Server running: ${io.socketPort}`);
})

io.sockets.on('connection', socket => {
	socket.emit('hello world', 'How do you do?')
})
