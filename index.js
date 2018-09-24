require('dotenv').config()
const moment = require('moment');
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const getResources = require('./getResources');
const app = express();
const {
    SOURCE,
    FROM = moment().format('MM-YYYY'),
    DELAY = 100
} = process.env;


app.use(cors());
app.use(bodyParser.json());

app.get('/resources', async (req, res) => {
    const {
        from = FROM, source = SOURCE
    } = req.query;
    const response = await getResources(from, source, DELAY).catch(e => res.json({
        err: e.message
    }));

    return res.json(response);
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('App listening on port ' + PORT))