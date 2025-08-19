import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    let mounted = true;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      if (mounted) setInit(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const options = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      particles: {
        move: {
          enable: true,
          speed: { min: 1, max: 6 },
        },
        number: {
          value: 20,
          max: 30,
        },
        opacity: {
          value: 0.4,
        },
        rotate: {
          path: true,
        },
        shape: {
          options: {
            image: {
              gif: true,
              height: 100,
              src: "/coin.gif",
              width: 100,
            },
          },
          type: "image",
        },
        size: {
          value: {
            min: 32,
            max: 64,
          },
        },
        detectRetina: true,
      },
    }),
    []
  );

  if (!init) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Particles id="tsparticles" options={options} />
    </div>
  );
};

export default ParticlesBackground;
