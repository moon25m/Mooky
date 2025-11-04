import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useNavigate } from 'react-router-dom';

// Configure dayjs with plugins once in this module
dayjs.extend(utc);
dayjs.extend(timezone);

const DHK_TZ = 'Asia/Dhaka';

function useDhakaNow() {
  return dayjs().tz(DHK_TZ);
}

function getNextNov5Dhaka(nowDhaka) {
  const year = nowDhaka.year();
  let target = dayjs.tz(`${year}-11-05T00:00:00`, DHK_TZ);
  if (target.isSame(nowDhaka) || target.isBefore(nowDhaka)) {
    target = target.add(1, 'year');
  }
  return target;
}

function formatDiff(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export default function BirthdayCountdown({ label = 'Countdown', onReached = undefined, autoRedirect = true, doConfetti = true }) {
  const navigate = useNavigate();
  const nowDhaka = useDhakaNow();
  const target = useMemo(() => getNextNov5Dhaka(nowDhaka), [nowDhaka]);
  const [diff, setDiff] = useState(target.diff(useDhakaNow()));
  const reachedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      const d = target.diff(dayjs().tz(DHK_TZ));
      setDiff(d);
      if (!reachedRef.current && d <= 0) {
        reachedRef.current = true;
        if (doConfetti) {
          try {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } catch (_) {
            // ignore confetti errors in headless environments
          }
        }
        if (typeof onReached === 'function') {
          try { onReached(); } catch (_) {}
        }
        if (autoRedirect) {
          setTimeout(() => navigate('/birthday'), 800);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [navigate, onReached, autoRedirect, doConfetti, target]);

  const { days, hours, minutes, seconds } = formatDiff(diff);

  return (
    <div className="birthday-countdown" role="timer" aria-live="polite">
      {label && <div className="birthday-countdown__label">{label}</div>}
      <div className="birthday-countdown__values">
        <span className="bd-val"><strong>{String(days).padStart(2, '0')}</strong><span className="bd-unit">d</span></span>
        <span className="bd-sep">:</span>
        <span className="bd-val"><strong>{String(hours).padStart(2, '0')}</strong><span className="bd-unit">h</span></span>
        <span className="bd-sep">:</span>
        <span className="bd-val"><strong>{String(minutes).padStart(2, '0')}</strong><span className="bd-unit">m</span></span>
        <span className="bd-sep">:</span>
        <span className="bd-val"><strong>{String(seconds).padStart(2, '0')}</strong><span className="bd-unit">s</span></span>
      </div>
    </div>
  );
}
