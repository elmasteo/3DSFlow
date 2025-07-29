const querystring = require("querystring");

exports.handler = async (event, context) => {
  try {
    // Asegúrate de que sea POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed"
      };
    }

    // Content-Type: application/x-www-form-urlencoded
    const formData = querystring.parse(event.body);
    const cres = formData.cres;

    if (!cres) {
      return {
        statusCode: 400,
        body: "Falta el parámetro 'cres' en el cuerpo POST"
      };
    }

    // Ahora obtén los parámetros adicionales desde la URL
    const queryParams = event.queryStringParameters;
    const encodedTransactionData = queryParams.data;
    const encodedSecret = queryParams.key;

    if (!encodedTransactionData || !encodedSecret) {
      return {
        statusCode: 400,
        body: "Faltan parámetros requeridos en la URL"
      };
    }

    const transactionData = JSON.parse(
      Buffer.from(encodedTransactionData, "base64").toString("utf-8")
    );
    const merchantSecretKey = Buffer.from(encodedSecret, "base64").toString("utf-8");

    // Aquí puedes continuar con la lógica del llamado a payment
    console.log("cres:", cres);
    console.log("transactionData:", transactionData);
    console.log("merchantSecretKey:", merchantSecretKey);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "Procesado correctamente",
        cres,
        transactionData,
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Error interno: " + err.message
    };
  }
};
