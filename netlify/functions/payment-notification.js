const querystring = require("querystring");

let lastNotificationData = null; // memoria temporal

exports.handler = async (event) => {
  if (event.httpMethod === "POST") {
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return {
        statusCode: 400,
        body: "Content-Type no soportado. Se espera application/x-www-form-urlencoded.",
      };
    }

    // Parsear el cuerpo
    const parsedData = querystring.parse(event.body);
    lastNotificationData = parsedData; // Guardar en memoria temporal

    return {
      statusCode: 200,
      body: "Notificación recibida correctamente.",
    };
  }

  // Cuando se hace GET desde el navegador
  if (event.httpMethod === "GET") {
    if (!lastNotificationData) {
      return {
        statusCode: 200,
        body: `
          <html>
            <head><title>Esperando datos...</title></head>
            <body style="font-family: sans-serif;">
              <h2>No hay datos recientes de Nuvei.</h2>
              <p>Es posible que aún no se haya recibido la notificación.</p>
            </body>
          </html>
        `,
        headers: { "Content-Type": "text/html" },
      };
    }

    // Mostrar los datos visualmente en pantalla
    return {
      statusCode: 200,
      body: `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Resultado del Pago Nuvei</title>
            <style>
              body {
                font-family: sans-serif;
                background-color: #f4f4f4;
                padding: 2rem;
              }
              h1 {
                color: #2c3e50;
              }
              pre {
                background: #fff;
                padding: 1rem;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                overflow-x: auto;
                max-height: 80vh;
              }
              .status {
                font-size: 1.5rem;
                font-weight: bold;
                color: ${lastNotificationData.Status === "APPROVED" ? "green" : "red"};
              }
            </style>
          </head>
          <body>
            <h1>Resultado de la Transacción</h1>
            <p class="status">Estado: ${lastNotificationData.Status || "Desconocido"}</p>
            <pre>${JSON.stringify(lastNotificationData, null, 2)}</pre>
          </body>
        </html>
      `,
      headers: { "Content-Type": "text/html" },
    };
  }

  return {
    statusCode: 405,
    body: "Método no permitido",
  };
};
