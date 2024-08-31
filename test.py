from flask import jsonify
from db_files.watchlist import watchlist
from db_files.companies import companies

watch = watchlist()
company = companies()

def add_company_to_db(user_id, company_name):
    company_data = company.search_by_name(company_name)['data'][0]
    input_data = {
        'u_id':user_id,
        'c_name':company_data['c_name'],
        'share_price':None,
        'c_symbol':company_data['c_symbol']
    }
    watch.add_company(input_data)
    data = watch.get_data_by_userID(user_id)['data']
    print(data)
    return ({'watchlist':data})


if __name__ == '__main__':
    c_list = add_company_to_db(1, "HDFC Bank Limited")
    print(c_list)