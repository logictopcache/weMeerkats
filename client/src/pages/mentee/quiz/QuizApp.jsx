import { createPrompt, generateQuestion } from "/src/utils/ai";
import {
  Crown,
  Frown,
  RotateCcw,
  Search,
  Clock,
  Trophy,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "../../../components/mentee/home/Navigation";
import MenteeHeader from "../../../components/mentee/home/Header";
import { quizService } from "../../../services/api/quizService";

let categories = [
  {
    name: "Programming Languages",
    imageURL: "/quiz/programming_languages.png",
    description:
      "Test your knowledge of various programming languages and concepts",
  },
  {
    name: "Software Development Life Cycle",
    imageURL: "/quiz/sdlc.jpeg",
    description:
      "Understand the stages and best practices in software development",
  },
  {
    name: "Agile Methodologies",
    imageURL: "/quiz/agile-methodologies.png",
    description: "Learn about agile practices and project management",
  },
  {
    name: "DevOps Practices",
    imageURL: "/quiz/devops.jpeg",
    description: "Master the integration of development and operations",
  },
  {
    name: "Database Systems",
    imageURL: "/quiz/database.jpeg",
    description: "Explore database concepts and management systems",
  },
  {
    name: "Cloud Computing",
    imageURL: "/quiz/cloud.png",
    description: "Test your knowledge of cloud platforms and services",
  },
  {
    name: "Machine Learning in Software Engineering",
    imageURL: "/quiz/ml.jpeg",
    description: "Discover AI and ML applications in software",
  },
  {
    name: "Cybersecurity",
    imageURL: "/quiz/cybersecurity.jpeg",
    description: "Learn about security principles and best practices",
  },
  {
    name: "User Interface / User Experience",
    imageURL: "/quiz/user-interface.jpeg",
    description: "Master the art of creating user-friendly interfaces",
  },
  {
    name: "Software Testing",
    imageURL: "/quiz/software-testing.jpeg",
    description: "Understand testing methodologies and tools",
  },
  {
    name: "Open Source Software",
    imageURL: "/quiz/open-source.jpeg",
    description: "Learn about open source development and collaboration",
  },
  {
    name: "Networks and Communications",
    imageURL: "/quiz/networking.jpeg",
    description: "Test your networking and protocols knowledge",
  },
  {
    name: "Systems Architecture",
    imageURL: "/quiz/systems-architecture.jpeg",
    description: "Explore system design and architecture patterns",
  },
  {
    name: "Tech Innovations",
    imageURL: "/quiz/tech.jpeg",
    description: "Stay updated with latest technology trends",
  },
];

function string_between_strings(startStr, endStr, str) {
  let pos = str.indexOf(startStr) + startStr.length;
  return str.substring(pos, str.indexOf(endStr, pos));
}

export default function QuizApp() {
  const [categoriesData, setCategoriesData] = useState(categories);
  const [search, setSearch] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [correctAns, setCorrectAns] = useState(false);
  const [result, setResult] = useState(false);
  const [currentCate, setCurrentCate] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [existingResult, setExistingResult] = useState(null);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [allQuizResults, setAllQuizResults] = useState([]);
  const [quizData, setQuizData] = useState({
    question: "",
    options: {
      a: "",
      b: "",
      c: "",
      d: "",
    },
    correctAnswer: "",
    currentQuestion: 1,
    totalCorrectAnswers: 0,
  });

  // Load all quiz results on component mount
  useEffect(() => {
    loadAllQuizResults();
  }, []);

  const loadAllQuizResults = async () => {
    try {
      const response = await quizService.getAllQuizResults();
      setAllQuizResults(response.results || []);
    } catch (error) {
      console.error("Error loading quiz results:", error);
    }
  };

  const loadExistingResult = async (category) => {
    try {
      const response = await quizService.getQuizResult(category);
      if (response && response.result) {
        setExistingResult(response.result);
      } else {
        setExistingResult(null);
      }
    } catch (error) {
      console.error("Error loading existing result:", error);
      setExistingResult(null);
    }
  };

  const saveQuizResult = async (finalScore = null) => {
    if (isSavingResult) return;

    setIsSavingResult(true);
    try {
      const timeTaken = quizStartTime
        ? Math.floor((Date.now() - quizStartTime) / 1000)
        : 0;

      // Use the passed score or current quiz data
      const correctAnswers =
        finalScore !== null ? finalScore : quizData.totalCorrectAnswers;
      const percentage = Math.round((correctAnswers / 5) * 100);

      const quizResultData = {
        category: currentCate,
        score: correctAnswers,
        percentage: percentage,
        timeTaken: timeTaken,
      };

      const response = await quizService.saveQuizResult(quizResultData);

      if (response.success) {
        toast.success(
          response.isRetake
            ? "Quiz retaken successfully!"
            : "Quiz result saved successfully!"
        );
        setExistingResult(response.result);
        await loadAllQuizResults(); // Refresh all results
      }
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast.error("Failed to save quiz result. Please try again.");
    } finally {
      setIsSavingResult(false);
    }
  };

  const searchCategory = () => {
    let searchedCate = categories.filter((cate) => {
      return cate.name.toLowerCase().includes(search.toLowerCase());
    });
    setCategoriesData(searchedCate);
    searchedCate.length == 0 ? setHasError(true) : setHasError(false);
  };

  const createQuiz = async (title, currentQuestion) => {
    setSelectedOption("");
    setIsLoading(true);
    setCurrentCate(title);
    setIsOpen(true);
    setCorrectAns(false);
    setCurrentQuestion(currentQuestion);

    // Load existing result for this category
    await loadExistingResult(title);

    // Start timing on first question and reset score
    if (currentQuestion === 1) {
      setQuizStartTime(Date.now());
      setQuizData((prevData) => ({
        ...prevData,
        totalCorrectAnswers: 0, // Reset score for new quiz
      }));
    }

    let res = await createQuestion(title);
    let question = string_between_strings("[[", "]]", res);
    let opt1 = string_between_strings("$$", "$$", res);
    let opt2 = string_between_strings("@@", "@@", res);
    let opt3 = string_between_strings("##", "##", res);
    let opt4 = string_between_strings("&&", "&&", res);
    let correctAns = string_between_strings("~~~", "~~~", res);

    setQuizData((prevData) => ({
      ...prevData,
      question,
      options: { a: opt1, b: opt2, c: opt3, d: opt4 },
      correctAnswer: correctAns,
      currentQuestion: currentQuestion,
    }));
    setIsLoading(false);
  };

  const createQuestion = async (title) => {
    let prompt = await createPrompt(title);
    if (prompt.status) {
      let exactPrompt = string_between_strings(
        "[[",
        "]]",
        prompt.generatedPrompt
      );
      let res = await generateQuestion(exactPrompt);
      if (res.status) {
        return res.question;
      } else {
        toast.error("Question Can't be generated. Something went wrong.");
      }
    } else {
      toast.error("Question Can't be generated. Something went wrong.");
    }
  };

  const checkAnswer = (ans, option) => {
    if (ans == quizData.correctAnswer) {
      const newScore = quizData.totalCorrectAnswers + 1;
      setQuizData({
        ...quizData,
        totalCorrectAnswers: newScore,
      });
      setSelectedOption(option);
      if (quizData.currentQuestion == 5) {
        setResult(true);
        // Auto-save result when quiz is completed with the correct final score
        setTimeout(() => {
          saveQuizResult(newScore);
        }, 1000);
      }
    } else {
      setSelectedOption(option);
      document.querySelectorAll(".optionsBox .option").forEach((opt) => {
        if (!opt.classList.contains("correct")) {
          opt.classList.add("wrong");
        }
      });
      setCorrectAns(true);
      if (quizData.currentQuestion == 5) {
        setResult(true);
        // Auto-save result when quiz is completed with current score
        setTimeout(() => {
          saveQuizResult(quizData.totalCorrectAnswers);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MenteeHeader />
      <Navigation />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-4">
                <motion.h1
                  className="text-4xl md:text-5xl font-bold text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Test Your Knowledge with
                  <span className="text-primary-color">
                    {" "}
                    Interactive Quizzes
                  </span>
                </motion.h1>
                <motion.p
                  className="text-gray-400 text-lg max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Challenge yourself across various tech domains and track your
                  progress
                </motion.p>
              </div>

              {/* Search Section */}
              <motion.div
                className="max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-primary-color text-white placeholder-gray-400 transition-all pr-12"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      searchCategory();
                    }}
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>

              {/* Categories Grid */}
              {hasError ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Frown className="w-16 h-16 text-primary-color mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    No Categories Found
                  </h3>
                  <p className="text-gray-400">
                    Try searching with different keywords
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {categoriesData.map((category, index) => {
                    const existingResult = allQuizResults.find(
                      (result) => result.category === category.name
                    );

                    return (
                      <motion.div
                        key={index}
                        className="group relative bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-500"
                        whileHover={{ y: -5 }}
                        onClick={() => createQuiz(category.name, 1)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-primary-color/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Previous Result Badge */}
                        {existingResult && (
                          <div className="absolute top-4 right-4 z-10">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                existingResult.percentage >= 80
                                  ? "bg-green-500 text-black border border-green-500"
                                  : existingResult.percentage >= 60
                                  ? "bg-blue-500 text-black border border-blue-500"
                                  : "bg-orange-500 text-black border border-orange-500"
                              }`}
                            >
                              {existingResult.percentage}%
                              {existingResult.retakeCount > 0 && (
                                <span className="ml-1">
                                  ({existingResult.retakeCount} retakes)
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="relative p-6">
                          <div className="h-48 mb-4 overflow-hidden rounded-lg">
                            <img
                              src={category.imageURL}
                              alt={category.name}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {category.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3">
                            {category.description}
                          </p>

                          {/* Previous Result Summary */}
                          {existingResult && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Best: {existingResult.score}/5
                              </span>
                              <span className="text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.floor(existingResult.timeTaken / 60)}:
                                {(existingResult.timeTaken % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Quiz Dialog */}
          {isOpen && (
            <div className="relative grid grid-cols-1 lg:grid-cols-7 gap-6 max-w-[1800px] mx-auto">
              {/* Left Panel - Study Tips */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block lg:col-span-2"
              >
                <div className="sticky top-6 space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Study Tips
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center shrink-0">
                          <svg
                            className="w-4 h-4 text-primary-color"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Take your time to read each question carefully before
                          selecting an answer.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center shrink-0">
                          <svg
                            className="w-4 h-4 text-primary-color"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Eliminate obviously incorrect answers to improve your
                          chances.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center shrink-0">
                          <svg
                            className="w-4 h-4 text-primary-color"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Keep an eye on the timer, but don't let it rush your
                          decision-making.
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedOption &&
                    quizData.options[selectedOption] !==
                      quizData.correctAnswer && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                      >
                        <h3 className="text-xl font-semibold text-white mb-4">
                          Keep Practicing!
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                          Don't worry about getting it wrong - every mistake is
                          a learning opportunity. Take your time to understand
                          why the correct answer makes sense.
                        </p>
                        <div className="flex items-center gap-2 text-primary-color">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span className="text-sm font-medium">
                            Keep going!
                          </span>
                        </div>
                      </motion.div>
                    )}
                </div>
              </motion.div>

              {/* Main Quiz Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-3 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10"
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-white">
                      {currentCate}
                    </h2>
                    <div className="flex items-center gap-4">
                      <span className="text-primary-color font-medium">
                        Question {quizData.currentQuestion}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {result ? (
                    // Results Screen
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6"
                    >
                      <div className="mb-6">
                        {quizData.totalCorrectAnswers >= 4 ? (
                          <Crown className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                        ) : quizData.totalCorrectAnswers >= 3 ? (
                          <svg
                            className="w-20 h-20 text-green-500 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-20 h-20 text-orange-500 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        )}

                        <h2 className="text-3xl font-bold text-white mb-2">
                          {quizData.totalCorrectAnswers >= 4
                            ? "Excellent!"
                            : quizData.totalCorrectAnswers >= 3
                            ? "Good Job!"
                            : "Keep Practicing!"}
                        </h2>

                        <p className="text-gray-400">
                          You completed the {currentCate} quiz
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-6 space-y-4">
                        <div className="text-4xl font-bold text-primary-color">
                          {quizData.totalCorrectAnswers}/5
                        </div>
                        <div className="text-sm text-gray-300">
                          {Math.round((quizData.totalCorrectAnswers / 5) * 100)}
                          % Score
                        </div>

                        <div className="w-full bg-white/10 rounded-full h-3">
                          <motion.div
                            className="bg-primary-color h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (quizData.totalCorrectAnswers / 5) * 100
                              }%`,
                            }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-white font-medium">
                          {quizData.totalCorrectAnswers >= 4
                            ? "Outstanding performance! You've mastered this topic."
                            : quizData.totalCorrectAnswers >= 3
                            ? "Great work! You have a solid understanding."
                            : quizData.totalCorrectAnswers >= 2
                            ? "Good effort! Consider reviewing the material."
                            : "Don't give up! Practice makes perfect."}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Questions answered correctly:{" "}
                          {quizData.totalCorrectAnswers} out of 5
                        </p>

                        {/* Show timing */}
                        {quizStartTime && (
                          <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            Time taken:{" "}
                            {Math.floor((Date.now() - quizStartTime) / 60000)}:
                            {Math.floor(
                              ((Date.now() - quizStartTime) % 60000) / 1000
                            )
                              .toString()
                              .padStart(2, "0")}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ) : isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-6 bg-white/10 rounded w-3/4"></div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-12 bg-white/10 rounded"
                          ></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg text-white">
                        {quizData.question}
                      </div>
                      <div className="space-y-3">
                        {Object.entries(quizData.options).map(
                          ([key, value]) => (
                            <motion.button
                              key={key}
                              className={`w-full p-4 rounded-lg text-left transition-all ${
                                selectedOption === key &&
                                value === quizData.correctAnswer
                                  ? "bg-green-500/20 border-2 border-green-500 text-white"
                                  : selectedOption === key
                                  ? "bg-red-500/20 border-2 border-red-500 text-white"
                                  : "bg-white/5 text-white hover:bg-white/10"
                              } ${
                                correctAns && value === quizData.correctAnswer
                                  ? "bg-green-500/20 border-2 border-green-500"
                                  : correctAns && selectedOption === key
                                  ? "bg-red-500/20 border-2 border-red-500"
                                  : ""
                              } ${
                                (selectedOption !== "" || correctAns) &&
                                value !== quizData.correctAnswer
                                  ? "opacity-50"
                                  : ""
                              }`}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => checkAnswer(value, key)}
                              disabled={selectedOption !== "" || correctAns}
                            >
                              <span className="font-medium">
                                {key.toUpperCase()}.
                              </span>{" "}
                              {value}
                            </motion.button>
                          )
                        )}
                      </div>

                      {/* Feedback Message */}
                      {selectedOption && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg ${
                            selectedOption &&
                            quizData.options[selectedOption] ===
                              quizData.correctAnswer
                              ? "bg-green-500/20 border border-green-500"
                              : "bg-red-500/20 border border-red-500"
                          }`}
                        >
                          <p className="text-white text-center">
                            {selectedOption &&
                            quizData.options[selectedOption] ===
                              quizData.correctAnswer ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Correct Answer!
                              </span>
                            ) : (
                              <span className="flex flex-col items-center gap-2">
                                <span className="flex items-center gap-2">
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Incorrect Answer
                                </span>
                              </span>
                            )}
                          </p>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between items-center">
                  <div className="flex gap-3">
                    <button
                      className="px-6 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all"
                      onClick={() => {
                        setIsOpen(false);
                        setQuizData({
                          question: "",
                          options: { a: "", b: "", c: "", d: "" },
                          correctAnswer: "",
                          currentQuestion: 1,
                          totalCorrectAnswers: 0,
                        });
                        setCurrentCate("");
                        setIsLoading(true);
                        setSelectedOption("");
                        setCurrentQuestion(0);
                        setResult(false);
                        setCorrectAns(false);
                        setQuizStartTime(null);
                        setExistingResult(null);
                      }}
                    >
                      Exit Quiz
                    </button>
                    {result && (
                      <button
                        className="px-6 py-2 rounded-lg bg-primary-color text-white hover:bg-primary-color/90 transition-all flex items-center gap-2"
                        onClick={() => {
                          setQuizData({
                            question: "",
                            options: { a: "", b: "", c: "", d: "" },
                            correctAnswer: "",
                            currentQuestion: 1,
                            totalCorrectAnswers: 0,
                          });
                          setIsLoading(true);
                          setSelectedOption("");
                          setCorrectAns(false);
                          setResult(false);
                          setQuizStartTime(null);
                          createQuiz(currentCate, 1);
                        }}
                        disabled={isSavingResult}
                      >
                        <RotateCcw className="w-4 h-4" />
                        {isSavingResult ? "Saving..." : "Retake Quiz"}
                      </button>
                    )}
                  </div>
                  {selectedOption &&
                    !result &&
                    quizData.currentQuestion < 5 && (
                      <button
                        className="px-6 py-2 rounded-lg bg-primary-color hover:bg-primary-color/90 text-white transition-all"
                        onClick={() => {
                          // Reset states for next question
                          setSelectedOption("");
                          setCorrectAns(false);
                          createQuiz(currentCate, currentQuestion + 1);
                        }}
                      >
                        Next Question
                      </button>
                    )}
                  {selectedOption &&
                    quizData.currentQuestion === 5 &&
                    !result && (
                      <button
                        className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all"
                        onClick={() => {
                          setResult(true);
                          // Calculate final score including current question if correct
                          const finalScore =
                            selectedOption &&
                            quizData.options[selectedOption] ===
                              quizData.correctAnswer
                              ? quizData.totalCorrectAnswers + 1
                              : quizData.totalCorrectAnswers;

                          setTimeout(() => {
                            saveQuizResult(finalScore);
                          }, 1000);
                        }}
                      >
                        Finish Quiz
                      </button>
                    )}
                </div>
              </motion.div>

              {/* Right Panel - Progress & Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block lg:col-span-2"
              >
                <div className="sticky top-6 space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Your Progress
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span>Current Score</span>
                          <span>{quizData.totalCorrectAnswers}/5</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary-color"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (quizData.totalCorrectAnswers / 5) * 100
                              }%`,
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm">
                          Questions Completed
                        </span>
                        <span className="text-white font-medium">
                          {quizData.currentQuestion}/5
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm">
                          Success Rate
                        </span>
                        <span className="text-white font-medium">
                          {Math.round(
                            (quizData.totalCorrectAnswers /
                              quizData.currentQuestion) *
                              100
                          ) || 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedOption &&
                    quizData.options[selectedOption] ===
                      quizData.correctAnswer && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                      >
                        <h3 className="text-xl font-semibold text-white mb-4">
                          Great Job!
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                          You're doing fantastic! Keep up the great work and
                          maintain this momentum.
                        </p>
                        <div className="flex items-center gap-2 text-primary-color">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm font-medium">
                            Keep it up!
                          </span>
                        </div>
                      </motion.div>
                    )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
