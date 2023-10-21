let drawings = {};
let galleryCount;
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const sendPost = async (nameForm) => {
  const userField = nameForm.querySelector('#userField');
  const nameField = nameForm.querySelector('#nameField');

  // Build a JSON data object
  const formData = 
  {
    id: getRandomString(30),
    user: userField.value,
    name: nameField.value,
    drawing: strokes
  }

  // Make a fetch request and await a response
  let response = await fetch('/addDrawing', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  //Once we have a response, handle it.
  handleResponse(response);
};

const requestUpdate = async () => {
  //A wait our fetch response. Go to the URL, use the right method, and attach the headers.
  let response = await fetch('/getDrawing', {
    method: 'get',
    headers: {
        'Accept': 'application/json'
    },
  });

  handleResponse(response, true);
};

// Handle response based on status code
const handleResponse = async (response, parseResponse) => {
  switch(response.status) {
    case 200: 
      console.log('Request success!')
      break;
    case 201:
      // Reset name field, and previous drawings
      nameForm.querySelector('#nameField').value = "";
      strokes = [];
      lines = [];
      redos = [];

      alert('Drawing submitted!');
      break;
    case 204:
      alert('No content to update!');
      break;
    case 400: 
      alert('Please fill in username and drawing name!');
      break;
    case 404:
      alert('Drawings not found!');
      break;
    default: 
      alert('Error code not implemented by client.');
      break;
  }

  // Grab JSON from response
  if (!parseResponse) return;
  let obj = await response.json();
  drawings = obj.message.draw;
  galleryCount = obj.message.count;
  pageCount = Math.floor(galleryCount / 4);
  isGallery = true;
};

// Credits: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
// Return random string at a given length
const getRandomString = (length) => {
  let cLength = characters.length;
  let result = '';
  let i = 0;
  while (i < length) {
    result += characters.charAt(Math.floor(Math.random() * cLength));
    i++;
  }
  return result;
}