from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import uuid

app = Flask(__name__)

# Enable CORS for all routes - allow frontend domain
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5000",
            "https://mod-training-void.onrender.com",
            "https://mod-training-void-backend-cbpz.onrender.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# In-memory storage for submissions (replace with database in production)
submissions_db = []

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}), 200

@app.route('/api/submissions', methods=['GET'])
def get_submissions():
    """Get all submissions for admin review"""
    try:
        return jsonify(submissions_db), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/submissions', methods=['POST'])
def submit_task():
    """Create a new test submission"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['user_id', 'user_email', 'username', 'answers', 'score', 'passed']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create submission object
        submission = {
            'id': str(uuid.uuid4()),
            'user_id': data['user_id'],
            'user_email': data['user_email'],
            'username': data['username'],
            'answers': data['answers'],
            'score': data['score'],
            'passed': data['passed'],
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        submissions_db.append(submission)
        
        return jsonify({
            'message': 'Submission received successfully',
            'submission': submission
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/action', methods=['POST'])
def admin_action():
    """Handle admin actions (accept/deny) on submissions"""
    try:
        action_data = request.json
        
        if 'submission_id' not in action_data or 'action' not in action_data:
            return jsonify({'error': 'Missing required fields: submission_id and action'}), 400
        
        submission_id = action_data['submission_id']
        action = action_data['action']
        
        if action not in ['accepted', 'denied']:
            return jsonify({'error': 'Action must be either "accepted" or "denied"'}), 400
        
        # Find and update submission
        submission = None
        for sub in submissions_db:
            if sub['id'] == submission_id:
                submission = sub
                break
        
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        # Update submission status
        submission['status'] = action
        submission['updated_at'] = datetime.utcnow().isoformat()
        
        return jsonify({
            'message': f'Submission {action} successfully',
            'submission': submission
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)