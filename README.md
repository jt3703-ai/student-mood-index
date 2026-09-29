# Student Mood Index

## Original Idea

I wanted to create a simple student mood check-in website where students could enter their name and select how they were feeling.

The original idea was to combine mood tracking with attendance-style check-ins in a way that felt more playful and student-friendly than a standard survey.

When someone submits their mood, the experience should record the check-in and give the student a simple visual response.

---

## How to Run

1. Download or clone this repository.
2. Open `index.html` in a web browser.
3. Enter a name.
4. Select one of the five mood options.
5. Submit the check-in.
6. The website will save the check-in in the browser using localStorage.

No external libraries are required.

---

## AI Tool Used

I used OpenAI Codex to help build, test, revise, and debug the project.

I used AI as a development partner rather than only asking it to generate the final code. I tested each version, identified problems, and then asked Codex to revise specific parts of the experience.

---

## Selected Prompts

### Prompt 1: Build the first working version

I first asked Codex to create a simple Student Mood Index using HTML, CSS, and JavaScript.

The first version included:
- five mood choices
- a submit button
- localStorage
- average mood score
- response count
- a simple mood breakdown

The goal was to first make sure the main interaction worked before focusing on visual design.

---

### Prompt 2: Make the experience more playful

After testing the first version, I felt that it looked too much like a normal survey.

I asked Codex to:
- create a more cartoon-like design
- use blue as the main color
- add a name field
- change the mood labels to short words such as Sad, Bad, Okay, Cool, and Happy
- add different animations for each mood
- make the experience feel more like a classroom check-in

---

### Prompt 3: Improve privacy and personal feedback

After testing the attendance version, I realized that showing other students' names and moods was not appropriate for a student-facing interface.

I asked Codex to:
- remove the public attendance list
- remove class-wide average mood information
- remove total response counts
- show only the current student's own history
- add a personal mood trend
- keep the student's name and mood saved locally

This changed the project from a class dashboard into a more personal check-in tool.

---

### Prompt 4: Add a calendar and doodle visuals

I wanted the website to feel more like a personal mood journal.

I asked Codex to:
- add a personal check-in calendar
- visually mark days when the student checked in
- keep a personal mood trend
- replace emoji-style visuals with simple hand-drawn doodles
- keep the blue cartoon visual style

---

### Prompt 5: Final usability improvements

For the final revision, I asked Codex to:
- make today's check-in more visible on the calendar
- add a short interpretation of the student's mood trend
- simplify the privacy message
- keep the interface focused on the individual student

---

## Testing and Revision

I tested the website after each major change.

The first version worked technically, but it felt too much like a standard survey.

The second version added names, attendance tracking, and more playful visuals, but I then noticed that showing other students' information created a privacy problem.

Because of that, I changed the design so students only see their own check-in history and mood trend.

I also tested the localStorage behavior to make sure responses remained after reloading the page.

The final version includes:
- name-based check-ins
- five mood choices
- blue cartoon-style design
- hand-drawn doodle visuals
- mood-specific animations
- personal check-in calendar
- personal mood trend
- local browser storage

---

## Reflection

My original intention was to create a simple classroom mood check-in tool, but the project changed significantly during testing.

At first, I focused on collecting class mood data and attendance information. However, once I saw the interface working, I realized that displaying names, attendance status, and individual mood information publicly did not fit the experience I wanted.

I decided to redesign the project around the individual student instead.

The final version allows students to enter their name, record their mood, view their own check-in calendar, and see their own mood trend over time. I also changed the visual design from a more standard interface into a blue, cartoon-like style with hand-drawn doodle graphics.

AI helped me quickly create the basic structure, data logic, styling, animations, and revisions. However, I still had to decide what information students should see, what felt appropriate for the user experience, and what needed to be removed.

One of the most important design decisions was changing the project from a public class dashboard into a more private personal check-in experience.

---

## Remaining Limitations

This project is still a prototype.

The main limitation is that it uses browser localStorage instead of a real database or login system.

Student names are used only to filter saved records. They are not authenticated identities.

This means that someone using the same browser and entering the same name could potentially see that student's saved history.

The current version is designed to demonstrate the interaction and design concept rather than provide secure real-world student data storage.