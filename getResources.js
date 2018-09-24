const helpers = require('./helpers');

const getResources = async (FROM, SOURCE, DELAY) => {

    const months = helpers.initMonths(FROM);

    if (months.length === 0) {
        throw new Error('Date is After!')
    }

    const delay = (t) => new Promise((resolve) => setTimeout(() => resolve(''), t));

    const cacheImages = async (images) => {
        const imagesPromises = images.map((uri) => helpers.downloadImage(uri, uri.slice(uri.lastIndexOf('/') + 1)))
        return Promise
            .all(imagesPromises)
            .then(d => console.log('images saved'))
            .catch(e => console.log('images failed', e))
    }

    let data = [];

    try {
        for (let i in months) {
            const m = months[i];
            const titles = [];
            const images = [];

            try {
                console.log('fetching... ', SOURCE + m);
                const $ = await helpers.getHtml(SOURCE + m, m);

                $('figure > span > img').each((i, elem) => {
                    images[i] = elem.attribs['data-lazy-src'];
                });

                await cacheImages(images);

                $('h4 > a').each((i, elem) => {
                    titles[i] = {
                        text: elem.children[0].data,
                        link: elem.attribs['href'],
                        image: images[i].slice(images[i].lastIndexOf('/') + 1),
                        description: ''
                    }
                });

                $('h4 + p').each((i, elem) => {
                    titles[i].description = elem
                        .children
                        .map(c => c.data)
                        .join();

                });

                data = [
                    ...data,
                    ...titles
                ];
            } catch (e) {
                console.log('fetching failed', e);
            }

            await delay(DELAY);
        };

        return data;
    } catch (e) {
        console.log('process failed', e);
    }
}

module.exports = getResources;