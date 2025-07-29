exports.handler = async (event) => {
  const query = event.queryStringParameters;
  const cres = query?.cres;
  const encodedData = query?.data;
  const encodedKey = query?.key;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Procesando CRES</title>
    </head>
    <body>
      <h2>Procesando validación 3DS...</h2>
      <pre id="output"></pre>
      <script>
        (async () => {
          const cres = "${cres}";
          const encodedTransactionData = "${encodedData}";
          const encodedSecret = "${encodedKey}";

          const output = document.getElementById("output");

          try {
            const transactionData = JSON.parse(atob(decodeURIComponent(encodedTransactionData)));
            const merchantSecretKey = atob(decodeURIComponent(encodedSecret));

            if (!cres || !transactionData || !merchantSecretKey) {
              output.textContent = "Faltan datos.";
              return;
            }

            const res = await fetch("/.netlify/functions/cres-handler", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cres, transactionData, merchantSecretKey })
            });

            const data = await res.json();
            output.textContent = JSON.stringify(data, null, 2);
          } catch (err) {
            output.textContent = "Error al procesar el pago: " + err.message;
          }
        })();
      </script>
    </body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: html
  };
};
