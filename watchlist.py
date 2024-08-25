import mysql
import mysql.connector

class watchlist:
    def db_connection(self):
        try:
            db_connection = mysql.connector.connect(
                host='localhost',
                user='Aravind',
                password='Aru.8967',
                database='website'
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
            q = "SELECT * FROM WATCHLIST"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q)
            data = cursor.fetchall()
            return {'status':200, 'data':data}
        else:
            return {"status":db["status"], "data":db["data"]}
    
    def add_company(self, data):
        db = self.db_connection()
        try:
            if db['status'] == 200:
                con = db['connection']
                q = "INSERT INTO WATCHLIST (C_NAME, U_ID) VALUES (%s, %s)"
                cursor = con.cursor(dictionary=True)
                cursor.execute(q, (data['c_name'], data['u_id']))
                db['connection'].commit()
                return {'status':200, 'data':'company added succesfully'}
        except:
                return {'status':404, 'data':'company already present in watchlist'}
        else:
            return {'status':404, 'data':'database connection error'}


if __name__ == '__main__':
    watch = watchlist()
    data = {
        'c_name':'ONGC',
        'u_id':8
    }
    print(watch.add_company(data))
    d = watch.get_all_data()['data']
    for i in d:
        print(i)