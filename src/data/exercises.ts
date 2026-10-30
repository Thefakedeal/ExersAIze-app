import { ExerciseItem, ExerciseType, TrackMetric } from '../types/exercise';

type ExerciseSeed = {
  name: string;
  type: ExerciseType;
  categories: string[];
  trackMetrics?: TrackMetric[];
  note?: string;
};

export const exerciseSeeds: ExerciseSeed[] = [
  {
    "name": "Incline Barbell Bench Press",
    "type": "Strength",
    "categories": [
      "Upper Chest",
      "Front Delts",
      "Triceps"
    ],
    "note": "Lower the bar toward your upper chest and press it upward. Tip: Set the bench to a 30 to 45 degree incline to maximize upper-pectoral recruitment without turning it into a shoulder press."
  },
  {
    "name": "Incline Dumbbell Press",
    "type": "Strength",
    "categories": [
      "Upper Chest",
      "Front Delts",
      "Triceps"
    ],
    "note": "Lower the dumbbells beside your upper chest, then press them upward. Tip: Keep your wrists stacked over your elbows and angle your elbows slightly inward (45-60 degrees) to protect the shoulder joint."
  },
  {
    "name": "Low-to-High Cable Fly",
    "type": "Strength",
    "categories": [
      "Upper Chest",
      "Middle Chest"
    ],
    "note": "Pull the cables upward and inward from low pulleys. Tip: Keep a slight bend in your elbows and lead with your elbows, crossing your hands slightly at the top for complete sternal contraction."
  },
  {
    "name": "Incline Push-Up",
    "type": "Bodyweight",
    "categories": [
      "Upper Chest",
      "Middle Chest",
      "Front Delts",
      "Triceps"
    ],
    "note": "Place your hands on an elevated surface and lower your chest toward it. Tip: A higher surface reduces load; keep your core braced to prevent lower-back hyperextension."
  },
  {
    "name": "Barbell Bench Press",
    "type": "Strength",
    "categories": [
      "Middle Chest",
      "Front Delts",
      "Triceps"
    ],
    "note": "Lower the bar to your mid-chest and press it upward. Tip: Maintain a slight natural arch in your upper back with shoulder blades retracted and depressed against the bench for joint stability."
  },
  {
    "name": "Dumbbell Bench Press",
    "type": "Strength",
    "categories": [
      "Middle Chest",
      "Front Delts",
      "Triceps"
    ],
    "note": "Lower the dumbbells beside your chest and press them upward. Tip: Control the descent and allow a natural stretch at the bottom without dropping your shoulders forward."
  },
  {
    "name": "Machine Chest Press",
    "type": "Strength",
    "categories": [
      "Middle Chest",
      "Front Delts",
      "Triceps"
    ],
    "note": "Push the machine handles forward and slowly return them. Tip: Adjust the seat so handles align with your mid-to-lower chest for optimal mechanical advantage."
  },
  {
    "name": "Push-Up",
    "type": "Bodyweight",
    "categories": [
      "Middle Chest",
      "Front Delts",
      "Triceps",
      "Transverse Abdominis"
    ],
    "note": "Lower your chest toward the floor while maintaining a straight body, then push up. Tip: Protractor your shoulder blades at the top (push the floor away) to fully engage the serratus anterior."
  },
  {
    "name": "Decline Barbell Bench Press",
    "type": "Strength",
    "categories": [
      "Lower Chest",
      "Triceps",
      "Front Delts"
    ],
    "note": "Lower the bar toward your lower chest and press it upward. Tip: Ensure your feet are securely locked; focus on driving the elbows down and inward."
  },
  {
    "name": "High-to-Low Cable Fly",
    "type": "Strength",
    "categories": [
      "Lower Chest",
      "Middle Chest"
    ],
    "note": "Bring the cable handles downward and inward in front of your torso. Tip: Focus on moving your upper arms; slight forward trunk lean targets the lower sternal fibers more effectively."
  },
  {
    "name": "Chest Dip",
    "type": "Bodyweight",
    "categories": [
      "Lower Chest",
      "Triceps",
      "Front Delts"
    ],
    "note": "Lean slightly forward as you lower between parallel bars, then push up. Tip: Flare your elbows slightly outward to shift emphasis from the triceps to the lower chest."
  },
  {
    "name": "Decline Push-Up",
    "type": "Bodyweight",
    "categories": [
      "Upper Chest",
      "Front Delts",
      "Triceps"
    ],
    "note": "Place your feet on an elevated surface and perform a push-up. Tip: Keep your hips aligned; higher elevation shifts the load to the clavicular head of the pectoralis major."
  },
  {
    "name": "Lat Pulldown",
    "type": "Strength",
    "categories": [
      "Lats",
      "Biceps",
      "Forearms",
      "Teres Major"
    ],
    "note": "Pull the bar toward your upper chest, then slowly extend your arms. Tip: Drive your elbows downward and back; avoid pulling behind the neck, which compromises rotator cuff health."
  },
  {
    "name": "Pull-Up",
    "type": "Bodyweight",
    "categories": [
      "Lats",
      "Teres Major",
      "Biceps",
      "Forearms"
    ],
    "note": "Hang from a bar and pull until your chin clears it, then lower with control. Tip: Initiate the pull by depressing your shoulder blades rather than yanking with your biceps."
  },
  {
    "name": "Close-Grip Lat Pulldown",
    "type": "Strength",
    "categories": [
      "Lats",
      "Teres Major",
      "Biceps",
      "Forearms"
    ],
    "note": "Pull a close-grip attachment toward your upper chest. Tip: Using a neutral grip allows for a longer range of motion and deep lat stretch at the top."
  },
  {
    "name": "Straight-Arm Cable Pulldown",
    "type": "Strength",
    "categories": [
      "Lats",
      "Teres Major"
    ],
    "note": "With slightly bent elbows, pull the bar from shoulder height toward your thighs. Tip: Keep your arm angle fixed to isolate the lats and prevent it from turning into a triceps pushdown."
  },
  {
    "name": "Dumbbell Pullover",
    "type": "Strength",
    "categories": [
      "Lats",
      "Teres Major",
      "Middle Chest"
    ],
    "note": "Lower a dumbbell behind your head while lying on a bench, then bring it back over your chest. Tip: Keep a soft bend in your elbows and keep your ribcage down to target both the lats and serratus."
  },
  {
    "name": "Barbell Bent-Over Row",
    "type": "Strength",
    "categories": [
      "Lats",
      "Rhomboids",
      "Traps",
      "Biceps",
      "Forearms",
      "Erector Spinae"
    ],
    "note": "Hinge forward and pull the bar toward your lower ribs. Tip: Keep your spine neutral (hinged at roughly 45 degrees); pull toward your hips for lower lat engagement or upper ribs for upper back."
  },
  {
    "name": "Seated Cable Row",
    "type": "Strength",
    "categories": [
      "Lats",
      "Rhomboids",
      "Traps",
      "Biceps",
      "Forearms"
    ],
    "note": "Pull the handle toward your torso and slowly extend your arms. Tip: Allow a controlled protraction of the shoulder blades at extension, but avoid excessive forward-backward rocking."
  },
  {
    "name": "Chest-Supported Row",
    "type": "Strength",
    "categories": [
      "Lats",
      "Rhomboids",
      "Traps",
      "Biceps"
    ],
    "note": "Pull the weights toward your torso while resting your chest against the bench. Tip: This completely unloads the spinal erectors, allowing you to fail locally in the upper back and lats."
  },
  {
    "name": "Dumbbell Shrug",
    "type": "Strength",
    "categories": [
      "Traps",
      "Forearms"
    ],
    "note": "Raise your shoulders toward your ears and lower them slowly. Tip: Lift straight up (or slightly backward); rolling the shoulders in circles places unnecessary shear stress on the AC joint."
  },
  {
    "name": "Face Pull",
    "type": "Strength",
    "categories": [
      "Traps",
      "Rear Delts",
      "Rhomboids"
    ],
    "note": "Pull the rope toward your face while moving your elbows outward. Tip: Externally rotate your shoulders at the peak contraction (hands finishing behind your ears) to target rear delts and rotator cuffs."
  },
  {
    "name": "Reverse Pec Deck",
    "type": "Strength",
    "categories": [
      "Rear Delts",
      "Rhomboids",
      "Traps"
    ],
    "note": "Move the handles outward and backward with slightly bent elbows. Tip: Lead with your elbows and pause briefly at peak contraction."
  },
  {
    "name": "Inverted Row",
    "type": "Bodyweight",
    "categories": [
      "Lats",
      "Rhomboids",
      "Traps",
      "Biceps",
      "Forearms"
    ],
    "note": "Hang beneath a secure horizontal bar and pull your chest toward it. Tip: Adjust foot position (knees bent vs. legs straight) to scale intensity; keep glutes squeezed."
  },
  {
    "name": "Barbell Deadlift",
    "type": "Strength",
    "categories": [
      "Lats",
      "Traps",
      "Forearms",
      "Hamstrings",
      "Glutes",
      "Quads",
      "Erector Spinae"
    ],
    "note": "Brace your torso, hinge at your hips, and lift the bar while keeping it close to your body. Tip: Pull the slack out of the bar before lifting; push the floor away with your legs rather than pulling with your lower back."
  },
  {
    "name": "Romanian Deadlift",
    "type": "Strength",
    "categories": [
      "Hamstrings",
      "Glutes",
      "Lats",
      "Forearms",
      "Erector Spinae"
    ],
    "note": "Push your hips backward while lowering the bar along your legs, then stand tall. Tip: Stop the descent the moment your hips stop moving backward to prevent rounding your lumbar spine."
  },
  {
    "name": "Back Extension",
    "type": "Bodyweight",
    "categories": [
      "Erector Spinae",
      "Glutes",
      "Hamstrings"
    ],
    "note": "Hinge at your hips to lower your torso, then return to a straight body position. Tip: Stop at neutral alignment; hyperextension strains the lumbar spine without adding glute/hamstring activation."
  },
  {
    "name": "Superman",
    "type": "Bodyweight",
    "categories": [
      "Erector Spinae",
      "Glutes"
    ],
    "note": "Lie face down and gently lift your arms and legs off the floor. Tip: Focus on longitudinal elongation rather than maximal height to protect the lower back."
  },
  {
    "name": "T-Bar Row",
    "type": "Strength",
    "categories": [
      "Lats",
      "Rhomboids",
      "Traps",
      "Biceps",
      "Forearms"
    ],
    "note": "Pull the T-bar toward your torso and lower it slowly. Tip: Maintain a rigid, braced torso; keep your chest glued to the pad if using a supported version."
  },
  {
    "name": "Single-Arm Dumbbell Row",
    "type": "Strength",
    "categories": [
      "Lats",
      "Teres Major",
      "Rhomboids",
      "Biceps",
      "Forearms"
    ],
    "note": "Support yourself on a bench and pull the dumbbell toward your hip. Tip: Think of your hand as a hook and pull your elbow toward your back pocket."
  },
  {
    "name": "Barbell Overhead Press",
    "type": "Strength",
    "categories": [
      "Front Delts",
      "Side Delts",
      "Triceps",
      "Traps"
    ],
    "note": "Press the bar overhead from shoulder height and lower it under control. Tip: Move your head back slightly as the bar passes your face, then punch through at the top."
  },
  {
    "name": "Seated Dumbbell Shoulder Press",
    "type": "Strength",
    "categories": [
      "Front Delts",
      "Side Delts",
      "Triceps"
    ],
    "note": "Press the dumbbells overhead and lower them to shoulder level. Tip: Bringing dumbbells slightly forward of the frontal plane (scaption) reduces anterior capsule stress."
  },
  {
    "name": "Dumbbell Front Raise",
    "type": "Strength",
    "categories": [
      "Front Delts"
    ],
    "note": "Raise the dumbbells in front of you to approximately shoulder height. Tip: Most people get enough front delt work from pressing; if performed, neutral grip (thumbs up) reduces impingement risk."
  },
  {
    "name": "Dumbbell Lateral Raise",
    "type": "Strength",
    "categories": [
      "Side Delts"
    ],
    "note": "Raise the dumbbells out to your sides until your arms approach shoulder height. Tip: Slightly internally rotate your hands (pouring water motion) only if comfortable; otherwise, a neutral-to-slight pinky-up orientation matches line-of-pull."
  },
  {
    "name": "Cable Lateral Raise",
    "type": "Strength",
    "categories": [
      "Side Delts"
    ],
    "note": "Raise the cable handle outward to shoulder height. Tip: Setting the cable pulley at wrist or knee height provides a smoother resistance profile throughout the arc."
  },
  {
    "name": "Arnold Press",
    "type": "Strength",
    "categories": [
      "Front Delts",
      "Side Delts",
      "Triceps"
    ],
    "note": "Start with your palms facing you and rotate them outward as you press overhead. Tip: Keep the movement smooth; do not use excessive weight, as the continuous rotation fatigues stabilizers quickly."
  },
  {
    "name": "Reverse Dumbbell Fly",
    "type": "Strength",
    "categories": [
      "Rear Delts",
      "Rhomboids",
      "Traps"
    ],
    "note": "Hinge forward and raise the dumbbells outward with slightly bent elbows. Tip: Keep your palms facing inward or backward to maximize rear delt recruitment over the rhomboids."
  },
  {
    "name": "Pike Push-Up",
    "type": "Bodyweight",
    "categories": [
      "Front Delts",
      "Side Delts",
      "Triceps"
    ],
    "note": "Form an inverted V with your hips raised and lower your head toward the floor. Tip: Stack your hips directly over your shoulders to shift the load completely onto the deltoids."
  },
  {
    "name": "Wall Handstand Push-Up",
    "type": "Bodyweight",
    "categories": [
      "Front Delts",
      "Side Delts",
      "Triceps",
      "Traps"
    ],
    "note": "Face a wall in a supported handstand and lower your head carefully before pressing up. Tip: Keep your core tight and glutes squeezed to prevent banana-back arching."
  },
  {
    "name": "Barbell Curl",
    "type": "Strength",
    "categories": [
      "Biceps",
      "Forearms"
    ],
    "note": "Curl the bar toward your shoulders and lower it slowly. Tip: Keep your elbows slightly forward of your torso to maintain constant tension on the biceps at the bottom."
  },
  {
    "name": "Incline Dumbbell Curl",
    "type": "Strength",
    "categories": [
      "Biceps"
    ],
    "note": "Curl the dumbbells while seated against an incline bench. Tip: Let your arms hang straight down behind your torso to fully stretch the long head of the biceps."
  },
  {
    "name": "Hammer Curl",
    "type": "Strength",
    "categories": [
      "Brachialis",
      "Biceps",
      "Forearms"
    ],
    "note": "Curl the dumbbells with your palms facing each other. Tip: This targets the brachialis and brachioradialis, adding visual thickness to the outer arm."
  },
  {
    "name": "Reverse Curl",
    "type": "Strength",
    "categories": [
      "Brachialis",
      "Forearms",
      "Biceps"
    ],
    "note": "Curl a barbell or dumbbells with your palms facing downward. Tip: Excellent for building the brachioradialis and forearm extensors."
  },
  {
    "name": "Preacher Curl",
    "type": "Strength",
    "categories": [
      "Biceps",
      "Brachialis"
    ],
    "note": "Curl the weight while resting your upper arms on a preacher bench. Tip: Do not hyperextend your elbows at the bottom under heavy load to protect the distal tendon."
  },
  {
    "name": "Cable Biceps Curl",
    "type": "Strength",
    "categories": [
      "Biceps"
    ],
    "note": "Curl the cable handle toward your shoulders while keeping your elbows stable. Tip: Cables provide continuous tension curves matching human strength profiles."
  },
  {
    "name": "Close-Grip Bench Press",
    "type": "Strength",
    "categories": [
      "Triceps",
      "Middle Chest",
      "Front Delts"
    ],
    "note": "Lower the bar toward your chest with a relatively narrow grip and press upward. Tip: Keep hands shoulder-width apart (excessively narrow grips strain the wrists and elbows)."
  },
  {
    "name": "Cable Triceps Pushdown",
    "type": "Strength",
    "categories": [
      "Triceps"
    ],
    "note": "Push the cable attachment downward until your elbows extend. Tip: Pin your elbows to your sides; do not let them drift backward during the push."
  },
  {
    "name": "Overhead Dumbbell Triceps Extension",
    "type": "Strength",
    "categories": [
      "Triceps"
    ],
    "note": "Lower a dumbbell behind your head by bending your elbows, then extend your arms. Tip: Keep your upper arms locked pointing upward to stretch the long head of the triceps fully."
  },
  {
    "name": "Skull Crusher",
    "type": "Strength",
    "categories": [
      "Triceps"
    ],
    "note": "Lower the weight toward your forehead by bending your elbows, then extend your arms. Tip: Angling your upper arms slightly back behind vertical keeps tension on the triceps at the top of the movement."
  },
  {
    "name": "Diamond Push-Up",
    "type": "Bodyweight",
    "categories": [
      "Triceps",
      "Middle Chest",
      "Front Delts"
    ],
    "note": "Perform a push-up with your hands close together beneath your chest. Tip: Place hands under your center of mass; keep elbows tracking back rather than flaring wide."
  },
  {
    "name": "Wrist Curl",
    "type": "Strength",
    "categories": [
      "Forearms"
    ],
    "note": "Rest your forearms on a bench and curl the weight using your wrists. Tip: Allow the bar to roll down into your fingertips at the bottom for a complete wrist-flexor stretch."
  },
  {
    "name": "Reverse Wrist Curl",
    "type": "Strength",
    "categories": [
      "Forearms"
    ],
    "note": "Hold a light weight with your palms facing downward and raise your hands at the wrists. Tip: Keep forearms flat on the bench; use high repetitions since extensors recover quickly."
  },
  {
    "name": "Farmer Carry",
    "type": "Strength",
    "categories": [
      "Forearms",
      "Traps",
      "Transverse Abdominis"
    ],
    "trackMetrics": [
      "Time",
      "Distance"
    ],
    "note": "Hold heavy weights at your sides and walk with an upright posture. Tip: Pack your shoulders down and back; walk with controlled, deliberate strides."
  },
  {
    "name": "Dead Hang",
    "type": "Bodyweight",
    "categories": [
      "Forearms",
      "Lats",
      "Traps"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Hang from a secure pull-up bar for as long as you can maintain a comfortable grip. Tip: Active hang (shoulders depressed) builds scapular control; passive hang prioritizes pure grip/decompression."
  },
  {
    "name": "Barbell Back Squat",
    "type": "Strength",
    "categories": [
      "Quads",
      "Glutes",
      "Adductors",
      "Erector Spinae",
      "Transverse Abdominis"
    ],
    "note": "Bend your hips and knees to lower into a squat, then drive through your feet to stand. Tip: Break at the knees and hips simultaneously; squat to a depth where you maintain neutral spinal control."
  },
  {
    "name": "Front Squat",
    "type": "Strength",
    "categories": [
      "Quads",
      "Glutes",
      "Adductors",
      "Erector Spinae",
      "Transverse Abdominis"
    ],
    "note": "Rest the bar across the front of your shoulders and squat down under control. Tip: Use a clean grip or cross-arm grip; keep your upper back tight to prevent the upper torso from collapsing forward."
  },
  {
    "name": "Goblet Squat",
    "type": "Strength",
    "categories": [
      "Quads",
      "Glutes",
      "Adductors",
      "Transverse Abdominis"
    ],
    "note": "Hold a dumbbell or kettlebell at your chest and squat down. Tip: Use your elbows inside your knees at the bottom to gently push them open and maintain an upright chest."
  },
  {
    "name": "Leg Press",
    "type": "Strength",
    "categories": [
      "Quads",
      "Glutes",
      "Adductors"
    ],
    "note": "Lower the platform by bending your knees, then press it away without locking your knees forcefully. Tip: Foot placement does not isolate the hamstrings on a leg press (since hip extension is not occurring against an open chain). High foot placement increases glutes slightly; low increases quads. Avoid locking knees."
  },
  {
    "name": "Leg Extension",
    "type": "Strength",
    "categories": [
      "Quads"
    ],
    "note": "Straighten your knees against the machine pad and lower the weight slowly. Tip: Align the machine axis marker with the lateral epicondyle of your knee for proper joint tracking."
  },
  {
    "name": "Bulgarian Split Squat",
    "type": "Strength",
    "categories": [
      "Quads",
      "Glutes",
      "Adductors",
      "Transverse Abdominis"
    ],
    "note": "Place your rear foot on a bench and lower your hips by bending the front leg. Tip: A more vertical shin emphasizes the quads, while a slight forward torso lean shifts emphasis to the glutes."
  },
  {
    "name": "Bodyweight Squat",
    "type": "Bodyweight",
    "categories": [
      "Quads",
      "Glutes",
      "Adductors",
      "Transverse Abdominis"
    ],
    "note": "Bend your knees and hips to lower your body, then stand up. Tip: Keep your center of pressure distributed evenly across your whole foot—do not let your heels lift."
  },
  {
    "name": "Walking Lunge",
    "type": "Bodyweight",
    "categories": [
      "Quads",
      "Glutes",
      "Adductors",
      "Transverse Abdominis"
    ],
    "note": "Step forward, lower your back knee toward the floor, then step through with the other leg. Tip: Take a stride long enough so your front shin stays roughly vertical at the bottom."
  },
  {
    "name": "Romanian Deadlift",
    "type": "Strength",
    "categories": [
      "Hamstrings",
      "Glutes",
      "Erector Spinae",
      "Forearms"
    ],
    "note": "Push your hips backward while lowering the weight along your legs, then stand tall. Tip: Stop the descent the moment your hips stop moving backward to prevent rounding your lumbar spine."
  },
  {
    "name": "Lying Leg Curl",
    "type": "Strength",
    "categories": [
      "Hamstrings"
    ],
    "note": "Curl your heels toward your glutes against the machine pad, then lower slowly. Tip: Keep your hips pressed firmly into the pad; lifting your hips recruits the lower back and calves, reducing hamstring tension."
  },
  {
    "name": "Seated Leg Curl",
    "type": "Strength",
    "categories": [
      "Hamstrings"
    ],
    "note": "Bend your knees to pull the machine pad downward and return slowly. Tip: Ensure the lap pad is securely locked down to prevent your hips from rising during knee flexion."
  },
  {
    "name": "Nordic Hamstring Curl",
    "type": "Bodyweight",
    "categories": [
      "Hamstrings",
      "Glutes"
    ],
    "note": "Secure your ankles and slowly lower your torso forward, resisting the descent with your hamstrings. Tip: Use a band for assistance if you cannot control the eccentric phase yet."
  },
  {
    "name": "Glute-Ham Raise",
    "type": "Bodyweight",
    "categories": [
      "Hamstrings",
      "Glutes"
    ],
    "note": "Secure your feet in a glute-ham machine and lower your torso before curling back up. Tip: Initiate the return by driving your toes backward into the footplate and squeezing your glutes."
  },
  {
    "name": "Barbell Hip Thrust",
    "type": "Strength",
    "categories": [
      "Glutes",
      "Hamstrings"
    ],
    "note": "Rest your upper back on a bench and drive your hips upward with a barbell. Tip: Keep your chin tucked looking forward to prevent lumbar hyperextension at the top lockout."
  },
  {
    "name": "Glute Bridge",
    "type": "Bodyweight",
    "categories": [
      "Glutes",
      "Hamstrings",
      "Transverse Abdominis"
    ],
    "note": "Lie on your back with bent knees and lift your hips off the floor. Tip: Drive through your heels and pause for a 1-2 second squeeze at the top."
  },
  {
    "name": "Cable Glute Kickback",
    "type": "Strength",
    "categories": [
      "Glutes"
    ],
    "note": "Move one leg backward against a cable attachment and return slowly. Tip: Keep your working leg slightly internally rotated (toe pointed slightly inward) to target the glute medius fibers."
  },
  {
    "name": "Donkey Kick",
    "type": "Bodyweight",
    "categories": [
      "Glutes"
    ],
    "note": "Start on all fours and lift one bent leg upward behind you. Tip: Avoid kicking past the point where your lower back starts to arch."
  },
  {
    "name": "Standing Hip Flexion",
    "type": "Strength",
    "categories": [
      "Hip Flexors"
    ],
    "note": "Lift one knee toward your torso against a cable or resistance band. Tip: Maintain a tall posture; do not lean back to cheat the weight up."
  },
  {
    "name": "Hanging Knee Raise",
    "type": "Bodyweight",
    "categories": [
      "Hip Flexors",
      "Lower Abs",
      "Transverse Abdominis"
    ],
    "note": "Hang from a bar and lift your knees toward your chest, then lower slowly. Tip: Actively curl your pelvis upward at the top to fully contract the lower rectus abdominis."
  },
  {
    "name": "Lying Leg Raise",
    "type": "Bodyweight",
    "categories": [
      "Hip Flexors",
      "Lower Abs",
      "Transverse Abdominis"
    ],
    "note": "Lie on your back and raise your legs, then lower them without losing core control. Tip: Press your lower back flat into the floor before initiating movement."
  },
  {
    "name": "Hip Adduction Machine",
    "type": "Strength",
    "categories": [
      "Adductors"
    ],
    "note": "Bring your thighs inward against the machine pads and return slowly. Tip: Control the eccentric phase; do not let the weight stack slam between reps."
  },
  {
    "name": "Copenhagen Plank",
    "type": "Bodyweight",
    "categories": [
      "Adductors",
      "Obliques",
      "Transverse Abdominis"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Support your upper leg on a bench and lift your hips into a side plank. Tip: Incredible for adductor injury prevention and groin strength; scale by moving the support point from knee to ankle."
  },
  {
    "name": "Hip Abduction Machine",
    "type": "Strength",
    "categories": [
      "Abductors",
      "Glutes"
    ],
    "note": "Push your thighs outward against the pads and return slowly. Tip: A slight forward lean of your torso shifts the target from the tensor fasciae latae (TFL) to the gluteus medius."
  },
  {
    "name": "Side-Lying Leg Raise",
    "type": "Bodyweight",
    "categories": [
      "Abductors",
      "Glutes"
    ],
    "note": "Lie on your side and raise your upper leg while keeping your hips stacked. Tip: Keep your toes pointed straight ahead or slightly down—pointing toes upward turns off the glute medius."
  },
  {
    "name": "Clamshell",
    "type": "Bodyweight",
    "categories": [
      "Abductors",
      "Glutes"
    ],
    "note": "Lie on your side with bent knees and raise your top knee while keeping your feet together. Tip: Do not let your pelvis roll backward as your knee opens."
  },
  {
    "name": "Standing Calf Raise",
    "type": "Strength",
    "categories": [
      "Calves"
    ],
    "note": "Rise onto the balls of your feet, pause briefly, then lower your heels. Tip: Pause at the bottom stretch position for 2 seconds to eliminate elastic tendon recoil and maximize calf fiber recruitment."
  },
  {
    "name": "Seated Calf Raise",
    "type": "Strength",
    "categories": [
      "Calves"
    ],
    "note": "Raise your heels while seated against the machine pad, then lower slowly. Tip: The bent knee unloads the gastrocnemius, placing the soleus muscle in prime mechanical position."
  },
  {
    "name": "Single-Leg Calf Raise",
    "type": "Bodyweight",
    "categories": [
      "Calves"
    ],
    "note": "Stand on one foot and raise your heel before lowering it under control. Tip: Perform on a step to achieve a full range-of-motion ankle dorsiflexion stretch."
  },
  {
    "name": "Tibialis Raise",
    "type": "Bodyweight",
    "categories": [
      "Tibialis Anterior"
    ],
    "note": "Keep your heels planted and lift your toes toward your shins. Tip: Essential for shin splint prevention and ankle balance."
  },
  {
    "name": "Cable Dorsiflexion",
    "type": "Strength",
    "categories": [
      "Tibialis Anterior"
    ],
    "note": "With a light cable attached to your foot, pull your toes toward your shin. Tip: Use high repetitions with a smooth tempo."
  },
  {
    "name": "Crunch",
    "type": "Bodyweight",
    "categories": [
      "Upper Abs"
    ],
    "note": "Lie on your back and curl your shoulders off the floor. Tip: Think of shortening the distance between your ribcage and pubic bone rather than pulling your neck."
  },
  {
    "name": "Cable Crunch",
    "type": "Strength",
    "categories": [
      "Upper Abs"
    ],
    "note": "Kneel at a cable station and curl your torso downward against the resistance. Tip: Lock your hips in place so the movement happens entirely through spinal flexion, not hip hinging."
  },
  {
    "name": "Reverse Crunch",
    "type": "Bodyweight",
    "categories": [
      "Lower Abs"
    ],
    "note": "Lie on your back and curl your pelvis toward your chest. Tip: Control the descent; avoid letting your legs drop straight down and causing your lower back to arch."
  },
  {
    "name": "Hanging Leg Raise",
    "type": "Bodyweight",
    "categories": [
      "Lower Abs",
      "Hip Flexors",
      "Transverse Abdominis"
    ],
    "note": "Hang from a bar and raise your legs in front of you, then lower slowly. Tip: Eliminate momentum; if your body swings, reduce range (e.g., knee raises) until core stability improves."
  },
  {
    "name": "Ab Wheel Rollout",
    "type": "Strength",
    "categories": [
      "Upper Abs",
      "Lower Abs",
      "Transverse Abdominis",
      "Erector Spinae"
    ],
    "note": "Kneel, roll the wheel forward while maintaining core tension, then pull it back. Tip: Posteriorly tilt your pelvis (tuck your tailbone) to keep tension entirely on the abs and protect the lower back."
  },
  {
    "name": "Russian Twist",
    "type": "Bodyweight",
    "categories": [
      "Obliques",
      "Upper Abs"
    ],
    "note": "Sit with your knees bent and rotate your torso from side to side. Tip: Rotate from your thoracic spine rather than just swishing your arms back and forth."
  },
  {
    "name": "Cable Woodchop",
    "type": "Strength",
    "categories": [
      "Obliques",
      "Transverse Abdominis"
    ],
    "note": "Pull a cable diagonally across your body while controlling your torso rotation. Tip: Pivot your back foot to allow your hips and torso to rotate as a unified unit."
  },
  {
    "name": "Side Plank",
    "type": "Bodyweight",
    "categories": [
      "Obliques",
      "Transverse Abdominis"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Support yourself on one forearm and the side of your foot, keeping your body straight. Tip: Keep your bottom hip actively lifted; do not let your waist sag toward the floor."
  },
  {
    "name": "Dead Bug",
    "type": "Bodyweight",
    "categories": [
      "Transverse Abdominis",
      "Upper Abs",
      "Lower Abs"
    ],
    "note": "Lie on your back and slowly extend the opposite arm and leg while keeping your torso stable. Tip: If your lower back arches off the floor, reduce your range of motion until your core endurance improves."
  },
  {
    "name": "Plank",
    "type": "Bodyweight",
    "categories": [
      "Transverse Abdominis",
      "Upper Abs",
      "Obliques"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Support your body on your forearms and toes while maintaining a straight line. Tip: Squeeze your glutes and brace your abs as if taking a punch to lock down pelvic stability."
  },
  {
    "name": "Bird Dog",
    "type": "Bodyweight",
    "categories": [
      "Transverse Abdominis",
      "Erector Spinae",
      "Glutes"
    ],
    "note": "On all fours, extend one arm and the opposite leg, then switch sides. Tip: Imagine balancing a cup of water on your lower back—do not let your hips twist or rotate."
  },
  {
    "name": "Weighted Sit-Up",
    "type": "Strength",
    "categories": [
      "Upper Abs",
      "Hip Flexors"
    ],
    "note": "Lie on your back, hold a weight securely, and raise your torso toward your knees. Tip: Keep the weight close to your chest to manage the leverage safely."
  },
  {
    "name": "Jump Rope",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Calves"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Swing the rope with your wrists and jump just high enough to clear it. Tip: Land softly on the balls of your feet with a slight knee bend to absorb impact."
  },
  {
    "name": "Stationary Cycling",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Pedal at a steady pace with your chosen resistance. Tip: Adjust saddle height so there is a 25 to 30 degree knee bend at the bottom of the stroke."
  },
  {
    "name": "Rowing Machine",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Lats",
      "Rhomboids"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Push with your legs, lean back slightly, then pull the handle toward your torso. Tip: Follow the exact sequence: Legs-Body-Arms on the drive, and Arms-Body-Legs on the recovery."
  },
  {
    "name": "Elliptical Trainer",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Move the pedals in a smooth elliptical motion at a comfortable resistance. Tip: Keep your heels flat on the pedals rather than dropping onto your toes, which can numb your feet."
  },
  {
    "name": "Stair Climber",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Step continuously on the machine at a manageable pace. Tip: Lightly graze the handrails for balance only—leaning your upper-body weight onto them drops calorie burn and alters posture."
  },
  {
    "name": "Swimming",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Lats",
      "Shoulders"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Swim using a comfortable stroke and maintain a steady pace. Tip: Focus on a long, streamlined body line to reduce hydrodynamic drag."
  },
  {
    "name": "Shadow Boxing",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Front Delts",
      "Triceps",
      "Obliques"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Throw controlled punches into the air while moving your feet. Tip: Power originates from the ground up: drive off your back foot and rotate your hips with every punch."
  },
  {
    "name": "Treadmill Running",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Run at a sustainable pace on the treadmill. Tip: Aim for a quick cadence (around 160-180 steps per minute) with a midfoot strike underneath your center of mass."
  },
  {
    "name": "High Knees",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hip Flexors",
      "Calves"
    ],
    "trackMetrics": [
      "Time"
    ],
    "note": "Run in place while alternately lifting your knees. Tip: Keep your torso tall; do not crunch forward to meet your knees."
  },
  {
    "name": "Burpees",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Middle Chest",
      "Quads",
      "Glutes",
      "Front Delts",
      "Triceps"
    ],
    "trackMetrics": [
      "Reps",
      "Time"
    ],
    "note": "Squat down, place your hands on the floor, move your feet back, return to a squat, and stand or jump. Tip: Step or jump your feet back into a strong plank, avoiding a sagging lower back."
  },
  {
    "name": "Outdoor Running",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Run outdoors and record the total distance covered. Tip: Increase weekly distance gradually to help manage training load."
  },
  {
    "name": "Outdoor Walking",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Walk at a comfortable pace and record your total distance. Tip: Engage your glutes and roll smoothly from heel to toe with every step."
  },
  {
    "name": "Outdoor Cycling",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Glutes",
      "Hamstrings",
      "Calves"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Ride your bicycle and record the total distance traveled. Tip: Use a comfortable gear that lets you pedal smoothly."
  },
  {
    "name": "Treadmill Walking",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Walk on the treadmill and log the distance displayed. Tip: Increase incline gradually if you want a more demanding session."
  },
  {
    "name": "Treadmill Running Distance",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Run on the treadmill until you complete your target distance. Tip: Use the machine display to track distance consistently."
  },
  {
    "name": "Swimming Laps",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Lats",
      "Shoulders"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Swim laps and record the total distance completed. Tip: Confirm the pool length before logging your session."
  },
  {
    "name": "Rowing Distance",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Lats",
      "Rhomboids"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Row until you reach your target distance on the machine. Tip: Drive with your legs first, then finish the stroke with your arms."
  },
  {
    "name": "Hiking",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Walk a trail and record the total distance covered. Tip: Wear suitable footwear and adjust your pace to the terrain."
  },
  {
    "name": "Cross-Country Skiing",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Hamstrings",
      "Glutes",
      "Triceps",
      "Lats"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Glide along a ski trail using alternating leg and pole movements. Tip: Keep your movements smooth and maintain a sustainable pace."
  },
  {
    "name": "Elliptical Distance",
    "type": "Bodyweight",
    "categories": [
      "Cardio",
      "Quads",
      "Glutes",
      "Calves"
    ],
    "trackMetrics": [
      "Distance"
    ],
    "note": "Use the elliptical until you reach your target distance on its display. Tip: Machine-calculated distance is an estimate and may differ between models."
  }
];


// ============================================================
// DEFAULT EXERCISE LIBRARY
// ============================================================

function createExerciseId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const DEFAULT_EXERCISES: ExerciseItem[] = Array.from(
  new Map(
    exerciseSeeds.map((exercise) => {
      const id = createExerciseId(exercise.name);

      const item: ExerciseItem = {
        id,
        name: exercise.name,
        type: exercise.type,
        categories: exercise.categories,
        trackMetrics: exercise.trackMetrics ?? ['Reps'],
        isCustom: false,
        ...(exercise.note ? { note: exercise.note } : {}),
      };

      return [id, item];
    }),
  ).values(),
);