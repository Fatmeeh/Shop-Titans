const { readFile } = require("fs");
const path = require("path");
const querystring = require("querystring");

const {
  getData,
  postData,
  addToCart,
  getCart
} = require("./queries/handleData.js");

const serverError = (err, response) => {
  response.writeHead(500, "Content-Type:text/html");
  response.end("<h1>Sorry, there was a problem loading the homepage</h1>");
  console.log(err);
};

const homeHandler = response => {
  const filepath = path.join(
    __dirname,
    "..",
    "public",
    "homePage",
    "home.html"
  );
  readFile(filepath, (err, file) => {
    if (err) return serverError(err, response);
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(file);
  });
};

const publicHandler = (url, response) => {
  const filepath = path.join(__dirname, "..", url);
  readFile(filepath, (err, file) => {
    if (err) return serverError(err, response);
    const [, extension] = url.split(".");
    const extensionType = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      ico: "image/x-icon",
      png: "image/png"
    };
    response.writeHead(200, { "content-type": extensionType[extension] });
    response.end(file);
  });
};

const buyInfoHandler = response => {
  getData((err, res) => {
    if (err) return console.log(err);
    let dynamicData = JSON.stringify(res);
    response.writeHead(200, {
      "content-type": "application/json"
    });
    response.end(dynamicData);
  });
};
const loadCartHandler = response => {
  getCart((err, res) => {
    if (err) return console.log(err);
    let dynamicData = JSON.stringify(res);
    response.writeHead(200, {
      "content-type": "application/json"
    });
    response.end(dynamicData);
  });
};

const sellInfoHandler = (request, response) => {
  let body = "";
  request.on("data", chunk => {
    body += chunk.toString();
  });
  request.on("end", () => {
    //send to postData the sellInfo (item_name,item_price,price_currency) for the item

    let callBack = (err, res) => {
      if (err) return console.log(err);
      let dynamicData = JSON.stringify(res);
      response.writeHead(301, { location: "/" });
      response.end(dynamicData);
    };
    try {
      let cartItem = JSON.parse(body).item_id;
      addToCart(cartItem, callBack);
    } catch (error) {
      let sellInfo = querystring.parse(body);
      postData(
        sellInfo.item_name,
        sellInfo.item_price,
        sellInfo.currency,
        callBack
      );
    }
  });
};

const errorHandler = response => {
  response.writeHead(404, { "content-type": "text/html" });
  response.end("<h1>404 Page Requested Cannot be Found</h1>");
};

module.exports = {
  homeHandler,
  buyInfoHandler,
  sellInfoHandler,
  loadCartHandler,
  publicHandler,
  errorHandler
};
