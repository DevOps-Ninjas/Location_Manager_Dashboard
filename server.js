const express = require('express');
const app = express();

app.get('/hello', (req, res) => res.send('Hello World!'));

app.post('/', (req, res) => {
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;

  console.log(`Received data: latitude=${latitude}, longitude=${longitude}`);

  res.status(200).send({ message: 'Data received successfully' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

