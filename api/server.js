//to view es6 capabilities see http://node.green/
//node v8-options es6 module syntax currently under development (2016/06/25)
let path = require('path');
let express = require('express');
let expressHbs = require('express-handlebars');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let routes = require('./routes/index');
let app = express();
let mongoose = require('mongoose');
let config = require('config');
var morgan = require('morgan')
mongoose.connect(config.get('dbConnection'));
var program = require('commander');

program
    .version('0.1.0')
    .option('-m, --migrate')
    .parse(process.argv);
if (program.migrate) {
    require('./migration/index');
}


    //settings
    app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

//view engine & main template
app.engine('.hbs', expressHbs({
    defaultLayout: 'template',
    extname: '.hbs',
    helpers: {
        eq: function (val, val2, options) {
            if (val === val2) {
                return options.fn(this);
                // return block(this)
            }
        },
        amountInArray: function (arr, coin, options) {
            if (!arr || !Array.isArray(arr)) return 0;
            // console.log(arr, coin)
            arr.filter((item) => {
                console.log(item.coin_type === coin)
                item.coin_type === coin;
            });
            // console.log(coinArray)
            return arr[0] && arr[0].confirmed_amount || 0;
        }
    }
}));
app.set('view engine', '.hbs');

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use((req, res, next) => {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE");
    res.sendResponse = (body, statusCode, msg) => {

        let response = {};
        response['body'] = body;
        response['statusCode'] = statusCode;
        response['message'] = msg;
        response['status'] = 'success';
        res.json(response);
    }
    next();
});
app.use('/public', express.static('public'));

//router
app.use('/', routes);

app.use(function (err, req, res, next) {
    console.log(err)
    let response = {};
    response['body'] = err.message;
    response['statusCode'] = 500;
    response['message'] = err.message;
    response['status'] = 'fail';
    res.json(response);
});
//server
app.listen(app.get('port'), () => console.log('Listening on http://localhost:' + app.get('port')));

