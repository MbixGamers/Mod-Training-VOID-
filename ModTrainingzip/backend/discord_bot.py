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
        
        guild = bot.get_guild(SERVER_ID)
        if not guild:
            return web.json_response({'error': 'Guild not found'}, status=404)
        
        member = guild.get_member(int(user_id))
        if not member:
            try:
                member = await guild.fetch_member(int(user_id))
            except:
                return web.json_response({'error': 'Member not found'}, status=404)
        
        role = discord.utils.get(guild.roles, name=role_name)
        if not role:
            role = await guild.create_role(name=role_name, color=discord.Color.green())
        
        await member.add_roles(role)
        logger.info(f'Added role {role_name} to {member.name}')
        
        return web.json_response({
            'success': True,
            'message': f'Role {role_name} added to {member.name}'
        })
    except Exception as e:
        logger.error(f'Error handling role request: {e}')
        return web.json_response({'error': str(e)}, status=500)

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