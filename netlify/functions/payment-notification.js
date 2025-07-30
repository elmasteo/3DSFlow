const fetch = require('node-fetch');
const { Buffer } = require('buffer');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'elmasteo/3DSFlow'; // 👈 Cambia esto por tu nombre de usuario y repo real
const BRANCH = 'main';
const FILE_PATH = 'lastNotification.json'; // Ruta dentro del repo

exports.handler = async (event, context) => {
  const method = event.httpMethod;

  if (method === 'POST') {
    try {
      const body = event.body;
      const parsedData = parseFormURLEncoded(body);

      const fileContent = JSON.stringify(parsedData, null, 2);

      const githubResponse = await uploadToGitHub(FILE_PATH, fileContent);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Notificación guardada en GitHub.', githubResponse })
      };
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  }

  if (method === 'GET') {
    try {
      const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/${FILE_PATH}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('No se pudo recuperar el archivo desde GitHub');
      const json = await response.json();

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json, null, 2)
      };
    } catch (error) {
      return { statusCode: 500, body: `Error al obtener datos: ${error.message}` };
    }
  }

  return {
    statusCode: 405,
    body: 'Método no permitido. Usa POST o GET.'
  };
};

function parseFormURLEncoded(data) {
  return Object.fromEntries(
    data.split('&').map(pair => {
      const [key, value] = pair.split('=');
      return [decodeURIComponent(key), decodeURIComponent(value || '')];
    })
  );
}

async function uploadToGitHub(path, content) {
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;

  const getFile = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
  });

  const sha = getFile.ok ? (await getFile.json()).sha : undefined;

  const body = {
    message: 'Actualizar notificación de Nuvei',
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH,
    ...(sha && { sha })
  };

  const result = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!result.ok) {
    const errorBody = await result.text();
    throw new Error(`Error al subir a GitHub: ${errorBody}`);
  }

  return await result.json();
}
