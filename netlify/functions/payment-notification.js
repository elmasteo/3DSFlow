const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

const tempFilePath = path.join("/tmp", "lastNotification.json");

exports.handler = async (event) => {
  const method = event.httpMethod;

  if (method === "POST") {
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return {
        statusCode: 400,
        body: "Content-Type no soportado. Se espera application/x-www-form-urlencoded.",
      };
    }

    const parsedData = querystring.parse(event.body);

    // Guardar en archivo temporal
    try {
      fs.writeFileSync(tempFilePath, JSON.stringify(parsedData, null, 2));
    } catch (err) {
      return {
        statusCode: 500,
        body: "Error al guardar datos: " + err.message,
      };
    }

    return {
      statusCode: 200,
      body: "Notificación guardada exitosamente.",
    };
  }

  if (method === "GET") {
    let data;
    try {
      const fileContent = fs.readFileSync(tempFilePath, "utf8");
      data = JSON.parse(fileContent);
    } catch (err) {
      return {
        statusCode: 200,
        body: `
          <html>
            <head><title>Sin datos</title></head>
            <body style="font-family: sans-serif;">
              <h2>No hay datos de notificación recientes.</h2>
              <p>Aún no se ha recibido un POST con datos desde Nuvei.</p>
            </body>
          </html>
        `,
        headers: { "Content-Type": "text/html" },
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
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
                color: ${data.Status === "APPROVED" ? "green" : "red"};
              }
            </style>
          </head>
          <body>
            <h1>Resultado de la Transacción</h1>
            <p class="status">Estado: ${data.Status || "Desconocido"}</p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </body>
        </html>
      `,
    };
  }

  return {
    statusCode: 405,
    body: "Método no permitido",
  };
};
