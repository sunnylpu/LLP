import { useParams, useLocation } from "react-router-dom";
import React, { useEffect, useState, useRef, useContext } from "react";
import { GlobalContext } from "./globalfile";
import { useDispatch, useSelector } from "react-redux";
import { addScore, minusScore } from "../Score/slice";
import CompareText from "../components/comapreText";
import SpeakSentence from "./speakaudio";
import { jwtDecode } from "jwt-decode";
import api, { question, saveScoreData } from "../utils/api";
import Languagecode from "./languageCode";
import MonthGrid from "../utils/calender";
import './level.css'

// Import MUI components for popups
import {
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material';

import {
    containerStyle, headerStyle, titleStyle, subHeaderStyle, badgeStyle,
    contentStyle, leftPanelStyle, rightPanelStyle, cardStyle, cardHeaderStyle,
    cardTitleStyle, scoreIndicatorStyle, scoreCircleStyle, scoreValueTextStyle,
    scoreValueLabelStyle, currentQuestionTitleStyle, sentenceCardStyle,
    sentenceHeaderStyle, targetSentenceStyle, pronunciationStyle, speechCardStyle,
    speechHeaderStyle, speechInputStyle, textAreaStyle, buttonGroupStyle,
    recordButtonStyle, compareButtonStyle, spinnerStyle, navigationStyle,
    navButtonStyle, getQuestionButtonStyle, audioCardStyle, audioPlayerButtonStyle,
    resultsCardStyle, resultsHeaderStyle, accuracyBadgeStyle, feedbackMessageStyle,
    comparisonGridStyle, wordCardStyle, wordHeaderStyle, wordIndexStyle,
    accuracyIndicatorStyle, wordComparisonStyle, wordSectionStyle, wordLabelStyle,
    expectedWordStyle, spokenWordStyle, missingIndicatorStyle, statsCardStyle,
    statsTitleStyle, scoreGridStyle, scoreItemStyle, scoreNumberStyle,
    scoreItemLabelStyle, scoreControlsStyle, scoreActionButtonStyle,
    currentScoreDisplayStyle, submitButtonStyle, calendarCardStyle,
    calendarGridStyle, calendarSectionStyle, languageCodeContainerStyle
} from './levelStyles';

export default function Level1() {
    const currentScore = useSelector((state) => state.todos.count);
    const dispatch = useDispatch();

    const { id } = useParams();
    const { state } = useLocation();
    const language = state?.language;
    const learningLanguage = state?.learningLanguage;
    const Category = state?.Category;

    const [match, setMatch] = useState(null);
    const { startListening, setlistening, setText, text } = useContext(GlobalContext);
    const [index, setIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [qIndex, setQIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [lastScore, setLastScore] = useState("loading");
    const [bestScore, setBestScore] = useState("loading");
    const [code, setLanguageCode] = useState("");
    const [currentMonth, setFirstMonth] = useState([]);
    const [lastMonth, setLastmonth] = useState([]);
    const [isComparing, setIsComparing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [overallAccuracy, setOverallAccuracy] = useState(0);
    
    // New state for popups
    const [loading, setLoading] = useState(false);
    const [loadingTime, setLoadingTime] = useState(0);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(false);

    // Track which sentences have been scored to prevent duplicate scoring
    const [scoredSentences, setScoredSentences] = useState(new Set());
    
    // Create a unique key for current sentence - moved inside component
    const currentSentenceKey = `${qIndex}-${index}`;

    // Ref for scrolling to results
    const resultsRef = useRef(null);

    // Helper function to safely get current sentence data
    const getCurrentSentenceData = () => {
        if (!result || result.length === 0 || !result[qIndex] || result[qIndex].length <= index) {
            return null;
        }
        
        const sentenceData = result[qIndex][index];
        
        // Handle case where sentenceData might be the question title (index 0)
        if (index === 0) {
            return null; // This is the question title, not a sentence
        }
        
        // Check if sentenceData is an object with the expected properties
        if (sentenceData && typeof sentenceData === 'object') {
            return sentenceData;
        }
        
        return null;
    };
    let targetsen;
    // Get current sentence text
    let targetcode=code;
    const getCurrentSentenceText = () => {
        const sentenceData = getCurrentSentenceData();
        if (!sentenceData) return null;
        targetsen=sentenceData.meaning_in_target;
        return sentenceData.meaning_in_target || sentenceData.sentence || "";
    };

    // Get pronunciation guide
    let pronunciationd;
    const getCurrentPronunciation = () => {
        const sentenceData = getCurrentSentenceData();
        if (!sentenceData) return "";
        pronunciationd=sentenceData.pronunciation_in_source_script;
        return sentenceData.pronunciation_in_source_script || sentenceData.pronunciation || "";
    };
    
    const Onhandle = () => {
        if (result && result.length > 0 && result[qIndex]) {
            // Check if there's a next sentence in current question
            // We need to check if index+1 exists AND if it has sentence data (not just question title)
            if (index + 1 < result[qIndex].length) {
                // Go to next sentence
                setIndex(prevIndex => prevIndex + 1);
            } else {
                // If no more sentences in current question, go to next question
                if (qIndex + 1 < result.length) {
                    setQIndex(prevQIndex => prevQIndex + 1);
                    setIndex(1); // Start at first sentence (skip question title at index 0)
                } else {
                    // If no more questions, reset to first question
                    setQIndex(0);
                    setIndex(1);
                }
            }
            // Reset comparison results when moving to next sentence/question
            setShowResults(false);
            setMatch(null);
            setText(""); // Clear speech text
        }
    }

    const calculateScore = (match) => {
        if (!match) return;
        
        // Check if this sentence has already been scored
        if (scoredSentences.has(currentSentenceKey)) {
            console.log("Sentence already scored, skipping score calculation");
            return;
        }
        
        let sd = 0, sv = 0;
        match.forEach(item => {
            sd += item.score;
            sv += 100;
        })
        const currentScore = (sd / sv) * 100 * 0.05;
        setTotalScore(prev => prev + currentScore);
        
        // Mark this sentence as scored
        setScoredSentences(prev => new Set(prev).add(currentSentenceKey));
        
        // Calculate overall accuracy for the current comparison
        const accuracy = (sd / sv) * 100;
        setOverallAccuracy(accuracy);
    }

    useEffect(() => {
        const fetchdetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const decoded = jwtDecode(token);
                const response = await api.get("/save/fetchdetail", {
                    params: { id: decoded.id },
                });
                setLastScore(response.data.lastScore);
                setBestScore(response.data.bestScore);
                setFirstMonth(response.data.currentMonth);
                setLastmonth(response.data.lastMonth);
            } catch (err) {
                console.log(err);
            }
        }
        fetchdetails();
    }, []);

    useEffect(() => {
        if (match) calculateScore(match);
    }, [match]);

    // Timer effect for loading popup
    useEffect(() => {
        let timer;
        if (loading) {
            setLoadingTime(0);
            timer = setInterval(() => {
                setLoadingTime(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        return 100;
                    }
                    return prev + 2; // Increment by 2% every 100ms
                });
            }, 100);
        } else {
            setLoadingTime(0);
        }
        
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [loading]);

    // Function to scroll to results
    const scrollToResults = () => {
        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handleCompare = () => {
        const sentenceText = getCurrentSentenceText();
        if (!sentenceText || !text) {
            console.error("Cannot compare: Missing data", { 
                sentenceText, 
                text, 
                result, 
                qIndex, 
                index,
                currentData: getCurrentSentenceData()
            });
            return;
        }
        
        setIsComparing(true);
        setTimeout(() => {
            const comparisonResult = CompareText(sentenceText, text);
            setMatch(comparisonResult);
            setShowResults(true);
            setIsComparing(false);
            
            // Scroll to results after a short delay
            setTimeout(() => {
                scrollToResults();
            }, 100);
        }, 1000);
    }

    const handleGetQuestion = async () => {
        setLoading(true);
        setShowResults(false);
        setMatch(null);
        setText(""); // Clear speech text
        setScoredSentences(new Set()); // Reset scored sentences when loading new questions
        
        try {
            const res = await question({
                source: `${language}`,
                target: `${learningLanguage}`,
                category: `${Category}`,
                id: `${id}`,
            });
            
            const parse = JSON.parse(res.result);
            const arr = Object.entries(parse);
            
            setResult(arr);
            setQIndex(0);
            
            // Check if first question has sentences beyond the title
            if (arr.length > 0 && arr[0].length > 1) {
                setIndex(1); // Start at first sentence
            } else {
                setIndex(0); // Fallback
            }
        } catch (error) {
            console.error("Error loading questions:", error);
        } finally {
            // Simulate a minimum loading time for better UX
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    }

    const handleSaveProgress = async () => {
        try {
            await saveScoreData(totalScore);
            setSaveSuccess(true);
            
            // Auto-hide the success message after 3 seconds
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (error) {
            console.error("Error saving progress:", error);
            setSaveError(true);
            
            // Auto-hide the error message after 3 seconds
            setTimeout(() => {
                setSaveError(false);
            }, 3000);
        }
    }

    const getAccuracyColor = (score) => {
        if (score >= 80) return "#4CAF50";
        if (score >= 60) return "#FF9800";
        return "#F44336";
    }

    const getAccuracyEmoji = (score) => {
        if (score >= 80) return "🎉";
        if (score >= 60) return "👍";
        return "🔄";
    }

    const getFeedbackMessage = (score) => {
        if (score >= 80) return "Excellent pronunciation!";
        if (score >= 60) return "Good job! Keep practicing.";
        return "Try speaking more clearly.";
    }

    // Get current sentence index display
    const getSentenceNumber = () => {
        if (!result || result.length === 0) return 1;
        return index; // Since index starts at 1 for the first sentence
    }

    // Get total sentences in current question
    const getTotalSentencesInCurrentQuestion = () => {
        if (!result || result.length === 0 || !result[qIndex]) return 0;
        // Subtract 1 for the question title at index 0
        return Math.max(0, result[qIndex].length - 1);
    }

    // Get current question title
    let defaultvalue;
    const getCurrentQuestionTitle = () => {
        if (!result || result.length === 0 || !result[qIndex] || !result[qIndex][0]) {
            return "";
        }
        defaultvalue=result[qIndex][0];
        return result[qIndex][0];
    }

    return (
        <div style={containerStyle}>
            {/* Loading Popup Dialog */}
            <Dialog 
                open={loading} 
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: '16px',
                        padding: '20px',
                        backgroundColor: 'white',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }
                }}
            >
                <DialogContent style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <CircularProgress 
                        size={70} 
                        thickness={4}
                        style={{ color: '#667eea', marginBottom: '25px' }}
                    />
                    <Typography variant="h5" style={{ marginBottom: '15px', color: '#2d3748', fontWeight: '700' }}>
                        ⏳ Loading New Questions
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '30px', color: '#666', fontSize: '1.1rem' }}>
                        Please wait while we generate your new practice set...
                    </Typography>
                    
                    <Box style={{ marginBottom: '20px' }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={loadingTime}
                            style={{
                                height: '12px',
                                borderRadius: '6px',
                                backgroundColor: '#e2e8f0'
                            }}
                        />
                    </Box>
                    
                    <Typography variant="body2" style={{ 
                        color: '#667eea', 
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        marginBottom: '15px'
                    }}>
                        {loadingTime}% complete
                    </Typography>
                    
                    <div style={{ 
                        marginTop: '30px', 
                        fontSize: '0.95rem', 
                        color: '#888',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '25px',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>⏳</span>
                            Generating content...
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔄</span>
                            Processing language models...
                        </span>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Save Success Snackbar */}
            <Snackbar
                open={saveSuccess}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                style={{ 
                    zIndex: 9999,
                    bottom: '30px'
                }}
            >
                <Alert 
                    severity="success" 
                    variant="filled"
                    style={{
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        padding: '18px 24px',
                        boxShadow: '0 10px 30px rgba(76, 175, 80, 0.4)',
                        alignItems: 'center',
                        minWidth: '300px'
                    }}
                    icon={false}
                >
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}>
                        <span style={{ 
                            fontSize: '1.8rem', 
                            animation: 'bounce 0.5s ease infinite alternate'
                        }}>✅</span>
                        <span style={{ fontSize: '1.1rem' }}>Progress saved successfully!</span>
                    </div>
                </Alert>
            </Snackbar>

            {/* Save Error Snackbar */}
            <Snackbar
                open={saveError}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                style={{ 
                    zIndex: 9999,
                    bottom: '30px'
                }}
            >
                <Alert 
                    severity="error" 
                    variant="filled"
                    style={{
                        background: 'linear-gradient(135deg, #F44336 0%, #d32f2f 100%)',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        padding: '18px 24px',
                        boxShadow: '0 10px 30px rgba(244, 67, 54, 0.4)',
                        alignItems: 'center',
                        minWidth: '300px'
                    }}
                    icon={false}
                >
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}>
                        <span style={{ fontSize: '1.8rem' }}>❌</span>
                        <span style={{ fontSize: '1.1rem' }}>Failed to save progress. Please try again.</span>
                    </div>
                </Alert>
            </Snackbar>

            {/* Header Section */}
            <div style={headerStyle}>
                <h1 style={titleStyle}>🎤 Speaking Practice - Level {id}</h1>
                <div style={subHeaderStyle}>
                    <span style={badgeStyle}>{learningLanguage}</span>
                    <span style={badgeStyle}>{Category}</span>
                    <span style={badgeStyle}>Level {id}</span>
                </div>
            </div>

            <div style={contentStyle}>
                {/* Left Panel - Practice Area */}
                <div style={leftPanelStyle}>
                    {/* Question Card */}
                    <div style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <h2 style={cardTitleStyle}>
                                <span style={{ marginRight: "10px" }}>📝</span>
                                Practice Sentence {getSentenceNumber()}
                                {result && result.length > 0 && (
                                    <span style={{ 
                                        fontSize: "0.9rem", 
                                        color: "#666", 
                                        marginLeft: "10px",
                                        fontWeight: "normal"
                                    }}>
                                        (Question {qIndex + 1}/{result.length})
                                    </span>
                                )}
                            </h2>
                            <div style={scoreIndicatorStyle}>
                                <div style={scoreCircleStyle}>
                                    <span style={scoreValueTextStyle}>{Math.round(totalScore)}</span>
                                    <span style={scoreValueLabelStyle}>Current Score</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Question Title */}
                        {result && result.length > 0 && getCurrentQuestionTitle() && (
                            <div style={currentQuestionTitleStyle}>
                                <h3 style={{ 
                                    margin: "0 0 10px 0", 
                                    fontSize: "1.1rem", 
                                    color: "#666",
                                    fontWeight: "500"
                                }}>
                                    <span style={{ marginRight: "8px" }}>❓</span>
                                    {getCurrentQuestionTitle()}
                                </h3>
                            </div>
                        )}

                        {/* Target Sentence */}
                        <div style={sentenceCardStyle}>
                            <div style={sentenceHeaderStyle}>
                                <span style={{ fontSize: "0.9rem", color: "#666", marginBottom: "5px" }}>
                                    Target Sentence (in {learningLanguage})
                                </span>
                                {result && result.length > 0 && getCurrentSentenceText() && (
                                    <span style={{ 
                                        fontSize: "0.8rem", 
                                        color: "#888",
                                        backgroundColor: "#f0f0f0",
                                        padding: "3px 8px",
                                        borderRadius: "10px"
                                    }}>
                                        Sentence {getSentenceNumber()}/{getTotalSentencesInCurrentQuestion()}
                                    </span>
                                )}
                            </div>
                            <p style={targetSentenceStyle}>
                                {getCurrentSentenceText() || "Click 'New Question Set' to start"}
                            </p>
                            <div style={pronunciationStyle}>
                                <span style={{ color: "#666", fontSize: "0.9rem" }}>Pronunciation Guide:</span>
                                <p style={{ margin: "5px 0 0 0", fontSize: "1.1rem" }}>
                                    {getCurrentPronunciation()}
                                </p>
                            </div>
                        </div>

                        {/* Speech Input Section */}
                        <div style={speechCardStyle}>
                            <div style={speechHeaderStyle}>
                                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#333" }}>
                                    <span style={{ marginRight: "8px" }}>🎤</span>
                                    Your Speech
                                </h3>
                                <div style={languageCodeContainerStyle}>
                                    {learningLanguage && (
                                        <Languagecode 
                                            language={learningLanguage} 
                                            onCodeChange={(code) => setLanguageCode(code)} 
                                        />
                                    )}
                                </div>
                            </div>

                            <div style={speechInputStyle}>
                                <textarea
                                    value={text}
                                    readOnly
                                    placeholder="Your speech will appear here..."
                                    style={textAreaStyle}
                                />
                                <div style={buttonGroupStyle}>
                                    <button 
                                        onClick={() => startListening(code)}
                                        style={recordButtonStyle}
                                        disabled={!code || loading}
                                    >
                                        <span style={{ fontSize: "1.5rem", marginRight: "10px" }}>🎤</span>
                                        {text ? "Speak Again" : "Start Speaking"}
                                    </button>
                                    
                                    <button 
                                        onClick={handleCompare}
                                        style={compareButtonStyle}
                                        disabled={!text || isComparing || loading || !getCurrentSentenceText()}
                                    >
                                        {isComparing ? (
                                            <>
                                                <span className="spinner" style={spinnerStyle}></span>
                                                Comparing...
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ marginRight: "8px" }}>📊</span>
                                                Compare Results
                                                <span style={{ 
                                                    fontSize: "1rem", 
                                                    marginLeft: "8px",
                                                    animation: "bounceDown 2s ease infinite"
                                                }}>⬇</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div style={navigationStyle}>
                            <button 
                                onClick={Onhandle} 
                                disabled={(!result || result.length === 0) || loading}
                                style={navButtonStyle}
                            >
                                <span style={{ marginRight: "8px" }}>→</span>
                                {result && result.length > 0 && qIndex + 1 >= result.length && index + 1 >= getTotalSentencesInCurrentQuestion() ? 
                                    "Start Over" : 
                                    "Next Sentence"
                                }
                            </button>
                            <button 
                                onClick={handleGetQuestion}
                                style={getQuestionButtonStyle}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner" style={spinnerStyle}></span>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <span style={{ marginRight: "8px" }}>🔄</span>
                                        New Question Set
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Audio Player */}
                    {getCurrentSentenceText() && code && (
                        <div style={audioCardStyle}>
                            <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>
                                <span style={{ marginRight: "8px" }}>🔊</span>
                                Listen & Repeat
                            </h3>
                            <SpeakSentence 
                                sentence={getCurrentSentenceText()} 
                                lang={code}
                                style={audioPlayerButtonStyle}
                            />
                        </div>
                    )}
                </div>

                {/* Right Panel - Results & Stats */}
                <div style={rightPanelStyle}>
                    {/* Stats Card */}
                    <div style={statsCardStyle}>
                        <h2 style={statsTitleStyle}>
                            <span style={{ marginRight: "10px" }}>📈</span>
                            Your Progress
                        </h2>
                        
                        <div style={scoreGridStyle}>
                            <div style={scoreItemStyle}>
                                <div style={scoreNumberStyle}>{Math.round(totalScore)}</div>
                                <div style={scoreItemLabelStyle}>Current Score</div>
                            </div>
                            <div style={scoreItemStyle}>
                                <div style={scoreNumberStyle}>{lastScore}</div>
                                <div style={scoreItemLabelStyle}>Last Attempt</div>
                            </div>
                            <div style={scoreItemStyle}>
                                <div style={scoreNumberStyle}>{bestScore}</div>
                                <div style={scoreItemLabelStyle}>Best Score</div>
                            </div>
                        </div>

                        {/* Score Controls */}
                        <div style={scoreControlsStyle}>
                            <button 
                                onClick={() => dispatch(addScore())}
                                style={scoreActionButtonStyle("#4CAF50")}
                                disabled={loading}
                            >
                                <span style={{ marginRight: "5px" }}>➕</span>
                                Add Score
                            </button>
                            <button 
                                onClick={() => dispatch(minusScore())}
                                style={scoreActionButtonStyle("#F44336")}
                                disabled={loading}
                            >
                                <span style={{ marginRight: "5px" }}>➖</span>
                                Minus Score
                            </button>
                        </div>

                        <div style={currentScoreDisplayStyle}>
                            Redux Score: <strong>{currentScore}</strong>
                        </div>

                        {/* Submit Button */}
                        <button 
                            onClick={handleSaveProgress}
                            style={submitButtonStyle}
                            disabled={loading}
                        >
                            <span style={{ marginRight: "8px" }}>💾</span>
                            Save Progress
                        </button>
                        
                        {/* Save Status Indicator */}
                        {saveSuccess && (
                            <div style={{
                                marginTop: '10px',
                                padding: '8px',
                                backgroundColor: '#4CAF5020',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontSize: '0.9rem',
                                color: '#4CAF50',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>✓</span>
                                Progress saved!
                            </div>
                        )}
                        {saveError && (
                            <div style={{
                                marginTop: '10px',
                                padding: '8px',
                                backgroundColor: '#F4433620',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontSize: '0.9rem',
                                color: '#F44336',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>✗</span>
                                Save failed. Try again.
                            </div>
                        )}
                    </div>

                    {/* Calendar Section */}
                    <div style={calendarCardStyle}>
                        <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>
                            <span style={{ marginRight: "8px" }}>📅</span>
                            Practice Calendar
                        </h3>
                        <div style={calendarGridStyle}>
                            <div style={calendarSectionStyle}>
                                <h4 style={{ fontSize: "0.9rem", color: "#666", marginBottom: "10px" }}>
                                    Current Month
                                </h4>
                                <MonthGrid days={currentMonth} compact={true} />
                            </div>
                            <div style={calendarSectionStyle}>
                                <h4 style={{ fontSize: "0.9rem", color: "#666", marginBottom: "10px" }}>
                                    Last Month
                                </h4>
                                <MonthGrid days={lastMonth} compact={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Results Section - MOVED TO BOTTOM */}
            <div ref={resultsRef} style={{ marginTop: "30px" }}>
                {showResults && match && (
                    <div style={resultsCardStyle}>
                        <div style={resultsHeaderStyle}>
                            <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#333" }}>
                                <span style={{ marginRight: "10px" }}>📊</span>
                                Comparison Results
                                <span style={{ 
                                    fontSize: "1rem", 
                                    marginLeft: "10px",
                                    color: "#666",
                                    fontWeight: "normal"
                                }}>
                                    (Scrolled automatically)
                                </span>
                            </h2>
                            <div style={accuracyBadgeStyle(getAccuracyColor(overallAccuracy))}>
                                <span style={{ fontSize: "1.2rem", marginRight: "5px" }}>
                                    {getAccuracyEmoji(overallAccuracy)}
                                </span>
                                {overallAccuracy.toFixed(1)}% Accuracy
                            </div>
                        </div>

                        <div style={feedbackMessageStyle(getAccuracyColor(overallAccuracy))}>
                            {getFeedbackMessage(overallAccuracy)}
                        </div>

                        {/* Word-by-word Comparison */}
                        <div style={comparisonGridStyle}>
                            {match.map((item, idx) => (
                                <div key={idx} style={wordCardStyle}>
                                    <div style={wordHeaderStyle}>
                                        <span style={wordIndexStyle}>Word {idx + 1}</span>
                                        <div style={accuracyIndicatorStyle(item.score)}>
                                            {item.score}%
                                        </div>
                                    </div>
                                    <div style={wordComparisonStyle}>
                                        <div style={wordSectionStyle}>
                                            <span style={wordLabelStyle}>Expected:</span>
                                            <span style={expectedWordStyle}>{item.target}</span>
                                        </div>
                                        <div style={wordSectionStyle}>
                                            <span style={wordLabelStyle}>Spoken:</span>
                                            <span style={spokenWordStyle(item.score)}>{item.spoken || "(missing)"}</span>
                                        </div>
                                    </div>
                                    {item.missing && (
                                        <div style={missingIndicatorStyle}>
                                            ⚠️ Word missing in your speech
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Back to top button */}
                        <div style={{ textAlign: "center", marginTop: "30px" }}>
                            <button 
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                style={{
                                    background: "#667eea",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >
                                <span>⬆</span>
                                Back to Practice
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Inline Styles with new animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes bounce {
                    0% { transform: translateY(0px); }
                    100% { transform: translateY(-5px); }
                }
                
                @keyframes bounceDown {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(5px); }
                    60% { transform: translateY(3px); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .spinner {
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top: 3px solid white;
                    width: 16px;
                    height: 16px;
                    animation: spin 1s linear infinite;
                    margin-right: 8px;
                    display: inline-block;
                }
                
                .popup-enter {
                    animation: fadeIn 0.3s ease-out;
                }
                
                @media (max-width: 1024px) {
                    .content {
                        flex-direction: column;
                    }
                    
                    .left-panel, .right-panel {
                        width: 100% !important;
                    }
                    
                    .comparison-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                
                @media (max-width: 768px) {
                    .comparison-grid {
                        grid-template-columns: 1fr !important;
                    }
                    
                    .score-grid {
                        flex-direction: column !important;
                    }
                    
                    .button-group {
                        flex-direction: column !important;
                    }
                    
                    .navigation {
                        flex-direction: column !important;
                    }
                    
                    /* Adjust popup for mobile */
                    .MuiDialog-paper {
                        margin: 16px !important;
                    }
                    
                    .MuiSnackbar-root {
                        bottom: 70px !important;
                    }
                }
            `}</style>
        </div>
    );
}

// Styles are now imported from levelStyles.js
// Lines 968-1566 have been moved to levelStyles.js