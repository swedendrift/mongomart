/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License")
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const url = "mongodb://localhost:27017/mongomart"

const MongoClient = require('mongodb').MongoClient,
    assert = require('assert')


function CartDAO(database) {
    "use strict"

    this.db = database


    this.getCart = function(userId, callback) {
        "use strict"

        MongoClient.connect(url, (err, db) => {
          assert.equal(err, null)

          const userCart = {
              userId: userId,
              items: []
          }

          database.collection('cart').find({userId: userId}).toArray((err, data) => {
            let cartData = []
            let cartItems = []
            cartData = data[0].items
            cartData.forEach((element) => {
              userCart.items.push(element)
            })
            callback(userCart)
          })
        db.close()
        })
    }


    this.itemInCart = function(userId, itemId, callback) {
        "use strict"

        /*
         *
         * TODO-lab6
         *
         * LAB: #6
         *
         * Write a query that will determine whether or not the cart associated
         * with the userId contains an item identified by itemId. If the cart
         * does contain the item, pass the item to the callback. If it does not,
         * pass the value null to the callback.
         *
         * NOTE: You should pass only the matching item to the callback. Do not
         * pass an array of one or more items or the entire cart.
         *
         * SUGGESTION: While it is not necessary, you might find it easier to
         * use the $ operator in a projection document in your call to find() as
         * a means of selecting the matching item. Again, take care to pass only
         * the matching item (not an array) to the callback. See:
         * https://docs.mongodb.org/manual/reference/operator/projection/positional/
         *
         * As context for this method to better understand its purpose, look at
         * how cart.itemInCart is used in the mongomart.js app.
         *
         */

        callback(null)

        // TODO-lab6 Replace all code above (in this method).
    }

    this.addItem = function(userId, item, callback) {
        "use strict"

        database.collection("cart").findOneAndUpdate(
            {userId: userId},
            {"$push": {items: item}},
            {
                upsert: true,
                returnOriginal: false
            },
            (err, result) => {
                assert.equal(null, err)
                callback(result.value)
            })

    }


    this.updateQuantity = function(userId, itemId, quantity, callback) {
        "use strict"

        /*
        * TODO-lab7
        *
        * LAB #7: Update the quantity of an item in the user's cart in the
        * database by setting quantity to the value passed in the quantity
        * parameter. If the value passed for quantity is 0, remove the item
        * from the user's cart stored in the database.
        *
        * Pass the updated user's cart to the callback.
        *
        * NOTE: Use the solution for addItem as a guide to your solution for
        * this problem. There are several ways to solve this. By far, the
        * easiest is to use the $ operator. See:
        * https://docs.mongodb.org/manual/reference/operator/update/positional/
        *
        */

        var userCart = {
            userId: userId,
            items: []
        }
        var dummyItem = this.createDummyItem()
        dummyItem.quantity = quantity
        userCart.items.push(dummyItem)
        callback(userCart)

        // TODO-lab7 Replace all code above (in this method).

    }

    this.createDummyItem = function() {
        "use strict"

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            quantity: 1,
            reviews: []
        }

        return item
    }

}


module.exports.CartDAO = CartDAO
