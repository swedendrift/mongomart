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


function ItemDAO(database) {
    "use strict"

    this.db = database

    this.getCategories = function(callback) {
        "use strict"

        MongoClient.connect(url, (err, db) => {
          assert.equal(err, null)
          let categories = []

          database.collection('item').aggregate([
            {$group: {_id: "$category", num: {$sum: 1}}},
            {$sort: {_id: 1}}
          ]).toArray((err, data) => {
            categories.push(...data)
            const total = categories.reduce((acc, val) =>{
                return acc + val["num"]
            },0)
            categories.push({_id: "All", num: total})
            callback(categories)
          })
        db.close()
        })
    }

    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict"

         var pageItem = this.createDummyItem()
         var pageItems = []
         for (var i=0; i<5; i++) {
             pageItems.push(pageItem)
         }

        MongoClient.connect(url, (err, db) => {
          assert.equal(err, null)
          const pageItems = []

          if (category === "All") {
            const cursor = database.collection('item').find({})
            cursor
              .sort({_id: 1})
              .skip(page > 0 ? ((page - 1) * itemsPerPage) : 0)
              .limit(itemsPerPage).toArray((err, data) => {
                pageItems.push(...data)
                callback(pageItems)
              })
          } else {
          const cursor = database.collection('item').find({category})
          cursor
            .sort({_id: 1})
            .skip(page > 0 ? ((page - 1) * itemsPerPage) : 0)
            .limit(itemsPerPage).toArray((err, data) => {
              pageItems.push(...data)
              callback(pageItems)
            })
          }
          db.close()
        })
    }

    this.getNumItems = function(category, callback) {
        "use strict"
        const numberOfItems = []
        let numItems = 0

        MongoClient.connect(url, (err, db) => {
          assert.equal(err, null)

          database.collection("item").aggregate([
            { $group: { _id: "$category", num: { $sum: 1 }}}
          ]).toArray((err, data) => {

            numberOfItems.push(...data)
            const total = numberOfItems.reduce((acc, val) => {
                return acc + val["num"]
            },0)
            numItems = total
            callback(numItems)
          })
        db.close()
      })
    }

    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict"
        const pageItems = []
        MongoClient.connect(url, (err, db) => {
          assert.equal(err, null)

          const cursor = database.collection('item').find({ $text: {
            $search: query,
            $caseSensitive: false
          }})

          cursor.sort({_id: 1})
          .skip(page > 0 ? ((page - 1) * itemsPerPage) : 0)
          .limit(itemsPerPage).toArray((err, data) => {
            pageItems.push(...data)
            callback(pageItems)
          })
        db.close()
      })
    }


    this.getNumSearchItems = function(query, callback) {
        "use strict"

        const numberOfItems = []
        let numItems = 0

        MongoClient.connect(url, (err, db) => {
          assert.equal(err, null)

          database.collection("item").aggregate([
            { $group: { _id: "$category", num: { $sum: 1 }}}
          ]).toArray((err, data) => {

            numberOfItems.push(...data)
            const total = numberOfItems.reduce((acc, val) => {
                return acc + val["num"]
            },0)
            numItems = total
            callback(numItems)
          })
        db.close()
      })
    }


    this.getItem = function(itemId, callback) {
        "use strict"
        var itemId = parseInt(itemId)

        MongoClient.connect(url, (err, db) => {
          assert.equal(err, null)

          database.collection("item").find({_id: itemId})
          .toArray((err, item) => {
              assert.equal(null, err)
              callback(item[0])
          })
          db.close()
        })
    }

    this.getRelatedItems = function(callback) {
        "use strict"

      this.db.collection("item").find({})
          .limit(4)
          .toArray((err, relatedItems) => {
              assert.equal(null, err)
              callback(relatedItems)
      })
    }


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict"

         const review = {
           name: name,
           comment: comment,
           stars: stars,
           date: Date.now()
         }

        MongoClient.connect(url, (err, db) => {
          assert.equal(err, null)

          database.collection("item").updateOne(
            {_id: itemId},
            {$push: {reviews: review}},
            {upsert: true}
          )
          let doc = {reviews: [review]}
          callback(doc)
          db.close()
        })
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
            reviews: []
        }

        return item
    }
}


module.exports.ItemDAO = ItemDAO
