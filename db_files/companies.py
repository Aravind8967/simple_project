import mysql
import mysql.connector

class companies:
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
        
    def search_by_name(self, c_name):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "SELECT * FROM COMPANIES WHERE C_NAME = %s"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q, (c_name, ))
            data = cursor.fetchall()
            return {'status':200, 'data':data}
        else:
            return {"status":db["status"], "data":db["data"]}
