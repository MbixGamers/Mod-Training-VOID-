import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { testQuestions, checkAnswer } from '../lib/testQuestions';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Test = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showProtocol, setShowProtocol] = useState(false);

  useEffect(() => {
    // Clean up URL parameters (like ?code=...) if they exist
    if (window.location.search || window.location.hash) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const handleNext = () => {
    answers[currentQuestion] = currentAnswer;
    setAnswers({ ...answers });
    setCurrentAnswer('');
    setShowProtocol(false);
    
    if (currentQuestion < testQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    setShowProtocol(false);
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const handleSubmit = async () => {
    answers[currentQuestion] = currentAnswer;
    
    const evaluatedAnswers = testQuestions.map((q, idx) => ({
      question_number: idx + 1,
      question: q.question,
      user_answer: answers[idx] || '',
      is_correct: checkAnswer(q.id, answers[idx] || '')
    }));

    const correctCount = evaluatedAnswers.filter(a => a.is_correct).length;
    const score = (correctCount / testQuestions.length) * 100;
    const passed = score >= 80;

    try {
      await axios.post('/api/submissions', {
        user_id: user.id,
        user_email: user.email,
        username: user.user_metadata?.name || user.email,
        answers: evaluatedAnswers,
        score: score,
        passed: passed
      });

      navigate('/results', { 
        state: { 
          score, 
          passed, 
          answers: evaluatedAnswers 
        } 
      });
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  const question = testQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / testQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400 text-sm">Question {currentQuestion + 1} of {testQuestions.length}</span>
              <span className="text-zinc-400 text-sm">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-6">
            <h2 className="text-sm uppercase tracking-wide text-violet-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {question.scenario}
            </h2>
            <h3 className="text-2xl font-bold mb-6">{question.question}</h3>
            
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-6">
              <p className="text-zinc-400"><strong className="text-zinc-300">Task:</strong> {question.task}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Your Response</label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                data-testid={`answer-input-${currentQuestion + 1}`}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-4 text-zinc-100 focus:ring-2 focus:ring-violet-600 focus:border-transparent outline-none transition-all placeholder:text-zinc-600 font-mono min-h-[150px] resize-y"
                placeholder="Type your response here..."
              />
            </div>

            <Button
              onClick={() => setShowProtocol(!showProtocol)}
              data-testid="show-protocol-button"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-md border border-zinc-700 text-sm"
            >
              {showProtocol ? 'Hide' : 'Show'} Protocol Compliance
            </Button>

            {showProtocol && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 bg-violet-600/10 border border-violet-600/30 rounded-lg p-6"
              >
                <h4 className="text-lg font-bold mb-3 text-violet-400">Protocol Compliance</h4>
                <p className="text-zinc-300 mb-4">
                  <strong>Optimal Response:</strong> {question.optimalResponse}
                </p>
                <p className="text-zinc-400 mb-2">
                  <strong>Avoid:</strong> {question.avoid}
                </p>
              </motion.div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              data-testid="previous-button"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-6 rounded-md border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentQuestion < testQuestions.length - 1 ? (
              <Button
                onClick={handleNext}
                data-testid="next-button"
                className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-6 rounded-md transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                data-testid="submit-button"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-md transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Submit Assessment
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};