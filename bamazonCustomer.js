var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon_DB"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  //connection.end();
});
showProducts();

/*Products user can choose from*/
function showProducts() {

  connection.query("SELECT * FROM products", function(err, res) {
  if (err) throw err;    
  for (let record in res) {
      let product = res[record]

      console.log(
          "Item Id: ", product.item_id,
          "Product Name: ", product.product_name, 
          "Department Name: ", product.department_name,
          "Price: ", product.price, 
          "Stock Quantity: ", product.stock_quantity
      )        
    }
  //connection.end();
  });
}
inquirePrompt();

function inquirePrompt(){
  showProducts();
  inquirer
    .prompt([
      {
        name: "userItem_id",
        message: "What is the id of the product you would like to order?"
      },
      {
        name: "userQuantity",
        message: "How many would you like?"
      }]) 
     .then(function(answers){
       console.log(answers);
       checkStock(answers);
     });

          
}

function checkStock(answers) {
  connection.query("SELECT stock_quantity, item_id, price FROM products WHERE item_id ='" + answers.userItem_id + "'", function(err, res) {
    if (err) throw err;
    if (answers.userQuantity <= res[0].stock_quantity) {
      var newQuantity = res[0].stock_quantity - answers.userQuantity;
      var cost = answers.userQuantity * res[0].price;
      console.log("Price " + res[0].price)
      console.log("new quantity: " + newQuantity);
    
      connection.query(
        "UPDATE products SET ? WHERE ?",
        [{stock_quantity: newQuantity},
          {item_id: answers.userItem_id}],
        function(err, res) {
          if (err) throw err;
          console.log("The cost of your order is $" + cost);
          connection.end();
        })
    }
    else {
      console.log("Insufficient quantity");
      
      connection.end();
    }
  });
}

function exitHandler(options, err) {
  connection.end();
  if (options.cleanup)
      console.log('clean');
  if (err)
      console.log(err.stack);
  if (options.exit)
      process.exit();
}