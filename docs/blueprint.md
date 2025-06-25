# **App Name**: ReactiFast

## Core Features:

- Instruction Screen: Display initial instruction screen with a 'Start Test' button and test instructions.
- Stimulus Presentation: Display black screen after 'Start Test' is clicked, followed by a white screen after a random delay.
- Reaction Time Measurement: Measure and record user reaction time in milliseconds, including timestamp, trial number and stimulus interval.
- Premature Click Detection: Check if the user clicked before the color change; record these events and show error feedback to the user.
- Data Persistence: Save trial data including participant ID, timestamp, trial number, reaction time, stimulus interval, and premature click status.
- Result Display: Present trial number, reaction time, interval and premature click notes after test completion.
- PII Detection: The 'participant_id' can be generated from any identifiable feature from user and a LLM will be used as a tool to protect the users PII.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to establish focus and calmness during the test.
- Background color: Light gray (#F5F5F5), almost white, providing a neutral backdrop that avoids distraction during the reaction tests. The color is lightly desaturated and bright to support a light color scheme.
- Accent color: Light violet (#9575CD) for interactive elements (start button) and result highlights.
- Body font: 'Inter', a sans-serif font providing a modern, neutral look; good for body text, instructions and data tables.
- Headline font: 'Space Grotesk', a sans-serif font providing a computerized, techy, scientific feel; to differentiate headings and instructions.
- Minimalist design with full-screen view. The initial instruction screen and final results displayed in a centered card or container.
- No animations during tests to avoid distractions. Subtle animations on the result screen for a smooth presentation of the final data.