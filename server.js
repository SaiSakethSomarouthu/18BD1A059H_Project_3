const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
var db;
MongoClient.connect('mongodb://localhost:27017/fwS', (err, database) => {
    if(err) return console.log(err)
    db = database.db('fwS')
    app.listen(1000, () => {
        console.log('Listening at port number 1000')
    })
})
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/', (req, res) => {
    db.collection('Stock').find().toArray((err, result) => {
        if(err) return console.log(err)
        res.render('index.ejs', {data: result})
    })
})
app.get('/deletestock', (req, res) => {
    db.collection('Stock').deleteOne({"Product ID": Number.parseInt(req.query["productid"])})
    db.collection('Stock').find().toArray((err, result) => {
        if(err) return console.log(err)
        res.redirect('/')
    })
})
app.get('/updatestock', (req, res) => {
    db.collection('Stock').find({"Product ID": Number.parseInt(req.query["productid"])}).toArray((err, result) => {
        if(err) return console.log(err)
        res.render('updatestock.ejs', {data: result})
    })
})
app.post('/update', (req, res) => {
    db.collection('Stock').updateOne({"Product ID": Number.parseInt(req.body["ProductID"])}, {$set: {"Quantity": Number.parseInt(req.body["NewQuantity"]),"Cost Price": Number.parseInt(req.body["NewCostPrice"]),"Selling Price": Number.parseInt(req.body["NewSellingPrice"])}})
    res.redirect('/')
})
app.get('/addstock', (req, res) => {
    res.render('addstock.ejs')
})
app.post('/add', (req, res) => {
    db.collection('Stock').insertOne({
        "Product ID": Number.parseInt(req.body["ProductID"]),
        "Brand": req.body["Brand"],
        "Category": req.body["Category"],
        "Name": req.body["Name"],
        "Size": Number.parseInt(req.body["Size"]),
        "Quantity": Number.parseInt(req.body["Quantity"]),
        "Cost Price": Number.parseInt(req.body["CostPrice"]),
        "Selling Price": Number.parseInt(req.body["SellingPrice"])
    })
    res.redirect('/')
})
app.get('/salesdetails', (req, res) => {
    db.collection('Sales').find().toArray((err, result) => {
        if(err) return console.log(err)
        res.render('salesdetails.ejs', {data: result})
    })
})
app.get('/updatesales', (req, res) => {
    db.collection('Stock').find({}, {"Product ID": 1, "_id": 0}).toArray((err, result) => {
        if(err) return console.log(err)
        res.render('updatesales.ejs', {data: result})
    })
})
app.post('/updatesalesdetails', (req, res) => {
    var result = db.collection('Stock').find({"Product ID": Number.parseInt(req.body["ProductID"])}).toArray().then( result => {
        var quantity = result[0]["Quantity"] - Number.parseInt(req.body["Quantity"]);
        if(quantity >= 0){
            db.collection('Sales').insertOne({
                "Purchase Date": req.body["PurchaseDate"],
                "Product ID": Number.parseInt(req.body["ProductID"]),
                "Unit Price": result[0]["Selling Price"],
                "Quantity": Number.parseInt(req.body["Quantity"]),
                "Total Sales": Number.parseInt(req.body["Quantity"]) * result[0]["Selling Price"]
            })
            db.collection('Stock').updateOne({"Product ID": Number.parseInt(req.body["ProductID"])}, {$set: {"Quantity": quantity}})
        }
    })
    res.redirect('/salesdetails')
})