const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const test = 'http://189.253.141.202:3829';
const base = 'https://www.icasas.mx';
const url = 'https://www.icasas.mx/venta/habitacionales-casas-guanajuato-2_5_11_0_0_0/list';


async function house_link_extractor(url, name='test') {
   const body = await fetch(url).then(res => {
      console.log(res.status);
      return res.text();
   });

   const root = await cheerio.load(body, {decodeEntities: false});

   const house_pages = [];
   const links = [];

   root('.detail-redirection').each((i, el) => {
      const link = root(el).attr('href');

      const innerbody = fetch(base+link).then(res => {
         return res.text();
      });
      house_pages.push(innerbody);
      links.push(link);
   });
   return house_pages;
};


function house_data_extractor(house_pages, name) {
   //const writeStream = fs.createWriteStream(`./routes/api/extract_${name}.csv`);
   const headers = 'loc,ubicacion,precio,dim_m2,cuartos,baños,etc\n';
   const loc = name.split('_')[0].slice(0, -2);
   //writeStream.write(headers);

   let houses = headers;
   for (const innerbody of house_pages) {
      const $ = cheerio.load(innerbody, {decodeEntities: false});

      const ubicacion = $('.location_info').text().replace(/,/g, '');
      const precio = $('.left-part .price h2').text().trim().replace(/,/g, '').replace(' MX$', '');
      const dim = $('.left-part .dimensions').text().trim().replace(/,/g, '').replace('m2', '');
      const cuartos = $('.left-part .bedrooms').text().split(' ')[0];
      const baños = $('.left-part .bathrooms').text().split(' ')[0];

      let etc = '';
      $('.icons li').each((i, el) => {
         etc += $(el).text().trim('\t') + ';';
      });

      const house = `${loc},${ubicacion},${precio},${dim},${cuartos},${baños},${etc}\n`;
      //writeStream.write(house);
      houses += house;
   };
   //writeStream.end();
   fs.writeFileSync(`./routes/api/extract_${name}.csv`, houses, () => {
      console.log('Done')
   })
   return houses;
};



exports.house_link_extractor = house_link_extractor;
exports.house_data_extractor = house_data_extractor;

