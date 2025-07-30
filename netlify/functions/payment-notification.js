const fetch = require('node-fetch');
const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Define esto en Netlify
const GITHUB_REPO = 'elmasteo/3DSFlow'; // Reemplaza con tu repo
const BRANCH = 'main'; // O 'master' si aplica
const FILE_PATH = 'lastNotification.json'; // Ruta en tu repo

exports.handler = async function (event) {
  const method = event.httpMethod;

  if (method === 'POST') {
    try {
      const body = event.body;
      const parsedData = Object.fromEntries(new URLSearchParams(body));
      const jsonContent = JSON.stringify(parsedData, null, 2);

      const octokit = new Octokit({ auth: GITHUB_TOKEN });

      const { data: refData } = await octokit.git.getRef({
        owner: GITHUB_REPO.split('/')[0],
        repo: GITHUB_REPO.split('/')[1],
        ref: `heads/${BRANCH}`
      });

      const { data: latestCommit } = await octokit.git.getCommit({
        owner: GITHUB_REPO.split('/')[0],
        repo: GITHUB_REPO.split('/')[1],
        commit_sha: refData.object.sha
      });

      const { data: blobData } = await octokit.git.createBlob({
        owner: GITHUB_REPO.split('/')[0],
        repo: GITHUB_REPO.split('/')[1],
        content: jsonContent,
        encoding: 'utf-8'
      });

      const { data: treeData } = await octokit.git.createTree({
        owner: GITHUB_REPO.split('/')[0],
        repo: GITHUB_REPO.split('/')[1],
        base_tree: latestCommit.tree.sha,
        tree: [
          {
            path: FILE_PATH,
            mode: '100644',
            type: 'blob',
            sha: blobData.sha
          }
        ]
      });

      const { data: newCommit } = await octokit.git.createCommit({
        owner: GITHUB_REPO.split('/')[0],
        repo: GITHUB_REPO.split('/')[1],
        message: 'Nueva notificación de Nuvei',
        tree: treeData.sha,
        parents: [latestCommit.sha]
      });

      await octokit.git.updateRef({
        owner: GITHUB_REPO.split('/')[0],
        repo: GITHUB_REPO.split('/')[1],
        ref: `heads/${BRANCH}`,
        sha: newCommit.sha
      });

      return {
        statusCode: 200,
        body: 'Notificación recibida y almacenada exitosamente.'
      };

    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: 'Error procesando la notificación: ' + error.message
      };
    }
  }

  if (method === 'GET') {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/${FILE_PATH}`;

    // Página HTML con loader y fetch periódico
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Última Notificación de Nuvei</title>
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
  <h2>Cargando datos...</h2>
  <div id="status">Esperando última notificación...</div>
  <pre id="jsonOutput"></pre>

  <script>
    async function fetchData(attempt = 1) {
      try {
        const res = await fetch("${rawUrl}", { cache: "no-store" });
        if (!res.ok) throw new Error("Archivo aún no disponible");
        const data = await res.json();
        if (Object.keys(data).length === 0) throw new Error("JSON vacío");

        document.querySelector("h2").textContent = "Última Notificación Recibida:";
        document.getElementById("status").remove();
        document.getElementById("jsonOutput").textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        if (attempt < 10) {
          setTimeout(() => fetchData(attempt + 1), 1000);
        } else {
          document.getElementById("status").textContent = "No se pudo cargar el archivo después de varios intentos.";
        }
      }
    }

    fetchData();
  </script>
</body>
</html>
      `
    };
  }

  return {
    statusCode: 405,
    body: 'Método no permitido. Usa POST o GET.'
  };
};
