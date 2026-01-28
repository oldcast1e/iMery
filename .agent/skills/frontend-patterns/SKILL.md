---
name: frontend-patterns
description: Frontend development patterns for iMery (React 19, Tailwind CSS, Framer Motion).
---

# iMery Frontend Development Patterns

## Routing: activeView Pattern

iMery uses a state-based routing system instead of a traditional router.

```javascript
// App.jsx
const [activeView, setActiveView] = useState("home");

// Navigation
<button onClick={() => setActiveView("works")}>Go to Works</button>;

// View Rendering
{
  activeView === "home" && <HomeView />;
}
{
  activeView === "works" && <WorksView />;
}
```

## Styling: Tailwind CSS & Premium Design

iMery follows a premium, glassmorphism-inspired design system.

### Glassmorphism Card

```html
<div
  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
>
  <h2 className="text-white text-xl font-semibold">Premium Card</h2>
</div>
```

### Gradients & Icons

Use soft gradients and Lucide icons for a modern feel.

```javascript
import { Heart } from "lucide-react";

<div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-full">
  <Heart className="text-white w-6 h-6" />
</div>;
```

## Animation: Framer Motion

ALWAYS use Framer Motion for view transitions and interactions.

```javascript
import { motion } from "framer-motion";

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    {children}
  </motion.div>
);
```

## State Management

### Persistence with useLocalStorage

Use the custom `useLocalStorage` hook for user state and settings.

```javascript
const [user, setUser] = useLocalStorage("imery-user", null);
```

### Data Fetching

Use `useEffect` for fetching data on mount, ideally wrapped in the `api` client.

```javascript
useEffect(() => {
  const loadWorks = async () => {
    const data = await api.getPosts();
    setWorks(data);
  };
  loadWorks();
}, []);
```

## Component Organization

- **Pages**: `src/pages/` (Full screen views)
- **Features**: `src/features/` (Complex logic components like `UploadModal`)
- **Widgets**: `src/widgets/` (Reusable layout elements like `BottomNav`)
- **Shared**: `src/shared/ui/` (Atomic UI components)
