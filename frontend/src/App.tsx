import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";

const App = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-4">
      <Button onClick={toggleTheme}>
        Toggle {isDark ? "Light" : "Dark"} Mode
      </Button>
      <Textarea placeholder="Type something..." />
    </div>
  );
};

export default App;
