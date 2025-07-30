const querystring = require('querystring');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método no permitido. Usa POST.'
    };
  }

  const contentType = event.headers['content-type'] || event.headers['Content-Type'];

  // Validamos que sea tipo x-www-form-urlencoded
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return {
      statusCode: 400,
      body: 'Content-Type no soportado. Esperado: application/x-www-form-urlencoded.'
    };
  }

  // Parsear el cuerpo de la solicitud
  const parsedData = querystring.parse(event.body);

  console.log("Notificación recibida desde Nuvei:", parsedData);

  // Convertimos a query string para redirigir a la página de visualización
  const queryString = new URLSearchParams(parsedData).toString();

  return {
    statusCode: 302,
    headers: {
      Location: `/notificacion.html?${queryString}`
    }
  };
};
