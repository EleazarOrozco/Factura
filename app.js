const mysql = require('mysql');

// Conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234567',
  database: 'minegocio'
});

// JSON de cliente
let cliente = { nombre: 'Nepomuceno', rfc: 'NEPO231010', ciudad: 'Colima', email: 'conocido@gmail.com' };

// JSON de factura
let factura = { fecha: '2023/03/23', total: 150, productos: [{ id: 1, cantidad: 5, costo: 10 }, { id: 2, cantidad: 5, costo: 20 }] };

connection.query('INSERT INTO Clientes (nombre, RFC, ciudad, email) VALUES (?, ?, ?, ?)', [cliente.nombre, cliente.rfc, cliente.ciudad, cliente.email], function(error, results, fields) {
  if (error) throw error;

  let clienteId = results.insertId;

  connection.query('INSERT INTO Facturas (fecha, total, cliente) VALUES (?, ?, ?)', [factura.fecha, factura.total, clienteId], function(error, results, fields) {
    if (error) throw error;

    let facturaFolio = results.insertId;

    factura.productos.forEach(function(producto) {
      connection.query('SELECT cantidad FROM Productos WHERE id = ?', [producto.id], function(error, results, fields) {
        if (error) throw error;

        let cantidadExistente = results[0].cantidad;

        if (cantidadExistente >= producto.cantidad) {
          connection.query('INSERT INTO DetalleFacturas (factura, producto, cantidad, costo) VALUES (?, ?, ?, ?)', [facturaFolio, producto.id, producto.cantidad, producto.costo], function(error, results, fields) {
            if (error) throw error;

            connection.query('UPDATE Productos SET cantidad = ? WHERE id = ?', [cantidadExistente - producto.cantidad, producto.id], function(error, results, fields) {
              if (error) throw error;

              console.log(`Detalle de factura para el producto ${producto.id} insertado correctamente.`);
            });
          });
        } else {
          console.log(`No hay suficiente cantidad en existencia del producto ${producto.id}.`);
        }
      });
    });
  });
});
