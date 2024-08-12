from flask import Flask, abort,jsonify, redirect, render_template, request, url_for
from flask_cors import CORS
from markupsafe import escape
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
CORS(app)
app.secret_key = "Aru.8967"

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/data")
def data():
    massage = {"msg":"this is a massage"}
    return jsonify(massage)

@app.route("/home_1/<name>")
def home_1(name):
    return f"hello, {escape(name)}"

@app.route("/home_2/")
@app.route("/home_2/<name>")
def home_2(name=None):
    return render_template("test.html", name = name)

@app.route("/home_3", methods=['GET','POST'])
def home_3():
    return page_not_found("x")

@app.errorhandler(404)
def page_not_found(error):
    return render_template('test.html'), 404


@app.route("/project/")
def project():
    return "project file"

@app.route("/path/<name>")
def profile_path(name):
    return f"/profile/{name}"

@app.route("/profile/<name>")
def profile(name):
    url = url_for('profile_path', name=name)
    print(url)
    return f"This is profile page for {name}"


@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        name = request.get

if __name__ == '__main__':
    app.run(debug=True, port=301)