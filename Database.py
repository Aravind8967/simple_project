import mysql
import mysql.connector
import json

class Database:
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
            q = "SELECT * FROM USERS"
            cursor = con.cursor(dictionary=True)
            cursor.execute(q)
            data = cursor.fetchall()
            return {'status':200, 'data':data}
        else:
            return {"status":db["status"], "data":db["data"]}
    
    def get_user(self, name):
        db = self.db_connection()
        if db['status'] == 200:
            try:
                con = db['connection']
                q = "SELECT * FROM USERS WHERE U_NAME = %s;"
                cursor = con.cursor(dictionary=True)
                cursor.execute(q, (name,))
                data = cursor.fetchall()
                if data:
                    return {'status':200,'data':data}
                else:
                    return {'status':404, 'data':'user not found'}
            except:
                    return {'status':404, 'data':'user not found'}
        else:
            return {'status':db['status'], 'data':db['data']}
     
    def set_user(self, data):
        db = self.db_connection()
        if db['status'] == 200:
            try:
                con = db['connection']
                q = "INSERT INTO USERS (U_NAME, U_PASSWORD) VALUES (%s, %s);"
                cursor = con.cursor(dictionary=True)
                cursor.execute(q, (data['u_name'],data['u_password']))
                db['connection'].commit()
                return {'status':200, 'data':'New user created'}
            except:
                return {'status':404, 'data':'Not able to create new user'}
        else:
            return {'status':404, 'data':'database connection error'}
        
    def get_user_test(self, name):
        db = self.db_connection()
        if db['status'] == 200:
            try:
                con = db['connection']
                q = "select * from users where u_name = %s;"
                cursor = con.cursor(dictionary=True)
                cursor.execute(q, (name,))
                row_data = cursor.fetchall()
                if row_data:
                    
                    return {'status':200,'data':row_data}
                else:
                    return {'status':404, 'data':'user not found'}
            except:
                    return {'status':404, 'data':'user not found'}
        else:
            return {'status':db['status'], 'data':db['data']}
    
    def delete_user(self, u_name):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            cursor = con.cursor()
            q = "DELETE FROM USERS WHERE U_NAME = %s"
            cursor.execute(q, (u_name,))
            con.commit()
            return {'status':200, 'data':'User account deleted'}
        else:
            return {'status':404, 'data':'Not able to delete user'}

    def update_user(self, id, u_name, u_password):
        db = self.db_connection()
        if db["status"] == 200:
            con = db["connection"]
            cursor = con.cursor()
            q = "UPDATE USERS SET U_NAME = %s, U_PASSWORD = %s WHERE id = %s"
            cursor.execute(q, (u_name, u_password, id))
            con.commit()
            return {'status':200, 'data':'User account updated'}
        else:
            return {'status':404, 'data':'Not able to delete user'}


    def truncate_table(self):
        db = self.db_connection()
        if db['status'] == 200:
            con = db['connection']
            q = "TRUNCATE TABLE USERS"
            cursor = con.cursor()
            cursor.execute(q)
            con.commit()
            return {'status':200, 'data':'Truncate successfully'}


if __name__ == '__main__':
    db = Database()
    data = {
        'u_name':'Varun',
        'u_password':'Varu.8967'
    }
    # print(db.delete_user("Aravind"))
    print(db.truncate_table())
    get_all_user = db.get_all_data()
    print(get_all_user['data'])