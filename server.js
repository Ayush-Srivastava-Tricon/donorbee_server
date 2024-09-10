const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require("cors");
const serverless = require('serverless-http');
const router = express.Router();
const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  
  password: '',  
  database: 'blood_donor_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

router.get("/",(req,res)=>{
  res.send({"message":"Connected"});
})

// API to register a new blood donor
router.post('/api/register', (req, res) => {
  const { name, blood_type, state, city, contact_info, age, last_donation_date } = req.body;
  const sql = `INSERT INTO donors (name, blood_type, state, city, contact_info, age, last_donation_date) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.query(sql, [name, blood_type, state, city, contact_info, age, last_donation_date], (err, result) => {
    if (!err){
      res.send({ message: 'Thankyou for registering', id: result.insertId,status:200 });
    }else{
      res.send({ message: err.code == 'ER_DUP_ENTRY' ? 'Already Registered': err.sqlMessage, status:400 });
    }
  });
});

// API to find donors by location and blood type
router.post('/api/find', (req, res) => {
  const { city, state, bloodType } = req.body;
  console.log(req.body);
  
  const sql = `SELECT * FROM donors WHERE blood_type = ? AND state = ? AND city = ?  AND availability = TRUE`;
  
  db.query(sql, [bloodType, state, city], (err, results) => {
    if (err) throw err;
      res.send({message:"Donor Found", status : 200, data:results});
  });
});

app.use('/.netlify/server', router);
module.exports.handler = serverless(app);


app.listen(3000, () => {
  console.log('Server running on port 3000');
});
