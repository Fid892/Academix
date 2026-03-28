import React, { useState, useEffect } from 'react';
import './StudyPlanner.css';
import { Calendar, Edit, Clock, RefreshCw, CheckCircle, Play, Pause, Square, ArrowLeft } from 'lucide-react';
import TimetableList from './TimetableList';
import CreateTimetableModal from './CreateTimetableModal';

const API_BASE = 'http://localhost:5000/api/study-planner';

const StudyPlanner = () => {
    const [view, setView] = useState('loading'); // loading, list, setup, generating, review, dashboard
    const [plan, setPlan] = useState(null);
    const [timetables, setTimetables] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newPlanMeta, setNewPlanMeta] = useState(null);

    // Setup Form State
    const [manualTopics, setManualTopics] = useState('');
    
    // Follow up questions State
    const [days, setDays] = useState(7);
    const [hoursPerDay, setHoursPerDay] = useState(4);
    const [timeRangeStart, setTimeRangeStart] = useState('09:00');
    const [timeRangeEnd, setTimeRangeEnd] = useState('21:00');
    const [includeBreaks, setIncludeBreaks] = useState(true);

    // Generation state
    const [modules, setModules] = useState([]);
    const [generatedSchedule, setGeneratedSchedule] = useState([]);
    
    // Timer state
    const [timerActive, setTimerActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentTask, setCurrentTask] = useState(null);

    useEffect(() => {
        fetchTimetables();
    }, []);

    const fetchTimetables = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/timetable/my`, {credentials: 'include'});
            if (res.ok) {
                const data = await res.json();
                setTimetables(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setView('list');
        }
    };

    const handleCreateNew = () => setShowModal(true);

    const handleGenerateStart = (meta) => {
        setNewPlanMeta(meta);
        setShowModal(false);
        setManualTopics('');
        setView('setup');
    };

    const handleOpenPlan = (timetable) => {
        const mappedPlan = {
            ...timetable,
            checklist: timetable.tasks || []
        };
        setPlan(mappedPlan);
        setView('dashboard');
    };

    const handleDeletePlanFromList = async (id) => {
        if (!window.confirm("Are you sure you want to delete this timetable?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/timetable/delete/${id}`, { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                fetchTimetables();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const processInitialInput = async () => {
        if (!manualTopics.trim()) return alert('Please enter topics');
        const topicList = manualTopics.split(',').map(t => t.trim());
        setModules([{ module_name: 'Manual Topics', topics: topicList }]);
        setView('options');
    };

    const generateSchedule = async () => {
        setView('generating');
        try {
            const res = await fetch(`${API_BASE}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modules,
                    days,
                    hoursPerDay,
                    timeRangeStart,
                    timeRangeEnd,
                    includeBreaks
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.schedule) {
                setGeneratedSchedule(data.schedule);
                setView('review');
            } else {
                alert('Failed to generate schedule');
                setView('options');
            }
        } catch (err) {
            console.error(err);
            setView('options');
        }
    };

    const savePlan = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/timetable/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planName: newPlanMeta?.planName || 'My Study Plan',
                    description: newPlanMeta?.description || '',
                    type: 'manual',
                    modules,
                    settings: { days, hoursPerDay, timeRangeStart, timeRangeEnd, includeBreaks },
                    schedule: generatedSchedule
                }),
                credentials: 'include'
            });
            if (res.ok) {
                await fetchTimetables();
            } else {
                alert('Failed to save plan');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleChecklist = async (itemId, completed) => {
        const optimisticPlan = {...plan};
        const itemIndex = optimisticPlan.checklist.findIndex(i => i._id === itemId);
        if(itemIndex !== -1) optimisticPlan.checklist[itemIndex].completed = !completed;
        setPlan(optimisticPlan);

        try {
            await fetch(`http://localhost:5000/api/timetable/task/${plan._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, completed: !completed }),
                credentials: 'include'
            });
        } catch (err) {
            console.error(err);
        }
    };

    const deletePlan = async () => {
        if(!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await fetch(`http://localhost:5000/api/timetable/delete/${plan._id}`, { method: 'DELETE', credentials: 'include' });
            setPlan(null);
            fetchTimetables();
        } catch (err) {
            console.error(err);
        }
    };

    const [refining, setRefining] = useState(false);

    // Timer functions
    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(l => l - 1), 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            alert("Time's up for task: " + currentTask?.topic);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const startTimerForTask = (task) => {
        setCurrentTask(task);
        // Estimate time diff in seconds. Just using a generic 60 mins for simplicity if parsing fails.
        setTimeLeft(60 * 60); 
        setTimerActive(true);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (view === 'loading') return <div className="sp-loading">Loading Planner...</div>;

    return (
        <div className="study-planner-container">
            {showModal && (
                <CreateTimetableModal 
                    onClose={() => setShowModal(false)} 
                    onGenerate={handleGenerateStart} 
                />
            )}

            <div className="sp-header">
                <h1><Calendar className="icon" /> AI Smart Study Planner</h1>
            </div>

            {view === 'setup' && (
                <div className="sp-card card-animate">
                    <h2>Enter Study Topics</h2>
                    <div className="sp-input-group slide-in">
                        <label>Enter topics (comma separated)</label>
                        <textarea 
                            value={manualTopics} 
                            onChange={(e) => setManualTopics(e.target.value)}
                            placeholder="e.g. Newton's laws, Thermodynamics, Logic Gates..."
                            rows={4}
                        />
                    </div>
                    <button className="sp-primary-btn" onClick={processInitialInput}>Next Step</button>
                </div>
            )}

            {view === 'options' && (
                <div className="sp-card card-animate">
                    <h2>Customize Your Plan</h2>
                    
                    <div className="sp-form-grid">
                        <div className="sp-input-group">
                            <label>How many days do you have?</label>
                            <input type="number" min="1" max="90" value={days} onChange={e => setDays(e.target.value)} />
                        </div>
                        <div className="sp-input-group">
                            <label>Hours per day to study?</label>
                            <input type="number" min="1" max="16" value={hoursPerDay} onChange={e => setHoursPerDay(e.target.value)} />
                        </div>
                        <div className="sp-input-group">
                            <label>Time Range Start</label>
                            <input type="time" value={timeRangeStart} onChange={e => setTimeRangeStart(e.target.value)} />
                        </div>
                        <div className="sp-input-group">
                            <label>Time Range End</label>
                            <input type="time" value={timeRangeEnd} onChange={e => setTimeRangeEnd(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="sp-input-group sp-checkbox">
                        <input type="checkbox" id="breaks" checked={includeBreaks} onChange={e => setIncludeBreaks(e.target.checked)} />
                        <label htmlFor="breaks">Include breaks and meals?</label>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button className="sp-secondary-btn" onClick={() => setView('setup')} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px' }}>Back</button>
                        <button className="sp-primary-btn" onClick={generateSchedule} style={{ flex: '2', padding: '12px' }}>Generate Plan</button>
                    </div>
                </div>
            )}

            {view === 'generating' && (
                <div className="sp-card loading-card">
                    <RefreshCw className="icon-spin icon-xl" />
                    <h2>AI is organizing your study schedule...</h2>
                    <p>Optimizing difficulty, spaced repetition, and breaks.</p>
                </div>
            )}

            {view === 'review' && (
                <div className="sp-card card-animate">
                    <h2>Review Your Plan</h2>
                    <div className="sp-schedule-preview">
                        {generatedSchedule.map((dayPlan, idx) => (
                            <div key={idx} className="sp-day-card">
                                <h3>Day {dayPlan.day}</h3>
                                <ul>
                                    {dayPlan.schedule.map((item, id) => (
                                        <li key={id} className={item.type === 'break' || item.type === 'meal' ? 'sp-li-break' : 'sp-li-study'}>
                                            <span className="time-badge">{item.start} - {item.end}</span>
                                            <span className="task-text">{item.topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="sp-review-actions">
                        <h3>Are you satisfied with this plan?</h3>
                        {!refining ? (
                            <div className="action-buttons">
                                <button className="sp-primary-btn" onClick={savePlan}><CheckCircle className="icon"/> YES, Let's GO!</button>
                                <button className="sp-secondary-btn" onClick={() => setRefining(true)}><RefreshCw className="icon"/> NO, Adjust</button>
                            </div>
                        ) : (
                            <div className="sp-refine-opts slide-in" style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button className="sp-secondary-btn" onClick={() => { setHoursPerDay(Math.max(1, hoursPerDay - 1)); generateSchedule(); setRefining(false); }}>Reduce Rules/Hours</button>
                                <button className="sp-secondary-btn" onClick={() => { setIncludeBreaks(true); generateSchedule(); setRefining(false); }}>More Breaks</button>
                                <button className="sp-secondary-btn" onClick={() => { setView('options'); setRefining(false); }}>Back to Options form</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'list' && (
                <TimetableList 
                    timetables={timetables} 
                    onCreateNew={handleCreateNew}
                    onOpen={handleOpenPlan}
                    onDelete={handleDeletePlanFromList}
                />
            )}

            {view === 'dashboard' && plan && (
                <div className="sp-dashboard fade-in">
                    <div className="sp-dash-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button className="sp-secondary-btn" onClick={() => setView('list')} style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <ArrowLeft size={16} /> Back
                            </button>
                            <h2>{plan.planName}</h2>
                        </div>
                        <button className="sp-danger-btn" onClick={deletePlan}>Delete Plan</button>
                    </div>

                    <div className="sp-dash-grid">
                        <div className="sp-checklist-section">
                            <h3><CheckCircle className="icon" /> Task Checklist</h3>
                            <div className="sp-checklist">
                                {plan.checklist.map(item => (
                                    <div key={item._id} className="sp-check-item" onClick={() => toggleChecklist(item._id, item.completed)}>
                                        <div className={`checkbox ${item.completed ? 'checked' : ''}`}></div>
                                        <span className={item.completed ? 'completed-text' : ''}>{item.topic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sp-schedule-section">
                            <h3><Calendar className="icon" /> Master Schedule</h3>
                            <div className="sp-schedule-scroll">
                                {plan.schedule.map((dayPlan, idx) => (
                                    <div key={idx} className="sp-day-block">
                                        <h4>Day {dayPlan.day}</h4>
                                        <div className="sp-day-timeline">
                                            {dayPlan.schedule.map((item, i) => (
                                                <div key={i} className={`sp-timeline-item ${item.type === 'break' || item.type === 'meal' ? 'break' : 'study'}`}>
                                                    <div className="time">{item.start} - {item.end}</div>
                                                    <div className="task">{item.topic}</div>
                                                    {item.type !== 'break' && item.type !== 'meal' && (
                                                        <button className="sp-timer-btn" onClick={() => startTimerForTask(item)}>
                                                            <Clock className="icon" /> Start Timer
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Timer Overlay */}
            {currentTask && (
                <div className="sp-timer-overlay">
                    <div className="sp-timer-card">
                        <h3>Focus Session</h3>
                        <p>{currentTask.topic}</p>
                        <div className="sp-timer-display">{formatTime(timeLeft)}</div>
                        <div className="sp-timer-controls">
                            {!timerActive ? (
                                <button onClick={() => setTimerActive(true)}><Play /></button>
                            ) : (
                                <button onClick={() => setTimerActive(false)}><Pause /></button>
                            )}
                            <button onClick={() => {
                                setTimerActive(false);
                                setTimeLeft(0);
                                setCurrentTask(null);
                            }}><Square /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyPlanner;
