import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            // Show after scrolling past ~1 viewport section
            setVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollUp = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            id="scroll-to-top-btn"
            onClick={scrollUp}
            aria-label="Scroll to top"
            className={`
        fixed z-50 bottom-6 right-6 sm:bottom-8 sm:right-8
        w-11 h-11 sm:w-12 sm:h-12
        rounded-full
        bg-primary text-primary-foreground
        shadow-lg shadow-primary/25
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:scale-110 hover:shadow-xl hover:shadow-primary/35
        active:scale-95
        ${visible
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }
      `}
        >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
        </button>
    );
};

export default ScrollToTop;
