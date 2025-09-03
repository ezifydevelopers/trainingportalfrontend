
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "@/types/course";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface QuizComponentProps {
  quiz: Quiz;
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
  attempts: number;
}

export default function QuizComponent({ quiz, onComplete, onBack, attempts }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<{score: number, correctAnswers: boolean[]}>({
    score: 0,
    correctAnswers: []
  });

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (selectedAnswers[currentQuestion] === undefined) {
      toast.error("Please select an answer before continuing");
      return;
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const correctAnswers = quiz.questions.map((question, index) => 
      selectedAnswers[index] === question.correctAnswer
    );
    
    const correctCount = correctAnswers.filter(Boolean).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    
    setQuizResults({ score, correctAnswers });
    setShowResults(true);
    
    setTimeout(() => {
      onComplete(score, passed);
    }, 3000);
  };

  if (showResults) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {quizResults.score >= quiz.passingScore ? (
              <CheckCircle className="h-16 w-16 text-green-600" />
            ) : (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {quizResults.score >= quiz.passingScore ? "Congratulations!" : "Quiz Not Passed"}
          </CardTitle>
          <CardDescription>
            You scored {quizResults.score}% ({quizResults.correctAnswers.filter(Boolean).length}/{quiz.questions.length} correct)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Progress value={quizResults.score} className="mb-2" />
            <p className="text-sm text-gray-600">
              {quizResults.score >= quiz.passingScore 
                ? "You can now proceed to the next module!"
                : `You need ${quiz.passingScore}% to pass. ${quiz.maxAttempts - attempts} attempts remaining.`
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Question Review:</h4>
            {quiz.questions.map((question, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                {quizResults.correctAnswers[index] ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Question {index + 1}</span>
                {!quizResults.correctAnswers[index] && (
                  <Badge variant="outline" className="text-xs">
                    Correct: {question.options[question.correctAnswer]}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Question {currentQuestion + 1} of {quiz.questions.length}</CardTitle>
          <Badge variant="outline">Attempt {attempts + 1}/{quiz.maxAttempts}</Badge>
        </div>
        <CardDescription>
          Choose the best answer • {quiz.passingScore}% required to pass
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{currentQ.question}</h3>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 border rounded-lg transition-colors ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={currentQuestion === 0 ? onBack : handlePrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentQuestion === 0 ? "Back to Module" : "Previous"}
          </Button>
          
          <Button onClick={handleNext} disabled={selectedAnswers[currentQuestion] === undefined}>
            {currentQuestion === quiz.questions.length - 1 ? "Submit Quiz" : "Next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
