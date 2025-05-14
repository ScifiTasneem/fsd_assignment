from flask import Flask
from flask_cors import CORS
from backend.models import db
from backend.routes.auth import auth_bp
from backend.routes.dashboard import dashboard_bp
from backend.routes.students import student_bp
from backend.routes.drives import drive_bp
from backend.routes.reports import report_bp
import os

# set paths
script_directory = os.path.dirname(os.path.abspath(__file__))
upload_folder = os.path.join(script_directory, "uploads")
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///vaccination.db'
app.config['UPLOAD_FOLDER'] = upload_folder
db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(student_bp)
app.register_blueprint(drive_bp)
app.register_blueprint(report_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)