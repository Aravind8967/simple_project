from flask import Flask, render_template
import mysql
import mysql.connector

app = Flask(__name__)

db = mysql.connector.connect(
    host='localhost',
    user='Aravind',
    password='Aru.8967',
    database='website'
        )

@app.route('/')
def welcome():
    return "welcome to flask"

@app.route('/database')
def database():
    cursor = db.cursor()
    q = "select * from users"
    cursor.execute(q)
    data = cursor.fetchall()
    return data

@app.route('/home')
def home():
    return render_template('home.html')
    

if __name__ == '__main__':
    app.run(host="localhost", port=200, debug=True)
