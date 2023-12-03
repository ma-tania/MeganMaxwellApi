const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

// crear y configurar servidor
const app = express();
app.use(cors());
app.use(express.json());

// conexion con la BD
async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.PASS,
    database: process.env.DATABASE,
  });
  connection.connect();
  return connection;
}

const port = 4001;
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

//ENDPOINTS
//post (añadir más libros)
app.post('/libros', async (req, res) => {
  const dataLibros = req.body;
  const { titulo, saga, any, genero } = dataLibros;
  let sqlPost =
    'INSERT INTO libros (titulo, saga, any, genero) VALUES (?, ?, ?, ?);';
  try {
    //conexion bd
    const conn = await getConnection();
    //ejecutar consulta
    const [results] = await conn.query(sqlPost, [titulo, saga, any, genero]);
    //validar si se ha insertado
    if (results.affectedRows === 0) {
      res.json({
        success: false,
        message: 'No se ha podido añadir',
      });
      return;
    }
    res.json({
      success: true,
      message: "Añadido correctamente",
      id: results.insertId,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Ha ocurrido un error${error}`,
    });
  }
});

//get (obtener todos los libros)
app.get('/libros', async (req, res) => {
  let queryGet = 'SELECT * FROM libros';
  //conexion bd
  const conn = await getConnection();
  //ejecutar consulta
  const [results] = await conn.query(queryGet);
  const numOfElements = results.length;
  res.json({ info: { count: numOfElements }, results: results });
  conn.end();
});

// get (obtener un libro por ID)
app.get("/libros/:id", async (req, res) => {
  const idLibros = req.params.id;
  /*if (idLibros <54){
  res.json({
    succes: false,
    error: "No hay datos",
  });
  return;
  }*/  //otra manera de validar que no hay libros en los primero 53 id
  let queryGetId = "SELECT * FROM libros WHERE id = ?"
  const conn = await getConnection();
  const [results] = await conn.query(queryGetId, [idLibros]);
  const numOfElements = results.length;
  if(numOfElements === 0){
    res.json({
    success: true,
    message: "No hay datos",
    });
    return;
    }
  res.json({
  results: results[0]
  });
});

//put (actualizar)
app.put('/libros/:id', async (req, res) => {
  const dataLibros = req.body;
  const {titulo, saga, any, genero} = dataLibros
  const idLibros = req.params.id;
  let sqlPut = "UPDATE libros SET titulo = ?, saga = ?, any = ?, genero = ? WHERE id = ?";
  //conexion bd
  const conn = await getConnection();
  //ejecutar consulta
  const [results] = await conn.query(sqlPut, [
  titulo,
  saga,
  any,
  genero,
  idLibros
]);
res.json ({
success: true,
message: "Actualizado correctamente"
});
});

//delete (eliminar libro)
app.delete('/libros/:id', async (req, res) => {
  const idLibros = req.params.id;
  let sqlDelete= "DELETE FROM libros WHERE id = ?";
  const conn = await getConnection();
  const [results] = await conn.query(sqlDelete, [idLibros]);
    res.json({
      success: true,
      message: "Borrado correctamente"
    })
});
