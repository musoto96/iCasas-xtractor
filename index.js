const express = require('express');
const path = require('path');
const config = require('./config');
const extractor = require('./app');

const xd = 'https://www.icasas.mx/venta/habitacionales-casas-guanajuato-2_5_11_0_0_0/list';

port = config['port'];
hostname = config['hostname'];

const app = express();

app.get('/api/extract/:url*', async (req, res) => {
   const date = new Date(Date.now()).toISOString().split('.')[0];
   const url = req.params['url'] + req.params['0'];
   const name = url.split('casas-')[1].split('/')[0] + '_' + date;
   console.log(name);

   promises = await extractor.house_link_extractor(url, name);
   Promise.all(promises).then(links => {
      const data = extractor.house_data_extractor(links, name);
      res.download(`./routes/api/extract_${name}.csv`);
   });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port=port, hostname=hostname, 
   () => console.log(`Server started on ${hostname}:${port}`));

