const {Router} = require('express');
const { DB_TYPE_BFILE } = require('oracledb');
const router = Router();
const BD = require('../config/config')

router.get('/',(req,res)=>{
    res.status(200).json({
        message: "Este mensaje viene del server"
    })
})

//GET para productos
router.get('/products', async (req, res) => {
    sql = "select nombre, precio, id from plato"
    const result = await BD.Open(sql,[],false);
    const resultado = result.rows
    let data2 = []
    resultadoFinal = resultado.forEach(e => {
        let data = {
            nombre: e[0],
            precio: e[1],
            id: e[2]
        }
        data2.push(data)
    });  
    res.json(data2)
})

//POST para obtener el id del cliente actual en la mesa
router.post('/cliente-mesa', async (req, res) => {
    sql = "select cliente_id_cliente from reserva where mesa_id = :mesaId"
    const {IdMesa} = req.body;
    const result = await BD.Open(sql,[IdMesa],false);
    const resultado = result.rows[0]
    res.json(resultado)
})

//POST para ingresar el pedido
router.post('/pedido',async (req, res) => {
    console.log(req.body)
    const {id,hora,producto,idCliente} = req.body;
    sql = "BEGIN sp_insertarOrden(:id,:hora,:producto,:idCliente); END;" ;
    const result = await BD.Open(sql,[id,hora,producto,idCliente],true);
    res.json("Pedido ingresado al sistema");
})


//POST para obtener id de mesa 
router.post('/fromoracle',async (req, res) => {
    const {tipoMesa,cantidadPersonas} = req.body;
    sql = "select id from mesa where zona = :tipoMesa and sillas = :cantidadPersonas and estado = 'Disponible'" ;
    const result = await BD.Open(sql,[tipoMesa,cantidadPersonas],false);
    const mesa = result.rows[0]
    res.json({mesa});
})

//POST para insertar reservas(se inserta un cliente y una reserva, ademas se setea el status de mesa en "Ocupada")

router.post('/agregarReserva', async (req, res) => {
    console.log(req.body)
    const { 
        nombre, 
        apellido, 
        rut, 
        telefono, 
        email, 
        fechaHora, 
        cantidadPersonas, 
        tipoMesa, 
        idReserva, 
        clienteId, 
        mesaId 
    } = req.body
    sql = "BEGIN sp_insertarreserva(:idReserva,:fechaHora,:cantidad,:idCliente,:idMesa); END;";
    sql2 = "BEGIN sp_insertarCliente(:id,:nombre,:apellido,:rut,:email,:telefono); END;"
    const resp2 = await BD.Open(sql2,[clienteId,nombre,apellido,rut,email,telefono], true);
    const resp = await BD.Open(sql, [idReserva,fechaHora,cantidadPersonas,clienteId,mesaId], true);
    res.json("Reserva creada")
});





///Mercado Pago

const mercadopago = require ('mercadopago');

// Agrega credenciales
mercadopago.configure({
    access_token: 'TEST-4456146486149202-120901-c3269bef48d73bc1614748a7f336620a-234914727'
  });

router.post("/create_preference", (req, res) => {
    console.log(req.body)

	let preference = {
		items: [
			{
				unit_price: Number(req.body.precio),
				quantity: Number(req.body.cantidad),
			}
		],
		back_urls: {
			"success": "http://localhost:3000/feedback",
			"failure": "http://localhost:3000/feedback",
			"pending": "http://localhost:3000/feedback"
		},
		auto_return: "approved",
	};

	mercadopago.preferences.create(preference)
		.then(function (response) {
			res.json({
				id: response.body.id
			});
		}).catch(function (error) {
			console.log(error);
		});
});

router.get('/feedback', function(req, res) {
	res.json({
		Payment: req.query.payment_id,
		Status: req.query.status,
		MerchantOrder: req.query.merchant_order_id
	});
});


module.exports = router;