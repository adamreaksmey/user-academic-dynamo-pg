import json

def insert_data(data):
    queries = []
    for item in data:
        # Prepare column names and values
        columns = [key for key in item if key not in ["tableName", "recordType"]]
        values = []
        for column in columns:
            value = item[column]

            if isinstance(value, str):
                # Replace single quotes with two single quotes for SQL string literals
                values.append(f"'{value.replace('\'', '\'\'')}'")
            elif value is None or value == "":
                values.append("NULL")
            else:
                # Convert non-string and non-None values to JSON and quote them
                values.append(f"'{json.dumps(value)}'")

        # Build the query
        query_columns = ', '.join([f'"{column}"' for column in columns])
        query_values = ', '.join([value if value != "''" else "NULL" for value in values])
        query = f"INSERT INTO {item['tableName']} ({query_columns}) VALUES ({query_values});"
        queries.append(query)

    return queries