"""
Discord Interaction Handler
This script listens for Discord button interactions via webhooks
and forwards them to the backend API for processing
"""

from aiohttp import web
import httpx
import os
from dotenv import load_dotenv
import logging
import json

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BACKEND_API_URL = os.environ.get('BACKEND_API_URL', 'http://localhost:8080')

async def handle_interaction(request):
    """Handle Discord button interaction"""
    try:
        data = await request.json()
        
        logger.info(f"Received Discord interaction: {json.dumps(data, indent=2)}")
        
        # Extract interaction data
        interaction_type = data.get('type')
        
        # Type 3 = MESSAGE_COMPONENT (button click)
        if interaction_type == 3:
            custom_id = data['data']['custom_id']
            user = data['member']['user'] if 'member' in data else data['user']
            
            # Parse custom_id (format: "approve_<submission_id>" or "deny_<submission_id>")
            parts = custom_id.split('_', 1)
            if len(parts) != 2:
                return web.json_response({
                    'type': 4,
                    'data': {
                        'content': '❌ Invalid button interaction',
                        'flags': 64  # Ephemeral
                    }
                })
            
            action, submission_id = parts
            
            # Forward to backend API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{BACKEND_API_URL}/api/webhook/action",
                    json={
                        'submission_id': submission_id,
                        'action': action,
                        'admin_user_id': user['id']
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    action_text = "✅ Approved" if action == "approve" else "❌ Denied"
                    
                    # Send acknowledgment response
                    return web.json_response({
                        'type': 4,
                        'data': {
                            'content': f'{action_text} submission for **{result["submission"]["username"]}**',
                            'flags': 64  # Ephemeral
                        }
                    })
                else:
                    error_data = response.json()
                    return web.json_response({
                        'type': 4,
                        'data': {
                            'content': f'❌ Error: {error_data.get("detail", "Unknown error")}',
                            'flags': 64
                        }
                    })
        
        # Type 1 = PING (verification)
        elif interaction_type == 1:
            return web.json_response({'type': 1})
        
        return web.json_response({
            'type': 4,
            'data': {
                'content': 'Unknown interaction type',
                'flags': 64
            }
        })
        
    except Exception as e:
        logger.error(f"Error handling interaction: {str(e)}", exc_info=True)
        return web.json_response({
            'type': 4,
            'data': {
                'content': f'❌ Error processing interaction: {str(e)}',
                'flags': 64
            }
        }, status=500)

async def health_check(request):
    return web.json_response({'status': 'healthy'})

app = web.Application()
app.router.add_post('/interactions', handle_interaction)
app.router.add_get('/health', health_check)

if __name__ == '__main__':
    port = int(os.environ.get('INTERACTION_PORT', 8004))
    web.run_app(app, host='0.0.0.0', port=port)
