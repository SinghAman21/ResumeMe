import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion } from "framer-motion" // Fixed import
import { CheckCircle, XCircle, AlertCircle, Award, Frown, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewFeedbackProps {
  mode: "genuine" | "roast" // Type narrowing for safer usage
}

interface FeedbackItem {
  category: string
  score: number
  feedback: string
  improvement?: string
}

export default function ReviewFeedback({ mode }: ReviewFeedbackProps) {
  const [loading, setLoading] = useState(true)
  const [overallScore, setOverallScore] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    // In production, this would fetch from an API instead of hardcoded data
    const timer = setTimeout(() => {
      setLoading(false)

      const feedbackData = mode === "genuine" 
        ? {
            score: 78,
            items: [
              {
                category: "Format & Layout",
                score: 85,
                feedback: "Your resume has a clean, professional layout that is easy to scan.",
                improvement: "Consider adding more white space between sections for better readability.",
              },
              {
                category: "Content Quality",
                score: 75,
                feedback: "Good use of action verbs and quantifiable achievements.",
                improvement: "Be more specific about your impact in each role with metrics and results.",
              },
              {
                category: "Skills Presentation",
                score: 82,
                feedback: "Relevant skills are highlighted effectively.",
                improvement: "Group skills by category and emphasize those most relevant to your target roles.",
              },
              {
                category: "ATS Compatibility",
                score: 70,
                feedback: "Your resume contains most keywords relevant to your field.",
                improvement: "Add more industry-specific keywords to improve ATS performance.",
              },
            ]
          }
        : {
            score: 42,
            items: [
              {
                category: "Format & Layout",
                score: 35,
                feedback: "Did you design this in MS Paint? Because it looks like you tried really hard... at making the most generic resume possible.",
              },
              {
                category: "Content Quality",
                score: 45,
                feedback: "Ah yes, 'detail-oriented' and 'team player' - truly groundbreaking qualities that no other candidate has ever claimed before.",
              },
              {
                category: "Skills Presentation",
                score: 50,
                feedback: "Proficient in Microsoft Office? Wow, you and literally everyone else who has touched a computer since 1995.",
              },
              {
                category: "Overall Impact",
                score: 38,
                feedback: "This resume is so forgettable that hiring managers develop amnesia halfway through reading it.",
              },
            ]
          };

      setOverallScore(feedbackData.score);
      setFeedback(feedbackData.items);

      // Set animation complete after a delay to allow score counter to finish
      setTimeout(() => setAnimationComplete(true), 1500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [mode]);

  const getScoreColor = (score: number) => 
    score >= 80 ? "text-emerald-500 dark:text-emerald-400" :
    score >= 60 ? "text-amber-500 dark:text-amber-400" :
    "text-rose-500 dark:text-rose-400";

  const getProgressColor = (score: number) => 
    score >= 80 ? "bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-500" :
    score >= 60 ? "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-500" :
    "bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-500";

  const getGlowColor = (score: number) => 
    score >= 80 ? "shadow-[0_0_15px_theme(colors.emerald.500/30)]" :
    score >= 60 ? "shadow-[0_0_15px_theme(colors.amber.500/30)]" :
    "shadow-[0_0_15px_theme(colors.rose.500/30)]";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-800/50 dark:border-gray-700/50 border-t-gray-400 dark:border-t-gray-300"></div>
          <div className="absolute inset-0 animate-pulse rounded-full bg-[url('/noise.svg')] opacity-[0.05] mix-blend-soft-light"></div>
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {mode === "genuine" ? "Analyzing your resume..." : "Preparing to roast..."}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-xl border border-gray-200/10 dark:border-gray-800/50 bg-gray-200/20 dark:bg-gray-900/30 p-8 text-center backdrop-blur-sm"
      >
        <div className="relative z-10">
          <motion.div
            className={cn(
              "relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4 transition-all duration-500",
              mode === "genuine" 
                ? "border-violet-500/20 dark:border-violet-600/20" 
                : "border-rose-500/20 dark:border-rose-600/20",
              getGlowColor(overallScore),
            )}
          >
            <div className="absolute inset-0 rounded-full bg-[url('/noise.svg')] opacity-[0.05] mix-blend-soft-light"></div>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`text-5xl font-bold ${getScoreColor(overallScore)}`}
            >
              <Counter from={0} to={overallScore} duration={1.5} />
            </motion.span>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-2 text-2xl font-medium text-gray-900 dark:text-gray-50"
          >
            {mode === "genuine" ? "Resume Score" : "Roast Rating"}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 dark:text-gray-400"
          >
            {mode === "genuine"
              ? "Your resume is above average, but there's room for improvement."
              : "Your resume is impressively underwhelming. Let's break down the mediocrity."}
          </motion.p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {feedback.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-xl border border-gray-200/10 dark:border-gray-800/50 bg-gray-200/20 dark:bg-gray-900/30 p-5 backdrop-blur-sm"
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">{item.category}</h4>
                <div className={`flex items-center ${getScoreColor(item.score)}`}>
                  <span className="mr-2 font-bold">
                    <Counter from={0} to={item.score} duration={1.5} />
                  </span>
                  {item.score >= 80 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : item.score >= 60 ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </div>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-800/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 ${getProgressColor(item.score)}`}
                />
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.05] mix-blend-soft-light"></div>
              </div>

              <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{item.feedback}</p>

              {item.improvement && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 10 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  className="mt-3 flex items-start rounded-md bg-gray-100 dark:bg-gray-800/30 p-3"
                >
                  <Award className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-violet-500 dark:text-violet-400" />
                  <p className="text-xs text-gray-700 dark:text-gray-300">{item.improvement}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="flex justify-center pt-4"
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
          <Button
            onClick={() => window.print()}
            className={cn(
              "relative overflow-hidden px-8",
              mode === "genuine"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 dark:from-violet-700 dark:to-indigo-700 dark:hover:from-violet-600 dark:hover:to-indigo-600"
                : "bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 dark:from-rose-700 dark:to-orange-700 dark:hover:from-rose-600 dark:hover:to-orange-600",
            )}
          >
            <span className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.05] mix-blend-soft-light"></span>
            <span className="relative z-10 flex items-center">
              {mode === "genuine" ? (
                <>
                  <Smile className="mr-2 h-5 w-5" /> Save Feedback
                </>
              ) : (
                <>
                  <Frown className="mr-2 h-5 w-5" /> Save Roast
                </>
              )}
            </span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Memoize this component for better performance
function Counter({ from, to, duration = 1 }: { from: number; to: number; duration?: number }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(from + progress * (to - from)));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return <>{count}</>;
}
