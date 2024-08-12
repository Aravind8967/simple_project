from flask import Flask, jsonify,render_template,flash,request,redirect,session, url_for
from Database import Database
from flask_cors import CORS

d = {
    "username":"test_user",
    "password":"test_password",
}

app = Flask(__name__)
CORS(app)
app.secret_key = "Aru.8967"
db = Database()     

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        name = request.form["name"]
        password = request.form["password"]
        row_data = db.get_user(name)
        user_data = row_data['data'][0]
        session["user_data"] = user_data
        if row_data["status"] == 200:
            if user_data['u_password'] == password:
                print("user login successfull")
                return redirect(f'/home/{name}')
            else:
                print("Password is incurrect", 'danger')
        else:
            print(row_data['data'])
    return render_template("login.html")

@app.route('/home/<u_name>')
def home(u_name):
    user_data = session.get("user_data")
    print(u_name)
    print(user_data)
    if user_data:
        return render_template("home.html", data=user_data)
    else:
        print("Please login...")
        return redirect("/login")

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form['name']
        pass1 = request.form['password1']
        pass2 = request.form['password2']
        user_present = True if db.get_user(name)['status'] == 200 else False
        if not user_present:
            if pass1 == pass2:
                data = {
                    "u_name":name,
                    "u_password":pass1
                }
                new_user = db.set_user(data)
                if new_user['status'] == 200:
                    flash(new_user['data'])
                    return redirect('/login')
                else:
                    flash(new_user['data'])
            else:
                flash("password is incurrect")
                return redirect('/signup')
        else:
            print("user already present please login")
            return redirect('/login')
    return render_template("signup.html")

@app.route('/home/<username>/delete_account')
def delete_account(username):
    print(username)
    userdata = db.get_user(username)["data"][0]
    return render_template('delete_profile.html', data=userdata)

@app.route('/home/<username>/delete_account', methods=['DELETE'])
def delete_acc(username):
    responce = db.delete_user(username)
    print(responce["data"])
    return jsonify(responce)

@app.route('/<username>/profile')
def profile(username):
    data = db.get_user(username)["data"][0]
    return render_template("profile.html", data=data)

@app.route('/<username>/profile', methods=['POST'])
def profile_update(username):
    if request.method == 'POST':
        name = request.form['u_name']
        password = request.form['u_password']
        print(username, name, password)
        data = db.get_user(username)['data'][0]
        responce = db.update_user(data["id"], name, password)
        print(responce)
    return redirect('profile')

@app.route('/test')
def test():
    db = Database()
    fun = db.get_user("Varsha")
    return fun

@app.route('/truncate', methods=['GET'])
def truncate():
    db = Database()
    fun = db.truncate_table()
    print(fun['status'], fun['data'])
    return jsonify(fun)

@app.route('/logout')
def logout():
    session.clear()
    return redirect('login')

@app.route('/get_all_data')
def get_all_data():
    data = db.get_all_data()['data']
    return render_template('all_user.html', data=data)

if __name__ == '__main__':
    app.run(debug=True, port=300)
    # print(login_test('Varsha'))