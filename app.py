from flask import Flask, jsonify
from flask_cors import CORS


app=Flask(__name__)

@app.route('/')
def hello_workd():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)