from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/submissions', methods=['POST'])
def submit_task():
    data = request.json
    # Logic for handling submissions
    return jsonify({'message': 'Submission received', 'data': data}), 201

@app.route('/admin/action', methods=['POST'])
def admin_action():
    action_data = request.json
    # Logic for admin actions
    return jsonify({'message': 'Admin action executed', 'data': action_data}), 200

if __name__ == '__main__':
    app.run(debug=True)