//Packages required to run this application
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
    console.log(chalk.blue("Welcome Manager!"));
    selectOp();
});

//Options menu for manager application
function selectOp() {
    inquirer
        .prompt([
            {
                name: "action",
                type: "rawlist",
                choices: ["View Products For Sale", "View Low Inventory", "Add To Inventory", "Add New Product"],
                message: "How can we help you today?"
            }
        ]) 
        //Switch Case directs selections to the correct function
        .then(function (answer) {
            switch (answer.action) {
                case "View Products For Sale":
                    displayProducts();
                    break;

                case "View Low Inventory":
                    displayLow();
                    break;

                case "Add To Inventory":
                    updateStock();
                    break;

                case "Add New Product":
                    addProduct();
                    break;
            }
        })
};

//Function to display products
function displayProducts() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            console.log(chalk.yellow(
                "Item Id: " + results[i].item_id +
                "\nProduct Name: " + results[i].product_name +
                "\nPrice: $" + results[i].price +
                "\nQuantity: " + results[i].stock +
                "\n----------------------\n"
            ));

        }
        again()
    })

};

//This function queries the database for any items less then 10 in stock
function displayLow() {
    var query = "SELECT * FROM products WHERE stock<10 "
    connection.query(query, function (err, res) {

        for (var i = 0; i < res.length; i++) {
            console.log(
                "Product: " + res[i].product_name +
                "\nStock: " + res[i].stock +
                "\n----------------\n"
            )

        }
        again()
    })
}

//This Function allows the user to update the stock in the database
function updateStock() {
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "Which product are we updating? (Select by ID)"
            },
            {
                name: "stock",
                type: "input",
                message: "What is the new quantity?"
            }
        ])
        .then(function (answer) {
            connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                    {
                        stock: answer.stock
                    },
                    {
                        item_id: answer.item
                    }
                ],
                function (error) {
                    if (error) throw err;
                    console.log(chalk.green("Item Stock Updated!"))
                    again()
                }
            )

        })
}

//Function to add a product to the database
function addProduct() {
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "Item name?"
            },
            {
                name: "department",
                type: "input",
                message: "Department name?"
            },
            {
                name: "price",
                type: "input",
                message: "Price?"
            },
            {
                name: "stock",
                type: "input",
                message: "Quantity?"
            }
        ]).then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.item,
                    department_name: answer.department,
                    price: answer.price,
                    stock: answer.stock
                },
                function (err) {
                    if (err) throw err;
                    console.log(chalk.green("You added your item successfully!"))
                    again();
                }
            )
        })
}

//Function that allows the user to continue or exit the application
function again() {
    confirm({
        question: "Perform another task?",
    }).then(function confirmed() {
        selectOp();
    }, function cancelled() {
        console.log(chalk.blue("Have a nice day!"));
        return process.exit();
    })

}