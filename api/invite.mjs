import { readFileSync } from "fs";

const htmlTemplate = readFileSync("./api/_invite.html", "utf8");

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
