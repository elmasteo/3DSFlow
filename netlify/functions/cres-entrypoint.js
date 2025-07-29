exports.handler = async (event) => {
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
          const params = new URLSearchParams(window.location.search);
          const cres = params.get("cres");
          const encodedTransactionData = params.get("data");
          const encodedSecret = params.get("key");

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
