const express = require('express');
const app = express();
const port = 8080;

app.use('/', express.static('public', { index : "/main/index.html" }));

app.listen(port, () => console.log(`listening on port ${port}!`));