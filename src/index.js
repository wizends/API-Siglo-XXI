const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({
    limit: '1mb'
}
));

const router = require('../routes/routes')

/**Configuraciones */

app.set('port',3000);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(router)


app.listen(app.get('port'), () =>{
    console.log("Server status 200 on port 3000")
})
