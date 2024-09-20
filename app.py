from flask import Flask, jsonify,render_template,flash,request,redirect,session, url_for
from db_files.Database import Database
from db_files.watchlist import watchlist
from db_files.companies import companies
from analyses.analysis import analysis, tradingview, yfinance
from flask_cors import CORS
from tradingview_ta import TA_Handler, Interval, Exchange


d = {
    "username":"test_user",
    "password":"test_password",
}

app = Flask(__name__)
CORS(app)
app.secret_key = "Aru.8967"

db = Database()     
watch = watchlist()
company = companies()

# ========================= Registration =====================================

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
                return redirect(f'/home/{user_data["id"]}')
            else:
                print("Password is incurrect", 'danger')
        else:
            print(row_data['data'])
    return render_template("login.html")

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


@app.route('/logout')
def logout():
    session.clear()
    return redirect('login')

# ========================= Home path data ====================================

@app.route('/home/<int:id>')
def home(id):
    if session.get("user_data"):
        user_data = session.get("user_data")
        watchlist_data = watch.get_data_by_userID(id)['data']
        data = {
            'user':user_data,
            'watchlist' : watchlist_data
        }
        if user_data:
            return render_template("home.html", data=data)
        else:
            return redirect("/login")
    else:
        return redirect("/login")

@app.route('/<c_symbol>/get_data', methods=['GET'])
def get_c_data(c_symbol):
    row_data = analysis(c_symbol)
    data = row_data.company_data()
    return jsonify(data)

@app.route('/home/<c_name>/share_price_arr', methods=['GET'])
def share_price_arr(c_name):
    analys = analysis(c_name)
    price_arr = analys.share_price_range()
    return jsonify(price_arr)

@app.route('/get/<c_name>/yfinance_data', methods=['GET'])
def yfinance_data(c_name):
    yf = yfinance(c_name)
    yf_data = yf.yfinance_data()
    return jsonify(yf_data)

@app.route('/get/<c_symbol>/tradingview_data', methods=['GET'])
def tradingview_data(c_symbol):
    tv_connect = tradingview(c_symbol)
    tv_data = tv_connect.tradingview_data()
    return jsonify(tv_data)

# ==================== Misulanious route ==================================

@app.route('/home/<int:id>/delete_account')
def delete_account(id):
    row_data = db.get_userid(id)["data"][0]
    data = {
        'user':row_data
    }
    return render_template('delete_profile.html', data=data)

@app.route('/home/<int:id>/delete_account', methods=['DELETE'])
def delete_acc(id):
    responce = db.delete_user(id)
    return jsonify(responce)

@app.route('/<int:id>/profile')
def profile(id):
    row_data = db.get_userid(id)["data"][0]
    data = {
        'user':row_data
    }
    return render_template("profile.html", data=data)

@app.route('/<int:id>/profile', methods=['POST'])
def profile_update(id):
    if request.method == 'POST':
        name = request.form['u_name']
        password = request.form['u_password']
        data = db.get_userid(id)['data'][0]
        db.update_user(data["id"], name, password)
    return redirect('profile')

@app.route('/truncate', methods=['GET'])
def truncate():
    db = Database()
    fun = db.truncate_table()
    return jsonify(fun)

@app.route('/get_all_data')
def get_all_data():
    data = db.get_all_data()['data']
    return render_template('all_user.html', data=data)

@app.route('/delete_alldata_by_user/<int:u_id>')
def delete_alldata_by_user(u_id):
    data = watch.delete_all_data_by_user(u_id)
    return jsonify(data)

# =========================== watchlist database rotes =====================

@app.route('/home/<int:user_id>/<company_name>/add_company')
def add_company_to_watchlist(user_id, company_name):
    company_data = company.search_by_name(company_name)['data'][0]
    analysis_company = analysis(company_data['c_symbol'])
    input_data = {
        'u_id':user_id,
        'c_name':company_data['c_name'],
        'share_price': analysis_company.share_price(),
        'c_symbol':company_data['c_symbol']
    }
    watch.add_company(input_data)
    data = watch.get_data_by_userID(user_id)['data']
    return jsonify({"watchlist":data})

@app.route('/<int:user_id>/<c_symbol>/delete_company', methods=['DELETE'])
def remove_company_from_watchlist(user_id, c_symbol):
    data = {
        'c_symbol': c_symbol,
        'user_id': user_id
    }
    responce = watch.remove_company(data)
    print(responce)
    return jsonify(responce)

@app.route('/load_watchlist/<int:user_id>', methods=['GET'])
def load_watchlist_by_user(user_id):
    watchlist_data = watch.get_data_by_userID(user_id)
    return jsonify(watchlist_data)

# =================== testing routes ==================================

@app.route('/test')
def test():
    return render_template('test.html')


# =======================================================================

@app.route('/search')
def search():
    query = request.args.get('query', '').strip()
    db = watch.db_connection()
    if db['status'] == 200:
        connection = db['connection']
        cursor = connection.cursor()
        if query:
            q = "SELECT c_name FROM companies WHERE c_name LIKE %s OR c_symbol LIKE %s LIMIT 5"
            cursor.execute(q, (f'%{query}%', f'%{query}%')) 
            result = cursor.fetchall()
        else:
            result = []
           
        suggestions = [row[0] for row in result]
        return jsonify(suggestions)
    else:
        print("database connection error")


if __name__ == '__main__':
    app.run(debug=True, port=300)