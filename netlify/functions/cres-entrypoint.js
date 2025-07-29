exports.handler = async (event) => {
  const cres = new URLSearchParams(event.queryStringParameters).get("cres");

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
          const transactionData = JSON.parse(localStorage.getItem('nuvei_final_payload'));
          const merchantSecretKey = localStorage.getItem('merchant_secret_key');

          const output = document.getElementById("output");

          if (!cres || !transactionData || !merchantSecretKey) {
            output.textContent = "Faltan datos: verifique que el proceso fue iniciado desde el mismo navegador.";
            return;
          }

          try {
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
