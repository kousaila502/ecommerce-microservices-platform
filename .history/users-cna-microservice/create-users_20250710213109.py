import requests
import json
import time

# Load users from JSON file
with open('seed_users.json', 'r') as file:
    users = json.load(file)

url = 'http://localhost:9090/auth/register'

for i, user in enumerate(users):
    try:
        response = requests.post(url, json=user)
        if response.status_code in [200, 201]:
            print(f"✅ User {i + 1}/50: {user['email']} created")
        else:
            print(f"❌ User {i + 1}/50: {user['email']} failed")
    except:
        print(f"❌ User {i + 1}/50: {user['email']} error")
    
    time.sleep(0.1)  # Small delay

print("✅ All users created!")