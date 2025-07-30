const querystring = require('querystring');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType.includes('application/x-www-form-urlencoded')) {
      return {
        statusCode: 400,
        body: 'Content-Type no soportado. Esperado: application/x-www-form-urlencoded.'
      };
    }

    const parsedData = querystring.parse(event.body);
    const queryString = new URLSearchParams(parsedData).toString();

    return {
      statusCode: 302,
      headers: {
        Location: `/notificacion.html?${queryString}`
      }
    };
  }

  // GET manual directo sin datos (no redirigido desde POST)
  return {
    statusCode: 400,
    body: 'Esta función espera recibir un POST desde Nuvei.'
  };
};
