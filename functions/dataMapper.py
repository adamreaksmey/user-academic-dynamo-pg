import json
from pathlib import Path

from functions.operations.data import dob_handler, id_card_handler, schoolIdHandler

def mapper_function(data, output_directory):
    # Construct the file path for the output
    output_path = Path(output_directory) / "logs/content.py"

    # Preprocessing to minimize dictionary access
    preprocessed_data = [
        {
            key: item['Item'].get(key, {}).get('S', 'N/A') if key not in ['remark', 'position', 'phone']
            else item['Item'].get(key, {}).get('S', '')
            for key in ['organizationId', 'idCard', 'firstName', 'lastName', 'gender', 'remark', 'status', 'position', 'phone']
        }
        for item in data
    ]

    # Process the data with minimized accesses and direct mappings
    removed_value_prefix = [
        {
            "tableName": "student",
            "schoolId": schoolIdHandler(item["organizationId"]) if 'schoolId' not in item else item['schoolId'],
            "campusId": "",
            "idCard": id_card_handler(item["idCard"]),
            "firstName": item["firstName"],
            "lastName": item["lastName"],
            "firstNameNative": item["firstName"],
            "lastNameNative": item["lastName"],
            "gender": item["gender"].lower(),
            "dob": dob_handler(item) or "",
            "remark": [item["remark"]],
            "status": item["status"],
            "profile": {
                "position": item["position"].replace("'", "`"),
                "phone": item["phone"]
            }
        } for item in preprocessed_data if item["organizationId"] != 'N/A'
    ]

    # Write the processed data to a file
    with open(output_path, 'w') as f:
        f.write(f"reWrittenDatas = {json.dumps(removed_value_prefix, indent=2)}")
