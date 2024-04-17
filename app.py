from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time

chrome_driver_path = 'C:\chromedriver-win64\chromedriver.exe'
url = "https://pay.keralauniversity.ac.in/kupay/personalDetails?purpose=EXAM"

app = Flask(__name__)
CORS(app, support_credentials=True)

def scrape(roll):
    service = Service(chrome_driver_path)
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(url)
    candCode = driver.find_element(By.ID,"candCode")
    breakValue2 = 0
    name = ''
    student_list = {}
    while(breakValue2 < 2):
        breakValue1 = 0
        candCode.send_keys(str(roll), Keys.ENTER)
        while((driver.find_element('xpath','//*[@id="remtName"]').get_attribute('value') == '' or driver.find_element('xpath','//*[@id="remtName"]').get_attribute('value') == name) and breakValue1 < 3):
            time.sleep(0.5)
            breakValue1 += 1
        if breakValue1 == 3:
            roll += 1
            breakValue2 += 1
            continue 
        name = driver.find_element('xpath','//*[@id="remtName"]').get_attribute('value')
        print(roll, ': ', name)
        student_list[roll] = name
        roll += 1
        candCode.send_keys(Keys.CONTROL, 'a')
        candCode.send_keys(Keys.DELETE)
    driver.quit()
    return student_list

@app.route('/')
def index():
    # Return the HTML file located in the same folder as the Flask app
    return send_file('index.html')

@app.route('/styles.css')
def styles():
    return send_file('styles.css')

# Route for serving JavaScript file
@app.route('/script.js')
def javascript():
    return send_file('script.js')

@app.route('/2000x700_senate_house.jpg')
def img():
    return send_file('2000x700_senate_house.jpg')


@app.route('/scrap', methods=['POST'])  # Specify POST method
@cross_origin(supports_credentials=True)

def get_student_list():
    data = request.get_json()
    roll = int(data['roll'])
    student_list = scrape(roll)
    json_list = json.dumps(student_list, indent = 4)
    return jsonify({'student_list': json_list})

if __name__ == '__main__':
    app.run(host='0.0.0.0')