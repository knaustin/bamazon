//Packages required for this application
require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var confirm = require('inquirer-confirm');
var chalk = require('chalk');


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_PASSWORD,
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(chalk.blue.bold("Welcome to Bamazon!\n------------\n"));
    start();
});
//Function that allows the user to look at the inventory or exit the application
function start() {
    confirm({
        question: "Would you like to start shopping?",
    }).then(function confirmed() {
        displayItems();
    }, function cancelled() {
        console.log(chalk.blue.bold("Have a nice day!"));
        return process.exit();
    })
}
//Displays products from the database
function displayItems() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
    for (var i = 0; i < results.length; i++) {
        console.log(chalk.yellow(
            "Item Id: " + results[i].item_id +
            "\nProduct Name: " + results[i].product_name +
            "\nPrice: $" + results[i].price +
            "\n----------------------\n"
        ));
    }
   //Asks the user which item they would like to purchase using ID, and the quanity
        inquirer
            .prompt([
               {
                    name: "item",
                    type: "input",
                    message: "Which item would you like to purchase? (Please enter item's ID)"
                },
                {
                    name: "buy",
                    type: "input",
                    message: "How many would you like to purchase?"
                }
            ])
            .then(function (answer) {
                var chosenProduct;
                //If there is enough stock, this subtracts the stock from the database, and creates a total
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_id == answer.item) {
                        chosenProduct = results[i];
                    }
                }
                console.log(chalk.blue(
                    "Item Id: " + chosenProduct.item_id +
                    "\nProduct Name: " + chosenProduct.product_name +
                    "\nPrice: $" + chosenProduct.price +
                    "\n----------------------\n"
                ));
                if (chosenProduct.stock > parseInt(answer.buy)) {
                    
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock: chosenProduct.stock - parseInt(answer.buy)
                            },
                            {
                                item_id: chosenProduct.item_id
                            }
                        ],
                        function (err) {
                            if (err) throw err;
                            var total = chosenProduct.price * parseInt(answer.buy);
                            console.log(chalk.green("----------------\nItem(s) purchased sucessfully! \nYour Total is: $" + total + "\n----------------"))
                            buyAgain();
                        }
                    );
                }
                //If there is not enough stock, the user is asked if they would like to continue shopping
                else {
                    console.log(chalk.red("Not enough stock!"));
                    buyAgain();
                }
            });
    });
}
//Allows user to continue shopping or exit the application
function buyAgain() {
   confirm({
       question: "Continue Shopping?",
   }).then(function confirmed() {
       displayItems();
   }, function cancelled() {
       console.log(chalk.blue("Have a nice day!"));
       return process.exit();
   })

}