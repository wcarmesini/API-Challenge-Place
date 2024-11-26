
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchPlayerData(id_clube) {
  
  const url = `https://www.transfermarkt.com.br/club/kader/verein/${id_clube}/plus/1`;
  
  try {

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const players = [];

    $('table.items tbody tr.odd, table.items tbody tr.even').each((index, row) => {

      const playerData = {
        name: $(row).find('.hauptlink a').eq(0).text().trim(),
        position: $(row).find('td').eq(4).text().trim(),
        shirtNumber: $(row).find('.rn_nummer').eq(0).text().trim(),
        id: $(row).find('.hauptlink a').attr('href').split("spieler/")[1] || 'N/A',
        urlImage: $(row).find('td[rowspan="2"] img').attr('data-src') || 'N/A'
      };

      players.push(playerData);

    });

    return players;

  } catch (error) {

    console.error('Erro ao buscar os dados:', error);
    return [];

  }
}