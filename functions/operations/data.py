import re
import uuid

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

def is_valid_uuid(val):
    """Check if the provided string is a valid UUID."""
    regex_uuid = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\Z', re.I)
    match = regex_uuid.match(val)
    return bool(match)

def schoolIdHandler(schoolId):
    if not schoolId or not is_valid_uuid(schoolId):
        return 'b740450d-a05d-4e1d-a235-1d507702f30d'
    return schoolId