import { readFileSync } from "fs";
import path from "path";

const inviteHtmlFile = path.join(process.cwd(), "api/_invite.html");
const htmlTemplate = readFileSync(inviteHtmlFile, "utf8");

export default function handler(request, response) {
  const { query } = request;
  let score = Number(query.score);

  if (!Number.isInteger(score)) {
    score = 0;
  }

  const htmlString = htmlTemplate.replaceAll("__SCORE__", score);

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  return response.status(200).send(htmlString);
}
