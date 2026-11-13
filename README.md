# ExersAIze 💪

**Your workouts. Your progress. Your consistency.**

ExersAIze is a mobile fitness and workout tracking application designed to make managing workouts, building routines, and monitoring fitness progress simpler.

Whether you're following a structured training program or creating your own workouts, ExersAIze helps you organize your training and keep track of your activity in one place.

---

## ✨ Features

### 🏋️ Workout Tracking

- Create and track workout sessions.
- Log exercises, sets, reps, weight, time, and distance.
- Keep a history of completed workouts.
- Track individual exercise performance.

### 📋 Custom Workout Routines

- Create personalized workout routines.
- Organize exercises into structured training plans.
- Reuse saved routines when starting new sessions.
- Support different training styles, including strength and bodyweight exercises.

### 📊 Progress & Analytics

- Visualize workout activity and training history.
- Monitor weekly workout consistency.
- Track exercise performance over time.
- View fitness activity through interactive charts.

### 👟 Daily Activity Tracking

- Track daily steps.
- View weekly step activity.
- Monitor activity trends over time.
- Integrate with native health platforms.

### ❤️ Health Platform Integration

- Android Health Connect integration.
- Apple HealthKit integration.
- Access supported health and activity data with user permission.

### 🎨 Customizable Experience

- Clean, minimal interface.
- Theme customization.
- Consistent design across the application.

---

## 🛠️ Tech Stack

ExersAIze is built using modern mobile development technologies.

| Technology                 | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| React Native               | Cross-platform mobile development          |
| Expo                       | Development and native application tooling |
| TypeScript                 | Type safety and maintainable code          |
| Expo Router                | File-based navigation                      |
| React Native Gifted Charts | Data visualization                         |
| AsyncStorage               | Local data persistence                     |
| React Native Reanimated    | Animations                                 |
| Health Connect             | Android health integration                 |
| Apple HealthKit            | iOS health integration                     |
| date-fns                   | Date and time utilities                    |

---

## 📱 Platforms

| Platform | Support             |
| -------- | ------------------- |
| Android  | Supported           |
| iOS      | Supported           |
| Web      | Development support |

_Native health integrations require the corresponding platform and permissions._

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

### 1. Clone the Repository

```bash
git clone https://github.com/Thefakedeal/ExersAIze-app.git

cd ExersAIze-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npx expo start
```

### 4. Run on Android

```bash
npm run android
```

### 5. Run on iOS

```bash
npm run ios
```

_Note: Native development builds are required for features that depend on native modules, including Health Connect and HealthKit._

---

## 📂 Project Structure

The application follows a feature-oriented structure.

```text
ExersAIze-app/
│
├── assets/                 # Images, icons and fonts
│
├── src/
│   ├── app/                # Expo Router screens and navigation
│   ├── components/         # Reusable UI components
│   ├── constants/          # Application constants and theme
│   ├── hooks/              # Custom React hooks
│   └── ...                 # Feature modules and supporting code
│
├── scripts/                # Development scripts
├── .agents/                # Agent skills
├── .opencode/              # AI coding agent configuration
│
├── app.json                # Expo configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗺️ Roadmap

ExersAIze is an evolving project. Some areas being explored for future development include:

- AI-assisted workout recommendations.
- More detailed exercise progression analytics.
- Enhanced fitness insights and reporting.
- Additional health data integrations.
- Improved workout planning and personalization.

---

## 🤝 Contributing

Suggestions, bug reports, and contributions are welcome.

If you have an idea for improving ExersAIze, feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Developer

**Samir Shrestha**

- GitHub: [@Thefakedeal](https://github.com/Thefakedeal)
- LinkedIn: [Samir Shrestha](https://linkedin.com/in/samir-shrestha-16050a210)
- Website: [samirshrestha.info.np](https://samirshrestha.info.np)

---

<p align="center">
  Built with ❤️ and a passion for fitness and technology.
</p>
