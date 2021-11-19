# load libaries
from flask import Flask, jsonify, send_from_directory, render_template
import os
from dotenv import load_dotenv

load_dotenv()
appurl = os.getenv('appurl')

# load modules
from routers.blueprint_model import blueprint_model


# init Flask app
app = Flask(__name__,
            static_url_path='',
            static_folder='app',
            template_folder='app/templates')

app.config['TEMPLATES_AUTO_RELOAD'] = True

print(">>> Launching Server")
# Bad practice but good enough for small number of standard pages
@app.route('/')
def homepage():
    #return send_from_directory(app.static_folder, 'index.html')
    return render_template('index.html', page='Home', appurl=appurl, ishome=True)

@app.route('/about')
def about():                     
    return render_template('about.html', page='About Model', isabout=True)



print(">>> Registering Model API")
app.register_blueprint(blueprint_model, url_prefix="/api/model")
