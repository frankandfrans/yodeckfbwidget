const fs = require('fs');
const fetch = require('node-fetch');

const PAGE_ID = '210175288809';
const ACCESS_TOKEN = 'EAAUHRrIZCMu8BOyo9I9UKOSNJqWMqu3RC5jw18ZAyaM9d5eSbIVciFR5cI4ZAx9YUt1QBTmh8WEKYWopbjVXw0pD4tiBfGNkd8nO0HRZBGMzDGxTqZBmZByrRKNHaa0EYPMSO3wYd8fhfmHsDxFoNqMZCYmqEsZBCM74IRl0kK11vco5CGy0Ll2Gjmmg894ZD';

async function fetchPosts() {
  const url = `https://graph.facebook.com/v22.0/${PAGE_ID}/posts?fields=message,attachments{subattachments{media},media}&limit=10&access_token=${ACCESS_TOKEN}`;
  const res = await fetch(url);

  if (!res.ok) {
    const errText = await res.text();
    console.error("Failed to fetch FB posts:", errText);
    return null;
  }

  const json = await res.json();
  if (!json || !json.data) {
    console.error("No data returned from Facebook.");
    return null;
  }

  return json.data
    .filter(p => p.message && p.message.includes('#hookedonfandf') && p.message.includes('#fishingreport'))
    .slice(0, 1)
    .map(p => {
      const images = [];
      const attach = p.attachments?.data[0];
      if (attach?.subattachments) {
        attach.subattachments.data.forEach(s => images.push(s.media.image.src));
      } else if (attach?.media) {
        images.push(attach.media.image.src);
      }
      return { text: p.message, images };
    })[0];
}

async function buildHTML() {
  const post = await fetchPosts();
  let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Frank & Fran's Fishing Reports</title>
<style>
  body { font-family: Arial, sans-serif; background: #f8f8f8; margin: 0; padding: 20px; text-align: center; }
  h1 { font-size: 2.5em; margin-bottom: 20px; color: #003366; }
  .post-content { font-size: 1.2em; max-width: 1200px; margin: 0 auto 40px auto; text-align: left; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  img { width: 500px; margin: 20px 0; border-radius: 8px; }
</style>
</head>
<body>
`;

  if (post) {
    const lines = post.text.split('\\n');
    const titleLine = lines.shift();

    html += `<h1>${titleLine}</h1><div class="post-content"><p>${lines.join('<br>')}</p></div>`;

    post.images.forEach(src => {
      html += `<img src="${src}" alt="Fishing image">`;
    });
  } else {
    html += `<h1>No fishing reports available right now.</h1>`;
  }

  html += `
</body>
</html>`;

  fs.writeFileSync('index.html', html);
  console.log("✅ index.html generated successfully!");
}

buildHTML();
