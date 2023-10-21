const drawings = { count: 0, draw: {} };
let count = 0;

const respond = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

const getJSON = (message, id) => ({ message, id });
const getDrawing = (request, response) => respond(request, response, 200, getJSON(drawings, 'Success'));
//const notReal = (request, response) => respond(request, response, 404, getJSON('', 'Not Found'));
const notFound = (request, response) => respond(request, response, 404, getJSON('The page you are looking for was not found.', 'Not Found'));

const getDrawingMeta = (request, response) => respondJSONMeta(request, response, 200);
//const notRealMeta = (request, response) => respondJSONMeta(request, response, 400);

const addDrawing = (request, response, body) => {
  const responseJSON = {
    message: 'Your drawing needs a name!',
  };

  if (!body.name || !body.user) {
    responseJSON.id = 'missingParams';
    return respond(request, response, 400, responseJSON);
  }

  let responseCode = 204;
  if (!drawings[body.id]) {
    responseCode = 201;
    drawings.draw[body.id] = {};
    count++;
    drawings.count = count;
  }

  drawings.draw[body.id].name = body.name;
  drawings.draw[body.id].user = body.user;
  drawings.draw[body.id].drawing = body.drawing;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respond(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

module.exports = {
  // notReal,
  // notRealMeta,
  getDrawing,
  getDrawingMeta,
  addDrawing,
  notFound,
};
