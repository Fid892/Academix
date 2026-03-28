const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const StudyPlan = require('../models/StudyPlan');
const { OpenAI } = require('openai');

// Initialize OpenAI conditionally
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

exports.parsePdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    const pdfText = pdfData.text.substring(0, 15000); // Limit context length

    if (!openai) {
      // Fallback: extract real syllabus data using regex if no API key
      const modules = [];
      const lines = pdfText.split('\n');
      let currentModule = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (/^module\s*\d+\s*:|unit\s*\d+\s*:/i.test(line)) {
          if (currentModule) modules.push(currentModule);
          currentModule = { module_name: line, topics: [] };
        } else if (currentModule && line.length > 3 && line.length < 80) {
          // Add clean lines as topics, avoid long descriptions
          currentModule.topics.push(line.replace(/^[-•]\s*/, ''));
        }
      }
      if (currentModule) modules.push(currentModule);

      // If no generic modules matched, group the text into general chunks
      if (modules.length === 0) {
        let genericTopics = lines.filter(l => l.trim().length > 5 && l.trim().length < 60);
        modules.push({
          module_name: "General Syllabus Topics",
          topics: genericTopics.slice(0, 15) // take top 15
        });
      }

      return res.json({ modules });
    }

    // Call OpenAI to extract study topics structure
    const prompt = `Extract the syllabus structure from the following text. 
Return a JSON array of objects where each object has "module_name" (String) and "topics" (Array of Strings). 
Do not include any markdown formatting, just pure JSON.
In module_name, use the actual real name (e.g. "Module 1: Phases of compiler").
Extract the actual subtopics from the text as topics.
Text:
${pdfText}`;

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
    });

    let rawJson = completion.choices[0].message.content;
    
    // Remove if there's markdown code block
    if (rawJson.startsWith('```json')) {
        rawJson = rawJson.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    const modules = JSON.parse(rawJson);
    res.json({ modules });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
};

exports.generateSchedule = async (req, res) => {
  try {
    const { modules, days, hoursPerDay, timeRangeStart, timeRangeEnd, includeBreaks } = req.body;

    if (!modules || !days || !timeRangeStart || !timeRangeEnd) {
      return res.status(400).json({ error: 'Missing required configuration' });
    }

    // Use a strict prompt and retry logic for AI if needed
    // But since it's a single endpoint, we'll give constraints mathematically.
    if (!openai) {
      // Create a sensible default fallback using REAL module names
      const mockSchedule = [];
      let currentTopicIdx = 0;
      let allTopics = [];
      modules.forEach(m => m.topics.forEach(t => allTopics.push(`${m.module_name}: ${t}`)));

      for (let i = 1; i <= days; i++) {
        const slots = [];
        let t1 = allTopics[currentTopicIdx % allTopics.length] || "Topic A";
        let t2 = allTopics[(currentTopicIdx + 1) % allTopics.length] || "Topic B";
        slots.push({ start: "09:00 AM", end: "10:30 AM", type: "study", topic: t1 });
        slots.push({ start: "10:30 AM", end: "10:45 AM", type: "break", topic: "Short Break" });
        slots.push({ start: "10:45 AM", end: "12:15 PM", type: "study", topic: t2 });
        if(includeBreaks) {
           slots.push({ start: "12:15 PM", end: "01:15 PM", type: "meal", topic: "Lunch Break" });
        }
        mockSchedule.push({ day: i, schedule: slots });
        currentTopicIdx += 2;
      }
      return res.json({ schedule: mockSchedule });
    }

    const prompt = `You are an expert AI study planner. Create a STRICTLY CHRONOLOGICAL, realistic day-wise schedule.
Input data:
Modules: ${JSON.stringify(modules)}
Available Days: ${days}
Preferred Study Hours per day: ${hoursPerDay}
Daily Time Range: ${timeRangeStart} to ${timeRangeEnd}
Include Breaks/Meals: ${includeBreaks ? 'YES' : 'NO'}

CRITICAL RULES:
1. NO OVERLAPS, STRICT CHRONOLOGICAL ORDER (e.g. 09:00 AM -> 10:30 AM, then 10:30 AM -> 10:45 AM).
2. DO NOT use 6 PM -> 10 AM backwards. Use 24-hr internally but format output exactly as "hh:mm AM/PM".
   Ensure start_time < end_time for every single slot.
3. Use ACTUAL syllabus topics provided in Modules. Format topic names beautifully, combining module and topic (e.g. "Module 1: Lexical Analysis - Tokens"). DO NOT USE PLACEHOLDERS.
4. Intelligent Distribution: Difficult topics in Morning, Medium in Afternoon, Revision in Evening.
5. NO continuous study block should exceed 2 hours without a break.
6. Provide specific "type" matching exactly: "study", "break", "meal", or "revision".

Return a pure JSON array (no markdown blocks or backticks) of objects representing each day's schedule:
[
  {
    "day": 1,
    "schedule": [
      { "start": "09:00 AM", "end": "10:30 AM", "type": "study", "topic": "Module 1: Phases of compiler" },
      { "start": "10:30 AM", "end": "10:45 AM", "type": "break", "topic": "Short Break" },
      { "start": "10:45 AM", "end": "12:15 PM", "type": "study", "topic": "Module 1: Lexical analysis" }
    ]
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    let rawJson = completion.choices[0].message.content;
    
    // Robustly extract the JSON array if OpenAI adds conversational text
    const jsonMatch = rawJson.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
       throw new Error("Could not find JSON array in response.");
    }
    rawJson = jsonMatch[0];

    // Attempt to parse and loosely validate. We give up to 1 retry in production, but here we fallback gracefully.
    let schedule = JSON.parse(rawJson);
    
    // Quick validation check
    const isValid = Array.isArray(schedule) && schedule.every(day => 
        day.day && Array.isArray(day.schedule) && day.schedule.every(slot => 
            slot.start && slot.end && slot.topic && slot.type
        )
    );

    if (!isValid) {
        throw new Error("AI generated an invalid schedule format");
    }

    res.json({ schedule });
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ error: 'Failed to generate schedule' });
  }
};

exports.savePlan = async (req, res) => {
  try {
    const { type, modules, settings, schedule } = req.body;

    // Build checklist flat structure
    const checklist = [];
    modules.forEach(m => {
      m.topics.forEach(t => {
        checklist.push({ topic: `${m.module_name}: ${t}`, completed: false });
      });
    });

    // Delete existing plan if any
    await StudyPlan.deleteOne({ user: req.user._id });

    // Create new plan
    const newPlan = new StudyPlan({
      user: req.user._id,
      type,
      modules,
      settings,
      schedule,
      checklist,
    });

    await newPlan.save();
    res.status(201).json({ message: 'Plan saved successfully', plan: newPlan });
  } catch (error) {
    console.error('Error saving plan:', error);
    res.status(500).json({ error: 'Failed to save plan' });
  }
};

exports.getMyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ user: req.user._id });
    if (!plan) return res.status(404).json({ message: 'No active plan found' });
    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
};

exports.updateChecklistItem = async (req, res) => {
  try {
    const { planId } = req.params;
    const { itemId, completed } = req.body;

    const plan = await StudyPlan.findOne({ _id: planId, user: req.user._id });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const item = plan.checklist.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.completed = completed;
    await plan.save();

    res.json({ message: 'Checklist updated', item });
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

exports.deleteMyPlan = async (req, res) => {
    try {
        await StudyPlan.deleteOne({ user: req.user._id });
        res.json({ message: 'Plan deleted successfully' });
    } catch(err) {
        console.error('error deleting plan', err);
        res.status(500).json({ error: 'Failed to delete plan'});
    }
}
