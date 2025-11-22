const http = require("http");

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(`{"message": "Hello world"}`);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
