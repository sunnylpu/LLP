import { useState } from "react";

import { Link } from "react-router-dom";
import Languagecode from "../levels/languageCode";
import { SPEAKING_CATEGORIES, SPEAKING_LANGUAGES, PRACTICE_LEVELS } from "../config/speakingConfig";

export default function Speaking() {
    const [language, setLanguage] = useState("");
    const [category, setCategory] = useState(null);
    const [learningLanguage, setLearningLanguage] = useState("");
    const [code, setLanguageCode] = useState("");

    const categories = SPEAKING_CATEGORIES;

    const languages = SPEAKING_LANGUAGES;

    return (
        <div className="speaking-container">
            {/* Header */}
            <div className="speaking-header">
                <div className="header-icon">🎤</div>
                <h1>Speaking Practice</h1>
                <p className="header-subtitle">Select your preferences to start practicing speaking</p>
            </div>

            {/* Progress Steps */}
            <div className="progress-container">
                <div className="progress-steps">
                    {[
                        { label: "Step 1", title: "Native Language", completed: !!language },
                        { label: "Step 2", title: "Target Language", completed: !!learningLanguage },
                        { label: "Step 3", title: "Category", completed: !!category }
                    ].map((step, index) => (
                        <div key={index} className="step-item">
                            <div className={`step-circle ${step.completed ? 'step-completed' : ''}`}>
                                {step.completed ? '✓' : index + 1}
                            </div>
                            <div className="step-info">
                                <span className="step-label">{step.label}</span>
                                <span className="step-title">{step.title}</span>
                            </div>
                            {index < 2 && (
                                <div className={`step-connector ${step.completed ? 'connector-active' : ''}`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="content-grid">
                {/* Left Column: Selection Forms */}
                <div className="selection-column">
                    {/* Language Selection Card */}
                    <div className="selection-card">
                        <div className="card-header">
                            <div className="card-icon language-icon">🌍</div>
                            <div>
                                <h2>Language Settings</h2>
                                <p className="card-subtitle">Choose your native and target languages</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🏠</span>
                                Your Native Language
                            </label>
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select your default language</option>
                                {languages.map((lang) => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-icon">🎯</span>
                                Language You Want to Learn
                            </label>
                            <select 
                                value={learningLanguage} 
                                onChange={(e) => setLearningLanguage(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select target language</option>
                                {languages.map((lang) => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        {/* Language Code Display */}
                        {learningLanguage && (
                            <div className="language-code-section">
                                <Languagecode 
                                    language={learningLanguage} 
                                    onCodeChange={(code) => setLanguageCode(code)} 
                                />
                            </div>
                        )}
                    </div>

                    {/* Category Selection Card */}
                    <div className="selection-card">
                        <div className="card-header">
                            <div className="card-icon category-icon">📁</div>
                            <div>
                                <h2>Learning Category</h2>
                                <p className="card-subtitle">Choose what you want to practice</p>
                            </div>
                        </div>

                        <div className="categories-grid">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.label)}
                                    className={`category-btn ${category === cat.label ? 'category-active' : ''}`}
                                >
                                    <span className="category-emoji">{cat.emoji}</span>
                                    <span className="category-label">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Levels Preview */}
                <div className="levels-column">
                    <div className="selection-card levels-card">
                        <div className="card-header">
                            <div>
                                <h2>Practice Levels</h2>
                                <p className="card-subtitle">Choose your difficulty level</p>
                            </div>
                            {(!language || !learningLanguage || !category) ? (
                                <div className="lock-status">
                                    <span className="lock-icon">🔒</span>
                                    <span>Complete steps to unlock</span>
                                </div>
                            ) : (
                                <div className="unlock-status">
                                    <span className="unlock-icon">🔓</span>
                                    <span>All steps completed!</span>
                                </div>
                            )}
                        </div>

                        {language && learningLanguage && category ? (
                            <div className="levels-list">
                                {PRACTICE_LEVELS.map((level) => (
                                    <Link
                                        key={level.id}
                                        to={`/dashboard/speaking/level/${level.id}`}
                                        state={{
                                            language: language,
                                            learningLanguage: learningLanguage,
                                            Category: category,
                                        }}
                                        className="level-link"
                                    >
                                        <div className={`level-card ${level.color}`}>
                                            <div className="level-header">
                                                <div className="level-number">{level.id}</div>
                                                <div className="level-info">
                                                    <h3 className="level-title">{level.label}</h3>
                                                    <p className="level-description">{level.description}</p>
                                                </div>
                                            </div>
                                            <div className="level-arrow">→</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="locked-levels">
                                <div className="lock-graphic">🔒</div>
                                <h3>Levels Locked</h3>
                                <p>Please select your native language, target language, and a category to unlock practice levels.</p>
                                <div className="unlock-hint">
                                    <span>Complete all 3 steps above</span>
                                    <span className="hint-arrow">→</span>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        {(language || learningLanguage || category) && (
                            <div className="selection-stats">
                                <h3>Your Selection</h3>
                                <div className="stats-tags">
                                    {language && (
                                        <span className="stat-tag native-tag">Native: {language}</span>
                                    )}
                                    {learningLanguage && (
                                        <span className="stat-tag learning-tag">Learning: {learningLanguage}</span>
                                    )}
                                    {category && (
                                        <span className="stat-tag category-tag">Category: {category}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="action-bar">
                <div className="action-text">
                    Ready to start speaking practice with realistic scenarios
                </div>
                {language && learningLanguage && category && (
                    <div className="ready-status">
                        <span className="ready-icon">✓</span>
                        <span>All set! Choose a level above</span>
                    </div>
                )}
            </div>

            {/* CSS Styles */}
            <style jsx>{`
                .speaking-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                }

                .speaking-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-top: 20px;
                }

                .speaking-header .header-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .speaking-header h1 {
                    font-size: 2.5rem;
                    color: #1a202c;
                    margin-bottom: 8px;
                    font-weight: 700;
                }

                .header-subtitle {
                    color: #718096;
                    font-size: 1.125rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .progress-container {
                    margin-bottom: 40px;
                }

                .progress-steps {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 40px;
                }

                .step-item {
                    display: flex;
                    align-items: center;
                    position: relative;
                }

                .step-circle {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #a0aec0;
                    font-size: 1.125rem;
                    transition: all 0.3s ease;
                    z-index: 2;
                }

                .step-completed {
                    background: #4299e1;
                    border-color: #4299e1;
                    color: white;
                }

                .step-info {
                    margin-left: 12px;
                    display: flex;
                    flex-direction: column;
                }

                .step-label {
                    font-size: 0.875rem;
                    color: #718096;
                    margin-bottom: 2px;
                }

                .step-title {
                    font-weight: 600;
                    color: #2d3748;
                }

                .step-connector {
                    width: 100px;
                    height: 2px;
                    background: #e2e8f0;
                    margin-left: 12px;
                    margin-right: 12px;
                }

                .connector-active {
                    background: #4299e1;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                @media (min-width: 1024px) {
                    .content-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                .selection-column {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .selection-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: transform 0.2s ease;
                }

                .selection-card:hover {
                    transform: translateY(-2px);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .card-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .language-icon {
                    background: #e3f2fd;
                    color: #1976d2;
                }

                .category-icon {
                    background: #f3e5f5;
                    color: #7b1fa2;
                }

                .card-header h2 {
                    font-size: 1.5rem;
                    color: #2d3748;
                    margin: 0;
                }

                .card-subtitle {
                    color: #718096;
                    font-size: 0.875rem;
                    margin-top: 4px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    color: #4a5568;
                    margin-bottom: 8px;
                    font-size: 0.875rem;
                }

                .label-icon {
                    font-size: 18px;
                }

                .form-select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    color: #2d3748;
                    background: white;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .form-select:focus {
                    outline: none;
                    border-color: #4299e1;
                    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
                }

                .form-select:hover {
                    border-color: #cbd5e0;
                }

                .language-code-section {
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                }

                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                }

                .category-btn {
                    padding: 16px 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .category-btn:hover {
                    border-color: #4299e1;
                    background: #f0f9ff;
                    transform: translateY(-2px);
                }

                .category-active {
                    border-color: #4299e1;
                    background: #ebf8ff;
                    box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
                }

                .category-emoji {
                    font-size: 24px;
                }

                .category-label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #2d3748;
                    text-align: center;
                }

                .levels-card .card-header {
                    justify-content: space-between;
                }

                .lock-status, .unlock-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .lock-status {
                    background: #fffaf0;
                    color: #dd6b20;
                }

                .unlock-status {
                    background: #f0fff4;
                    color: #38a169;
                }

                .lock-icon, .unlock-icon {
                    font-size: 16px;
                }

                .levels-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .level-link {
                    text-decoration: none;
                    color: inherit;
                }

                .level-card {
                    padding: 20px;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .level-card:hover {
                    border-color: #4299e1;
                    background: #f7fafc;
                    transform: translateX(4px);
                }

                .level-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .level-number {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                }

                .level-beginner .level-number {
                    background: linear-gradient(135deg, #48bb78, #38a169);
                }

                .level-intermediate .level-number {
                    background: linear-gradient(135deg, #4299e1, #3182ce);
                }

                .level-advanced .level-number {
                    background: linear-gradient(135deg, #9f7aea, #805ad5);
                }

                .level-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #2d3748;
                    margin: 0;
                }

                .level-description {
                    font-size: 0.875rem;
                    color: #718096;
                    margin-top: 4px;
                }

                .level-arrow {
                    color: #a0aec0;
                    font-size: 1.5rem;
                    transition: transform 0.2s ease;
                }

                .level-card:hover .level-arrow {
                    color: #4299e1;
                    transform: translateX(4px);
                }

                .locked-levels {
                    text-align: center;
                    padding: 40px 20px;
                }

                .lock-graphic {
                    font-size: 64px;
                    margin-bottom: 20px;
                    opacity: 0.5;
                }

                .locked-levels h3 {
                    font-size: 1.5rem;
                    color: #4a5568;
                    margin-bottom: 12px;
                }

                .locked-levels p {
                    color: #718096;
                    max-width: 400px;
                    margin: 0 auto 24px;
                }

                .unlock-hint {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #4299e1;
                    font-weight: 500;
                    padding: 12px 20px;
                    background: #ebf8ff;
                    border-radius: 8px;
                }

                .hint-arrow {
                    transition: transform 0.2s ease;
                }

                .unlock-hint:hover .hint-arrow {
                    transform: translateX(4px);
                }

                .selection-stats {
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                }

                .selection-stats h3 {
                    font-size: 1rem;
                    color: #4a5568;
                    margin-bottom: 12px;
                }

                .stats-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .stat-tag {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .native-tag {
                    background: #e3f2fd;
                    color: #1976d2;
                }

                .learning-tag {
                    background: #e8f5e9;
                    color: #388e3c;
                }

                .category-tag {
                    background: #f3e5f5;
                    color: #7b1fa2;
                }

                .action-bar {
                    max-width: 1200px;
                    margin: 40px auto 0;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .action-text {
                    color: #718096;
                    font-size: 0.875rem;
                }

                .ready-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #38a169;
                    font-weight: 500;
                    padding: 8px 16px;
                    background: #f0fff4;
                    border-radius: 20px;
                }

                .ready-icon {
                    font-weight: bold;
                }

                @media (max-width: 768px) {
                    .progress-steps {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 30px;
                    }

                    .step-item {
                        width: 100%;
                    }

                    .step-connector {
                        width: 2px;
                        height: 30px;
                        margin: 8px 0 8px 23px;
                        position: absolute;
                        left: 24px;
                        top: 48px;
                    }

                    .categories-grid {
                        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    }

                    .action-bar {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}