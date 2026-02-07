import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, GraduationCap, Palette, Mic, Video, MonitorPlay, Brush, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_USER_IDS = ['394600108846350346', '928635423465537579'];

const rosterCategories = [
  {
    icon: Trophy,
    title: "Pro Roster",
    color: "#fbbf24",
    requirements: [
      "25,000+ Power Ranking",
      "$1,000+ in Official Fortnite Earnings",
      "Place and earn consistently",
      "Represent Us In Game and On Your Socials"
    ]
  },
  {
    icon: Gamepad2,
    title: "Semi-Pro",
    color: "#94a3b8",
    requirements: [
      "10,000-25,000 PR",
      "Place Consistently",
      "Represent us in Game",
      "Use our Fortnite Code",
      "Must have earnings"
    ]
  },
  {
    icon: GraduationCap,
    title: "Academy Roster",
    color: "#ffffff",
    requirements: [
      "500-10,000 PR",
      "Place Consistently",
      "Represent us in Game",
      "Use our Fortnite Code"
    ]
  },
  {
    icon: Palette,
    title: "Creative Roster",
    color: "#ec4899",
    requirements: [
      "Smooth/Fast Mechanics",
      "Must Be Unique",
      "Must Be Able To Provide Clips When Asked",
      "Represent Us In Game and On Your Socials"
    ]
  },
  {
    icon: Mic,
    title: "Streamer",
    color: "#a855f7",
    requirements: [
      "1k+ Followers/Subscribers",
      "Average 25+ Viewers Per Stream",
      "Stream At Least 4x Per Week",
      "Use Our Hashtags in Bio/Descriptions",
      "Represent Us In Game and On Your Socials"
    ]
  },
  {
    icon: Video,
    title: "Content Creator",
    color: "#ef4444",
    requirements: [
      ">1k Followers on Twitch/YouTube",
      ">10k Followers on TikTok",
      "Original/High Quality Posts",
      "Willing to Help Out With Void Content",
      "Must Post Actively",
      "Represent Us In Game and On Your Socials"
    ]
  },
  {
    icon: MonitorPlay,
    title: "Junior Content Creator",
    color: "#f59e0b",
    requirements: [
      ">500 Followers On Twitch/YouTube",
      ">3k Followers On TikTok",
      "Posts Are Original and High Quality",
      "Willing To Grind to Become a Main Roster Content Creator",
      "Represent Us In Game and On Your Socials"
    ]
  },
  {
    icon: Brush,
    title: "GFX/VFX",
    color: "#3b82f6",
    requirements: [
      "Experience With Editing",
      "Portfolio Required",
      "High-Quality Work (1440p or Higher)",
      "Willing To Do Free Work For Staff/Roster",
      "Deliver When Asked"
    ]
  }
];

export const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(ADMIN_USER_IDS.includes(session.user.id));
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      toast.error('Access Denied', {
        description: 'You do not have admin privileges'
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Shield className="w-12 h-12 text-violet-600" />
            <h1 className="text-6xl font-bold uppercase tracking-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              VOID
            </h1>
          </div>
          <p className="text-2xl text-zinc-400 mb-2">Mod Training Suite v2.1</p>
          <p className="text-zinc-500">Welcome, {user?.user_metadata?.name || user?.email}</p>
          
          <div className="flex gap-4 justify-center mt-6">
            {isAdmin && (
              <Button
                onClick={handleAdminClick}
                data-testid="admin-portal-button"
                className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-6 rounded-md transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
              >
                Admin Portal
              </Button>
            )}
            <Button
              onClick={handleLogout}
              data-testid="logout-button"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-md border border-zinc-700"
            >
              Logout
            </Button>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Ticket Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-violet-500/50 transition-colors duration-300">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-violet-600" />
                General Ticket
              </h3>
              <p className="text-zinc-400">
                These are created by community members for support inquiries, moderator assistance, or reporting issues. Handle with professionalism and follow escalation procedures for complex matters.
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-violet-500/50 transition-colors duration-300">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-violet-600" />
                Roster Ticket
              </h3>
              <p className="text-zinc-400">
                Application channel for users seeking to join Void Esports. Initial response must include age verification and direction to appropriate resources. Follow structured onboarding workflow.
              </p>
            </div>
          </div>
          <div className="mt-6 bg-violet-600/10 border border-violet-600/30 rounded-lg p-4">
            <p className="text-zinc-300">
              <strong>Protocol:</strong> All ticket responses should begin with professional greeting and age inquiry. Direct new applicants to the appropriate channels and maintain detailed records of all interactions.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Roster Categories & Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rosterCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-violet-500/50 transition-colors duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-8 h-8" style={{ color: category.color }} />
                    <h3 className="text-xl font-bold" style={{ color: category.color }}>{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.requirements.map((req, idx) => (
                      <li key={idx} className="text-zinc-400 text-sm flex items-start gap-2">
                        <span className="text-violet-600 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Mod Responsibilities</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-violet-400">Weekly Performance Metrics</h3>
              <p className="text-zinc-400 mb-3">Maintain minimum weekly thresholds to retain moderator status:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-center gap-3 text-zinc-300">
                  <span className="bg-violet-600 w-2 h-2 rounded-full"></span>
                  <strong>10 Tickets</strong> - Process support tickets
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <span className="bg-violet-600 w-2 h-2 rounded-full"></span>
                  <strong>400 Messages</strong> - Active community engagement
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <span className="bg-violet-600 w-2 h-2 rounded-full"></span>
                  <strong>5 Dyno Modlogs</strong> - Documented moderator actions
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <span className="bg-violet-600 w-2 h-2 rounded-full"></span>
                  <strong>8 Hour Shift</strong> - Minimum weekly activity
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <span className="bg-violet-600 w-2 h-2 rounded-full"></span>
                  <strong>2 Hours VC Time</strong> - Voice channel participation
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Interactive Training Phase</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            Proceed to the practical assessment module. You'll encounter simulated scenarios requiring appropriate moderator responses. Each question evaluates application of the protocols detailed above.
          </p>
          <Button
            onClick={() => navigate('/test')}
            data-testid="begin-assessment-button"
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-8 rounded-md transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] text-lg"
          >
            Begin Practical Assessment
          </Button>
        </motion.div>
      </div>
    </div>
  );
};