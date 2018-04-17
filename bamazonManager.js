var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    startProgram();
});

function startProgram() {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
        name: "command"
    }]).then(function (inquirerResponse) {
        if (inquirerResponse.command === "View Products for Sale") {
            printProducts();
        }
        if (inquirerResponse.command === "View Low Inventory") {
            lowInventory();
        }
        if (inquirerResponse.command === "Add to Inventory") {
            addInventory();
        }
        if (inquirerResponse.command === "Add New Product") {
            addNew();
        }
    })
};

function printProducts() {
    connection.query("SELECT*FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        doMore();
    })
}

function lowInventory() {
    connection.query("SELECT*FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        console.log("The products below are running low on inventory. If no products show up, there are more than 5 of each item in inventory.");
        console.table(res);
        doMore();
    });
}

function addInventory() {
    connection.query("SELECT*FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        inquirer.prompt([{
            type: "input",
            message: "Please enter the item_id of the item you'd like to add inventory to",
            name: "itemId"
        }, {
            type: "input",
            message: "How many of the items would you like to add to the inventory?",
            name: "quantityItem"
        }]).then(function (inquirerResponse) {
            connection.query("SELECT stock_quantity FROM products WHERE item_id = ?", [inquirerResponse.itemId], function (err, res) {
                if (err) throw err;
                var stockQuantity = parseInt(res[0].stock_quantity);
                stockQuantity = stockQuantity + parseInt(inquirerResponse.quantityItem);
                connection.query("UPDATE products SET ? WHERE ?", [{ "stock_quantity": stockQuantity }, { "item_id": inquirerResponse.itemId }], function (err, res) {
                    if (err) throw err;
                    connection.query("SELECT product_name FROM products WHERE item_id = ?", [inquirerResponse.itemId], function (err, res) {
                        if (err) throw err;
                        console.log("You've added " + inquirerResponse.quantityItem + " " + res[0].product_name + "(s) to the inventory.");
                        doMore();
                    })
                })
            })
        })
    })
};

function addNew() {
    inquirer.prompt([{
        type: "input",
        message: "Please enter the name of the product you'd like to add.",
        name: "product_name"
    }, {
        type: "input",
        message: "What department does this item belong to?",
        name: "department_name"
    },{
        type: "input",
        message: "How much would you like to sell the item for?",
        name: "price"
    },{
        type: "input",
        message: "How many of these items are you adding to the inventory?",
        name: "stock_quantity"
    }]).then(function (inquirerResponse) {
        connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)", [inquirerResponse.product_name, inquirerResponse.department_name, inquirerResponse.price, inquirerResponse.stock_quantity], function (err, res) {
            if (err) throw err;
            console.log("You've added "+inquirerResponse.stock_quantity+" "+inquirerResponse.product_name+"(s) to the "+inquirerResponse.department_name+" department. You've set the price to $"+inquirerResponse.price+".")
            doMore();
        })
    })
};

function doMore() {
    inquirer.prompt([{
        type: "list",
        message: "Would you like to do something else?",
        choices: ["Yes", "No"],
        name: "yesorno"
    }]).then(function (inquirerResponse) {
        if (inquirerResponse.yesorno === "Yes") {
            startProgram();
        } else {
            console.log("Thank you for using Bamazon ManagerView!")
            connection.end();
        }
    })
};