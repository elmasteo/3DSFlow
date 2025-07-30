const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'elmasteo/3DSFlow';
const BRANCH = 'main';
const FILE_PATH = 'lastNotification.json';

exports.handler = async function () {
  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const [owner, repo] = GITHUB_REPO.split('/');

    // Obtener contenido y SHA del archivo
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path: FILE_PATH,
      ref: BRANCH,
    });

    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const sha = file.sha;

    // Eliminar el archivo luego de leerlo
    await octokit.repos.deleteFile({
      owner,
      repo,
      path: FILE_PATH,
      message: 'Eliminar notificación procesada',
      sha: sha,
      branch: BRANCH,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: content,
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: 'No hay notificación disponible o ya fue eliminada.',
    };
  }
};
