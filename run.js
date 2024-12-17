// kaboom dev server

const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const express = require("express");
const csurf = require("csurf");
const ws = require("ws");
const http = require("http");
const Database = require("@replit/database");
const multiplayer = require("./multiplayer");
const db = new Database();
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8000;
let err = null;

// start multiplayer server
multiplayer(server);

// build user game
function buildGame() {
  const template = fs.readFileSync("template.html", "utf-8");
  let code = "";

  code += `<script src="/dist/helper.js"></script>\n`;
  code += `<script src="/dist/game.js"></script>\n`;

  try {
    // build user code
    esbuild.buildSync({
      bundle: true,
      sourcemap: true,
      target: "es6",
      keepNames: true,
      logLevel: "silent",
      entryPoints: ["code/main.js"],
      outfile: "dist/game.js",
    });

    esbuild.buildSync({
      bundle: true,
      sourcemap: true,
      target: "es6",
      keepNames: true,
      entryPoints: ["helper.ts"],
      outfile: "dist/helper.js",
    });
  } catch (e) {
    const loc = e.errors[0].location;
    err = {
      msg: e.errors[0].text,
      stack: [
        {
          line: loc.line,
          col: loc.column,
          file: loc.file,
        },
      ],
    };
    let msg = "";
    msg += "<pre>";
    msg += `ERROR: ${err.msg}\n`;
    if (err.stack) {
      err.stack.forEach((trace) => {
        msg += `    -> ${trace.file}:${trace.line}:${trace.col}\n`;
      });
    }
    msg += "</pre>";
    fs.writeFileSync("dist/index.html", msg);
    return;
  }

  fs.writeFileSync("dist/index.html", template.replace("{{kaboom}}", code));
}

// server stuff
app.use(express.json({ strict: false }));

// middleware function to preserve any query parameters
// used for utm tracking: utm_source utm_medium and utm_campaign
// and re-add them to redirects
function preserveQueryParams(req, res, next) {
  const query = req.query;

  // if there are no query params, skip
  if (Object.keys(query).length === 0) {
    return next();
  }

  let queryParams = new URLSearchParams()

  const queryParamsList = ['utm_source', 'utm_medium', 'utm_campaign'];
  for (const param of queryParamsList) {
    if (query[param]) {
      queryParams.append(param, query[param]);
    }
  }
  
  const queryString = queryParams.toString();
  req.preserveQueryParams = queryString;
  next();
}

app.use(preserveQueryParams);

function redirectHomeWithQueryParams(req, res, next) {
  if (req.preserveQueryParams) {
    const redirectUrl = '/?' + req.preserveQueryParams
    res.redirect(redirectUrl);
  }

  next();
}


app.get('/intro', (req, res, next) => {
  return redirectHomeWithQueryParams(req, res, next);
});

app.get('/game', (req, res, next) => {
  return redirectHomeWithQueryParams(req, res, next);
});

app.get('/game-over', (req, res, next) => {
  return redirectHomeWithQueryParams(req, res, next);
});

app.get("/main", (req, res) => {
  err = null;
  buildGame();
  res.sendFile(__dirname + "/dist/index.html");
  render();
});

app.get("/", (req, res) => {
  res.redirect("/crawl/crawl.html");
});

app.post("/error", (req, res) => {
  err = req.body;
  render();
});

app.get("/user", (req, res) => {
  if (req.headers["x-replit-user-id"]) {
    res.json({
      id: req.headers["x-replit-user-id"] || null,
      name: req.headers["x-replit-user-name"] || null,
    });
  } else {
    res.json(null);
  }
});

app.get("/db", async (req, res) => {
  try {
    res.json(await db.list());
  } catch (e) {
    res.sendStatus(500);
  }
});

app.delete("/db", async (req, res) => {
  try {
    await db.empty();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.get("/db/:item", async (req, res) => {
  try {
    res.json(await db.get(req.params.item));
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post("/db/:item", async (req, res) => {
  try {
    await db.set(req.params.item, req.body);
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.delete("/db/:item", async (req, res) => {
  try {
    await db.delete(req.params.item);
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.use("/sprites", express.static("sprites"));
app.use("/sounds", express.static("sounds"));
app.use("/code", express.static("code"));
app.use("/dist", express.static("dist"));
app.use("/fonts", express.static("fonts"));
app.use("/images", express.static("images"));
app.use("/crawl", express.static("crawl"));
// app.use(csurf({ cookie: true }));

server.listen(port);

// term output
const red = (msg) => `\x1b[31m${msg}\x1b[0m`;
const dim = (msg) => `\x1b[2m${msg}\x1b[0m`;

function render() {
  // kaboooooom!
  process.stdout.write("\x1b[2J");
  process.stdout.write("\x1b[H");
  process.stdout.write("kaboom!\n");

  console.log(dim("\n(tip: Cmd + S in editor refresh webview)"));

  // error stack trace
  if (err) {
    console.log("");
    console.error(red(`ERROR: ${err.msg}`));
    if (err.stack) {
      err.stack.forEach((trace) => {
        console.error(`    -> ${trace.file}:${trace.line}:${trace.col}`);
      });
    }
  }
}
