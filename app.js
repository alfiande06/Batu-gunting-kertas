const express = require('express');
const app = express();
const methodOverride = require('method-override');
const PORT = process.env.PORT || 3001;
const pool = require('./config/server');
const bodyParser = require('body-parser');
const ejs = require('ejs'); // Impor modul EJS


// Middleware untuk menguraikan body dari request HTTP
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk parsing body dari permintaan POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware untuk penyediaan file statis dari folder 'assets'
app.use('/assets', express.static(__dirname + '/assets'));

// Middleware untuk penyediaan file statis dari folder 'views'
app.use('/views', express.static(__dirname + '/views'));

// Middleware untuk penyediaan file statis dari folder 'controller'
app.use('/controllers', express.static(__dirname + '/controllers'));

// Set view engine ke EJS
app.set('view engine', 'ejs');

//Gunakan method override

app.use(methodOverride('_method'));


// Routes
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/viewGameHistory', async (req, res) => {
    try {
        // Query untuk mengambil data dari tabel gamehistory
        const query = 'SELECT * FROM gamehistory';
    
        // Eksekusi query menggunakan pool
        const result = await pool.query(query);
    
        // Render file gamehistory.ejs dan kirimkan sebagai respons
        ejs.renderFile(__dirname + '/views/gamehistory.ejs', { gamehistory: result.rows }, (err, html) => {
          if (err) {
            console.error('Gagal merender file:', err.message);
            res.status(500).send('Terjadi kesalahan saat merender file.');
          } else {
            res.send(html);
          }
        });
    } catch (error) {
        console.error('Gagal mengambil data dari database:', error.message);
        res.status(500).send('Terjadi kesalahan saat mengambil data.');
    }
});

app.post('/saveResult', async (req, res) => {
    //Ambil value API dari req.body
    const { playerChoice, computerChoice, result } = req.body;
    
  
    try {
      // Query untuk menyimpan data ke tabel historygame
      const query = {
        text: 'INSERT INTO gamehistory (player_choice, comp_choice, winner) VALUES ($1, $2, $3)',
        values: [playerChoice, computerChoice, result],
      };
  
      // Eksekusi query menggunakan pool
      await pool.query(query);
  
      console.log('Data berhasil disimpan ke database.');
      res.status(200).send('Data berhasil disimpan.');
    } catch (error) {
      console.error('Gagal menyimpan data ke database:', error.message);
      res.status(500).send('Terjadi kesalahan saat menyimpan data.');
    }
  });

  app.delete('/gamehistory/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Query untuk menghapus data dari tabel gamehistory berdasarkan ID
        const query = {
            text: 'DELETE FROM gamehistory WHERE id = $1',
            values: [id]
        };

        // Eksekusi query menggunakan pool
        const result = await pool.query(query);

        // Periksa apakah data berhasil dihapus
        if (result.rowCount === 1) {
            console.log(`Data dengan ID ${id} berhasil dihapus dari tabel gamehistory.`);
            res.status(200).send(`Data dengan ID ${id} berhasil dihapus.`);
        } else {
            console.log(`Data dengan ID ${id} tidak ditemukan.`);
            res.status(404).send(`Data dengan ID ${id} tidak ditemukan.`);
        }
    } catch (error) {
        console.error('Gagal menghapus data dari tabel gamehistory:', error.message);
        res.status(500).send('Terjadi kesalahan saat menghapus data.');
    }
});



app.get('/gamehistory/detail/:id', async function (req, res){
  const id = req.params.id;
  const rawData = await pool.query(`
  SELECT id,player_choice, comp_choice, winner 
  from gamehistory where id = $1`, [id]);
  const data = rawData.rows[0];

  res.status(200).render('detail/index', {
    dataUpdate : data
  })
});

//update

app.put('/gamehistory/update/:id', async function(req, res) {
  const id = req.params.id;
  const payload = req.body;

  try {
    // Ambil data lama dari database
    const rawOldData = await pool.query(`
      SELECT player_choice, comp_choice, winner, id FROM gamehistory WHERE id = $1
    `, [id]);
    const oldData = rawOldData.rows[0];

    // Gunakan nilai baru jika tersedia, atau gunakan nilai lama
    const player_choice = payload.player_choice || oldData.player_choice;
    const comp_choice = payload.comp_choice || oldData.comp_choice;
    const winner = payload.winner || oldData.winner;

    // Lakukan update data dalam database
    await pool.query(`
      UPDATE gamehistory 
      SET player_choice = $1, comp_choice = $2, winner = $3 
      WHERE id = $4
    `, [player_choice, comp_choice, winner, id]);

    // Kirim respons setelah berhasil update
    
    res.redirect('/viewGameHistory');
  } catch (error) {
    console.error("Error updating data:", error);
    // Kirim respons kesalahan jika terjadi error
    res.status(500).send("An error occurred while updating data");
  }
});




// Port binding
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

pool.query('SELECT * FROM gamehistory', (err, res) => {
    if (err) {
        return console.error('Error executing query', err.stack);
    }
    console.log('Rows from the gamehistory table:', res.rows);
});