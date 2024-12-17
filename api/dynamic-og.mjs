import { readFileSync } from "fs";
import path from 'path';
import sharp from "sharp";
import opentype from "opentype.js";

const svgFile = path.join(process.cwd(), "api/_share-card.svg");
const ShareCardSVG = readFileSync(svgFile, "utf8");

function textToPath(text, x, y, fontSize) {
  const font = opentype.loadSync("./fonts/Jersey10-Regular.ttf"); // Load your font file
  const path = font.getPath(text, x, y, fontSize);
  return path.toSVG();
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const queryString = new URLSearchParams(requestUrl.search);
  const text = queryString.get("score");

  let score = Number(text);

  if (!Number.isInteger(score)) {
    score = 0;
  }

  const x = 100;
  const y = 100;
  const fontSize = 34;

  let pathData = textToPath(score.toString(), x, y, fontSize);

  // prefix is the '<path' part of the path data
  // suffix is the rest of the path data
  const prefix = pathData.substring(0, 5);
  const suffix = pathData.substring(5);

  // between them we add the fill and stroke attributes
  pathData = `${prefix} fill="#FFFFFF" transform="translate(500, 30) scale(3)" ${suffix}`;

  const svgCustomText = ShareCardSVG.replace("<TEMPLATE/>", pathData);

  const image = await sharp(Buffer.from(svgCustomText)).toBuffer();
  return new Response(image, {
    headers: {
      "Content-Type": "image/webp",
    },
  });
}
