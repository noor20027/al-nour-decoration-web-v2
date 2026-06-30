from bs4 import BeautifulSoup

with open('/home/ubuntu/browser_html/al-nour-decoration-web-v2-675z1fks0-noor1011122-7092s-projects_vercel_app_admin_1782857867076.html', 'r') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')
file_inputs = soup.find_all('input', type='file')

if file_inputs:
    for i, file_input in enumerate(file_inputs):
        print(f"Found file input element at index {i}:")
        print(f"  ID: {file_input.get('id')}")
        print(f"  Name: {file_input.get('name')}")
        print(f"  Class: {file_input.get('class')}")
        print(f"  Accept: {file_input.get('accept')}")
else:
    print("No file input elements found.")
