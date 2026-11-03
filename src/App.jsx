import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";

const linkClass =
  "flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700";

const iconClass = "h-5 w-5 shrink-0";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Center section */}
      <section className="flex flex-col items-center gap-6 px-6 py-16 text-center">
        <div className="relative h-[179px] w-[170px]">
          <img
            src={heroImg}
            width="170"
            height="179"
            alt=""
            className="absolute inset-0"
          />
          <img
            src={reactLogo}
            alt="React logo"
            className="absolute left-1/2 top-1/2 h-7 -translate-x-1/2 -translate-y-1/2"
          />
          <img
            src={viteLogo}
            alt="Vite logo"
            className="absolute -bottom-2 -right-4 h-8"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">Get started</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Edit{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-gray-800">
              src/App.jsx
            </code>{" "}
            and save to test{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-gray-800">
              HMR
            </code>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCount((count) => count + 1)}
          className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-5 py-2 font-medium text-purple-700 transition hover:border-purple-500 dark:text-purple-300"
        >
          Count is {count}
        </button>
      </section>

      <div className="h-4 border-t border-gray-200 dark:border-gray-800" />

      {/* Next steps */}
      <section className="mx-auto grid max-w-4xl gap-px border-gray-200 md:grid-cols-2 dark:border-gray-800">
        <div className="space-y-3 p-8">
          <svg className="h-8 w-8" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon" />
          </svg>
          <h2 className="text-xl font-semibold">Documentation</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your questions, answered
          </p>
          <ul className="flex flex-wrap gap-3 pt-2">
            <li>
              <a
                href="https://vite.dev/"
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                <img className={iconClass} src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a
                href="https://react.dev/"
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                <img className={iconClass} src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-3 p-8">
          <svg className="h-8 w-8" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon" />
          </svg>
          <h2 className="text-xl font-semibold">Connect with us</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join the Vite community
          </p>
          <ul className="flex flex-wrap gap-3 pt-2">
            {[
              ["https://github.com/vitejs/vite", "github-icon", "GitHub"],
              ["https://chat.vite.dev/", "discord-icon", "Discord"],
              ["https://x.com/vite_js", "x-icon", "X.com"],
              ["https://bsky.app/profile/vite.dev", "bluesky-icon", "Bluesky"],
            ].map(([href, icon, label]) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  <svg
                    className={iconClass}
                    role="presentation"
                    aria-hidden="true"
                  >
                    <use href={`/icons.svg#${icon}`} />
                  </svg>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="h-4 border-t border-gray-200 dark:border-gray-800" />
      <section className="h-24" />
    </div>
  );
}

export default App;
