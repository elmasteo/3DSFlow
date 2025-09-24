const fetch = require('node-fetch');
const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'elmasteo/3DSFlow'; // Reemplaza con tu repo
const BRANCH = 'main';
const FILE_PATH = 'lastNotification.json';

exports.handler = async function (event) {
  const method = event.httpMethod;

  // POST: recibir datos desde Nuvei y subir JSON a GitHub
  if (method === 'POST') {
    try {
      const body = event.body;
      const parsedData = Object.fromEntries(new URLSearchParams(body));
      const jsonContent = JSON.stringify(parsedData, null, 2);

      const octokit = new Octokit({ auth: GITHUB_TOKEN });

      const [owner, repo] = GITHUB_REPO.split('/');

      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${BRANCH}`,
      });

      const { data: latestCommit } = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: refData.object.sha,
      });

      const { data: blobData } = await octokit.git.createBlob({
        owner,
        repo,
        content: jsonContent,
        encoding: 'utf-8',
      });

      const { data: treeData } = await octokit.git.createTree({
        owner,
        repo,
        base_tree: latestCommit.tree.sha,
        tree: [
          {
            path: FILE_PATH,
            mode: '100644',
            type: 'blob',
            sha: blobData.sha,
          },
        ],
      });

      const { data: newCommit } = await octokit.git.createCommit({
        owner,
        repo,
        message: 'Nueva notificación de Nuvei',
        tree: treeData.sha,
        parents: [latestCommit.sha],
      });

      await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${BRANCH}`,
        sha: newCommit.sha,
      });

      return {
        statusCode: 200,
        body: 'Notificación recibida y almacenada exitosamente.',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: 'Error procesando la notificación: ' + error.message,
      };
    }
  }

  // GET: mostrar HTML que lee desde la API de GitHub (sin esperar raw.githubusercontent.com)
  if (method === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Last Notification from Nuvei</title>
  <link rel="icon" href="https://docs.nuvei.com/wp-content/themes/manual-child/img/favicons/cropped-favicon-nuvei-32x32.png" sizes="32x32">
  <style>
    body {
      font-family: sans-serif;
      padding: 20px;
      background-color: #f7f7f7;
    }
    pre {
      background: #eee;
      padding: 10px;
      white-space: pre-wrap;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h2>Loading Data...</h2>
  <div id="status">Loading last notification...</div>
  <pre id="jsonOutput"></pre>

  <script>
    async function fetchFromGitHubAPI(attempt = 1) {
      try {
        const res = await fetch("/.netlify/functions/payment-notification-api", { cache: "no-store" });
        if (!res.ok) throw new Error("Archivo aún no disponible");
        const data = await res.json();

        document.querySelector("h2").textContent = "Última Notificación Recibida:";
        document.getElementById("status").remove();
        document.getElementById("jsonOutput").textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        if (attempt < 10) {
          setTimeout(() => fetchFromGitHubAPI(attempt + 1), 1000);
        } else {
          document.getElementById("status").textContent = "Can not load the file, something was wrong!";
        }
      }
    }

    fetchFromGitHubAPI();
  </script>
</body>
</html>
      `,
    };
  }

  return {
    statusCode: 405,
    body: 'Método no permitido. Usa POST o GET.',
  };
};
