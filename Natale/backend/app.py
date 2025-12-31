from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import database.py

app = Flask(__name__)
CORS(app)

#collegamento con mongodb
client = MongoClient(database)
db = client["Library"]
books = db["Books"]

#routes
@app.route("/books", methods=["GET"])
def get_books():
    return jsonify(list(books.find({}, {"_id": 0})))

app.run(port=3000)
