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

        name: $(row).find('.hauptlink a').eq(0).text().trim() || 'N/A',

        id: $(row).find('.hauptlink a').attr('href').split("spieler/")[1] || 'N/A',

        position: $(row).find('td').eq(4).text().trim() || 'N/A',

        shirtNumber: $(row).find('.rn_nummer').eq(0).text().trim() || 'N/A',

        image: $(row).find('td[rowspan="2"] img').attr('data-src') || 'N/A',

        dateOfBirth: $(row).find('.zentriert').eq(1).text().trim().match(/^(\d{2}\/\d{2}\/\d{4}) \((\d{2})\)$/)[1],

        age: $(row).find('.zentriert').eq(1).text().trim().match(/^(\d{2}\/\d{2}\/\d{4}) \((\d{2})\)$/)[2],

        nationality: (() => {

          const nationality_element = $(row).find('.zentriert').eq(2);
          const nationalities = [];

          nationality_element.find('img').each((i, img) => {
            const nationality = $(img).attr('title') || 'N/A';
            if (nationality !== 'N/A') {
              nationalities.push(nationality);
            }
          });

          return nationalities.length > 0 ? nationalities : ['N/A'];
        })(),

        height: $(row).find('.zentriert').eq(3).text().trim().match(/\d{1},\d{2}/)?.[0] || 'N/A',

        foot: $(row).find('.zentriert').eq(4).text().trim() || 'N/A',

        injury: $(row).find('.verletzt-table').length > 0 ? true : false,

        captain: $(row).find('.kapitaenicon-table').length > 0 ? true : false,

        suspension: $(row).find('.ausfall-1-table').length > 0 ? true : false,

        joined: $(row).find('.zentriert').eq(5).text().trim() || 'N/A',

        contractUntil: $(row).find('.zentriert').eq(7).text().trim() || 'N/A',

        marketValue: (() => {

          const marketValueText = $(row).find('.rechts').eq(0).text().trim() || 'N/A';

          if (marketValueText !== 'N/A') {

            const valueMatch = marketValueText.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(mil|mi\.?)\s*([€$£])/);

            if (valueMatch) {

              const rawValue = valueMatch[1].replace(/\./g, '').replace(',', '.'); // Converte 28,00 para 28.00
              const unit = valueMatch[2];
              const currency = valueMatch[3];

              const numericValue = unit === 'mi.' ? parseFloat(rawValue) * 1_000_000 : parseFloat(rawValue) * 1_000;

              return {
                value: numericValue,
                currency: currency
              };
            }
          }

          return { value: 0, currency: 'N/A' };
        })(),

        lastClub: (() => {

          const linkElement = $(row).find('.zentriert').eq(6);

          if (linkElement.length) {

            const clubName = linkElement.find('img').attr('title')?.trim() || 'N/A';
            const clubIdMatch = linkElement.find('a').attr('href')?.match(/verein\/(\d+)/);
            const clubId = clubIdMatch ? clubIdMatch[1] : 'N/A';
            const clubImageUrl = linkElement.find('img').attr('src') || 'N/A';

            return {
              signed_from_club_name: clubName,
              signed_from_club_id: clubId,
              signed_from_club_image_url: clubImageUrl
            };
          }

          return null;

        })(),

        additionalInformation: (() => {

          const linkElement = $(row).find('.wechsel-kader-wappen a');

          if (linkElement.length) {
            const content = linkElement.attr('title')?.trim() || 'N/A';
            const clubName = linkElement.find('img').attr('title')?.trim() || 'N/A';
            const clubIdMatch = linkElement.attr('href')?.match(/verein\/(\d+)/);
            const clubId = clubIdMatch ? clubIdMatch[1] : 'N/A';
            const clubImageUrl = linkElement.find('img').attr('src') || 'N/A';

            return {
              content,
              info_club_name: clubName,
              info_club_id: clubId,
              info_club_image_url: clubImageUrl
            };
          }

          return null;
        })(),

      };

      players.push(playerData);

    });

    return players;

  } catch (error) {

    console.error('Erro ao buscar os dados:', error);
    return [];

  }
}