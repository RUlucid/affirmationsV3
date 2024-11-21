const https = require('https');
const fs = require('fs');
const path = require('path');

const FFMPEG_VERSION = '0.11.0';
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_VERSION}/dist`;
const FILES = [
  {
    url: `${BASE_URL}/ffmpeg-core.js`,
    filename: 'ffmpeg-core.js'
  },
  {
    url: `${BASE_URL}/ffmpeg-core.wasm`,
    filename: 'ffmpeg-core.wasm'
  }
];

const PUBLIC_FFMPEG_DIR = path.join(process.cwd(), 'public', 'ffmpeg');

// Ensure the directory exists
if (!fs.existsSync(PUBLIC_FFMPEG_DIR)) {
  fs.mkdirSync(PUBLIC_FFMPEG_DIR, { recursive: true });
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${filePath}...`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filePath);
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded ${path.basename(filePath)} successfully`);
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        downloadFile(response.headers.location, filePath)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {
        reject(new Error(`Network error downloading ${url}: ${err.message}`));
      });
    });
  });
}

async function downloadAll() {
  for (const { url, filename } of FILES) {
    const filePath = path.join(PUBLIC_FFMPEG_DIR, filename);
    
    try {
      await downloadFile(url, filePath);
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('All FFmpeg files downloaded successfully');
}

downloadAll();