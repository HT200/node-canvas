const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const canvas = fs.readFileSync(`${__dirname}/../client/canvas.js`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getJS = (request, response, file) => {
  response.writeHead(200, { 'Content-Type': 'text/js' });
  response.write(file);
  response.end();
}

const getCanvas = (request, response) => getJS(request, response, canvas);

module.exports = {
  getIndex,
  getCSS,
  getCanvas
};
