def dob_handler(item):
    response = None
    try:
        if item:
            if "date_of_birth" in item:
                response = item.get("date_of_birth", {}).get("S", None)
            elif "dob" in item:
                response = item.get("dob", {}).get("S", None)
        else:
            response = False
    except Exception as error:
        print("DOB HANDLER ERROR", error)
    
    return response


def id_card_handler(idCard):
    if idCard == "empty":
        return ""
    return idCard