import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Home } from 'lucide-react';

export const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, passed, answers } = location.state || {};

  if (!score && score !== 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="mb-6 flex justify-center">
            {passed ? (
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                <XCircle className="w-16 h-16 text-white" />
              </div>
            )}
          </div>

          <h1 className="text-5xl font-bold mb-4 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {passed ? 'Assessment Complete!' : 'Assessment Incomplete'}
          </h1>
          
          <div className="mb-6">
            <div className="text-6xl font-bold mb-2" style={{ color: passed ? '#10b981' : '#ef4444' }}>
              {Math.round(score)}%
            </div>
            <p className="text-xl text-zinc-400">
              {passed 
                ? 'Congratulations! Your responses have been submitted for admin review.'
                : 'You need 80% to pass. Please review the training materials and try again.'}
            </p>
          </div>

          {passed && (
            <div className="bg-violet-600/10 border border-violet-600/30 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <p className="text-zinc-300">
                Your submission is now pending admin approval. Once approved, you will receive the verified staff role on Discord automatically.
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Your Responses</h2>
          <div className="space-y-4">
            {answers?.map((answer, idx) => (
              <div 
                key={idx}
                className={`bg-zinc-900 border rounded-lg p-6 ${
                  answer.is_correct ? 'border-green-600/30' : 'border-red-600/30'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {answer.is_correct ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Question {answer.question_number}</h3>
                    <p className="text-zinc-400 text-sm mb-3">{answer.question}</p>
                    <div className="bg-zinc-950 border border-zinc-800 rounded p-3">
                      <p className="text-zinc-300 text-sm font-mono">{answer.user_answer || 'No answer provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate('/')}
            data-testid="back-home-button"
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-6 rounded-md transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          {!passed && (
            <Button
              onClick={() => navigate('/test')}
              data-testid="retake-test-button"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-md border border-zinc-700"
            >
              Retake Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};