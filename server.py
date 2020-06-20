from flask import Flask, render_template, request, jsonify
import json
from pylib import newsAnalysis as na

app = Flask(__name__, static_url_path='/static')


@app.route('/')
def home():
   return render_template('index.html')


@app.route('/newsreport', methods=['POST'])
def getNewReport():
  data = request.get_json()
  return na.textAnalysis(data['url'], data['ipfrom'])



if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True)