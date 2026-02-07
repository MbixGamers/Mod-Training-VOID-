import discord
from discord.ext import commands
import os
from dotenv import load_dotenv
import asyncio
import logging
from aiohttp import web
import json

load_dotenv()

BOT_TOKEN = os.environ.get('DISCORD_BOT_TOKEN')
SERVER_ID = int(os.environ.get('DISCORD_SERVER_ID'))

intents = discord.Intents.default()
intents.members = True
intents.guilds = True

bot = commands.Bot(command_prefix='!', intents=intents)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@bot.event
async def on_ready():
    logger.info(f'{bot.user} has connected to Discord!')
    logger.info(f'Bot is in {len(bot.guilds)} guilds')

async def handle_role_request(request):
    try:
        data = await request.json()
        user_id = data.get('user_id')
        role_name = data.get('role_name', 'Verified Staff')
        
        if not user_id:
            return web.json_response({'error': 'user_id is required'}, status=400)
        
        guild = bot.get_guild(SERVER_ID)
        if not guild:
            logger.error(f'Guild {SERVER_ID} not found')
            return web.json_response({
                'error': 'Guild not found',
                'message': 'Bot is not connected to the specified server'
            }, status=404)
        
        # Try to get member from cache first
        member = guild.get_member(int(user_id))
        
        # If not in cache, try to fetch from API
        if not member:
            try:
                member = await guild.fetch_member(int(user_id))
            except discord.NotFound:
                logger.warning(f'Member {user_id} not found in guild {guild.name}')
                return web.json_response({
                    'error': 'Member not found',
                    'message': 'User is not a member of the server. Please ensure they have joined the Discord server first.'
                }, status=404)
            except discord.HTTPException as e:
                logger.error(f'HTTP error fetching member {user_id}: {e}')
                return web.json_response({
                    'error': 'Failed to fetch member',
                    'message': str(e)
                }, status=500)
        
        # Get or create role
        role = discord.utils.get(guild.roles, name=role_name)
        if not role:
            try:
                role = await guild.create_role(
                    name=role_name,
                    color=discord.Color.green(),
                    reason='Auto-created for mod training verification'
                )
                logger.info(f'Created new role: {role_name}')
            except discord.Forbidden:
                logger.error('Bot lacks permission to create roles')
                return web.json_response({
                    'error': 'Permission denied',
                    'message': 'Bot does not have permission to create roles'
                }, status=403)
        
        # Check if member already has the role
        if role in member.roles:
            logger.info(f'Member {member.name} already has role {role_name}')
            return web.json_response({
                'success': True,
                'message': f'Member {member.name} already has role {role_name}',
                'already_had_role': True
            })
        
        # Add role to member
        try:
            await member.add_roles(role, reason='Passed mod training assessment')
            logger.info(f'Successfully added role {role_name} to {member.name} ({member.id})')
            
            # Try to send DM to user
            try:
                await member.send(
                    f'🎉 Congratulations! You have been verified as a staff member and received the **{role_name}** role in {guild.name}!'
                )
            except discord.Forbidden:
                logger.warning(f'Could not send DM to {member.name} (DMs disabled or blocked)')
            
            return web.json_response({
                'success': True,
                'message': f'Role {role_name} successfully added to {member.name}',
                'user': {
                    'id': str(member.id),
                    'name': member.name,
                    'discriminator': member.discriminator,
                    'display_name': member.display_name
                },
                'role': {
                    'id': str(role.id),
                    'name': role.name
                }
            })
        except discord.Forbidden:
            logger.error(f'Bot lacks permission to add roles to {member.name}')
            return web.json_response({
                'error': 'Permission denied',
                'message': 'Bot does not have permission to add roles to members'
            }, status=403)
            
    except ValueError as e:
        logger.error(f'Invalid user_id format: {e}')
        return web.json_response({
            'error': 'Invalid user_id',
            'message': 'user_id must be a valid Discord user ID (numeric)'
        }, status=400)
    except Exception as e:
        logger.error(f'Error handling role request: {e}', exc_info=True)
        return web.json_response({
            'error': 'Internal server error',
            'message': str(e)
        }, status=500)

async def start_web_server():
    app = web.Application()
    app.router.add_post('/api/assign-role', handle_role_request)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', 8003)
    await site.start()
    logger.info('Web server started on port 8003')

async def main():
    async with bot:
        bot.loop.create_task(start_web_server())
        await bot.start(BOT_TOKEN)

if __name__ == '__main__':
    asyncio.run(main())