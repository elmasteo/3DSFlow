const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'elmasteo/3DSFlow';
const BRANCH = 'main';
const FILE_PATH = 'lastNotification.json';

exports.handler = async function () {
  try {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    const [owner, repo] = GITHUB_REPO.split('/');

    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path: FILE_PATH,
      ref: BRANCH,
    });

    const content = Buffer.from(file.content, 'base64').toString('utf-8');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: content,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Error al leer el archivo JSON: ' + error.message,
    };
  }
};
