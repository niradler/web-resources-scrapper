const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
const moment = require('moment');

const saveFile = (path, fileName, body) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    const target = `${path}/${fileName}`
    return new Promise((resolve, reject) => {
        fs.writeFile(target, body, (err) => {
            if (err) {
                reject(err);
            }

            resolve(target);
        });
    })
}

const restoreFile = (path, fileName) => {
    const target = `${path}/${fileName}`
    return new Promise((resolve, reject) => {
        fs.readFile(target, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data)
        });
    })
}

const getHtml = async(uri, date) => {
    const options = {
        uri: uri,
        transform: (body) => {
            saveFile('htmls', `${date}.html`, body).catch((e) => console.log('error in save file', e));
            return cheerio.load(body);
        }
    };

    try {
        const body = await restoreFile('htmls', `${date}.html`);
        return cheerio.load(body)
    } catch (e) {
        console.log('backup file not found!', `htmls/${date}.html`);
    }

    return rp(options);
}

const downloadImage = (uri, filename) => {
    if (!fs.existsSync('./images')) {
        fs.mkdirSync('./images');
    }
    const target = `images/${filename}`;
    return new Promise((resolve, reject) => {
        restoreFile('images', filename).then((f) => resolve('cache')).catch((e) => {
            console.log('backup image not found!', target);
            request.head(uri, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                request(uri)
                    .pipe(fs.createWriteStream(target))
                    .on('close', () => resolve('saved'));
            });
        })

    })

};

const initMonths = (FROM) => {
    let from = moment(FROM, 'MM-YYYY');
    const months = [];

    if (from.isAfter(moment())) {
        return months;
    }

    months.push(from.format('MM-YYYY'));
    const last = {
        month: moment().month(),
        year: moment().year()
    };

    while (true) {
        from = from.add(1, 'months');
        from.month()

        if (from.month() > last.month && from.year() === last.year) 
            break;
        
        months.push(from.format('MM-YYYY'))
    }

    return months;
}

module.exports = {
    saveFile,
    getHtml,
    downloadImage,
    initMonths
}