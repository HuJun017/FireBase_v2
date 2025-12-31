from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from database import database

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

@app.route("/rent/<int:book_id>", methods=["POST"])
def rent_book(book_id):
    result = books.update_one(
        { "ID": book_id, "available_copies": { "$gt": 0 } },
        { "$inc": { "available_copies": -1 } }
    )

    if result.modified_count == 0:
        return jsonify({ "message": "Libro non disponibile" }), 400

    return jsonify({ "message": "Libro noleggiato con successo" }), 200
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
