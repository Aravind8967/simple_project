import mysql
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')


class portfolio:
    def db_connection(self):
        try:
            db_connection = mysql.connector.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASSWORD,
                database=DB_NAME
            )
            status = 200
            return {'connection':db_connection, 'status':status}
        except:
            status = 404
            return {'status':status, 'data':'database connection error'}

    def get_all_data(self):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "SELECT * FROM PORTFOLIO"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q)
            data = cursor.fetchall()
            return {'status':200, 'data':data}
        else:
            return {"status":db["status"], "data":db["data"]}
        
    def is_present(self, c_symbol, u_id):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "SELECT * FROM PORTFOLIO WHERE C_SYMBOL = %s AND U_ID = %s"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q, (c_symbol, u_id))
            data = cursor.fetchall()
            if data: 
                return True
            else:
                return False
            
    def add_company(self, data):
        db = self.db_connection()
        try:
            if db['status'] == 200:
                con = db['connection']
                if not self.is_present(data['c_symbol'], data['u_id']):
                    q = "INSERT INTO PORTFOLIO (U_ID, C_SYMBOL, QUANTITY, BOUGHT_PRICE) VALUES (%s, %s,%s, %s)"
                    cursor = con.cursor(dictionary=True)
                    cursor.execute(q, (data['u_id'], data['c_symbol'], data['quantity'], data['bought_price']))
                    db['connection'].commit()
                    return {'status':200, 'data':'company added succesfully'}
                else:
                    return {'status':404, 'data':'company already present in Portfolio'}
            else:
                return {'status':404, 'data':'database connection error'}
        except:
            return {'status':404, 'data':'database connection error'}

    def remove_company(self, data):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "DELETE FROM PORTFOLIO WHERE C_SYMBOL = %s AND U_ID = %s"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q, (data['c_symbol'], data['u_id']))
            db['connection'].commit()
            return {'status':200, 'data':'company removed succesfully'}
        else:
            return {'status':404, 'data':'database connection error'}
        
    def get_data_by_userID(self, u_id):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "SELECT * FROM PORTFOLIO WHERE U_ID = %s"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q,(u_id,))
            data = cursor.fetchall()
            return {'status':200, 'data':data}
        else:
            return {'status':404, 'data':'database connection error'}
        
    def delete_all_data_by_user(self, u_id):
        db = self.db_connection()
        try:
            if db['status'] == 200:
                con = db['connection']
                q = "DELETE FROM PORTFOLIO WHERE U_ID = %s"
                cursor = con.cursor(dictionary=True)
                cursor.execute(q, (u_id,))
                con.commit()
                return {'status':200, 'data':'Portfolio cleared successfully'}
        except:
                return {'status':404, 'data':'something went wrong'}
        else:
            return {'status':404, 'data':'company name not found'}

    def clear_portfolio(self):
        db = self.db_connection()
        try:
            if db['status'] == 200:
                con = db['connection']
                q = "TRUNCATE TABLE PORTFOLIO"
                cursor = con.cursor(dictionary=True)
                cursor.execute(q)
                con.commit()
                return {'status':200, 'data':'Portfolio cleared successfully'}
        except:
                return {'status':404, 'data':'Portfolio clear error'}
        else:
            return {'status':404, 'data':'database connection error'}


def get_all_data():
    pf = portfolio()
    portfolio_all_data = pf.get_all_data()
    for val in portfolio_all_data['data']:
        print(val)    

def insert_data(data):
    pf = portfolio()
    print(pf.add_company(data))

def remove_data(data):
    pf = portfolio()
    print(pf.remove_company(data))

def get_data_by_user(u_id):
    pf = portfolio()
    data = pf.get_data_by_userID(u_id)
    for val in data['data']:
        print(val)

def clear_table():
    pf = portfolio()
    print(pf.clear_portfolio())

def del_by_u_id(u_id):
    pf = portfolio()
    print(pf.delete_all_data_by_user(u_id))



if __name__ == '__main__':
    data = {
        'u_id': 11,
        'c_symbol' : 'ITC',
        'quantity' : 10,
        'bought_price' : 500
    }

    rm_data = {
        'c_symbol' : 'TCS',
        'u_id' : 12
    }
    insert_data(data)
    