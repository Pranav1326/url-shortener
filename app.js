const http = require('http');
const router = require('./router');

const server = http.createServer((req, res) => {
    router(req, res);
});

server.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});
