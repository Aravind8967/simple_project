from flask import Flask, jsonify,render_template,flash,request,redirect,session, url_for
from Database import Database
from watchlist import watchlist
from flask_cors import CORS

d = {
    "username":"test_user",
    "password":"test_password",
}

app = Flask(__name__)
CORS(app)
app.secret_key = "Aru.8967"

db = Database()     
watch = watchlist()

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        name = request.form["name"]
        password = request.form["password"]
        row_data = db.get_user(name)
        user_data = row_data['data'][0]
        session["user_data"] = user_data
        print(user_data)
        if row_data["status"] == 200:
            if user_data['u_password'] == password:
                print("user login successfull")
                return redirect(f'/home/{user_data["id"]}')
            else:
                print("Password is incurrect", 'danger')
        else:
            print(row_data['data'])
    return render_template("login.html")

@app.route('/home/<int:id>')
def home(id):
    user_data = session.get("user_data")
    watchlist_data = watch.get_data_by_userID(id)['data']
    data = {
        'user':user_data,
        'watchlist' : watchlist_data
    }
    print(data['watchlist'])
    if user_data:
        return render_template("home.html", data=data)
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
                    print(new_user['data'])
                    return redirect('/login')
                else:
                    print(new_user['data'])
            else:
                print("password is incurrect", " | ", pass1, " | ",pass2)
                return redirect('/signup')
        else:
            print("user already present please login")
            return redirect('/login')
    return render_template("signup.html")

@app.route('/home/<int:id>/delete_account')
def delete_account(id):
    print(id)
    userdata = db.get_userid(id)["data"][0]
    return render_template('delete_profile.html', data=userdata)

@app.route('/home/<int:id>/delete_account', methods=['DELETE'])
def delete_acc(id):
    responce = db.delete_user(id)
    return jsonify(responce)

@app.route('/<int:id>/profile')
def profile(id):
    data = db.get_userid(id)["data"][0]
    return render_template("profile.html", data=data)

@app.route('/<int:id>/profile', methods=['POST'])
def profile_update(id):
    if request.method == 'POST':
        name = request.form['u_name']
        password = request.form['u_password']
        # print(id, name, password)
        data = db.get_userid(id)['data'][0]
        responce = db.update_user(data["id"], name, password)
        print(responce)
    return redirect('profile')

@app.route('/home/<int:user_id>/<company_name>')
def add_company(user_id, company_name):
    input_data = {
        'c_name':company_name,
        'u_id':user_id
    }
    watch.add_company(input_data)
    data = watch.get_data_by_cname(company_name, user_id)['data'][0]
    print(data)
    return jsonify(data)

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

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/search')
def search():
    query = request.args.get('query', '').strip()
    db = watch.db_connection()
    if db['status'] == 200:
        connection = db['connection']
        cursor = connection.cursor()

        if query:
            q = "SELECT c_name FROM companies WHERE c_name or c_symbol LIKE %s LIMIT 5"
            cursor.execute(q, (f'%{query}%', )) 
            result = cursor.fetchall()
        else:
            result = []
           
        suggestions = [row[0] for row in result]
        return jsonify(suggestions)
    else:
        print("database connection error")

if __name__ == '__main__':
    app.run(debug=True, port=300)
    # print(login_test('Varsha'))