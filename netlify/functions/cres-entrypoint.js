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
        function fromBase64(str) {
          str = str.replace(/-/g, '+').replace(/_/g, '/');
          while (str.length % 4) str += '=';
          return decodeURIComponent(escape(atob(str)));
        }

        const params = new URLSearchParams(window.location.search);
        const cres = params.get("cres");
        const encodedTransactionData = params.get("data");
        const encodedSecret = params.get("key");

        const output = document.getElementById("output");

        if (!encodedTransactionData || !encodedSecret || !cres) {
          output.textContent = "Faltan parámetros requeridos en la URL.";
          return;
        }

        try {
          const transactionData = JSON.parse(fromBase64(encodedTransactionData));
          const merchantSecretKey = fromBase64(encodedSecret);

          console.log("transactionData:", transactionData);
          console.log("merchantSecretKey:", merchantSecretKey);

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
