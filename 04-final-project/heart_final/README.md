# final Project

For our final project, our team wanted to create a relaxation-based alternative visual, something that reacts to a person’s heartbeat but doesn’t add pressure or stress. We intentionally chose an outer-space theme because when we think of space, it feels like nothingness — but in a comforting way. There’s no noise, no demands, no responsibilities. Just a huge, quiet universe where you don’t have to worry about anything. That sense of openness and emptiness becomes the emotional foundation of the whole visual.

To translate that feeling into code, we built a 3D interactive environment using p5.js with WEBGL. The core logic combines several systems working together:

Heartbeat-Responsive Rhythm
The BPM sensor drives the internal “pulse.” Higher BPM increases distortion, ring expansion, and particle energy, while lower BPM makes everything slow down, breathe, and soften. Everything you see is synced to the user’s heart.

Floating Heart Network
The heart shape is created using hundreds of 3D nodes that connect with lines. Each node jitters slightly, giving a living, breathing quality without being overwhelming. The heart expands and contracts based on the BPM.

Breathing Particle Rings
Around the heart, a ring of particles rotate like a galaxy. Their colors shift from calm blues to warmer reds depending on stress level. Movement becomes smoother during calm states and more chaotic during elevated heart rate.

Saturn-Like Ring System
A layered set of rotating rings gives the scene a cosmic, meditative feeling. The rings pulse gently, and their movement is algorithmically tied to the heartbeat and breathing cycle.

Starfield Background
Thousands of stars move slowly in 3D space. They flicker softly, affected by noise + sine waves, making the whole scene feel alive but still tranquil.

Click-Activated Particle Bursts
If the user clicks, soft white particles burst outward like tiny stars — just a small interactive moment to keep the user engaged without breaking the calmness.

Overall, the entire visual is designed so that nothing feels sharp or stressful. Everything flows, rotates, pulses, and reacts gently. The user’s heartbeat becomes the center of the universe, and the universe responds with calmness. That’s the experience we want to deliver — a space where you can breathe, relax, and just exist.
