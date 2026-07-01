from bs4 import BeautifulSoup

with open('/home/ubuntu/browser_html/al-nour-decoration-web-v2-qzrs6lhw5-noor1011122-7092s-projects_vercel_app_admin_1782860314145.html', 'r') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')
file_inputs = soup.find_all('input', type='file')

for i, file_input in enumerate(file_inputs):
    print(f"Index: {i}, ID: {file_input.get('id')}, Name: {file_input.get('name')}, Class: {file_input.get('class')}")
