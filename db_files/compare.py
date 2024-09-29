import mysql
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

class compare:
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

    def is_present(self, c_symbol, u_id):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "SELECT * FROM COMPARE WHERE C_SYMBOL = %s AND U_ID = %s"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q, (c_symbol, u_id))
            data = cursor.fetchall()
            if data: 
                return True
            else:
                return False

    def get_all_data(self):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "SELECT * FROM COMPARE"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q)
            data = cursor.fetchall()
            return {'status':200, 'data':data}
        else:
            return {"status":db["status"], "data":db["data"]}

    def get_data_by_userID(self, u_id):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "SELECT * FROM COMPARE WHERE U_ID = %s"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q,(u_id,))
            data = cursor.fetchall()
            return {'status':200, 'data':data}
        else:
            return {'status':404, 'data':'database connection error'}        

    def add_company(self, data):
        db = self.db_connection()
        try:
            if db['status'] == 200:
                con = db['connection']
                if not self.is_present(data['c_symbol'], data['u_id']):
                    q = "INSERT INTO COMPARE (U_ID, C_SYMBOL) VALUES (%s, %s)"
                    cursor = con.cursor(dictionary=True)
                    cursor.execute(q, (data['u_id'], data['c_symbol']))
                    db['connection'].commit()
                    return {'status':200, 'data':'company added succesfully'}
                else:
                    return {'status':404, 'data':'company already present in Compare'}
            else:
                return {'status':404, 'data':'database connection error'}
        except:
            return {'status':404, 'data':'database connection error'}

    def remove_company(self, data):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "DELETE FROM COMPARE WHERE C_SYMBOL = %s AND U_ID = %s"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q, (data['c_symbol'], data['u_id']))
            db['connection'].commit()
            return {'status':200, 'data':'company removed succesfully'}
        else:
            return {'status':404, 'data':'database connection error'}
        
    def delete_all_data_by_user(self, u_id):
        db = self.db_connection()
        try:
            if db['status'] == 200:
                con = db['connection']
                q = "DELETE FROM COMPARE WHERE U_ID = %s"
                cursor = con.cursor(dictionary=True)
                cursor.execute(q, (u_id,))
                con.commit()
                return {'status':200, 'data':'Compare cleared successfully'}
        except:
                return {'status':404, 'data':'something went wrong'}
        else:
            return {'status':404, 'data':'company name not found'}
 
    def clear_compare(self):
        db = self.db_connection()
        try:
            if db['status'] == 200:
                con = db['connection']
                q = "TRUNCATE TABLE COMPARE"
                cursor = con.cursor(dictionary=True)
                cursor.execute(q)
                con.commit()
                return {'status':200, 'data':'Compare cleared successfully'}
        except:
                return {'status':404, 'data':'Compare clear error'}
        else:
            return {'status':404, 'data':'database connection error'}



def get_all():
    comp = compare()
    data = comp.get_all_data()
    for company in data['data']:
        print(company)
    return

def is_present(data):
    comp = compare()
    ans = comp.is_present(data['c_symbol'], data['u_id'])
    return ans

def add(data):
    comp = compare()
    insert = comp.add_company(data)
    return insert

def remove(data):
    comp = compare()
    delete = comp.remove_company(data)
    return delete

def data_by_id(u_id):
    comp = compare()
    data = comp.get_data_by_userID(u_id)
    for company in data['data']:
        print(company)

def clear(u_id):
    comp = compare()
    data = comp.delete_all_data_by_user(u_id)
    return data

def truncate():
    comp = compare()
    data = comp.clear_compare()
    return data

if __name__ == '__main__':
    data = {
        'c_symbol' : 'ONGC',
        'u_id' : 3
    }
    print(truncate())